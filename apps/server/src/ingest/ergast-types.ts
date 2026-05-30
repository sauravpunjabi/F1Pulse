/**
 * Raw Ergast/Jolpica JSON response types — modeled to the ACTUAL shapes returned
 * by api.jolpi.ca (inspected live before writing; see CLAUDE.md HARD RULE #4).
 *
 * Everything is a string in Ergast (numbers, dates, times). Conversion to real
 * types happens in the mappers (parse.ts + ingest.ts), never here.
 */

export interface ErgastResponse {
  MRData: ErgastMRData;
}

export interface ErgastMRData {
  total: string;
  limit: string;
  offset: string;
  RaceTable?: ErgastRaceTable;
  StandingsTable?: ErgastStandingsTable;
  SeasonTable?: ErgastSeasonTable;
}

export interface ErgastSeasonTable {
  Seasons: ErgastSeason[];
}

export interface ErgastSeason {
  season: string;
  url?: string;
}

export interface ErgastRaceTable {
  season?: string;
  round?: string;
  Races: ErgastRace[];
}

export interface ErgastSession {
  date: string;
  time?: string;
}

export interface ErgastLocation {
  lat?: string;
  long?: string;
  locality?: string;
  country?: string;
}

export interface ErgastCircuit {
  circuitId: string;
  url?: string;
  circuitName: string;
  Location?: ErgastLocation;
}

export interface ErgastDriver {
  driverId: string;
  permanentNumber?: string;
  code?: string;
  url?: string;
  givenName: string;
  familyName: string;
  dateOfBirth?: string;
  nationality?: string;
}

export interface ErgastConstructor {
  constructorId: string;
  url?: string;
  name: string;
  nationality?: string;
}

export interface ErgastResult {
  number?: string;
  position: string;
  positionText: string;
  points: string;
  Driver: ErgastDriver;
  Constructor: ErgastConstructor;
  grid: string;
  laps: string;
  status: string;
  Time?: { millis?: string; time?: string };
  FastestLap?: {
    rank?: string;
    lap?: string;
    Time?: { time?: string };
    AverageSpeed?: { units?: string; speed?: string };
  };
}

export interface ErgastQualifyingResult {
  number?: string;
  position: string;
  Driver: ErgastDriver;
  Constructor: ErgastConstructor;
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

export interface ErgastRace {
  season: string;
  round: string;
  url?: string;
  raceName: string;
  Circuit: ErgastCircuit;
  date: string;
  time?: string;
  FirstPractice?: ErgastSession;
  SecondPractice?: ErgastSession;
  ThirdPractice?: ErgastSession;
  Qualifying?: ErgastSession;
  Sprint?: ErgastSession;
  SprintQualifying?: ErgastSession;
  Results?: ErgastResult[];
  QualifyingResults?: ErgastQualifyingResult[];
}

export interface ErgastStandingsTable {
  season?: string;
  round?: string;
  StandingsLists: ErgastStandingsList[];
}

export interface ErgastStandingsList {
  season: string;
  round: string;
  DriverStandings?: ErgastDriverStanding[];
  ConstructorStandings?: ErgastConstructorStanding[];
}

export interface ErgastDriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: ErgastDriver;
  Constructors: ErgastConstructor[];
}

export interface ErgastConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: ErgastConstructor;
}
