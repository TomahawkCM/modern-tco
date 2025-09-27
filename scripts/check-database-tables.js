import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qnwcwoutgarhqxlgsjzs.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud2N3b3V0Z2FyaHF4bGdzanpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY3MzQyOCwiZXhwIjoyMDcyMjQ5NDI4fQ.U_FDgUC__dtFPVd5jrTpmwaWiDWJ701w4lRbe4qy1T4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log("🔍 Checking Supabase database tables...\n");

  try {
    // Check if tables exist by querying system tables
    const { data: tables, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .like("table_name", "study_%")
      .order("table_name");

    if (error) {
      console.error("❌ Error checking tables:", error.message);
      console.log("\n📋 Next steps:");
      console.log(
        "1. Open Supabase Dashboard: https://qnwcwoutgarhqxlgsjzs.supabase.co/project/default/sql"
      );
      console.log("2. Copy and paste the contents of MANUAL_SCHEMA_SETUP.sql");
      console.log("3. Run the SQL to create tables");
      console.log("4. Run this script again to verify");
      return;
    }

    if (!tables || tables.length === 0) {
      console.log("❌ No study tables found in database");
      console.log("\n📋 REQUIRED ACTION:");
      console.log("1. Open Supabase Dashboard SQL Editor:");
      console.log("   https://qnwcwoutgarhqxlgsjzs.supabase.co/project/default/sql");
      console.log("2. Copy and paste the contents of MANUAL_SCHEMA_SETUP.sql");
      console.log('3. Click "Run" to create all tables');
      console.log("4. Run this script again to verify: npm run check:tables");
      return;
    }

    console.log("✅ Found study tables:");
    tables.forEach((table) => {
      console.log(`   - ${table.table_name}`);
    });

    // Test basic queries on each table
    console.log("\n🔍 Testing table access...");

    const { count: moduleCount, error: moduleError } = await supabase
      .from("study_modules")
      .select("*", { count: "exact", head: true });

    if (moduleError) {
      console.log("❌ Error accessing study_modules:", moduleError.message);
    } else {
      console.log(`✅ study_modules accessible (${moduleCount} records)`);
    }

    const { count: sectionCount, error: sectionError } = await supabase
      .from("study_sections")
      .select("*", { count: "exact", head: true });

    if (sectionError) {
      console.log("❌ Error accessing study_sections:", sectionError.message);
    } else {
      console.log(`✅ study_sections accessible (${sectionCount} records)`);
    }

    if (!moduleError && !sectionError) {
      console.log("\n🎉 Database is ready for content migration!");
      console.log("Run: npm run migrate:content");
    } else {
      console.log("\n⚠️ Database tables exist but have access issues");
      console.log("Check RLS policies and permissions in Supabase Dashboard");
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
  }
}

checkTables();
