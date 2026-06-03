/**
 * Static rivalry config — driver IDs, era bounds, and defining-moment metadata.
 * Driver IDs must match Ergast/Jolpica driverId values in the database.
 *
 * Only cosmetic/structural config lives here — no race results, standings, or
 * statistics. Every data value comes from the API.
 */

export interface RivalryConfig {
  id: string;
  driverAId: string;
  driverBId: string;
  /** First season they competed together (for era range query). */
  eraStart: number;
  /** Last season they competed together. */
  eraEnd: number;
  /** Year of the defining moment. */
  definingYear: number;
  /** Ergast circuitId for the defining race. Optional. */
  definingCircuitId?: string;
  /** Human-readable circuit name. */
  definingCircuitName?: string;
  /** Title shown in the IconicMoment section. */
  definingTitle: string;
}

export const RIVALRIES: RivalryConfig[] = [
  {
    id: 'senna-prost',
    driverAId: 'senna',
    driverBId: 'prost',
    eraStart: 1984,
    eraEnd: 1993,
    definingYear: 1989,
    definingCircuitId: 'suzuka',
    definingCircuitName: 'Suzuka',
    definingTitle: 'COLLISION AT SUZUKA',
  },
  {
    id: 'hamilton-verstappen',
    driverAId: 'hamilton',
    driverBId: 'max_verstappen',
    eraStart: 2016,
    eraEnd: 2024,
    definingYear: 2021,
    definingCircuitId: 'yas_marina',
    definingCircuitName: 'Yas Marina',
    definingTitle: 'ABU DHABI DECIDES',
  },
  {
    id: 'schumacher-alonso',
    driverAId: 'schumacher',
    driverBId: 'alonso',
    eraStart: 2001,
    eraEnd: 2006,
    definingYear: 2006,
    definingTitle: 'THE FINAL SEASON',
  },
];

export function findRivalry(id: string): RivalryConfig | undefined {
  return RIVALRIES.find((r) => r.id === id);
}

/** Return all rivalry IDs a driver appears in. */
export function rivalriesForDriver(driverId: string): RivalryConfig[] {
  return RIVALRIES.filter(
    (r) => r.driverAId === driverId || r.driverBId === driverId,
  );
}
