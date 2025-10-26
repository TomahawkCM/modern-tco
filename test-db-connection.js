// Simple database connection test for TCO Study Platform
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔗 Testing Supabase Connection...");
console.log("URL:", supabaseUrl);
console.log("Key:", supabaseKey ? `${supabaseKey.slice(0, 20)}...` : "NOT SET");

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log("\n📊 Testing database connection...");

    // Test 1: Check if we can query study_domains
    const { data: domains, error: domainsError } = await supabase
      .from("study_domains")
      .select("*")
      .limit(5);

    if (domainsError) {
      console.log("❌ study_domains table error:", domainsError.message);
    } else {
      console.log("✅ study_domains table found:", domains?.length || 0, "records");
      if (domains?.length > 0) {
        console.log("   Sample:", domains[0]);
      }
    }

    // Test 2: Check if we can query study_modules
    const { data: modules, error: modulesError } = await supabase
      .from("study_modules")
      .select("*")
      .limit(3);

    if (modulesError) {
      console.log("❌ study_modules table error:", modulesError.message);
    } else {
      console.log("✅ study_modules table found:", modules?.length || 0, "records");
    }

    // Test 3: Check if we can query study_sections
    const { data: sections, error: sectionsError } = await supabase
      .from("study_sections")
      .select("*")
      .limit(3);

    if (sectionsError) {
      console.log("❌ study_sections table error:", sectionsError.message);
    } else {
      console.log("✅ study_sections table found:", sections?.length || 0, "records");
    }

    // Test 4: Check if we can query practice_questions
    const { data: questions, error: questionsError } = await supabase
      .from("practice_questions")
      .select("*")
      .limit(3);

    if (questionsError) {
      console.log("❌ practice_questions table error:", questionsError.message);
    } else {
      console.log("✅ practice_questions table found:", questions?.length || 0, "records");
    }

    console.log("\n🎯 Database Test Complete!");

    // Summary
    const errors = [domainsError, modulesError, sectionsError, questionsError].filter(Boolean);
    if (errors.length === 0) {
      console.log("🎉 All tables accessible - schema creation successful!");
    } else {
      console.log(`⚠️  ${errors.length} table(s) have issues - may need schema execution`);
    }
  } catch (error) {
    console.log("❌ Connection failed:", error.message);
  }
}

testConnection();
