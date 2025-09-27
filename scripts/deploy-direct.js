const { createClient } = require("@supabase/supabase-js");

// Use correct project from .env.local
const supabaseUrl = "https://qnwcwoutgarhqxlgsjzs.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud2N3b3V0Z2FyaHF4bGdzanpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY3MzQyOCwiZXhwIjoyMDcyMjQ5NDI4fQ.U_FDgUC__dtFPVd5jrTpmwaWiDWJ701w4lRbe4qy1T4";

console.log("🚀 Direct TCO Schema Deployment");
console.log("📍 Project: qnwcwoutgarhqxlgsjzs\n");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQL(query, description) {
  console.log(`📝 ${description}...`);
  try {
    const { data, error } = await supabase.rpc("exec", { sql: query });
    if (error) {
      console.log(`❌ ${description}: ${error.message}`);
      return false;
    }
    console.log(`✅ ${description}`);
    return true;
  } catch (err) {
    console.log(`❌ ${description}: ${err.message}`);
    return false;
  }
}

async function deploy() {
  // Create tables directly
  await executeSQL('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', "UUID Extension");

  await executeSQL(
    `
    CREATE TABLE IF NOT EXISTS study_domains (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      domain_number INTEGER NOT NULL UNIQUE,
      title TEXT NOT NULL,
      exam_weight INTEGER NOT NULL,
      estimated_time_minutes INTEGER DEFAULT 180,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
    "study_domains table"
  );

  await executeSQL(
    `
    CREATE TABLE IF NOT EXISTS study_modules (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      domain_id UUID NOT NULL REFERENCES study_domains(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      learning_objectives TEXT[],
      section_number INTEGER,
      estimated_time_minutes INTEGER DEFAULT 30,
      difficulty_level TEXT DEFAULT 'intermediate',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
    "study_modules table"
  );

  await executeSQL(
    `
    CREATE TABLE IF NOT EXISTS study_sections (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      module_id UUID NOT NULL REFERENCES study_modules(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      section_order INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
    "study_sections table"
  );

  await executeSQL(
    `
    CREATE TABLE IF NOT EXISTS practice_questions (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      domain_id UUID NOT NULL REFERENCES study_domains(id) ON DELETE CASCADE,
      module_id UUID REFERENCES study_modules(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      question_type TEXT DEFAULT 'multiple_choice',
      options JSONB,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      difficulty_level TEXT DEFAULT 'intermediate',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
    "practice_questions table"
  );

  await executeSQL(
    `
    INSERT INTO study_domains (domain_number, title, exam_weight, estimated_time_minutes) VALUES
    (1, 'Asking Questions', 22, 180),
    (2, 'Refining Questions & Targeting', 23, 200), 
    (3, 'Taking Action', 15, 150),
    (4, 'Navigation & Module Functions', 23, 180),
    (5, 'Reporting & Data Export', 17, 160)
    ON CONFLICT (domain_number) DO UPDATE SET
      title = EXCLUDED.title,
      exam_weight = EXCLUDED.exam_weight,
      estimated_time_minutes = EXCLUDED.estimated_time_minutes,
      updated_at = NOW();
  `,
    "TCO Domain Data"
  );

  // Enable RLS and policies
  await executeSQL(
    `
    ALTER TABLE study_domains ENABLE ROW LEVEL SECURITY;
    ALTER TABLE study_modules ENABLE ROW LEVEL SECURITY;
    ALTER TABLE study_sections ENABLE ROW LEVEL SECURITY;
    ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;
  `,
    "Row Level Security"
  );

  await executeSQL(
    `
    DROP POLICY IF EXISTS "Enable read access for all users" ON study_domains;
    DROP POLICY IF EXISTS "Enable read access for all users" ON study_modules;
    DROP POLICY IF EXISTS "Enable read access for all users" ON study_sections;
    DROP POLICY IF EXISTS "Enable read access for all users" ON practice_questions;
    
    CREATE POLICY "Enable read access for all users" ON study_domains FOR SELECT USING (true);
    CREATE POLICY "Enable read access for all users" ON study_modules FOR SELECT USING (true);
    CREATE POLICY "Enable read access for all users" ON study_sections FOR SELECT USING (true);
    CREATE POLICY "Enable read access for all users" ON practice_questions FOR SELECT USING (true);
  `,
    "Public Access Policies"
  );

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  try {
    const { data: domains, error } = await supabase
      .from("study_domains")
      .select("*")
      .order("domain_number");

    if (error) {
      console.log("❌ Verification error:", error.message);
    } else {
      console.log(`✅ Success! Found ${domains.length} TCO domains:`);
      domains.forEach((domain) => {
        console.log(
          `   📚 Domain ${domain.domain_number}: ${domain.title} (${domain.exam_weight}%)`
        );
      });
    }
  } catch (err) {
    console.log("❌ Verification failed:", err.message);
  }

  console.log("\n🎉 TCO Database Schema Deployment Complete!");
}

deploy().catch(console.error);
