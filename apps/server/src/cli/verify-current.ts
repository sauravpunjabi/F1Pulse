/**
 * CLI: `pnpm verify:current`
 * Proves — via real Prisma queries against Postgres — that the current season's
 * standings, schedule, and latest results landed. Reads only from our DB.
 */
import { prisma } from '../lib/prisma.js';

/* eslint-disable no-console */
async function main(): Promise<void> {
  const season = await prisma.season.findFirst({ orderBy: { year: 'desc' } });
  if (!season) {
    console.log('No seasons in the database yet — run `pnpm ingest:current` first.');
    return;
  }
  const year = season.year;
  console.log(`\n════════ F1Pulse DB proof — season ${year} ════════\n`);

  // Latest round for which we have driver standings.
  const latest = await prisma.driverStanding.aggregate({
    where: { seasonYear: year },
    _max: { round: true },
  });
  const round = latest._max.round ?? 0;

  // 1) Championship standings (top 5) as of the latest round.
  const topDrivers = await prisma.driverStanding.findMany({
    where: { seasonYear: year, round },
    orderBy: { position: 'asc' },
    take: 5,
    include: { driver: true, constructorLinks: { include: { constructor: true } } },
  });
  console.log(`▸ Driver standings — after round ${round} (top 5):`);
  for (const s of topDrivers) {
    const team = s.constructorLinks[0]?.constructor.name ?? '—';
    console.log(
      `   ${String(s.position).padStart(2)}. ${s.driver.givenName} ${s.driver.familyName}` +
        `  ${String(s.points).padStart(5)} pts  (${team})`,
    );
  }

  const topTeams = await prisma.constructorStanding.findMany({
    where: { seasonYear: year, round },
    orderBy: { position: 'asc' },
    take: 3,
    include: { constructor: true },
  });
  console.log(`\n▸ Constructor standings — after round ${round} (top 3):`);
  for (const s of topTeams) {
    console.log(
      `   ${String(s.position).padStart(2)}. ${s.constructor.name}  ${String(s.points).padStart(5)} pts`,
    );
  }

  // 2) Schedule.
  const raceCount = await prisma.race.count({ where: { seasonYear: year } });
  const firstRace = await prisma.race.findFirst({
    where: { seasonYear: year },
    orderBy: { round: 'asc' },
    include: { circuit: true },
  });
  const lastScheduled = await prisma.race.findFirst({
    where: { seasonYear: year },
    orderBy: { round: 'desc' },
    include: { circuit: true },
  });
  console.log(`\n▸ Schedule — ${raceCount} races`);
  if (firstRace) {
    console.log(
      `   R1:  ${firstRace.name}  · ${firstRace.circuit.name}, ${firstRace.circuit.country}` +
        `  · ${firstRace.date.toISOString().slice(0, 10)}`,
    );
  }
  if (lastScheduled) {
    console.log(
      `   R${lastScheduled.round}: ${lastScheduled.name}  · ${lastScheduled.circuit.name}` +
        `  · ${lastScheduled.date.toISOString().slice(0, 10)}`,
    );
  }

  // 3) Latest results — the podium of the most recent completed round.
  const podium = await prisma.raceResult.findMany({
    where: { race: { seasonYear: year, round }, position: { lte: 3 } },
    orderBy: { position: 'asc' },
    include: { driver: true, constructor: true, race: true },
  });
  if (podium[0]) {
    console.log(`\n▸ Latest results — ${podium[0].race.name} (round ${round}) podium:`);
    for (const r of podium) {
      console.log(
        `   ${r.position}. ${r.driver.givenName} ${r.driver.familyName} (${r.constructor.name})` +
          `  grid ${r.grid} → ${r.positionText}  ${r.timeText ?? ''}`,
      );
    }
  }

  // 4) Progression proof: leader's points round-by-round.
  const leaderId = topDrivers[0]?.driverId;
  if (leaderId) {
    const progression = await prisma.driverStanding.findMany({
      where: { seasonYear: year, driverId: leaderId },
      orderBy: { round: 'asc' },
      select: { round: true, points: true, position: true },
    });
    const leaderName = `${topDrivers[0]?.driver.givenName} ${topDrivers[0]?.driver.familyName}`;
    console.log(`\n▸ Progression proof — ${leaderName}, points by round:`);
    console.log(
      '   ' + progression.map((p) => `R${p.round}:${p.points}(P${p.position})`).join('  '),
    );
  }

  console.log('\n═══════════════════════════════════════════════════\n');
}

main()
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
