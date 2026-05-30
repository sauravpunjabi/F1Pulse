/**
 * One-off degradation test: forces circuit breaker open by pointing OpenF1
 * at a dead host, then verifies deriveWeekendStatus() still returns a valid
 * schedule-based response instead of throwing.
 *
 * Usage: OPENF1_BASE_URL=http://127.0.0.1:19999 npx tsx src/cli/test-live-degraded.ts
 */
import { deriveWeekendStatus } from '../live/session-state.js';
import { isOpenF1Available } from '../clients/openf1.js';

/* eslint-disable no-console */

console.log('OpenF1 base URL (from env):', process.env['OPENF1_BASE_URL'] ?? '(default)');

// Trip the circuit breaker: 3 consecutive calls exhaust the failure threshold.
console.log('\n--- Tripping circuit breaker (3 calls) ---');
for (let i = 1; i <= 3; i++) {
  const s = await deriveWeekendStatus();
  console.log(`  call ${i}: openf1Available=${s.openf1Available}, status=${s.status}`);
}

console.log('\nOpenF1 circuit open after 3 failures:', !isOpenF1Available());

// 4th call — circuit is open, no request made to OpenF1, schedule-only response.
console.log('\n--- 4th call with circuit open ---');
const status = await deriveWeekendStatus();
console.log(JSON.stringify(status, null, 2));

const isCorrectlyDegraded = !status.openf1Available;
console.log(
  isCorrectlyDegraded
    ? '\n✓ openf1Available=false — schedule-only response served correctly'
    : '\n✗ UNEXPECTED: openf1Available is still true',
);
console.log('✓ Status returned without throwing:', status.status);
