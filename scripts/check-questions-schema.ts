#!/usr/bin/env tsx
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSchema() {
  console.log("🔍 Checking questions table schema...\n");

  // Get one record to see the structure
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .limit(1);

  if (error) {
    console.error("❌ Error:", error.message);
  } else if (data && data.length > 0) {
    console.log("✅ Sample question record:");
    console.log(JSON.stringify(data[0], null, 2));
    console.log("\n📋 Available columns:");
    console.log(Object.keys(data[0]).join(", "));
  } else {
    console.log("⚠️  No questions found in database");
  }
}

checkSchema();
