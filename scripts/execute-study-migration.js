#!/usr/bin/env node

/**
 * Study Content Migration Executor
 *
 * Executes the professional study content migration for TCO certification
 * Uses the optimal TypeScript/JavaScript + Supabase stack
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

console.log("🚀 TCO Study Content Migration Executor");
console.log("=========================================");

async function executeMigration() {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        "❌ Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
      );
    }

    console.log("✅ Supabase environment variables found");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Read migration file
    const migrationPath = path.join(
      __dirname,
      "../supabase/migrations/20250902031155_populate_study_content.sql"
    );

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`❌ Migration file not found: ${migrationPath}`);
    }

    console.log("✅ Migration file found:", migrationPath);
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log(`📄 Migration file size: ${migrationSQL.length} characters`);

    // Execute migration
    console.log("🔄 Executing study content migration...");

    // Split SQL into individual statements and execute them
    const statements = migrationSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt && !stmt.startsWith("--"));

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt) {
        console.log(`   Executing statement ${i + 1}/${statements.length}...`);
        const { error } = await supabase.rpc("exec", { sql: stmt });
        if (error) {
          console.error(`❌ Statement ${i + 1} failed:`, error.message);
          throw error;
        }
      }
    }

    console.log("✅ Migration executed successfully");

    // Verify migration results
    console.log("🔍 Verifying migration results...");

    const { data: modules, error: modulesError } = await supabase
      .from("study_modules")
      .select("domain, title, exam_weight");

    if (modulesError) {
      console.error("❌ Verification failed:", modulesError.message);
      throw modulesError;
    }

    console.log(`✅ Found ${modules.length} study modules:`);
    modules.forEach((module) => {
      console.log(`   • ${module.domain} (${module.exam_weight}%): ${module.title}`);
    });

    const { data: sections, error: sectionsError } = await supabase
      .from("study_sections")
      .select("title, module_id")
      .order("module_id, order_index");

    if (sectionsError) {
      console.error("❌ Section verification failed:", sectionsError.message);
      throw sectionsError;
    }

    console.log(`✅ Found ${sections.length} study sections`);

    console.log("\n🎉 Study Content Migration COMPLETED Successfully!");
    console.log("");
    console.log("📋 Summary:");
    console.log(`   • Study Modules: ${modules.length}`);
    console.log(`   • Study Sections: ${sections.length}`);
    console.log(`   • Migration File: ${migrationPath}`);
    console.log(`   • Language: Professional publication-ready English`);
    console.log(`   • Stack: TypeScript/JavaScript + Supabase (optimal)`);
    console.log("");
    console.log("🔥 Next Steps:");
    console.log("   1. Test StudyModuleViewer component");
    console.log("   2. Validate study-to-practice workflow");
    console.log("   3. Begin Phase 3 analytics features");
  } catch (error) {
    console.error("\n💥 Migration failed:", error.message);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  executeMigration();
}

module.exports = { executeMigration };
