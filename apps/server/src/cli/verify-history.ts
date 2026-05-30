/**
 * CLI: `pnpm verify:history`
 * Answers four canonical F1 questions ENTIRELY from ingested Postgres data — no
 * hardcoded answers. If a needed season isn't ingested yet, it says so honestly.
 */
import { prisma } from '../lib/prisma.js';

/* eslint-disable no-console */
async function main(): Promise<void> {
  console.log('\n═══════ F1Pulse — historical proof (all from Postgres) ═══════\n');

  // 1) 1950 World Drivers' Champion = position 1 in the final standings snapshot.
  const champ1950 = await prisma.driverStanding.findFirst({
    where: { seasonYear: 1950, position: 1 },
    orderBy: { round: 'desc' },
    include: { driver: true, constructorLinks: { include: { constructor: true } } },
  });
  if (champ1950) {
    const team = champ1950.constructorLinks[0]?.constructor.name ?? '—';
    console.log(
      `▸ 1950 World Champion: ${champ1950.driver.givenName} ${champ1950.driver.familyName}` +
        `  — ${champ1950.points} pts, ${champ1950.wins} wins (${team})`,
    );
  } else {
    console.log('▸ 1950 champion: 1950 not ingested yet');
  }

  // 2) Ayrton Senna's career wins (race results with position 1). Disambiguated
  //    from his nephew Bruno Senna by given name.
  const senna = await prisma.driver.findFirst({
    where: { givenName: 'Ayrton', familyName: 'Senna' },
  });
  if (senna) {
    const [wins, starts] = await Promise.all([
      prisma.raceResult.count({ where: { driverId: senna.driverId, position: 1 } }),
      prisma.raceResult.count({ where: { driverId: senna.driverId } }),
    ]);
    console.log(`▸ Ayrton Senna — career wins: ${wins}  (from ${starts} race results in DB)`);
  } else {
    console.log('▸ Senna: his era not ingested yet');
  }

  // 3) Ferrari Constructors' Championships = position 1 at each season's FINAL round.
  const finals = await prisma.constructorStanding.groupBy({
    by: ['seasonYear'],
    _max: { round: true },
  });
  const finalRound = new Map(finals.map((f) => [f.seasonYear, f._max.round ?? 0]));
  const ferrariP1 = await prisma.constructorStanding.findMany({
    where: { constructorId: 'ferrari', position: 1 },
  });
  const ferrariYears = ferrariP1
    .filter((r) => r.round === finalRound.get(r.seasonYear))
    .map((r) => r.seasonYear)
    .sort((a, b) => a - b);
  console.log(
    `▸ Ferrari Constructors' Championships: ${ferrariYears.length}` +
      (ferrariYears.length ? ` — ${ferrariYears.join(', ')}` : ' (none in ingested range)'),
  );

  // 4) Michael Schumacher's points in his dominant 2004 season (final snapshot).
  const schu2004 = await prisma.driverStanding.findFirst({
    where: { seasonYear: 2004, driver: { givenName: 'Michael', familyName: 'Schumacher' } },
    orderBy: { round: 'desc' },
    include: { driver: true },
  });
  if (schu2004) {
    console.log(
      `▸ Michael Schumacher 2004: ${schu2004.points} pts, ${schu2004.wins} wins, finished P${schu2004.position}`,
    );
  } else {
    console.log('▸ Schumacher 2004: 2004 not ingested yet');
  }

  console.log('');
}

main()
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
