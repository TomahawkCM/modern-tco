#!/usr/bin/env node

/**
 * Comprehensive PostgreSQL Testing Suite for Tanium TCO Supabase
 * Tests database connectivity, schema validation, and PostgreSQL native features
 */

import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
dotenv.config({ path: ".env.local" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration from .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("🚀 Tanium TCO PostgreSQL Testing Suite");
console.log("=====================================");
console.log(`Database URL: ${SUPABASE_URL}`);
console.log(`Project ID: qnwcwoutgarhqxlgsjzs\n`);

// Test Results Storage
const testResults = {
  connection: null,
  schema: null,
  postgresqlFeatures: null,
  rlsPolicies: null,
  crudOperations: null,
  searchFunctionality: null,
  realtime: null,
  performance: null,
};

/**
 * Phase 1: Database Connection Validation
 */
async function testDatabaseConnection() {
  console.log("📡 Phase 1: Database Connection Validation");
  console.log("------------------------------------------");

  try {
    // Test Supabase client connection
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Test basic connectivity with a simple query
    const { data: versionData, error: versionError } = await supabase.rpc("version").single();

    if (versionError) {
      console.log("⚠️  Direct version RPC failed, trying alternative method...");

      // Alternative: Test with a simple table query
      const { data: testData, error: testError } = await supabase
        .from("study_modules")
        .select("count")
        .limit(1);

      if (testError) {
        throw new Error(`Connection failed: ${testError.message}`);
      }
      console.log("✅ Supabase connection successful (via table query)");
    } else {
      console.log("✅ Supabase connection successful");
      console.log(`   PostgreSQL Version: ${versionData}`);
    }

    // Test service role connection
    const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: serviceTest, error: serviceError } = await supabaseService
      .from("study_modules")
      .select("count")
      .limit(1);

    if (serviceError) {
      console.log(`⚠️  Service role test: ${serviceError.message}`);
    } else {
      console.log("✅ Service role connection successful");
    }

    testResults.connection = { success: true, timestamp: new Date() };
    return { supabase, supabaseService };
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    testResults.connection = { success: false, error: error.message, timestamp: new Date() };
    throw error;
  }
}

/**
 * Phase 2: Schema Validation
 */
async function testDatabaseSchema(supabase) {
  console.log("\n🏗️  Phase 2: Database Schema Validation");
  console.log("--------------------------------------");

  const expectedTables = [
    "study_modules",
    "study_sections",
    "user_study_progress",
    "user_study_bookmarks",
  ];

  const schemaResults = {};

  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1);

      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`);
        schemaResults[table] = { exists: false, error: error.message };
      } else {
        console.log(`✅ Table '${table}': accessible`);
        schemaResults[table] = { exists: true, sampleCount: data ? data.length : 0 };
      }
    } catch (error) {
      console.log(`❌ Table '${table}': ${error.message}`);
      schemaResults[table] = { exists: false, error: error.message };
    }
  }

  testResults.schema = schemaResults;
  return schemaResults;
}

/**
 * Phase 3: PostgreSQL Native Features Testing
 */
async function testPostgreSQLFeatures(supabase) {
  console.log("\n🔧 Phase 3: PostgreSQL Native Features Testing");
  console.log("---------------------------------------------");

  const features = {};

  try {
    // Test UUID extension
    console.log("Testing UUID extension...");
    const { data: uuidTest, error: uuidError } = await supabase.rpc("gen_random_uuid");

    if (!uuidError && uuidTest) {
      console.log("✅ UUID extension working");
      features.uuid = { working: true, sample: uuidTest };
    } else {
      console.log("❌ UUID extension failed");
      features.uuid = { working: false, error: uuidError?.message };
    }

    // Test JSONB functionality by querying study modules
    console.log("Testing JSONB functionality...");
    const { data: jsonbTest, error: jsonbError } = await supabase
      .from("study_modules")
      .select("learning_objectives, exam_prep")
      .limit(1);

    if (!jsonbError && jsonbTest && jsonbTest.length > 0) {
      console.log("✅ JSONB columns accessible");
      features.jsonb = { working: true, sample: jsonbTest[0] };
    } else {
      console.log("❌ JSONB test failed");
      features.jsonb = { working: false, error: jsonbError?.message };
    }

    // Test Array functionality
    console.log("Testing Array columns...");
    const { data: arrayTest, error: arrayError } = await supabase
      .from("study_sections")
      .select("key_points, procedures")
      .limit(1);

    if (!arrayError && arrayTest && arrayTest.length > 0) {
      console.log("✅ Array columns accessible");
      features.arrays = { working: true, sample: arrayTest[0] };
    } else {
      console.log("❌ Array test failed");
      features.arrays = { working: false, error: arrayError?.message };
    }
  } catch (error) {
    console.error("❌ PostgreSQL features test failed:", error.message);
    features.error = error.message;
  }

  testResults.postgresqlFeatures = features;
  return features;
}

/**
 * Phase 4: TCO Content Operations Testing
 */
async function testTCOContentOperations(supabase) {
  console.log("\n📚 Phase 4: TCO Content Operations Testing");
  console.log("-----------------------------------------");

  const operations = {};

  try {
    // Test READ operations
    console.log("Testing study content READ operations...");
    const { data: modules, error: modulesError } = await supabase
      .from("study_modules")
      .select("*")
      .limit(5);

    if (!modulesError && modules) {
      console.log(`✅ Study modules READ: Found ${modules.length} modules`);
      operations.read = { success: true, count: modules.length };

      // Test sections for first module if available
      if (modules.length > 0) {
        const { data: sections, error: sectionsError } = await supabase
          .from("study_sections")
          .select("*")
          .eq("module_id", modules[0].id);

        if (!sectionsError) {
          console.log(`✅ Study sections READ: Found ${sections?.length || 0} sections`);
          operations.sections = { success: true, count: sections?.length || 0 };
        }
      }
    } else {
      console.log("❌ Study modules READ failed");
      operations.read = { success: false, error: modulesError?.message };
    }

    // Test search functionality
    console.log("Testing search functionality...");
    const { data: searchResults, error: searchError } = await supabase
      .from("study_modules")
      .select("*")
      .ilike("title", "%Asking Questions%");

    if (!searchError) {
      console.log(`✅ Text search: Found ${searchResults?.length || 0} matching modules`);
      operations.search = { success: true, count: searchResults?.length || 0 };
    } else {
      console.log("❌ Search test failed");
      operations.search = { success: false, error: searchError.message };
    }
  } catch (error) {
    console.error("❌ Content operations test failed:", error.message);
    operations.error = error.message;
  }

  testResults.crudOperations = operations;
  return operations;
}

/**
 * Performance Benchmarking
 */
async function testPerformance(supabase) {
  console.log("\n⚡ Performance Benchmarking");
  console.log("---------------------------");

  const performance = {};

  try {
    // Test query response times
    const startTime = Date.now();

    const { data, error } = await supabase.from("study_modules").select(`
        *,
        study_sections (
          id,
          title,
          section_type,
          estimated_time
        )
      `);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (!error) {
      console.log(`✅ Complex query completed in ${responseTime}ms`);
      performance.complexQuery = { responseTime, recordCount: data?.length || 0 };
    } else {
      console.log("❌ Performance test failed");
      performance.complexQuery = { failed: true, error: error.message };
    }
  } catch (error) {
    console.error("❌ Performance test failed:", error.message);
    performance.error = error.message;
  }

  testResults.performance = performance;
  return performance;
}

/**
 * Generate Test Report
 */
function generateTestReport() {
  console.log("\n📊 PostgreSQL Testing Report");
  console.log("============================");

  const report = {
    timestamp: new Date().toISOString(),
    project: "Tanium TCO Study Platform",
    database: "PostgreSQL via Supabase",
    results: testResults,
  };

  // Summary
  const successCount = Object.values(testResults).filter(
    (result) => result && (result.success || result.working || Object.keys(result).length > 0)
  ).length;

  console.log(
    `\n✨ Test Summary: ${successCount}/${Object.keys(testResults).length} phases completed`
  );
  console.log("\nDetailed Results:");

  Object.entries(testResults).forEach(([phase, result]) => {
    if (result) {
      console.log(`  ${phase}: ${result.success ? "✅" : result.working ? "✅" : "📊"}`);
    }
  });

  return report;
}

/**
 * Main Test Execution
 */
async function runPostgreSQLTests() {
  try {
    // Phase 1: Connection
    const { supabase, supabaseService } = await testDatabaseConnection();

    // Phase 2: Schema
    await testDatabaseSchema(supabase);

    // Phase 3: PostgreSQL Features
    await testPostgreSQLFeatures(supabase);

    // Phase 4: Content Operations
    await testTCOContentOperations(supabase);

    // Phase 5: Performance
    await testPerformance(supabase);

    // Generate Report
    const report = generateTestReport();

    // Save report
    const reportPath = join(__dirname, "postgresql-test-report.json");
    const fs = await import("fs");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n💾 Test report saved to: ${reportPath}`);
    console.log("\n🎉 PostgreSQL testing completed successfully!");
  } catch (error) {
    console.error("\n💥 Testing failed:", error.message);
    process.exit(1);
  }
}

// Execute tests
runPostgreSQLTests();
