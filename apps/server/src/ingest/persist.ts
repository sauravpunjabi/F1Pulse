/**
 * Batched persistence: writes a fully-fetched season into Postgres using
 * `createMany` + chunked `$transaction`s instead of one round-trip per row.
 *
 * Idempotency is preserved by scope: dimensions use `createMany({ skipDuplicates })`,
 * races are upserted (stable ids + refreshed session times), and per-round facts are
 * written as `deleteMany → createMany` inside a single transaction — so re-running a
 * round atomically replaces exactly that round's rows (and fixes corrections), never
 * duplicating. No sample data is ever written (CLAUDE.md HARD RULES).
 */
import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type {
  ErgastConstructor,
  ErgastConstructorStanding,
  ErgastDriver,
  ErgastDriverStanding,
  ErgastQualifyingResult,
  ErgastRace,
  ErgastResult,
} from './ergast-types.js';
import {
  dateOrNull,
  dateTime,
  float,
  int,
  intOrNull,
  sessionDateTime,
  strOrNull,
} from './parse.js';

export interface RoundBundle {
  round: number;
  results: ErgastResult[];
  qualifying: ErgastQualifyingResult[];
  driverStandings: ErgastDriverStanding[];
  constructorStandings: ErgastConstructorStanding[];
}

export interface SeasonBundle {
  seasonYear: number;
  seasonUrl?: string;
  scheduleRaces: ErgastRace[];
  rounds: RoundBundle[];
}

export interface PersistCounts {
  scheduleRaces: number;
  raceResults: number;
  qualifyingResults: number;
  driverStandingRows: number;
  constructorStandingRows: number;
}

// ── Mappers: raw Ergast → flat createMany rows ───────────────────────────────

function mapCircuit(race: ErgastRace) {
  const c = race.Circuit;
  return {
    circuitId: c.circuitId,
    name: c.circuitName,
    locality: strOrNull(c.Location?.locality),
    country: strOrNull(c.Location?.country),
    lat: c.Location?.lat ? Number.parseFloat(c.Location.lat) : null,
    long: c.Location?.long ? Number.parseFloat(c.Location.long) : null,
    wikipediaUrl: strOrNull(c.url),
  };
}

function mapDriver(d: ErgastDriver) {
  return {
    driverId: d.driverId,
    givenName: d.givenName,
    familyName: d.familyName,
    code: strOrNull(d.code),
    permanentNumber: intOrNull(d.permanentNumber),
    nationality: strOrNull(d.nationality),
    dateOfBirth: dateOrNull(d.dateOfBirth),
    wikipediaUrl: strOrNull(d.url),
  };
}

function mapConstructor(c: ErgastConstructor) {
  return {
    constructorId: c.constructorId,
    name: c.name,
    nationality: strOrNull(c.nationality),
    wikipediaUrl: strOrNull(c.url),
  };
}

function mapResult(raceId: string, r: ErgastResult) {
  return {
    raceId,
    driverId: r.Driver.driverId,
    constructorId: r.Constructor.constructorId,
    number: intOrNull(r.number),
    position: int(r.position),
    positionText: r.positionText,
    points: float(r.points),
    grid: int(r.grid),
    laps: int(r.laps),
    status: r.status,
    timeMillis: intOrNull(r.Time?.millis),
    timeText: strOrNull(r.Time?.time),
    fastestLapRank: intOrNull(r.FastestLap?.rank),
    fastestLapNumber: intOrNull(r.FastestLap?.lap),
    fastestLapTime: strOrNull(r.FastestLap?.Time?.time),
    fastestLapSpeedKph: r.FastestLap?.AverageSpeed?.speed
      ? Number.parseFloat(r.FastestLap.AverageSpeed.speed)
      : null,
  };
}

function mapQualifying(raceId: string, q: ErgastQualifyingResult) {
  return {
    raceId,
    driverId: q.Driver.driverId,
    constructorId: q.Constructor.constructorId,
    number: intOrNull(q.number),
    position: int(q.position),
    q1: strOrNull(q.Q1),
    q2: strOrNull(q.Q2),
    q3: strOrNull(q.Q3),
  };
}

function mapConstructorStanding(seasonYear: number, round: number, s: ErgastConstructorStanding) {
  return {
    seasonYear,
    round,
    constructorId: s.Constructor.constructorId,
    position: int(s.position),
    positionText: s.positionText,
    points: float(s.points),
    wins: int(s.wins),
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function dedupeBy<T>(items: T[], key: (item: T) => string): T[] {
  const map = new Map<string, T>();
  for (const item of items) map.set(key(item), item);
  return [...map.values()];
}

/** Run an array of queries as a series of chunked transactions. */
async function runChunked(ops: Prisma.PrismaPromise<unknown>[], chunkSize: number): Promise<void> {
  for (let i = 0; i < ops.length; i += chunkSize) {
    await prisma.$transaction(ops.slice(i, i + chunkSize));
  }
}

// ── Persist ──────────────────────────────────────────────────────────────────

export async function persistSeasonBundle(bundle: SeasonBundle): Promise<PersistCounts> {
  const { seasonYear, scheduleRaces, rounds } = bundle;

  // 1. Season.
  await prisma.season.upsert({
    where: { year: seasonYear },
    create: { year: seasonYear, wikipediaUrl: strOrNull(bundle.seasonUrl) },
    update: { wikipediaUrl: strOrNull(bundle.seasonUrl) ?? undefined },
  });

  // 2. Dimensions — dedupe across the whole season, bulk insert (skip existing).
  const circuitRaces = dedupeBy(scheduleRaces, (r) => r.Circuit.circuitId);
  const driverSources: ErgastDriver[] = [];
  const constructorSources: ErgastConstructor[] = [];
  for (const rb of rounds) {
    for (const r of rb.results) {
      driverSources.push(r.Driver);
      constructorSources.push(r.Constructor);
    }
    for (const q of rb.qualifying) {
      driverSources.push(q.Driver);
      constructorSources.push(q.Constructor);
    }
    for (const s of rb.driverStandings) {
      driverSources.push(s.Driver);
      for (const c of s.Constructors) constructorSources.push(c);
    }
    for (const s of rb.constructorStandings) constructorSources.push(s.Constructor);
  }
  const drivers = dedupeBy(driverSources, (d) => d.driverId);
  const constructors = dedupeBy(constructorSources, (c) => c.constructorId);

  if (circuitRaces.length) {
    await prisma.circuit.createMany({ data: circuitRaces.map(mapCircuit), skipDuplicates: true });
  }
  if (drivers.length) {
    await prisma.driver.createMany({ data: drivers.map(mapDriver), skipDuplicates: true });
  }
  if (constructors.length) {
    await prisma.constructor.createMany({
      data: constructors.map(mapConstructor),
      skipDuplicates: true,
    });
  }

  // 3. Races — upsert (stable ids + refreshed session times), chunked.
  const raceUpserts = scheduleRaces.map((race) => {
    const round = int(race.round);
    const data = {
      name: race.raceName,
      date: dateTime(race.date, race.time),
      wikipediaUrl: strOrNull(race.url),
      circuitId: race.Circuit.circuitId,
      fp1At: sessionDateTime(race.FirstPractice),
      fp2At: sessionDateTime(race.SecondPractice),
      fp3At: sessionDateTime(race.ThirdPractice),
      qualifyingAt: sessionDateTime(race.Qualifying),
      sprintQualifyingAt: sessionDateTime(race.SprintQualifying),
      sprintAt: sessionDateTime(race.Sprint),
      isSprintWeekend: Boolean(race.Sprint ?? race.SprintQualifying),
    };
    return prisma.race.upsert({
      where: { seasonYear_round: { seasonYear, round } },
      create: { seasonYear, round, ...data },
      update: data,
    });
  });
  await runChunked(raceUpserts, 50);

  const raceRows = await prisma.race.findMany({
    where: { seasonYear },
    select: { id: true, round: true },
  });
  const raceIdByRound = new Map(raceRows.map((r) => [r.round, r.id]));

  // 4. Facts — one transaction per round: delete that round's rows, then bulk insert.
  const counts: PersistCounts = {
    scheduleRaces: scheduleRaces.length,
    raceResults: 0,
    qualifyingResults: 0,
    driverStandingRows: 0,
    constructorStandingRows: 0,
  };

  for (const rb of rounds) {
    const raceId = raceIdByRound.get(rb.round);
    if (!raceId) continue;
    const ops: Prisma.PrismaPromise<unknown>[] = [];

    ops.push(prisma.raceResult.deleteMany({ where: { raceId } }));
    if (rb.results.length) {
      ops.push(prisma.raceResult.createMany({ data: rb.results.map((r) => mapResult(raceId, r)) }));
    }

    ops.push(prisma.qualifyingResult.deleteMany({ where: { raceId } }));
    if (rb.qualifying.length) {
      ops.push(
        prisma.qualifyingResult.createMany({
          data: rb.qualifying.map((q) => mapQualifying(raceId, q)),
        }),
      );
    }

    ops.push(prisma.constructorStanding.deleteMany({ where: { seasonYear, round: rb.round } }));
    if (rb.constructorStandings.length) {
      ops.push(
        prisma.constructorStanding.createMany({
          data: rb.constructorStandings.map((s) => mapConstructorStanding(seasonYear, rb.round, s)),
        }),
      );
    }

    // Driver standings + explicit constructor join (ids generated so joins can be bulk-inserted).
    ops.push(prisma.driverStanding.deleteMany({ where: { seasonYear, round: rb.round } }));
    if (rb.driverStandings.length) {
      const dsRows = rb.driverStandings.map((s) => ({
        id: randomUUID(),
        seasonYear,
        round: rb.round,
        driverId: s.Driver.driverId,
        position: int(s.position),
        positionText: s.positionText,
        points: float(s.points),
        wins: int(s.wins),
      }));
      ops.push(prisma.driverStanding.createMany({ data: dsRows }));

      const joinRows = rb.driverStandings.flatMap((s, i) => {
        const ds = dsRows[i];
        if (!ds) return [];
        return s.Constructors.map((c) => ({
          driverStandingId: ds.id,
          constructorId: c.constructorId,
        }));
      });
      if (joinRows.length) {
        ops.push(
          prisma.driverStandingConstructor.createMany({ data: joinRows, skipDuplicates: true }),
        );
      }
      counts.driverStandingRows += dsRows.length;
    }

    counts.raceResults += rb.results.length;
    counts.qualifyingResults += rb.qualifying.length;
    counts.constructorStandingRows += rb.constructorStandings.length;

    await prisma.$transaction(ops);
  }

  return counts;
}
