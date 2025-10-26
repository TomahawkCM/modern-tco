#!/usr/bin/env tsx

/**
 * Apply a local SQL file to the Supabase Postgres database using a direct
 * connection. Requires a connection string via SUPABASE_DB_URL, or pass it
 * inline when invoking the script.
 *
 * Example:
 *   SUPABASE_DB_URL=postgresql://postgres:ENCODED@db.<ref>.supabase.co:5432/postgres \
 *   tsx scripts/apply-sql.ts --file supabase/migrations/20250920090000_add_analytics_and_lab_tables.sql
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';
import dns from 'node:dns/promises';
import { setDefaultResultOrder } from 'dns';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Prefer IPv4 to avoid IPv6 connectivity issues in some environments
try { setDefaultResultOrder('ipv4first'); } catch {}

function parseArgs(argv: string[]): { file?: string } {
  const out: { file?: string } = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if ((a === '--file' || a === '-f') && argv[i + 1]) {
      out.file = argv[++i];
    }
  }
  return out;
}

async function main() {
  const { file } = parseArgs(process.argv.slice(2));
  if (!file) {
    console.error('Usage: tsx scripts/apply-sql.ts --file <path-to-sql>');
    process.exit(1);
  }

  const filePath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.error(`SQL file not found: ${filePath}`);
    process.exit(1);
  }

  const conn = process.env.SUPABASE_DB_URL;
  if (!conn) {
    console.error('Missing SUPABASE_DB_URL. Provide a direct Postgres connection string.');
    process.exit(1);
  }

  const ssl = conn.includes('localhost') || conn.includes('127.0.0.1')
    ? false
    : ({ rejectUnauthorized: false } as any);

  const sql = fs.readFileSync(filePath, 'utf8');

  console.log(`Applying SQL file: ${path.relative(process.cwd(), filePath)}`);
  // Parse connection string to force IPv4 if needed
  let client: Client | null = null;
  try {
    const u = new URL(conn);
    const host = u.hostname;
    const port = Number(u.port || 5432);
    const user = decodeURIComponent(u.username);
    const password = decodeURIComponent(u.password);
    const database = decodeURIComponent(u.pathname.replace(/^\//, ''));
    let hostAddr = host;
    try {
      const v4 = await dns.lookup(host, { family: 4 });
      hostAddr = v4.address || host;
    } catch {}
    client = new Client({ host: hostAddr, port, user, password, database, ssl, statement_timeout: 0 as any });
  } catch {
    // Fallback: use connection string as-is
    client = new Client({ connectionString: conn, ssl, statement_timeout: 0 as any });
  }

  try {
    await client.connect();
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('SQL applied successfully.');
  } catch (err: any) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('Failed to apply SQL:', err?.message || err);
    process.exitCode = 1;
  } finally {
    try { await client.end(); } catch {}
  }
}

main();
