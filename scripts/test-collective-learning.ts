/**
 * Test Script for Collective Learning System
 * Verifies database tables, service layer, and learning functionality
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseTables() {
  console.log("\n🔍 Testing Database Tables...\n");

  const tables = ["category_patterns", "bank_formats", "merchants", "merchant_feedback"];

  for (const tableName of tables) {
    try {
      const { data, error, count } = await (supabase as any)
        .from(tableName)
        .select("*", { count: "exact", head: true });

      if (error) {
        console.log(`❌ ${tableName}: ERROR - ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: EXISTS (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${tableName}: FAILED - ${err}`);
    }
  }
}

async function testCategoryPatterns() {
  console.log("\n🧪 Testing Category Patterns...\n");

  try {
    // Insert test pattern
    const testPattern = {
      description_pattern: "STARBUCKS%",
      pattern_type: "starts_with",
      category: "Food & Dining",
      subcategory: "Coffee Shops",
      confidence: 0.95,
      usage_count: 10,
      success_count: 9,
      rejection_count: 1,
      source: "test",
    };

    const { data: insertData, error: insertError } = await (supabase as any)
      .from("category_patterns")
      .insert(testPattern)
      .select();

    if (insertError) {
      console.log(`❌ Insert pattern: ${insertError.message}`);
      return;
    }

    console.log(`✅ Inserted test pattern: ${insertData[0].id}`);

    // Retrieve pattern
    const { data: retrieveData, error: retrieveError } = await (supabase as any)
      .from("category_patterns")
      .select("*")
      .eq("description_pattern", "STARBUCKS%")
      .gte("confidence", 0.7)
      .single();

    if (retrieveError) {
      console.log(`❌ Retrieve pattern: ${retrieveError.message}`);
      return;
    }

    console.log(`✅ Retrieved pattern:`, {
      pattern: retrieveData.description_pattern,
      category: retrieveData.category,
      confidence: retrieveData.confidence,
    });

    // Clean up
    await (supabase as any).from("category_patterns").delete().eq("source", "test");

    console.log(`✅ Cleaned up test data`);
  } catch (err) {
    console.log(`❌ Test failed: ${err}`);
  }
}

async function testBankFormats() {
  console.log("\n🏦 Testing Bank Formats...\n");

  try {
    // Insert test format
    const testFormat = {
      bank_name: "Test Bank",
      bank_slug: "test-bank-" + Date.now(),
      column_mappings: {
        date: "Transaction Date",
        description: "Description",
        amount: "Amount",
      },
      date_format: "MM/DD/YYYY",
      has_header_row: true,
      amount_format: "single",
      confidence: 0.85,
      successful_imports: 5,
      failed_imports: 0,
    };

    const { data: insertData, error: insertError } = await (supabase as any)
      .from("bank_formats")
      .insert(testFormat)
      .select();

    if (insertError) {
      console.log(`❌ Insert format: ${insertError.message}`);
      return;
    }

    console.log(`✅ Inserted test format: ${insertData[0].id}`);

    // Retrieve format
    const { data: retrieveData, error: retrieveError } = await (supabase as any)
      .from("bank_formats")
      .select("*")
      .eq("bank_slug", testFormat.bank_slug)
      .single();

    if (retrieveError) {
      console.log(`❌ Retrieve format: ${retrieveError.message}`);
      return;
    }

    console.log(`✅ Retrieved format:`, {
      bank: retrieveData.bank_name,
      columns: Object.keys(retrieveData.column_mappings),
      confidence: retrieveData.confidence,
    });

    // Clean up
    await (supabase as any).from("bank_formats").delete().eq("bank_slug", testFormat.bank_slug);

    console.log(`✅ Cleaned up test data`);
  } catch (err) {
    console.log(`❌ Test failed: ${err}`);
  }
}

async function testHelperFunctions() {
  console.log("\n⚙️  Testing Helper Functions...\n");

  try {
    // Insert a test pattern
    const { data: patternData, error: patternError } = await (supabase as any)
      .from("category_patterns")
      .insert({
        description_pattern: "NETFLIX%",
        pattern_type: "starts_with",
        category: "Entertainment",
        subcategory: "Streaming",
        confidence: 0.5,
        usage_count: 0,
        success_count: 0,
        rejection_count: 0,
        source: "test",
      })
      .select()
      .single();

    if (patternError) {
      console.log(`❌ Create test pattern: ${patternError.message}`);
      return;
    }

    console.log(`✅ Created test pattern: ${patternData.id}`);

    // Test update_category_pattern_feedback function
    const { error: rpcError } = await (supabase as any).rpc("update_category_pattern_feedback", {
      p_pattern_id: patternData.id,
      p_accepted: true,
    });

    if (rpcError) {
      console.log(`❌ RPC function: ${rpcError.message}`);
      return;
    }

    console.log(`✅ Called update_category_pattern_feedback`);

    // Verify the update
    const { data: updatedData, error: verifyError } = await (supabase as any)
      .from("category_patterns")
      .select("*")
      .eq("id", patternData.id)
      .single();

    if (verifyError) {
      console.log(`❌ Verify update: ${verifyError.message}`);
      return;
    }

    console.log(`✅ Updated pattern:`, {
      usage_count: updatedData.usage_count,
      success_count: updatedData.success_count,
      confidence: updatedData.confidence,
    });

    // Clean up
    await (supabase as any).from("category_patterns").delete().eq("source", "test");

    console.log(`✅ Cleaned up test data`);
  } catch (err) {
    console.log(`❌ Test failed: ${err}`);
  }
}

async function runTests() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("🧪 Collective Learning System - Integration Tests");
  console.log("═══════════════════════════════════════════════════════");

  await testDatabaseTables();
  await testCategoryPatterns();
  await testBankFormats();
  await testHelperFunctions();

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("✅ All Tests Complete!");
  console.log("═══════════════════════════════════════════════════════\n");
}

runTests().catch(console.error);
