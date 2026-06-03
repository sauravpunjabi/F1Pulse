/**
 * Clean Data Transfer Objects for F1Pulse's own API.
 *
 * The frontend receives ONLY these types — no Prisma models, no raw Ergast shapes.
 * Mappers here are the single place that knows the DB shape; everything above this
 * file is blissfully unaware of the underlying schema.
 */
import type {
  Circuit,
  Constructor,
  ConstructorStanding,
  Driver,
  DriverStanding,
  DriverStandingConstructor,
  QualifyingResult,
  Race,
  RaceResult,
} from '@prisma/client';

// ── Primitive references (embedded in other DTOs) ────────────────────────────

export interface CircuitDto {
  id: string;
  name: string;
  locality: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
}

export interface DriverRef {
  id: string;
  givenName: string;
  familyName: string;
  code: string | null;
  nationality: string | null;
}

export interface ConstructorRef {
  id: string;
  name: string;
  nationality: string | null;
}

// ── Session schedule (all optional — varies by era and sprint format) ─────────

export interface SessionSchedule {
  fp1: string | null;
  fp2: string | null;
  fp3: string | null;
  qualifying: string | null;
  sprintQualifying: string | null;
  sprint: string | null;
}

// ── Public DTOs ───────────────────────────────────────────────────────────────

export interface RaceScheduleDto {
  round: number;
  name: string;
  date: string;
  isSprintWeekend: boolean;
  circuit: CircuitDto;
  sessions: SessionSchedule;
}

export interface DriverStandingDto {
  position: number;
  positionText: string;
  points: number;
  wins: number;
  round: number;
  driver: DriverRef;
  constructors: ConstructorRef[];
}

export interface StandingsDto {
  season: number;
  round: number;
  standings: DriverStandingDto[];
}

export interface ConstructorStandingDto {
  position: number;
  positionText: string;
  points: number;
  wins: number;
  round: number;
  constructor: ConstructorRef;
}

export interface ConstructorStandingsDto {
  season: number;
  round: number;
  standings: ConstructorStandingDto[];
}

export interface FastestLapDto {
  rank: number;
  lap: number;
  time: string;
}

export interface RaceResultDto {
  position: number;
  positionText: string;
  points: number;
  grid: number;
  laps: number;
  status: string;
  timeMillis: number | null;
  timeText: string | null;
  fastestLap: FastestLapDto | null;
  driver: DriverRef;
  constructor: ConstructorRef;
}

export interface QualifyingResultDto {
  position: number;
  driver: DriverRef;
  constructor: ConstructorRef;
  q1: string | null;
  q2: string | null;
  q3: string | null;
}

export interface RoundResultsDto {
  season: number;
  round: number;
  raceName: string;
  date: string;
  circuit: CircuitDto;
  results: RaceResultDto[];
  qualifying: QualifyingResultDto[];
}

export interface SeasonCurrentDto {
  year: number;
  nextRace: RaceScheduleDto | null;
  leader: {
    driver: DriverRef;
    constructors: ConstructorRef[];
    points: number;
    wins: number;
    round: number;
  } | null;
}

export interface DriverCareerSeasonDto {
  season: number;
  round: number;
  position: number;
  positionText: string;
  points: number;
  wins: number;
  constructors: ConstructorRef[];
}

export interface DriverStatsDto {
  wins: number;
  podiums: number;
  poles: number;
  championships: number;
  seasonsRaced: number;
}

export interface DriverWinDto {
  season: number;
  round: number;
  raceName: string;
  circuitName: string;
  country: string | null;
  constructor: ConstructorRef;
  date: string;
  laps: number;
  timeText: string | null;
}

export interface DriverProfileDto {
  id: string;
  givenName: string;
  familyName: string;
  code: string | null;
  permanentNumber: number | null;
  nationality: string | null;
  dateOfBirth: string | null;
  career: DriverCareerSeasonDto[];
  stats: DriverStatsDto;
}

export interface ChampionshipEntry {
  year: number;
  driverId: string;
  driverName: string;
  driverCode: string | null;
  points: number;
}

export interface ConstructorProfileDto {
  id: string;
  name: string;
  nationality: string | null;
  totalChampionships: number;
  totalWins: number;
  firstSeason: number | null;
  lastSeason: number | null;
  championships: ChampionshipEntry[];
  drivers: DriverRef[];
}

export interface ConstructorListItemDto {
  id: string;
  name: string;
  nationality: string | null;
  totalChampionships: number;
  totalWins: number;
}

export type ConstructorsListDto = ConstructorListItemDto[];

// ── Circuit DTOs ───────────────────────────────────────────────────────────────

export interface CircuitRaceDto {
  season: number;
  round: number;
  raceName: string;
  winnerGivenName: string;
  winnerFamilyName: string;
  winnerDriverId: string;
  constructorName: string;
  constructorId: string;
}

export interface CircuitWinnerDto {
  driverId: string;
  givenName: string;
  familyName: string;
  wins: number;
}

export interface CircuitProfileDto {
  id: string;
  name: string;
  locality: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  firstRaceYear: number;
  totalRaces: number;
  recentRaces: CircuitRaceDto[];
  mostWins: CircuitWinnerDto | null;
  eras: string[];
}

export interface CircuitListItemDto {
  id: string;
  name: string;
  locality: string | null;
  country: string | null;
  firstRaceYear: number;
  totalRaces: number;
}

export type CircuitsListDto = CircuitListItemDto[];

export interface SeasonChampionDto {
  season: number;
  driver: DriverRef;
  constructors: ConstructorRef[];
  points: number;
  wins: number;
}

// ── Prisma row types (joined shapes) ─────────────────────────────────────────

/** DriverStanding with all relations needed for DTO mapping. */
export type DriverStandingRow = DriverStanding & {
  driver: Driver;
  constructorLinks: (DriverStandingConstructor & { constructor: Constructor })[];
};

/** ConstructorStanding with relations. */
export type ConstructorStandingRow = ConstructorStanding & {
  constructor: Constructor;
};

/** RaceResult with relations. */
export type RaceResultRow = RaceResult & {
  driver: Driver;
  constructor: Constructor;
};

/** QualifyingResult with relations. */
export type QualifyingResultRow = QualifyingResult & {
  driver: Driver;
  constructor: Constructor;
};

/** Race with circuit relation. */
export type RaceWithCircuit = Race & { circuit: Circuit };

// ── Mappers ───────────────────────────────────────────────────────────────────

export function mapCircuit(c: Circuit): CircuitDto {
  return {
    id: c.circuitId,
    name: c.name,
    locality: c.locality,
    country: c.country,
    lat: c.lat,
    lng: c.long,
  };
}

export function mapDriverRef(d: Driver): DriverRef {
  return {
    id: d.driverId,
    givenName: d.givenName,
    familyName: d.familyName,
    code: d.code,
    nationality: d.nationality,
  };
}

export function mapConstructorRef(c: Constructor): ConstructorRef {
  return { id: c.constructorId, name: c.name, nationality: c.nationality };
}

export function mapRaceSchedule(r: RaceWithCircuit): RaceScheduleDto {
  return {
    round: r.round,
    name: r.name,
    date: r.date.toISOString(),
    isSprintWeekend: r.isSprintWeekend,
    circuit: mapCircuit(r.circuit),
    sessions: {
      fp1: r.fp1At?.toISOString() ?? null,
      fp2: r.fp2At?.toISOString() ?? null,
      fp3: r.fp3At?.toISOString() ?? null,
      qualifying: r.qualifyingAt?.toISOString() ?? null,
      sprintQualifying: r.sprintQualifyingAt?.toISOString() ?? null,
      sprint: r.sprintAt?.toISOString() ?? null,
    },
  };
}

export function mapDriverStanding(s: DriverStandingRow): DriverStandingDto {
  return {
    position: s.position,
    positionText: s.positionText,
    points: s.points,
    wins: s.wins,
    round: s.round,
    driver: mapDriverRef(s.driver),
    constructors: s.constructorLinks.map((l) => mapConstructorRef(l.constructor)),
  };
}

export function mapConstructorStanding(s: ConstructorStandingRow): ConstructorStandingDto {
  return {
    position: s.position,
    positionText: s.positionText,
    points: s.points,
    wins: s.wins,
    round: s.round,
    constructor: mapConstructorRef(s.constructor),
  };
}

export function mapRaceResult(r: RaceResultRow): RaceResultDto {
  const fastestLap =
    r.fastestLapRank !== null && r.fastestLapNumber !== null && r.fastestLapTime !== null
      ? { rank: r.fastestLapRank, lap: r.fastestLapNumber, time: r.fastestLapTime }
      : null;
  return {
    position: r.position,
    positionText: r.positionText,
    points: r.points,
    grid: r.grid,
    laps: r.laps,
    status: r.status,
    timeMillis: r.timeMillis,
    timeText: r.timeText,
    fastestLap,
    driver: mapDriverRef(r.driver),
    constructor: mapConstructorRef(r.constructor),
  };
}

export function mapQualifyingResult(q: QualifyingResultRow): QualifyingResultDto {
  return {
    position: q.position,
    driver: mapDriverRef(q.driver),
    constructor: mapConstructorRef(q.constructor),
    q1: q.q1,
    q2: q.q2,
    q3: q.q3,
  };
}
