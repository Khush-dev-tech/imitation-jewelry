import { PrismaClient } from "./generated/prisma/client";

/**
 * Prisma Client singleton — standard Next.js pattern to avoid exhausting
 * database connections from hot-reload creating a new client per request
 * in development.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
