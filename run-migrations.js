#!/usr/bin/env node

/**
 * Direct Database Migration Runner for Tanium TCO
 * Applies PostgreSQL schema migrations directly via Supabase client
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("🚀 Running PostgreSQL Migrations for Tanium TCO");
console.log("===============================================");

async function runMigrations() {
  try {
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    console.log("📡 Connected to Supabase database");
    console.log(`   URL: ${SUPABASE_URL}`);

    // Read and execute the main schema migration
    const schemaPath = join(__dirname, "supabase/migrations/003_create_study_content_tables.sql");
    const schemaSql = readFileSync(schemaPath, "utf-8");

    console.log("\n🏗️  Executing schema migration...");
    console.log("   File: 003_create_study_content_tables.sql");

    // Split the SQL into individual statements
    const statements = schemaSql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`   Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`   Executing statement ${i + 1}/${statements.length}...`);

        try {
          const { data, error } = await supabase.rpc("exec_sql", {
            query: statement,
          });

          if (error) {
            // Try alternative approach for DDL statements
            const { error: directError } = await supabase
              .from("dummy_table_for_sql_exec")
              .select("*")
              .limit(0);

            // If that fails, try using the REST API directly
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                apikey: SUPABASE_SERVICE_KEY,
              },
              body: JSON.stringify({ query: statement }),
            });

            if (!response.ok) {
              console.log(`   ⚠️  Statement ${i + 1} may need manual execution`);
              console.log(`       SQL: ${statement.substring(0, 100)}...`);
            } else {
              console.log(`   ✅ Statement ${i + 1} executed successfully`);
            }
          } else {
            console.log(`   ✅ Statement ${i + 1} executed successfully`);
          }
        } catch (execError) {
          console.log(`   ⚠️  Statement ${i + 1} execution issue: ${execError.message}`);
        }
      }
    }

    // Test if tables were created
    console.log("\n🔍 Verifying table creation...");

    const tablesToCheck = [
      "study_modules",
      "study_sections",
      "user_study_progress",
      "user_study_bookmarks",
    ];

    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase.from(table).select("*").limit(1);

        if (error) {
          console.log(`   ❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`   ✅ Table '${table}': accessible`);
        }
      } catch (error) {
        console.log(`   ❌ Table '${table}': ${error.message}`);
      }
    }

    // Now try to populate with sample data
    console.log("\n📚 Checking for sample data...");

    const { data: modules, error: modulesError } = await supabase
      .from("study_modules")
      .select("*")
      .limit(1);

    if (!modulesError && modules && modules.length === 0) {
      console.log("   No sample data found, attempting to populate...");

      // Try to read the populate script
      try {
        const populatePath = join(
          __dirname,
          "supabase/migrations/20250902031155_populate_study_content.sql"
        );
        const populateSql = readFileSync(populatePath, "utf-8");

        // Extract INSERT statements
        const insertStatements = populateSql
          .split("\n")
          .filter((line) => line.trim().startsWith("INSERT"))
          .slice(0, 3); // Just first few inserts for testing

        for (const insertStmt of insertStatements) {
          try {
            console.log("   Executing sample data insert...");
            // This is a complex INSERT, we'll handle it specially
            const { error: insertError } = await supabase.rpc("exec_sql", {
              query: insertStmt,
            });

            if (insertError) {
              console.log(`   ⚠️  Insert may need manual execution: ${insertError.message}`);
            } else {
              console.log("   ✅ Sample data inserted");
              break; // One successful insert is enough for testing
            }
          } catch (insertExecError) {
            console.log(`   ⚠️  Insert execution issue: ${insertExecError.message}`);
          }
        }
      } catch (populateError) {
        console.log("   ⚠️  Could not read populate script");
      }
    } else {
      console.log("   ✅ Sample data already exists");
    }

    console.log("\n🎉 Migration process completed!");
    console.log("\n📊 Final Status Check:");

    // Final verification
    for (const table of tablesToCheck) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });

        if (!error) {
          console.log(`   ${table}: ${count} records`);
        }
      } catch (error) {
        // Skip count errors
      }
    }
  } catch (error) {
    console.error("\n💥 Migration failed:", error.message);
    console.log("\n📋 Manual migration may be required.");
    console.log("    Use Supabase Dashboard SQL Editor to run the migration files.");
    process.exit(1);
  }
}

runMigrations();
