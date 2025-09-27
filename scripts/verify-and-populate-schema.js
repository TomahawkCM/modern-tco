const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

async function verifyAndPopulateSchema() {
  console.log("🔍 Verifying TCO Study Platform Schema...\n");

  // Initialize Supabase client with service role key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  console.log("✅ Supabase client initialized\n");

  // Check each table individually
  const tables = ["study_domains", "study_modules", "study_sections", "practice_questions"];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase.from(table).select("*", { count: "exact" });

      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`);
      } else {
        console.log(`✅ Table '${table}': exists with ${count} rows`);
        if (count === 0 && table === "study_domains") {
          console.log("   🔄 Populating study domains...");
          await populateStudyDomains(supabase);
        }
      }
    } catch (err) {
      console.log(`❌ Table '${table}': ${err.message}`);
    }
  }

  console.log("\n🎉 Schema verification completed!");
}

async function populateStudyDomains(supabase) {
  const domains = [
    {
      domain_number: 1,
      title: "Asking Questions",
      exam_weight: 22,
      estimated_time_minutes: 180,
    },
    {
      domain_number: 2,
      title: "Refining Questions & Targeting",
      exam_weight: 23,
      estimated_time_minutes: 200,
    },
    {
      domain_number: 3,
      title: "Taking Action",
      exam_weight: 15,
      estimated_time_minutes: 150,
    },
    {
      domain_number: 4,
      title: "Navigation & Module Functions",
      exam_weight: 23,
      estimated_time_minutes: 180,
    },
    {
      domain_number: 5,
      title: "Reporting & Data Export",
      exam_weight: 17,
      estimated_time_minutes: 160,
    },
  ];

  try {
    const { data, error } = await supabase
      .from("study_domains")
      .upsert(domains, { onConflict: "domain_number" });

    if (error) {
      console.log(`   ❌ Failed to populate study domains: ${error.message}`);
    } else {
      console.log(`   ✅ Successfully populated ${domains.length} study domains`);

      // Verify the data was inserted
      const { data: verifyData, error: verifyError } = await supabase
        .from("study_domains")
        .select("domain_number, title, exam_weight")
        .order("domain_number");

      if (verifyData && verifyData.length > 0) {
        console.log("   📊 Inserted domains:");
        verifyData.forEach((domain) => {
          console.log(`      ${domain.domain_number}. ${domain.title} (${domain.exam_weight}%)`);
        });
      }
    }
  } catch (err) {
    console.log(`   ❌ Exception populating study domains: ${err.message}`);
  }
}

// Run the verification
verifyAndPopulateSchema().catch(console.error);
