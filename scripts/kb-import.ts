#!/usr/bin/env tsx

import path from "path";
import * as url from "url";
import dotenv from "dotenv";
import { Client } from "pg";

import { buildModuleIndex, loadKbLessons } from "./lib/kb-lesson-loader";

type ImportOptions = {
  schema: string;
  lessonsDir: string;
  dryRun: boolean;
};

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

function resolveOptions(): ImportOptions {
  const args = process.argv.slice(2);
  let schema = process.env.KB_SCHEMA || "kb";
  let lessonsDir = path.join(process.cwd(), "docs", "KB", "lessons");
  let dryRun = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case "--schema":
      case "-s": {
        const next = args[i + 1];
        if (!next) throw new Error("Missing schema name after --schema");
        schema = next;
        i += 1;
        break;
      }
      case "--lessons":
      case "-l": {
        const next = args[i + 1];
        if (!next) throw new Error("Missing directory after --lessons");
        lessonsDir = path.resolve(process.cwd(), next);
        i += 1;
        break;
      }
      case "--dry-run":
      case "--check":
      case "-d":
        dryRun = true;
        break;
      default:
        break;
    }
  }

  if (!/^[a-zA-Z0-9_]+$/.test(schema)) {
    throw new Error(`Invalid schema name '${schema}'. Use alphanumeric and underscores only.`);
  }

  return { schema, lessonsDir, dryRun };
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

async function importLessons(options: ImportOptions) {
  const lessons = loadKbLessons(options.lessonsDir);
  const modulesIndex = buildModuleIndex(lessons);
  const modules = Object.values(modulesIndex).sort((a, b) => a.order - b.order);

  console.log(`?? Loaded ${lessons.length} lesson stub(s) across ${modules.length} module(s)`);

  if (options.dryRun) {
    console.log("\n?? Dry run preview:");
    modules.forEach((module) => {
      console.log(`- ${module.id} (${module.domain}) -> ${module.lessons.length} lesson(s)`);
      module.lessons.forEach((lesson) => {
        console.log(`   • ${lesson.slug} [${lesson.status}]`);
      });
    });
    return;
  }

  const connectionString = getConnectionString();
  const ssl = connectionString.includes("localhost")
    ? false
    : { rejectUnauthorized: false };

  const client = new Client({ connectionString, ssl });
  await client.connect();

  try {
    await client.query("BEGIN");

    for (const module of modules) {
      await client.query(
        `insert into ${options.schema}.kb_modules (id, title, domain, description, status, order_index, metadata)
         values ($1, $2, $3, $4, $5, $6, $7)
         on conflict (id) do update
           set title = excluded.title,
               domain = excluded.domain,
               description = excluded.description,
               status = excluded.status,
               order_index = excluded.order_index,
               metadata = excluded.metadata,
               updated_at = now()`,
        [
          module.id,
          module.title,
          module.domain,
          module.description ?? null,
          module.status,
          module.order,
          module.metadata,
        ]
      );
    }

    for (const lesson of lessons) {
      await client.query(
        `insert into ${options.schema}.kb_lessons (module_id, slug, title, summary, duration_minutes, content, tags, contributors, status, skill_level)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         on conflict (module_id, slug) do update
           set title = excluded.title,
               summary = excluded.summary,
               duration_minutes = excluded.duration_minutes,
               content = excluded.content,
               tags = excluded.tags,
               contributors = excluded.contributors,
               status = excluded.status,
               skill_level = excluded.skill_level,
               updated_at = now()`,
        [
          lesson.moduleId,
          lesson.slug,
          lesson.title,
          lesson.summary,
          lesson.durationMinutes ?? null,
          lesson.content,
          lesson.tags,
          lesson.contributors,
          lesson.status,
          lesson.skillLevel,
        ]
      );
    }

    await client.query("COMMIT");

    console.log(`?? Imported ${modules.length} module(s) and ${lessons.length} lesson(s)`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("?? Failed to import lessons:", (error as Error).message);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    const options = resolveOptions();
    console.log("?? KB Lesson Importer");
    console.log("?? Schema:", options.schema);
    console.log("?? Lessons dir:", options.lessonsDir);

    await importLessons(options);
  } catch (error) {
    console.error("?? KB lesson import failed:", (error as Error).message);
    process.exitCode = 1;
  }
}

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  main();
}

export { importLessons };