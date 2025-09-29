#!/usr/bin/env node

// Apply a local SQL file to Supabase Postgres via direct connection (pg)
// Requires SUPABASE_DB_URL in .env.local

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dns = require('dns');
try { if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first'); } catch {}
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

function parseArgs(argv) {
  const out = { file: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if ((a === '--file' || a === '-f') && argv[i + 1]) out.file = argv[++i];
  }
  return out;
}

async function main() {
  const { file } = parseArgs(process.argv.slice(2));
  if (!file) {
    console.error('Usage: node scripts/apply-sql.js --file <path-to-sql>');
    process.exit(1);
  }
  const filePath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.error(`SQL file not found: ${filePath}`);
    process.exit(1);
  }

  const conn = process.env.SUPABASE_DB_URL;
  if (!conn) {
    console.error('Missing SUPABASE_DB_URL. Add it to .env.local');
    process.exit(1);
  }

  const ssl = conn.includes('localhost') || conn.includes('127.0.0.1') ? false : { rejectUnauthorized: false };
  const sql = fs.readFileSync(filePath, 'utf8');

  // Prefer IPv4: parse connection and resolve host to IPv4 address
  let client;
  try {
    const u = new URL(conn);
    const host = u.hostname;
    const port = Number(u.port || 5432);
    const user = decodeURIComponent(u.username || 'postgres');
    const password = decodeURIComponent(u.password || '');
    const database = decodeURIComponent((u.pathname || '/postgres').replace(/^\//, ''));
    let hostAddr = host;
    try {
      const v4 = dns.lookupSync ? dns.lookupSync(host, { family: 4 }) : null;
      if (v4 && v4.address) hostAddr = v4.address;
    } catch {}
    // If lookupSync not available, fall back to async by blocking await using deasync? Skip: pg will still try IPv4 first due to setDefaultResultOrder
    client = new Client({ host: hostAddr, port, user, password, database, ssl, statement_timeout: 0 });
  } catch {
    client = new Client({ connectionString: conn, ssl, statement_timeout: 0 });
  }
  console.log(`Applying SQL file: ${path.relative(process.cwd(), filePath)}`);
  try {
    await client.connect();
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('SQL applied successfully.');
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('Failed to apply SQL:', err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    try { await client.end(); } catch {}
  }
}

main();
