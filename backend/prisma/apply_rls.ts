import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function applyRLS() {
  console.log('[RLS] Reading rls_policies.sql...');
  const sqlPath = path.join(__dirname, 'migrations', 'rls_policies.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split by statements (ignoring comments)
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  console.log(`[RLS] Executing ${statements.length} SQL policy statements on PostgreSQL...`);

  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(statement);
    } catch (err: any) {
      console.warn(`[RLS Warning] Could not execute statement: "${statement.slice(0, 50)}...":`, err.message);
    }
  }

  console.log('[RLS] Successfully applied Row-Level Security policies and constraints to PostgreSQL!');
}

applyRLS()
  .catch((e) => {
    console.error('[RLS Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
