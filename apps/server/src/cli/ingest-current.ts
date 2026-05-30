/**
 * CLI: `pnpm ingest:current`
 * Ingests the live F1 season from Jolpica into Postgres (idempotent — safe to re-run).
 */
import { prisma } from '../lib/prisma.js';
import { ingestCurrentSeason } from '../ingest/ingest.js';

/* eslint-disable no-console */
async function main(): Promise<void> {
  console.log('⏱  Ingesting current F1 season from Jolpica…\n');
  const startedAt = Date.now();

  const summary = await ingestCurrentSeason((message) => console.log(`   · ${message}`));

  const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log('\n✅ Ingest complete in ' + seconds + 's');
  console.log(`   season:               ${summary.seasonYear}`);
  console.log(`   latest round:         ${summary.latestRound}`);
  console.log(`   schedule races:       ${summary.scheduleRaces}`);
  console.log(`   race results:         ${summary.raceResults}`);
  console.log(`   qualifying results:   ${summary.qualifyingResults}`);
  console.log(`   driver standing rows: ${summary.driverStandingRows}`);
  console.log(`   constructor rows:     ${summary.constructorStandingRows}`);
}

main()
  .catch((error) => {
    console.error('\n❌ Ingest failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
