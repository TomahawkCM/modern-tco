/**
 * Direct Database Test for Collective Learning
 * Tests database tables directly with Supabase service role
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing configuration:");
  console.error("  NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅" : "❌");
  console.error("  SUPABASE_SERVICE_ROLE_KEY:", serviceRoleKey ? "✅" : "❌");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function testMerchantTable() {
  console.log("\n🏪 Testing merchants table...\n");

  try {
    // Insert test merchant
    const testMerchant = {
      merchant_token: "STARBUCKS",
      canonical_name: "Starbucks Coffee",
      default_category: "Food & Dining",
      default_subcategory: "Coffee Shops",
      confidence: 0.92,
      source: "openai", // Must match the enum
      classification_count: 10,
      user_agreement_count: 9,
      user_correction_count: 1,
    };

    console.log("  Inserting merchant:", testMerchant.canonical_name);
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from("merchants")
      .upsert(testMerchant, { onConflict: "merchant_token" })
      .select();

    if (insertError) {
      console.log("  ❌ Insert failed:", insertError.message);
      return false;
    }

    console.log("  ✅ Merchant inserted");

    // Query merchant
    const { data: queryData, error: queryError } = await supabaseAdmin
      .from("merchants")
      .select("*")
      .eq("merchant_token", "STARBUCKS")
      .single();

    if (queryError) {
      console.log("  ❌ Query failed:", queryError.message);
      return false;
    }

    console.log("  ✅ Merchant retrieved:", {
      name: queryData.canonical_name,
      category: queryData.default_category,
      confidence: queryData.confidence,
    });

    return true;
  } catch (error) {
    console.log("  ❌ Test failed:", error);
    return false;
  }
}

async function testCategoryPatternsTable() {
  console.log("\n📊 Testing category_patterns table...\n");

  try {
    // Insert test pattern
    const testPattern = {
      description_pattern: "NETFLIX%",
      pattern_type: "starts_with",
      category: "Entertainment",
      subcategory: "Streaming Services",
      confidence: 0.95,
      usage_count: 50,
      success_count: 48,
      rejection_count: 2,
      source: "test",
    };

    console.log("  Inserting pattern:", testPattern.description_pattern);
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from("category_patterns")
      .insert(testPattern)
      .select();

    if (insertError) {
      console.log("  ❌ Insert failed:", insertError.message);
      return false;
    }

    console.log("  ✅ Pattern inserted");

    // Query pattern
    const { data: queryData, error: queryError } = await supabaseAdmin
      .from("category_patterns")
      .select("*")
      .eq("description_pattern", "NETFLIX%")
      .limit(1)
      .maybeSingle();

    if (queryError) {
      console.log("  ❌ Query failed:", queryError.message);
      return false;
    }

    console.log("  ✅ Pattern retrieved:", {
      pattern: queryData.description_pattern,
      category: queryData.category,
      confidence: queryData.confidence,
    });

    return true;
  } catch (error) {
    console.log("  ❌ Test failed:", error);
    return false;
  }
}

async function testBankFormatsTable() {
  console.log("\n🏦 Testing bank_formats table...\n");

  try {
    // Insert test format
    const testFormat = {
      bank_name: "Chase Bank",
      bank_slug: "chase-bank",
      column_mappings: {
        date: "Posting Date",
        description: "Description",
        amount: "Amount",
      },
      date_format: "MM/DD/YYYY",
      has_header_row: true,
      amount_format: "single",
      confidence: 0.88,
      successful_imports: 25,
      failed_imports: 2,
    };

    console.log("  Inserting format:", testFormat.bank_name);
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from("bank_formats")
      .upsert(testFormat, { onConflict: "bank_slug" })
      .select();

    if (insertError) {
      console.log("  ❌ Insert failed:", insertError.message);
      return false;
    }

    console.log("  ✅ Format inserted");

    // Query format
    const { data: queryData, error: queryError } = await supabaseAdmin
      .from("bank_formats")
      .select("*")
      .eq("bank_slug", "chase-bank")
      .single();

    if (queryError) {
      console.log("  ❌ Query failed:", queryError.message);
      return false;
    }

    console.log("  ✅ Format retrieved:", {
      bank: queryData.bank_name,
      columns: Object.keys(queryData.column_mappings),
      confidence: queryData.confidence,
    });

    return true;
  } catch (error) {
    console.log("  ❌ Test failed:", error);
    return false;
  }
}

async function runTests() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("🧪 Collective Learning System - Direct Database Tests");
  console.log("═══════════════════════════════════════════════════════");

  const results = {
    merchants: await testMerchantTable(),
    categoryPatterns: await testCategoryPatternsTable(),
    bankFormats: await testBankFormatsTable(),
  };

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("📊 Test Results:");
  console.log("═══════════════════════════════════════════════════════\n");
  console.log("  Merchants Table:        ", results.merchants ? "✅ PASS" : "❌ FAIL");
  console.log("  Category Patterns Table:", results.categoryPatterns ? "✅ PASS" : "❌ FAIL");
  console.log("  Bank Formats Table:     ", results.bankFormats ? "✅ PASS" : "❌ FAIL");

  const allPassed = Object.values(results).every((r) => r);
  console.log(
    "\n  Overall:                ",
    allPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"
  );
  console.log("\n═══════════════════════════════════════════════════════\n");

  process.exit(allPassed ? 0 : 1);
}

runTests().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
