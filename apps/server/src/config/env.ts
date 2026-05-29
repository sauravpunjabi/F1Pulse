import 'dotenv/config';

/**
 * Centralized, typed environment access. ALL third-party base URLs and secrets
 * live here on the server — never in apps/web (see CLAUDE.md HARD RULES).
 */
function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),

  // Origin of apps/web — used to lock CORS to our own frontend.
  webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',

  // Local infra (defaults match docker-compose.yml).
  databaseUrl: required(
    'DATABASE_URL',
    'postgresql://f1pulse:f1pulse@localhost:5432/f1pulse?schema=public',
  ),
  redisUrl: required('REDIS_URL', 'redis://localhost:6379'),

  // Third-party sources — server-only. The browser never sees these.
  jolpicaBaseUrl: process.env.JOLPICA_BASE_URL ?? 'https://api.jolpi.ca/ergast/f1',
  openf1BaseUrl: process.env.OPENF1_BASE_URL ?? 'https://api.openf1.org/v1',
} as const;

export const isProduction = env.nodeEnv === 'production';
