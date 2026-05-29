import { PrismaClient } from '@prisma/client';
import { isProduction } from '../config/env.js';

/**
 * Single shared PrismaClient. In dev, persist across tsx hot-reloads via globalThis
 * so we don't exhaust the connection pool. The DB is the only source of race data
 * served to the frontend (see CLAUDE.md HARD RULES).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProduction ? ['error'] : ['warn', 'error'],
  });

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
