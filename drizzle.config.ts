import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema/*.ts',
  out: './db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
  },
} satisfies Config; 