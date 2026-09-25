import { PrismaClient } from '@prisma/client';

// Singleton instance to prevent multiple client instances during Next.js App Router hot-reloading
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const baseClient = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // SEC-06: Prisma client extension enforcing append-only immutability for AuditEvent
  return baseClient.$extends({
    query: {
      auditEvent: {
        update() {
          throw new Error('AuditEvent is append-only: update operations are prohibited (SEC-06)');
        },
        updateMany() {
          throw new Error('AuditEvent is append-only: update operations are prohibited (SEC-06)');
        },
        delete() {
          throw new Error('AuditEvent is append-only: delete operations are prohibited (SEC-06)');
        },
        deleteMany() {
          throw new Error('AuditEvent is append-only: delete operations are prohibited (SEC-06)');
        },
        upsert() {
          throw new Error('AuditEvent is append-only: upsert operations are prohibited (SEC-06)');
        },
      },
    },
  });
};

export type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

export const prisma = (globalForPrisma.prisma as unknown as ExtendedPrismaClient) ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma as unknown as PrismaClient;
}

export default prisma;
