#!/usr/bin/env tsx

// Sets up public KB tables/views using a direct Postgres connection.
// Uses SUPABASE_DB_URL or DIRECT_DATABASE_URL or DATABASE_URL from .env.local

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

function getConnectionString(): string {
  const candidates = [
    process.env.SUPABASE_DB_URL,
    process.env.DIRECT_DATABASE_URL,
    process.env.DATABASE_URL,
  ].filter((v): v is string => typeof v === 'string' && v.length > 0);
  if (candidates.length === 0) {
    throw new Error(
      'Database connection string not found. Set SUPABASE_DB_URL, DIRECT_DATABASE_URL, or DATABASE_URL in .env.local'
    );
  }
  return candidates[0];
}

async function main() {
  const sqlPath = path.join(process.cwd(), 'scripts', 'sql', 'public_kb_setup.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const conn = getConnectionString();
  const ssl = conn.includes('localhost') || conn.includes('127.0.0.1')
    ? false
    : { rejectUnauthorized: false } as any;

  const client = new Client({ connectionString: conn, ssl });
  console.log('Setting up public KB schema (modules, lessons, questions, view)...');

  try {
    await client.connect();
    // Run as a single batch to preserve DO $$ blocks and function bodies
    await client.query(sql);
    console.log('Public KB schema applied successfully.');
  } catch (err: any) {
    console.error('Failed to apply public KB schema:', err?.message || err);
    process.exitCode = 1;
  } finally {
    try { await client.end(); } catch {}
  }
}

main();

