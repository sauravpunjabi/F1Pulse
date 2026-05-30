/**
 * CLI: `pnpm ingest:history --from 1950 --to <lastCompletedSeason>`
 *
 * Flags:
 *   --from <year>     start season (default 1950)
 *   --to <year>       end season (default: last completed season = currentYear - 1)
 *   --progression     also fetch per-round standings snapshots (heavy; overnight job)
 *   --qualifying      also fetch qualifying results (sparse before ~1994)
 *   --force           re-ingest seasons even if already marked done
 *
 * Resumable and idempotent — safe to stop and re-run.
 */
import { prisma } from '../lib/prisma.js';
import { ingestHistory } from '../ingest/history.js';

interface Args {
  from: number;
  to: number;
  progression: boolean;
  qualifying: boolean;
  force: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    from: 1950,
    to: new Date().getUTCFullYear() - 1, // last completed season
    progression: false,
    qualifying: false,
    force: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--from') args.from = Number(argv[(i += 1)]);
    else if (token === '--to') args.to = Number(argv[(i += 1)]);
    else if (token === '--progression') args.progression = true;
    else if (token === '--qualifying') args.qualifying = true;
    else if (token === '--force') args.force = true;
  }
  if (!Number.isInteger(args.from) || !Number.isInteger(args.to) || args.from > args.to) {
    throw new Error(`Invalid range: --from ${args.from} --to ${args.to}`);
  }
  return args;
}

/* eslint-disable no-console */
async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const mode = args.progression ? 'results + per-round progression' : 'results + final standings';
  console.log(
    `⏱  Historical ingest ${args.from} → ${args.to}  [${mode}${args.qualifying ? ' + qualifying' : ''}]\n`,
  );
  const startedAt = Date.now();

  const result = await ingestHistory({ ...args, log: (m) => console.log(m) });

  const minutes = ((Date.now() - startedAt) / 60000).toFixed(1);
  console.log(`\n✅ History ingest finished in ${minutes} min`);
  console.log(`   seasons processed: ${result.seasonsProcessed}`);
  console.log(`   seasons skipped (already done): ${result.seasonsSkipped}`);
  console.log(`   seasons failed: ${result.seasonsFailed}`);
  console.log(`   data gaps logged: ${result.gaps.length}`);
  if (result.seasonsFailed > 0) {
    console.log(
      '\n   Some seasons failed — re-run the same command to retry just those (resumable).',
    );
  }
}

main()
  .catch((error) => {
    console.error('\n❌ History ingest failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
