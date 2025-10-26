#!/usr/bin/env node

/**
 * TCO Database Migration Script
 * Applies database migrations to remote Supabase instance
 * Uses service role key for administrative operations
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs").promises;
const path = require("path");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing Supabase configuration");
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function readMigrationFile(filename) {
  try {
    const filePath = path.join(__dirname, "..", "supabase", "migrations", filename);
    const content = await fs.readFile(filePath, "utf8");
    return content;
  } catch (error) {
    console.error(`❌ Failed to read migration file ${filename}:`, error.message);
    throw error;
  }
}

async function executeSql(sql, description) {
  try {
    console.log(`🔄 ${description}...`);

    // Use the rpc method to execute raw SQL
    const { data, error } = await supabase.rpc("exec", {
      sql: sql,
    });

    if (error) {
      throw error;
    }

    console.log(`✅ ${description} completed successfully`);
    return data;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select("count", { count: "exact" })
      .limit(0);

    if (error && error.code === "PGRST106") {
      // Table doesn't exist
      return false;
    }

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    return false;
  }
}

async function runMigrations() {
  console.log("🚀 Starting TCO Database Migration...");
  console.log(`📍 Target: ${supabaseUrl}`);

  try {
    // Test basic connectivity by checking if we can access the database
    console.log("🔄 Testing database connection...");

    // Simple connectivity test using a direct table query
    const { data: testData, error: testError } = await supabase
      .from("study_domains")
      .select("count", { count: "exact" })
      .limit(0);

    if (testError && testError.code === "PGRST106") {
      console.log("ℹ️  Tables do not exist yet - this is expected for first migration");
    } else if (testError) {
      console.log(`ℹ️  Connection test result: ${testError.message}`);
    } else {
      console.log("✅ Database connection successful - tables already exist");
    }

    // Check if tables already exist
    const tablesExist = await Promise.all([
      checkTableExists("study_domains"),
      checkTableExists("study_modules"),
      checkTableExists("study_sections"),
      checkTableExists("practice_questions"),
    ]);

    if (tablesExist.some((exists) => exists)) {
      console.log("⚠️  Some tables already exist. Checking individual tables...");
      const tableNames = ["study_domains", "study_modules", "study_sections", "practice_questions"];
      for (let i = 0; i < tableNames.length; i++) {
        console.log(`   ${tableNames[i]}: ${tablesExist[i] ? "✅ EXISTS" : "❌ MISSING"}`);
      }
    }

    // Migration 1: Create schema
    console.log("\n📋 Phase 1: Creating database schema...");
    const schemaSql = await readMigrationFile("20250904000001_create_tco_schema.sql");

    // Split SQL into individual statements for better error handling
    const statements = schemaSql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { data, error } = await supabase.rpc("exec_sql", {
            query: statement + ";",
          });

          if (error) {
            console.log(`⚠️  Statement warning: ${error.message}`);
            console.log(`   Statement: ${statement.substring(0, 50)}...`);
            // Continue with other statements unless it's a critical error
            if (!error.message.includes("already exists")) {
              throw error;
            }
          }
        } catch (error) {
          console.error(`❌ SQL execution failed:`, error.message);
          console.error(`   Statement: ${statement.substring(0, 100)}...`);
          throw error;
        }
      }
    }

    console.log("✅ Schema migration completed");

    // Verify tables were created
    console.log("\n🔍 Verifying table creation...");
    const tablesAfterMigration = await Promise.all([
      checkTableExists("study_domains"),
      checkTableExists("study_modules"),
      checkTableExists("study_sections"),
      checkTableExists("practice_questions"),
    ]);

    const tableNames = ["study_domains", "study_modules", "study_sections", "practice_questions"];
    let allTablesCreated = true;

    for (let i = 0; i < tableNames.length; i++) {
      const status = tablesAfterMigration[i] ? "✅ CREATED" : "❌ FAILED";
      console.log(`   ${tableNames[i]}: ${status}`);
      if (!tablesAfterMigration[i]) {
        allTablesCreated = false;
      }
    }

    if (!allTablesCreated) {
      throw new Error("Some tables were not created successfully");
    }

    // Check domain data
    console.log("\n📊 Checking study domains...");
    const { data: domains, error: domainError } = await supabase
      .from("study_domains")
      .select("*")
      .order("domain_number");

    if (domainError) {
      throw domainError;
    }

    console.log(`✅ Found ${domains?.length || 0} study domains`);
    if (domains && domains.length > 0) {
      domains.forEach((domain) => {
        console.log(`   Domain ${domain.domain_number}: ${domain.title} (${domain.exam_weight}%)`);
      });
    }

    console.log("\n🎉 Database migration completed successfully!");
    console.log("\n📋 Next Steps:");
    console.log("   1. Run content population script");
    console.log("   2. Test application database connectivity");
    console.log("   3. Verify all features work with live database");
  } catch (error) {
    console.error("\n💥 Migration failed:", error.message);
    console.error("\n🔧 Troubleshooting:");
    console.error("   1. Verify Supabase project is active and accessible");
    console.error("   2. Check service role key has admin permissions");
    console.error("   3. Ensure no conflicting migrations were run manually");
    process.exit(1);
  }
}

// Run migrations if this script is called directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
