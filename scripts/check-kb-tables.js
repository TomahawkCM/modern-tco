#!/usr/bin/env node
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const conn = process.env.SUPABASE_DB_URL;
  if (!conn) {
    console.error('SUPABASE_DB_URL is required (set in .env.local)');
    process.exit(1);
  }
  const ssl = conn.includes('localhost') || conn.includes('127.0.0.1') ? false : { rejectUnauthorized: false };
  const client = new Client({ connectionString: conn, ssl });
  try {
    await client.connect();
    for (const t of ['kb_modules', 'kb_lessons', 'kb_questions']) {
      const r = await client.query('select to_regclass($1) as exists', [ `public.${t}` ]);
      console.log(`${t}:`, r.rows[0].exists ? 'present' : 'missing');
    }
    // Check view if it exists
    const v = await client.query("select to_regclass('public.question_statistics') as exists");
    console.log('question_statistics view:', v.rows[0].exists ? 'present' : 'missing');
  } catch (e) {
    console.error('KB check failed:', e.message);
    process.exitCode = 1;
  } finally {
    try { await client.end(); } catch {}
  }
}

main();
