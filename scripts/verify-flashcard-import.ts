#!/usr/bin/env npx tsx

/**
 * Verify Flashcard Import Status
 *
 * This script checks:
 * 1. Total flashcards in database
 * 2. Breakdown by domain and difficulty
 * 3. Import logs from content_import_logs
 * 4. Sample flashcard data
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
  console.error("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✅ Set" : "❌ Missing");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyImport() {
  console.log("🔍 Verifying Flashcard Import Status\n");

  // 1. Check total count
  console.log("📊 Total Count:");
  const { count: totalCount, error: countError } = await supabase
    .from("flashcard_library")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("❌ Error counting flashcards:", countError);
  } else {
    console.log(`   Total flashcards: ${totalCount || 0}\n`);
  }

  // 2. Breakdown by domain and difficulty
  console.log("📈 Breakdown by Domain & Difficulty:");
  const { data: breakdown, error: breakdownError } = await supabase
    .from("flashcard_library")
    .select("domain, difficulty");

  if (breakdownError) {
    console.error("❌ Error getting breakdown:", breakdownError);
  } else if (breakdown && breakdown.length > 0) {
    const stats = breakdown.reduce((acc: any, card: any) => {
      const key = `${card.domain}|${card.difficulty}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    Object.entries(stats)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([key, count]) => {
        const [domain, difficulty] = key.split("|");
        console.log(`   ${domain.padEnd(25)} ${difficulty.padEnd(10)} ${count}`);
      });
    console.log();
  } else {
    console.log("   No flashcards found\n");
  }

  // 3. Check import logs
  console.log("📋 Recent Import Logs:");
  const { data: logs, error: logsError } = await supabase
    .from("content_import_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (logsError) {
    console.error("❌ Error getting logs:", logsError);
  } else if (logs && logs.length > 0) {
    logs.forEach((log: any) => {
      console.log(`   ${log.created_at}: ${log.content_type} - ${log.items_count} items`);
      if (log.metadata) {
        console.log(`      Source: ${log.metadata.source || "N/A"}`);
      }
    });
    console.log();
  } else {
    console.log("   No import logs found\n");
  }

  // 4. Sample flashcard
  console.log("🎴 Sample Flashcard:");
  const { data: sample, error: sampleError } = await supabase
    .from("flashcard_library")
    .select("front, back, domain, difficulty")
    .limit(1)
    .single();

  if (sampleError) {
    console.error("❌ Error getting sample:", sampleError);
  } else if (sample) {
    console.log(`   Domain: ${sample.domain} (${sample.difficulty})`);
    console.log(`   Front: ${sample.front.substring(0, 80)}...`);
    console.log(`   Back: ${sample.back.substring(0, 80)}...`);
  } else {
    console.log("   No flashcards available");
  }

  console.log("\n✅ Verification complete");
}

verifyImport().catch((error) => {
  console.error("💥 Unexpected error:", error);
  process.exit(1);
});
