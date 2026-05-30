/**
 * CLI: `pnpm data:integrity`
 * Flags seasons/rounds with missing data so the frontend can render honest empty
 * states instead of broken UI. It REPORTS gaps — it never fills or fabricates them.
 */
import { prisma } from '../lib/prisma.js';

/* eslint-disable no-console */
async function main(): Promise<void> {
  const now = new Date();
  console.log('\n═══════════ F1Pulse — data integrity report ═══════════\n');

  const [seasons, races, pastRaces, racesWithResults] = await Promise.all([
    prisma.season.count(),
    prisma.race.count(),
    prisma.race.count({ where: { date: { lt: now } } }),
    prisma.race.count({ where: { results: { some: {} } } }),
  ]);

  console.log(
    `Coverage: ${seasons} seasons · ${races} races (${pastRaces} already run) · ` +
      `${racesWithResults} have results`,
  );

  // Past races with no results = genuine gaps (upcoming races are excluded).
  const missing = await prisma.race.findMany({
    where: { date: { lt: now }, results: { none: {} } },
    orderBy: [{ seasonYear: 'asc' }, { round: 'asc' }],
    select: { seasonYear: true, round: true, name: true },
  });

  const bySeason = new Map<number, { round: number; name: string }[]>();
  for (const r of missing) {
    const list = bySeason.get(r.seasonYear) ?? [];
    list.push({ round: r.round, name: r.name });
    bySeason.set(r.seasonYear, list);
  }

  console.log(`\n▸ Completed races missing results: ${missing.length}`);
  if (missing.length === 0) {
    console.log('   none — every race that has run has results 🎉');
  } else {
    for (const [year, list] of [...bySeason].sort((a, b) => a[0] - b[0])) {
      console.log(`   ${year}: ${list.map((l) => `R${l.round} ${l.name}`).join(' · ')}`);
    }
  }

  // Seasons missing standings entirely.
  const seasonRows = await prisma.season.findMany({
    orderBy: { year: 'asc' },
    select: {
      year: true,
      _count: { select: { driverStandings: true, constructorStandings: true } },
    },
  });
  const noDriver = seasonRows.filter((s) => s._count.driverStandings === 0).map((s) => s.year);
  const noConstructor = seasonRows
    .filter((s) => s._count.constructorStandings === 0)
    .map((s) => s.year);

  console.log(`\n▸ Seasons with NO driver standings: ${noDriver.length}`);
  if (noDriver.length) console.log(`   ${noDriver.join(', ')}`);
  console.log(`▸ Seasons with NO constructor standings: ${noConstructor.length}`);
  if (noConstructor.length) console.log(`   ${noConstructor.join(', ')}`);
  console.log("   (the Constructors' Championship began in 1958 — earlier absence is expected)");

  console.log('\n   Gaps are reported, not filled. Render honest empty states downstream.\n');
}

main()
  .catch((error) => {
    console.error('Integrity report failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
