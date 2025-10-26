#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "pg";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

type ApplyOptions = {
  schemaFile: string;
  dryRun: boolean;
};

function resolveOptions(): ApplyOptions {
  const args = process.argv.slice(2);
  let schemaFile = path.join(process.cwd(), "docs", "KB", "export", "SCHEMA_SQL_SETUP_KB.sql");
  let dryRun = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--schema" || arg === "-s") {
      const next = args[i + 1];
      if (!next) {
        throw new Error("Missing value for --schema option");
      }
      schemaFile = path.resolve(process.cwd(), next);
      i += 1;
    } else if (arg === "--dry-run" || arg === "--check") {
      dryRun = true;
    }
  }

  return { schemaFile, dryRun };
}

function loadSql(schemaFile: string): string {
  if (!fs.existsSync(schemaFile)) {
    throw new Error(`Schema file not found at ${schemaFile}`);
  }

  const sql = fs.readFileSync(schemaFile, "utf-8").trim();
  if (!sql) {
    throw new Error(`Schema file ${schemaFile} is empty`);
  }

  return sql;
}

function getConnectionString(): string {
  const candidates = [
    process.env.SUPABASE_DB_URL,
    process.env.DIRECT_DATABASE_URL,
    process.env.DATABASE_URL,
  ].filter((value): value is string => typeof value === "string" && value.length > 0);

  if (candidates.length === 0) {
    throw new Error(
      "Database connection string not found. Set SUPABASE_DB_URL, DIRECT_DATABASE_URL, or DATABASE_URL in .env.local"
    );
  }

  return candidates[0] as string;
}

async function applySchema(sql: string, options: ApplyOptions) {
  const connectionString = getConnectionString();

  if (options.dryRun) {
    console.log("?? Dry run: skipping execution");
    console.log(`?? Target database: ${connectionString}`);
    console.log(`?? SQL statements preview (first 240 chars)\n${sql.slice(0, 240)}...`);
    return;
  }

  const ssl = connectionString.includes("localhost")
    ? false
    : { rejectUnauthorized: false };

  const client = new Client({ connectionString, ssl });

  console.log("?? Connecting to database...");
  await client.connect();

  try {
    console.log("?? Applying KB schema...");
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("?? KB schema applied successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("?? Failed to apply schema:", (error as Error).message);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    const options = resolveOptions();
    const sql = loadSql(options.schemaFile);

    console.log("?? KB Schema Apply Tool");
    console.log("?? Schema file:", options.schemaFile);

    await applySchema(sql, options);
  } catch (error) {
    console.error("?? KB schema apply failed:", (error as Error).message);
    process.exitCode = 1;
  }
}

if (process.argv[1] === __filename) {
  main();
}

export { applySchema };