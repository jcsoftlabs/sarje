import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// Reuse a single connection across hot-reloads / serverless invocations.
const globalForDb = globalThis as unknown as { _sarjeSql?: ReturnType<typeof postgres> };

const sql =
  globalForDb._sarjeSql ??
  postgres(connectionString, {
    max: 5,
    ssl: 'require',
    prepare: false,
  });

if (process.env.NODE_ENV !== 'production') globalForDb._sarjeSql = sql;

export const db = drizzle(sql, { schema });
export { schema };
