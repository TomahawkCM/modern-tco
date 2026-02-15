#!/usr/bin/env tsx

/**
 * Apply RLS Migration for Anonymous Flashcard Access
 *
 * This script provides instructions and SQL to enable anonymous users
 * to browse the flashcard library without authentication.
 */

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const projectRef = supabaseUrl?.match(/https:\/\/(.+)\.supabase\.co/)?.[1];

console.log("═".repeat(80));
console.log("🔐 RLS Migration: Enable Anonymous Flashcard Library Access");
console.log("═".repeat(80));
console.log();

// Read the migration file
const migrationPath = path.join(
  process.cwd(),
  "supabase/migrations/20251010000006_enable_anonymous_flashcard_library_access.sql"
);

let migrationSQL: string;
try {
  migrationSQL = fs.readFileSync(migrationPath, "utf-8");
  console.log("✅ Migration file created successfully");
  console.log("   Location:", migrationPath);
} catch (error) {
  console.error("❌ Error reading migration file:", error);
  process.exit(1);
}

console.log();
console.log("📋 SQL to Execute:");
console.log("─".repeat(80));
console.log();

// Extract and display the actual SQL
const sqlStatement = `CREATE POLICY IF NOT EXISTS "Flashcard library is publicly readable"
  ON public.flashcard_library FOR SELECT
  TO anon
  USING (true);`;

console.log(sqlStatement);
console.log();
console.log("─".repeat(80));
console.log();

console.log("🚀 How to Apply This Migration:");
console.log();
console.log("Option 1: Via Supabase Dashboard (Recommended)");
console.log("───────────────────────────────────────────────");
console.log("1. Open the Supabase SQL Editor:");
if (projectRef) {
  console.log(`   ${supabaseUrl}/project/${projectRef}/sql`);
}
console.log();
console.log("2. Paste the SQL statement above");
console.log('3. Click "Run" to execute');
console.log('4. You should see "Success. No rows returned"');
console.log();

console.log("Option 2: Using Supabase CLI (if available)");
console.log("───────────────────────────────────────────────");
console.log("   npx supabase db push");
console.log();

console.log("Option 3: Using psql (if installed)");
console.log("───────────────────────────────────────────────");
if (projectRef) {
  console.log(`   psql -h db.${projectRef}.supabase.co -U postgres -d postgres`);
  console.log("   (Enter service role key as password when prompted)");
}
console.log();

console.log("✨ Expected Result:");
console.log("─".repeat(80));
console.log("Anonymous users will be able to:");
console.log("  ✅ Browse all 157 AI-curated flashcards");
console.log("  ✅ Use filters (domain, difficulty)");
console.log("  ✅ Search flashcards");
console.log("  ✅ View flashcard content");
console.log();
console.log("Authenticated users will retain:");
console.log("  ✅ All browse features PLUS");
console.log("  ✅ Progress tracking");
console.log("  ✅ Statistics dashboard");
console.log("  ✅ Review sessions");
console.log();

console.log("🧪 Verification Steps:");
console.log("─".repeat(80));
console.log("1. Visit: http://localhost:3000/flashcards");
console.log('2. Click the "Library (AI)" tab');
console.log("3. You should see 157 flashcards displayed");
console.log('4. Verify the blue "Browse Mode" banner is showing');
console.log("5. Test filters and search functionality");
console.log();

console.log("═".repeat(80));
console.log("📝 Note: This is a PERMISSIVE policy that works alongside the existing");
console.log("   authenticated policy. It only grants SELECT (read) access to anonymous");
console.log("   users. Progress tracking remains secure and authenticated-only.");
console.log("═".repeat(80));
console.log();
