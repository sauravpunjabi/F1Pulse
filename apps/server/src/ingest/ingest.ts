/**
 * Ingestion layer: pulls real data from Jolpica and upserts it into Postgres.
 *
 * EVERYTHING here is idempotent — every write is an upsert keyed on a natural or
 * unique constraint, so any function (or the whole season) can be re-run safely.
 * No sample/seed data is ever written (CLAUDE.md HARD RULES).
 */
import type { Race } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import * as jolpica from '../clients/jolpica.js';
import type { ErgastConstructor, ErgastDriver, ErgastRace } from './ergast-types.js';
import {
  dateOrNull,
  dateTime,
  float,
  int,
  intOrNull,
  sessionDateTime,
  strOrNull,
} from './parse.js';

// ── Entity upserts (the building blocks) ─────────────────────────────────────

async function upsertSeason(year: number, wikipediaUrl?: string): Promise<void> {
  await prisma.season.upsert({
    where: { year },
    create: { year, wikipediaUrl: strOrNull(wikipediaUrl) },
    update: { wikipediaUrl: strOrNull(wikipediaUrl) ?? undefined },
  });
}

async function upsertDriver(d: ErgastDriver): Promise<void> {
  const data = {
    givenName: d.givenName,
    familyName: d.familyName,
    code: strOrNull(d.code),
    permanentNumber: intOrNull(d.permanentNumber),
    nationality: strOrNull(d.nationality),
    dateOfBirth: dateOrNull(d.dateOfBirth),
    wikipediaUrl: strOrNull(d.url),
  };
  await prisma.driver.upsert({
    where: { driverId: d.driverId },
    create: { driverId: d.driverId, ...data },
    update: data,
  });
}

async function upsertConstructor(c: ErgastConstructor): Promise<void> {
  const data = {
    name: c.name,
    nationality: strOrNull(c.nationality),
    wikipediaUrl: strOrNull(c.url),
  };
  await prisma.constructor.upsert({
    where: { constructorId: c.constructorId },
    create: { constructorId: c.constructorId, ...data },
    update: data,
  });
}

async function upsertCircuit(race: ErgastRace): Promise<void> {
  const c = race.Circuit;
  const data = {
    name: c.circuitName,
    locality: strOrNull(c.Location?.locality),
    country: strOrNull(c.Location?.country),
    lat: c.Location?.lat ? Number.parseFloat(c.Location.lat) : null,
    long: c.Location?.long ? Number.parseFloat(c.Location.long) : null,
    wikipediaUrl: strOrNull(c.url),
  };
  await prisma.circuit.upsert({
    where: { circuitId: c.circuitId },
    create: { circuitId: c.circuitId, ...data },
    update: data,
  });
}

/**
 * Ensure a Race row exists with its CORE fields. Used by results/qualifying ingest
 * (whose responses omit session times) so it never overwrites schedule-provided
 * session times with nulls. Returns the persisted Race.
 */
async function upsertRaceCore(race: ErgastRace): Promise<Race> {
  const seasonYear = int(race.season);
  const round = int(race.round);
  await upsertSeason(seasonYear);
  await upsertCircuit(race);

  const core = {
    name: race.raceName,
    date: dateTime(race.date, race.time),
    wikipediaUrl: strOrNull(race.url),
    circuitId: race.Circuit.circuitId,
  };
  return prisma.race.upsert({
    where: { seasonYear_round: { seasonYear, round } },
    create: { seasonYear, round, ...core },
    update: core,
  });
}

// ── Public ingest functions ──────────────────────────────────────────────────

/** Upsert every season (years only) Ergast knows about. */
export async function ingestSeasons(): Promise<number> {
  const seasons = await jolpica.fetchSeasons();
  for (const s of seasons) {
    await upsertSeason(int(s.season), s.url);
  }
  return seasons.length;
}

/** Upsert the full schedule (circuits, races, session times) for a season. */
export async function ingestSchedule(
  season: string,
): Promise<{ seasonYear: number; count: number }> {
  const races = await jolpica.fetchSchedule(season);
  let seasonYear = season === 'current' ? new Date().getUTCFullYear() : int(season);

  for (const race of races) {
    seasonYear = int(race.season);
    await upsertSeason(seasonYear);
    await upsertCircuit(race);

    const isSprintWeekend = Boolean(race.Sprint ?? race.SprintQualifying);
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
      isSprintWeekend,
    };
    await prisma.race.upsert({
      where: { seasonYear_round: { seasonYear, round: int(race.round) } },
      create: { seasonYear, round: int(race.round), ...data },
      update: data,
    });
  }
  return { seasonYear, count: races.length };
}

/** Upsert the driver-standings snapshot as of a round (or the latest if round omitted). */
export async function ingestDriverStandings(season: string, round?: string): Promise<number> {
  const snapshot = await jolpica.fetchDriverStandings(season, round);
  if (!snapshot) return 0;
  const seasonYear = int(snapshot.season);
  const snapRound = int(snapshot.round);
  await upsertSeason(seasonYear);

  for (const s of snapshot.standings) {
    await upsertDriver(s.Driver);
    for (const c of s.Constructors) await upsertConstructor(c);

    const connect = s.Constructors.map((c) => ({ constructorId: c.constructorId }));
    const data = {
      position: int(s.position),
      positionText: s.positionText,
      points: float(s.points),
      wins: int(s.wins),
    };
    await prisma.driverStanding.upsert({
      where: {
        seasonYear_round_driverId: { seasonYear, round: snapRound, driverId: s.Driver.driverId },
      },
      create: {
        seasonYear,
        round: snapRound,
        driverId: s.Driver.driverId,
        ...data,
        constructors: { connect },
      },
      update: { ...data, constructors: { set: connect } },
    });
  }
  return snapshot.standings.length;
}

/** Upsert the constructor-standings snapshot as of a round (or the latest). */
export async function ingestConstructorStandings(season: string, round?: string): Promise<number> {
  const snapshot = await jolpica.fetchConstructorStandings(season, round);
  if (!snapshot) return 0;
  const seasonYear = int(snapshot.season);
  const snapRound = int(snapshot.round);
  await upsertSeason(seasonYear);

  for (const s of snapshot.standings) {
    await upsertConstructor(s.Constructor);
    const data = {
      position: int(s.position),
      positionText: s.positionText,
      points: float(s.points),
      wins: int(s.wins),
    };
    await prisma.constructorStanding.upsert({
      where: {
        seasonYear_round_constructorId: {
          seasonYear,
          round: snapRound,
          constructorId: s.Constructor.constructorId,
        },
      },
      create: { seasonYear, round: snapRound, constructorId: s.Constructor.constructorId, ...data },
      update: data,
    });
  }
  return snapshot.standings.length;
}

/** Upsert all race results for a round. */
export async function ingestResults(season: string, round: string): Promise<number> {
  const race = await jolpica.fetchRaceResults(season, round);
  if (!race?.Results) return 0;
  const raceRow = await upsertRaceCore(race);

  for (const r of race.Results) {
    await upsertDriver(r.Driver);
    await upsertConstructor(r.Constructor);

    const data = {
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
    await prisma.raceResult.upsert({
      where: { raceId_driverId: { raceId: raceRow.id, driverId: r.Driver.driverId } },
      create: { raceId: raceRow.id, driverId: r.Driver.driverId, ...data },
      update: data,
    });
  }
  return race.Results.length;
}

/** Upsert all qualifying results for a round. */
export async function ingestQualifying(season: string, round: string): Promise<number> {
  const race = await jolpica.fetchQualifying(season, round);
  if (!race?.QualifyingResults) return 0;
  const raceRow = await upsertRaceCore(race);

  for (const q of race.QualifyingResults) {
    await upsertDriver(q.Driver);
    await upsertConstructor(q.Constructor);

    const data = {
      constructorId: q.Constructor.constructorId,
      number: intOrNull(q.number),
      position: int(q.position),
      q1: strOrNull(q.Q1),
      q2: strOrNull(q.Q2),
      q3: strOrNull(q.Q3),
    };
    await prisma.qualifyingResult.upsert({
      where: { raceId_driverId: { raceId: raceRow.id, driverId: q.Driver.driverId } },
      create: { raceId: raceRow.id, driverId: q.Driver.driverId, ...data },
      update: data,
    });
  }
  return race.QualifyingResults.length;
}

// ── Orchestrator ─────────────────────────────────────────────────────────────

export interface IngestSummary {
  seasonYear: number;
  latestRound: number;
  scheduleRaces: number;
  raceResults: number;
  qualifyingResults: number;
  driverStandingRows: number;
  constructorStandingRows: number;
}

/**
 * Ingest the live season end-to-end via the /current/ alias:
 *   schedule → (per completed round) results, qualifying, driver + constructor
 *   standings. Standings are stored as per-round snapshots, so the championship
 *   progression is captured, not just the latest table.
 */
export async function ingestCurrentSeason(
  onProgress?: (message: string) => void,
): Promise<IngestSummary> {
  const log = onProgress ?? (() => {});
  const run = await prisma.ingestRun.create({
    data: { source: 'jolpica', scope: 'current', status: 'pending' },
  });

  try {
    // 1. Schedule (also resolves the concrete season year from the response).
    const { seasonYear, count: scheduleRaces } = await ingestSchedule('current');
    log(`schedule: ${scheduleRaces} races for ${seasonYear}`);

    // 2. Latest completed round = the round of the current driver standings.
    const latest = await jolpica.fetchDriverStandings('current');
    const latestRound = latest ? int(latest.round) : 0;
    log(`latest completed round: ${latestRound}`);

    // 3. Per-round: results, qualifying, and both standings snapshots.
    let raceResults = 0;
    let qualifyingResults = 0;
    let driverStandingRows = 0;
    let constructorStandingRows = 0;

    for (let round = 1; round <= latestRound; round += 1) {
      const r = String(round);
      raceResults += await ingestResults(String(seasonYear), r);
      qualifyingResults += await ingestQualifying(String(seasonYear), r);
      driverStandingRows += await ingestDriverStandings(String(seasonYear), r);
      constructorStandingRows += await ingestConstructorStandings(String(seasonYear), r);
      log(`round ${round}/${latestRound} ingested`);
    }

    const recordCount =
      scheduleRaces +
      raceResults +
      qualifyingResults +
      driverStandingRows +
      constructorStandingRows;
    await prisma.ingestRun.update({
      where: { id: run.id },
      data: { status: 'success', recordCount, finishedAt: new Date() },
    });

    return {
      seasonYear,
      latestRound,
      scheduleRaces,
      raceResults,
      qualifyingResults,
      driverStandingRows,
      constructorStandingRows,
    };
  } catch (error) {
    await prisma.ingestRun.update({
      where: { id: run.id },
      data: { status: 'failed', error: String(error), finishedAt: new Date() },
    });
    throw error;
  }
}
