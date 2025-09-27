#!/usr/bin/env node

/**
 * PostgreSQL Schema Verification Script
 * Verifies all PostgreSQL native features are working correctly
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log("🔍 Verifying Native PostgreSQL Schema Setup...");
console.log("📍 Supabase PostgreSQL URL:", supabaseUrl);

async function verifyTables() {
  console.log("\n📋 Checking PostgreSQL Tables...");

  const tables = ["study_domains", "study_modules", "study_sections", "practice_questions"];
  const results = {};

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1);

      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`);
        results[table] = false;
      } else {
        console.log(`✅ Table '${table}': Accessible`);
        results[table] = true;
      }
    } catch (error) {
      console.log(`❌ Table '${table}': ${error.message}`);
      results[table] = false;
    }
  }

  return results;
}

async function verifyDomains() {
  console.log("\n📊 Checking Domain Data...");

  try {
    const { data, error } = await supabase
      .from("study_domains")
      .select("domain_number, title, exam_weight")
      .order("domain_number");

    if (error) {
      console.log(`❌ Domain verification failed: ${error.message}`);
      return false;
    }

    if (data && data.length === 5) {
      console.log("✅ All 5 TCO Domains Present:");
      data.forEach((domain) => {
        console.log(`   ${domain.domain_number}. ${domain.title} (${domain.exam_weight}% weight)`);
      });
      return true;
    } else {
      console.log(`❌ Expected 5 domains, found ${data ? data.length : 0}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Domain verification error: ${error.message}`);
    return false;
  }
}

async function verifyPostgreSQLFeatures() {
  console.log("\n🐘 Testing PostgreSQL Native Features...");

  try {
    // Test if we can query for PostgreSQL-specific features
    const { data: sampleModule, error } = await supabase
      .from("study_modules")
      .select("title, learning_objectives, metadata")
      .limit(1);

    if (error) {
      console.log(`❌ PostgreSQL features test failed: ${error.message}`);
      return false;
    }

    if (sampleModule && sampleModule.length > 0) {
      const module = sampleModule[0];

      // Test PostgreSQL array feature
      if (Array.isArray(module.learning_objectives)) {
        console.log(
          `✅ PostgreSQL Arrays: Working (${module.learning_objectives.length} objectives)`
        );
      } else {
        console.log(`❌ PostgreSQL Arrays: Not working`);
        return false;
      }

      // Test PostgreSQL JSONB feature
      if (module.metadata && typeof module.metadata === "object") {
        console.log(`✅ PostgreSQL JSONB: Working (${Object.keys(module.metadata).length} keys)`);
      } else {
        console.log(`❌ PostgreSQL JSONB: Not working`);
        return false;
      }

      return true;
    } else {
      console.log(`ℹ️  No modules found - schema exists but content not migrated yet`);
      return true; // Schema exists, just no content yet
    }
  } catch (error) {
    console.log(`❌ PostgreSQL features error: ${error.message}`);
    return false;
  }
}

async function testSearchFunction() {
  console.log("\n🔍 Testing PostgreSQL Search Function...");

  try {
    // This would only work if the custom search function was created
    const { data, error } = await supabase.rpc("search_content", { search_term: "Tanium" });

    if (error) {
      console.log(`❌ Search function not available: ${error.message}`);
      return false;
    }

    console.log(`✅ Search function working: ${data ? data.length : 0} results`);
    return true;
  } catch (error) {
    console.log(`❌ Search function error: ${error.message}`);
    return false;
  }
}

async function generateReport() {
  console.log("\n📋 PostgreSQL Schema Verification Report");
  console.log("=".repeat(50));

  const tables = await verifyTables();
  const domains = await verifyDomains();
  const features = await verifyPostgreSQLFeatures();
  const search = await testSearchFunction();

  const allTablesExist = Object.values(tables).every((exists) => exists);
  const schemaReady = allTablesExist && domains;
  const contentReady = features && Object.keys(tables).length > 0;

  console.log("\n🎯 Summary:");
  console.log(
    `   Tables Created: ${allTablesExist ? "✅" : "❌"} (${Object.values(tables).filter(Boolean).length}/4)`
  );
  console.log(`   Domain Data: ${domains ? "✅" : "❌"}`);
  console.log(`   PostgreSQL Arrays/JSONB: ${features ? "✅" : "❌"}`);
  console.log(`   Search Function: ${search ? "✅" : "❌"}`);

  if (schemaReady) {
    console.log("\n🎉 PostgreSQL Schema Ready!");
    console.log("📋 Next Step: Run content migration");
    console.log("🚀 Command: node scripts/run-native-postgresql.js");
  } else {
    console.log("\n⚠️  Schema Not Ready");
    console.log("📋 Next Step: Create schema in Supabase SQL Editor");
    console.log("📄 Schema: docs/POSTGRESQL_SCHEMA_SETUP.md");
  }

  return {
    schemaReady,
    contentReady,
    tables,
    domains,
    features,
    search,
  };
}

// Main execution
if (require.main === module) {
  generateReport()
    .then((report) => {
      if (report.schemaReady) {
        console.log("\n✅ Verification complete - Schema ready for content migration");
        process.exit(0);
      } else {
        console.log("\n❌ Verification complete - Schema creation required");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("💥 Verification failed:", error);
      process.exit(1);
    });
}

module.exports = { verifyTables, verifyDomains, verifyPostgreSQLFeatures, testSearchFunction };
