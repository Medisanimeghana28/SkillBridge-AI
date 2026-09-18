import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new pg.Client({
  host: process.env.SB_DB || 'db.dhsudmveawezorgrwopc.supabase.co',
  port: 5432,
  user: process.env.SB_USER || 'postgres',
  password: process.env.SB_PASS || 'Skillbridge-AI',
  database: process.env.SB_DBNAME || 'postgres',
  ssl: { rejectUnauthorized: false }
});

await client.connect();

// Canonical sources of truth (idempotent: IF NOT EXISTS / DROP IF EXISTS).
for (const f of ['../supabase/schema.sql', '../supabase/rls_policies.sql']) {
  const sql = readFileSync(path.join(__dirname, f), 'utf8');
  await client.query(sql);
  console.log('Applied', f);
}

const tabs = await client.query("select tablename from pg_tables where schemaname='public' order by tablename");
console.log('Tables:', tabs.rows.map(r => r.tablename).join(', '));
const pols = await client.query("select count(*)::int n from pg_policies where schemaname='public'");
console.log('Public policies:', pols.rows[0].n);
await client.end();
