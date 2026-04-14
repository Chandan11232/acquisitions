import 'dotenv/config';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
const { DATABASE_URL, NEON_LOCAL_FETCH_ENDPOINT } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const isNeonLocalConnection =
  DATABASE_URL.includes('@neon-local:5432/') ||
  DATABASE_URL.includes('@localhost:5432/');

if (isNeonLocalConnection) {
  neonConfig.fetchEndpoint =
    NEON_LOCAL_FETCH_ENDPOINT ||
    (DATABASE_URL.includes('@localhost:5432/')
      ? 'http://localhost:5432/sql'
      : 'http://neon-local:5432/sql');
  neonConfig.poolQueryViaFetch = true;
  neonConfig.useSecureWebSocket = false;
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

export { db, sql };
