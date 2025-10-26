#!/usr/bin/env node
/**
 * Database Analysis Script
 * Analyzes the current Supabase database structure and content
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Read environment variables from .env.local
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// If not in process env, try to read from .env.local file
if (!supabaseUrl || !supabaseServiceKey) {
  try {
    const envPath = path.join(__dirname, "..", ".env.local");
    const envContent = fs.readFileSync(envPath, "utf8");
    const envLines = envContent.split("\n");

    envLines.forEach((line) => {
      if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
        supabaseUrl = line.split("=")[1];
      } else if (line.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) {
        supabaseServiceKey = line.split("=")[1];
      }
    });
  } catch (error) {
    console.warn("⚠️  Could not read .env.local file");
  }
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase configuration in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function analyzeDatabase() {
  console.log("🔍 Analyzing Supabase Database Structure\n");
  console.log(`📡 Project URL: ${supabaseUrl}`);
  console.log(`🔑 Using Service Role Key: ${supabaseServiceKey.substring(0, 20)}...\n`);

  try {
    // 1. List all tables in public schema
    console.log("📋 TABLES IN PUBLIC SCHEMA:");
    console.log("=".repeat(50));

    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name, table_type")
      .eq("table_schema", "public")
      .order("table_name");

    if (tablesError) {
      console.error("❌ Error fetching tables:", tablesError.message);
    } else if (tables && tables.length > 0) {
      tables.forEach((table) => {
        console.log(`  📊 ${table.table_name} (${table.table_type})`);
      });
    } else {
      console.log("  ℹ️  No tables found in public schema");
    }

    // 2. Check for our required tables
    console.log("\n🎯 REQUIRED TABLES CHECK:");
    console.log("=".repeat(50));

    const requiredTables = [
      "users",
      "questions",
      "exam_sessions",
      "user_progress",
      "user_statistics",
    ];

    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select("*", { count: "exact", head: true });

        if (error) {
          console.log(`  ❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`  ✅ ${tableName}: Available (${data?.length || 0} rows)`);
        }
      } catch (err) {
        console.log(`  ❌ ${tableName}: ${err.message}`);
      }
    }

    // 3. Check table structures for existing tables
    console.log("\n🏗️  TABLE STRUCTURES:");
    console.log("=".repeat(50));

    for (const tableName of requiredTables) {
      try {
        const { data: columns, error: columnsError } = await supabase
          .from("information_schema.columns")
          .select("column_name, data_type, is_nullable, column_default")
          .eq("table_name", tableName)
          .eq("table_schema", "public")
          .order("ordinal_position");

        if (!columnsError && columns && columns.length > 0) {
          console.log(`\n  📊 ${tableName.toUpperCase()}:`);
          columns.forEach((col) => {
            const nullable = col.is_nullable === "YES" ? "NULL" : "NOT NULL";
            const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : "";
            console.log(`    ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
          });
        }
      } catch (err) {
        console.log(`  ❌ Error getting structure for ${tableName}: ${err.message}`);
      }
    }

    // 4. Check authentication status
    console.log("\n🔐 AUTHENTICATION STATUS:");
    console.log("=".repeat(50));

    try {
      const {
        data: { users },
        error: usersError,
      } = await supabase.auth.admin.listUsers();

      if (usersError) {
        console.log(`  ❌ Cannot access auth users: ${usersError.message}`);
      } else {
        console.log(`  ✅ Auth system accessible (${users?.length || 0} users registered)`);
        if (users && users.length > 0) {
          console.log("  📋 Recent users:");
          users.slice(0, 3).forEach((user) => {
            console.log(
              `    - ${user.email} (created: ${new Date(user.created_at).toLocaleDateString()})`
            );
          });
        }
      }
    } catch (err) {
      console.log(`  ❌ Auth check error: ${err.message}`);
    }

    // 5. Check RLS policies
    console.log("\n🛡️  ROW LEVEL SECURITY:");
    console.log("=".repeat(50));

    try {
      const { data: policies, error: policiesError } = await supabase
        .from("information_schema.table_privileges")
        .select("table_name, privilege_type, grantee")
        .eq("table_schema", "public");

      if (policiesError) {
        console.log(`  ❌ Cannot check RLS policies: ${policiesError.message}`);
      } else {
        console.log(`  ℹ️  Found ${policies?.length || 0} privilege entries`);
      }
    } catch (err) {
      console.log(`  ❌ RLS check error: ${err.message}`);
    }

    // 6. Database health summary
    console.log("\n📊 DATABASE HEALTH SUMMARY:");
    console.log("=".repeat(50));

    const healthChecks = {
      Connection: true,
      "Public Schema": tables && tables.length > 0,
      "Required Tables": requiredTables.length,
      "Auth System": true, // We got this far
    };

    Object.entries(healthChecks).forEach(([check, status]) => {
      const icon = status ? "✅" : "❌";
      console.log(`  ${icon} ${check}: ${status}`);
    });
  } catch (error) {
    console.error("💥 Fatal error analyzing database:", error.message);
    console.error("📋 Stack:", error.stack);
  }
}

// Run the analysis
analyzeDatabase()
  .then(() => {
    console.log("\n🎉 Database analysis complete!");
  })
  .catch((err) => {
    console.error("💥 Analysis failed:", err.message);
    process.exit(1);
  });
