/**
 * Integration Test for Collective Learning System
 * Tests the service layer with actual database writes using service role
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

// Import service functions - these will use supabaseAdmin internally
import {
  generateMerchantToken,
  saveMerchant,
  lookupMerchant,
  saveCategoryPattern,
  lookupCategoryPattern,
  saveBankFormat,
  lookupBankFormat,
} from "../src/lib/collective-learning-service";

async function testMerchantLearning() {
  console.log("\n🏪 Testing Merchant Learning...\n");

  try {
    // Save a test merchant
    const merchantData = {
      merchantToken: generateMerchantToken("STARBUCKS #12345 SEATTLE"),
      canonicalName: "Starbucks",
      category: "Food & Dining",
      subcategory: "Coffee Shops",
      confidence: 0.92,
      source: "openai" as const,
      explanation: "Well-known coffee chain",
    };

    console.log("  Saving merchant:", merchantData.canonicalName);
    const saveResult = await saveMerchant(merchantData);

    if (!saveResult) {
      console.log("  ❌ Failed to save merchant");
      return;
    }

    console.log("  ✅ Merchant saved successfully");

    // Look up the merchant
    console.log("  Looking up merchant...");
    const lookupResult = await lookupMerchant("STARBUCKS #67890 NEW YORK");

    if (!lookupResult) {
      console.log("  ❌ Failed to find merchant");
      return;
    }

    console.log("  ✅ Merchant found:", {
      name: lookupResult.canonicalName,
      category: lookupResult.category,
      confidence: lookupResult.confidence,
    });
  } catch (error) {
    console.log("  ❌ Test failed:", error);
  }
}

async function testCategoryPatternLearning() {
  console.log("\n📊 Testing Category Pattern Learning...\n");

  try {
    // Save a test pattern
    const pattern = {
      descriptionPattern: "NETFLIX%",
      patternType: "starts_with" as const,
      category: "Entertainment",
      subcategory: "Streaming Services",
      confidence: 0.95,
      usageCount: 50,
      successCount: 48,
      rejectionCount: 2,
    };

    console.log("  Saving pattern:", pattern.descriptionPattern);
    const saveResult = await saveCategoryPattern(pattern);

    if (!saveResult) {
      console.log("  ❌ Failed to save pattern");
      return;
    }

    console.log("  ✅ Pattern saved successfully");

    // Look up category by pattern
    console.log('  Looking up category for "NETFLIX.COM*"...');
    const lookupResult = await lookupCategoryPattern("NETFLIX.COM*");

    if (!lookupResult) {
      console.log("  ❌ Failed to find category pattern");
      return;
    }

    console.log("  ✅ Category pattern found:", {
      category: lookupResult.category,
      subcategory: lookupResult.subcategory,
      confidence: lookupResult.confidence,
    });
  } catch (error) {
    console.log("  ❌ Test failed:", error);
  }
}

async function testBankFormatLearning() {
  console.log("\n🏦 Testing Bank Format Learning...\n");

  try {
    // Save a test bank format
    const format = {
      bankName: "Chase Bank",
      bankSlug: "chase-bank",
      columnMappings: {
        date: "Posting Date",
        description: "Description",
        amount: "Amount",
        balance: "Balance",
      },
      dateFormat: "MM/DD/YYYY",
      hasHeaderRow: true,
      amountFormat: "single" as const,
      confidence: 0.88,
      successfulImports: 25,
      failedImports: 2,
    };

    console.log("  Saving bank format:", format.bankName);
    const saveResult = await saveBankFormat(format);

    if (!saveResult) {
      console.log("  ❌ Failed to save bank format");
      return;
    }

    console.log("  ✅ Bank format saved successfully");

    // Look up the format
    console.log('  Looking up format for "Chase Bank"...');
    const lookupResult = await lookupBankFormat("Chase Bank");

    if (!lookupResult) {
      console.log("  ❌ Failed to find bank format");
      return;
    }

    console.log("  ✅ Bank format found:", {
      bank: lookupResult.bankName,
      columns: Object.keys(lookupResult.columnMappings),
      confidence: lookupResult.confidence,
      imports: lookupResult.successfulImports,
    });
  } catch (error) {
    console.log("  ❌ Test failed:", error);
  }
}

async function runTests() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("🧪 Collective Learning System - Integration Tests");
  console.log("   Testing service layer with actual database writes");
  console.log("═══════════════════════════════════════════════════════");

  // Verify service role is configured
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("\n❌ SUPABASE_SERVICE_ROLE_KEY not configured!");
    console.log("   Add it to .env.local to run these tests.\n");
    process.exit(1);
  }

  console.log("\n✅ Service role configured\n");

  await testMerchantLearning();
  await testCategoryPatternLearning();
  await testBankFormatLearning();

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("✅ All Integration Tests Complete!");
  console.log("═══════════════════════════════════════════════════════\n");
}

runTests().catch(console.error);
