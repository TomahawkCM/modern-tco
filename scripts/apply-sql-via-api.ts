#!/usr/bin/env tsx
/**
 * Apply a local SQL file to Supabase via Management API (uses PAT).
 * Requires: SUPABASE_ACCESS_TOKEN and project ref (SUPABASE_PROJECT_REF or parse from NEXT_PUBLIC_SUPABASE_URL)
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env from .env.local if present
const envLocal = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal });
else dotenv.config();

function parseArgs(argv: string[]) {
  const out: { file?: string } = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if ((a === '--file' || a === '-f') && argv[i + 1]) out.file = argv[++i];
  }
  return out;
}

function inferProjectRef(): string | null {
  const ref = process.env.SUPABASE_PROJECT_REF || process.env.SUPABASE_PROJECT_ID;
  if (ref) return ref;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  try {
    const u = new URL(url);
    const host = u.hostname; // e.g. qnwcwoutgarhqxlgsjzs.supabase.co
    const projectRef = host.split('.')[0];
    return projectRef || null;
  } catch {
    return null;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const filePath = args.file ? (path.isAbsolute(args.file) ? args.file : path.resolve(process.cwd(), args.file)) : '';
  if (!filePath || !fs.existsSync(filePath)) {
    console.error('Usage: tsx scripts/apply-sql-via-api.ts --file <sql-file>');
    process.exit(1);
  }

  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const ref = inferProjectRef();
  if (!token || !ref) {
    console.error('Missing SUPABASE_ACCESS_TOKEN or project ref (SUPABASE_PROJECT_REF or parseable NEXT_PUBLIC_SUPABASE_URL).');
    process.exit(1);
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  const apiUrl = `https://api.supabase.com/v1/projects/${ref}/sql`;

  console.log(`Applying SQL to project ${ref} via Management API: ${path.relative(process.cwd(), filePath)}`);
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`Failed: HTTP ${res.status}`);
    console.error(text);
    process.exit(1);
  }
  console.log('Success applying SQL. Response:');
  console.log(text);
}

main().catch((e) => {
  console.error('Error:', e?.message || e);
  process.exit(1);
});

