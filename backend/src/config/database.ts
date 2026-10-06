import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/**
 * Executes a callback within a PostgreSQL transaction where the tenant context
 * is injected via `SET LOCAL app.current_tenant`.
 * 
 * Connection Pool Safety:
 * Because `SET LOCAL` is used inside a transaction block, PostgreSQL automatically
 * clears and reverts the setting as soon as the transaction commits or rolls back.
 * This guarantees zero cross-tenant contamination when connections return to the pool.
 */
export async function withTenantContext<T>(
  tenantId: string,
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    // Inject the verified tenant context into PostgreSQL RLS kernel
    await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${tenantId}'`);
    // Execute business operations within isolated tenant scope
    return await callback(tx as unknown as PrismaClient);
  });
}
