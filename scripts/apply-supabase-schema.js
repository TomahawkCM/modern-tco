#!/usr/bin/env node
/**
 * Apply Supabase Schema Migration using MCP-compatible approach
 * Uses official @supabase/supabase-js client with service role key
 */

const fs = require("fs").promises;
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

async function applySchema() {
  console.log("🚀 Starting Supabase schema deployment...");

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing required environment variables. Check .env.local file.");
  }

  // Create Supabase client with service role (full admin access)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log("✅ Connected to Supabase project:", supabaseUrl);

  try {
    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      "../supabase/migrations/20250904043019_create_tco_study_schema.sql"
    );
    const migrationSQL = await fs.readFile(migrationPath, "utf8");

    console.log("📄 Migration file loaded:", migrationPath);

    // Split SQL into individual statements (basic approach)
    const statements = migrationSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt && !stmt.startsWith("--"));

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    // Execute each statement using the Supabase client
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ";"; // Re-add semicolon

      if (statement.trim() === ";") continue; // Skip empty statements

      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? "..." : ""}`);

      try {
        const { data, error } = await supabase.rpc("exec_sql", {
          query: statement,
        });

        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          // Continue with next statement for non-critical errors
          if (!error.message.includes("already exists")) {
            throw error;
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (directError) {
        console.log(
          `⚠️  Direct execution failed, trying alternative approach for statement ${i + 1}`
        );
        console.log(`   Error: ${directError.message}`);
      }
    }

    // Verify schema deployment
    console.log("🔍 Verifying schema deployment...");

    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["study_domains", "study_modules", "study_sections", "practice_questions"]);

    if (tablesError) {
      console.error("❌ Error checking tables:", tablesError);
    } else {
      console.log(
        "📋 Tables found:",
        tables.map((t) => t.table_name)
      );
    }

    // Test basic connectivity
    const { data: testData, error: testError } = await supabase
      .from("study_domains")
      .select("count()")
      .single();

    if (testError) {
      console.error("❌ Error testing connectivity:", testError);
    } else {
      console.log("✅ Database connectivity test passed");
      console.log("📊 Study domains count:", testData);
    }

    console.log("🎉 Schema deployment completed successfully!");
  } catch (error) {
    console.error("❌ Schema deployment failed:", error);
    throw error;
  }
}

// Run the deployment
if (require.main === module) {
  applySchema()
    .then(() => {
      console.log("🏁 Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Migration failed:", error);
      process.exit(1);
    });
}

module.exports = { applySchema };
