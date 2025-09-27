const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Use the project from .env.local
const supabaseUrl = "https://qnwcwoutgarhqxlgsjzs.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud2N3b3V0Z2FyaHF4bGdzanpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY3MzQyOCwiZXhwIjoyMDcyMjQ5NDI4fQ.U_FDgUC__dtFPVd5jrTpmwaWiDWJ701w4lRbe4qy1T4";

console.log("🚀 Deploying TCO Database Schema...\n");

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function testConnection() {
  console.log("🔍 Testing Supabase connection...");

  try {
    // Simple test query
    const { data, error } = await supabase.from("pg_tables").select("*").limit(1);

    if (error) {
      console.log(`❌ Connection test failed: ${error.message}`);
      return false;
    }

    console.log("✅ Connection successful!\n");
    return true;
  } catch (err) {
    console.log(`❌ Connection error: ${err.message}`);
    return false;
  }
}

async function executeSQL(query, description) {
  console.log(`📝 ${description}...`);

  try {
    const { data, error } = await supabase.rpc("exec", { sql: query });

    if (error) {
      console.log(`❌ Failed: ${error.message}`);
      return false;
    }

    console.log(`✅ Success: ${description}`);
    return true;
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
    return false;
  }
}

async function deploySchema() {
  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.log("❌ Cannot proceed without database connection");
    return;
  }

  // Create UUID extension
  await executeSQL('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', "Creating UUID extension");

  // Create study_domains table
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
    "Creating study_domains table"
  );

  // Create study_modules table
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
    "Creating study_modules table"
  );

  // Create study_sections table
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
    "Creating study_sections table"
  );

  // Create practice_questions table
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
    "Creating practice_questions table"
  );

  // Create indexes
  await executeSQL(
    `
    CREATE INDEX IF NOT EXISTS idx_study_modules_domain_id ON study_modules(domain_id);
    CREATE INDEX IF NOT EXISTS idx_study_sections_module_id ON study_sections(module_id);
    CREATE INDEX IF NOT EXISTS idx_practice_questions_domain_id ON practice_questions(domain_id);
    CREATE INDEX IF NOT EXISTS idx_practice_questions_module_id ON practice_questions(module_id);
  `,
    "Creating performance indexes"
  );

  // Insert TCO domains
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
    "Inserting TCO certification domains"
  );

  // Enable RLS and create policies
  await executeSQL(
    `
    ALTER TABLE study_domains ENABLE ROW LEVEL SECURITY;
    ALTER TABLE study_modules ENABLE ROW LEVEL SECURITY;
    ALTER TABLE study_sections ENABLE ROW LEVEL SECURITY;
    ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;
  `,
    "Enabling Row Level Security"
  );

  await executeSQL(
    `
    CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON study_domains FOR SELECT USING (true);
    CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON study_modules FOR SELECT USING (true);
    CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON study_sections FOR SELECT USING (true);
    CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON practice_questions FOR SELECT USING (true);
  `,
    "Creating read access policies"
  );

  console.log("\n🎉 TCO Database schema deployed successfully!");

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const { data: domains } = await supabase.from("study_domains").select("*");
  console.log(`✅ Found ${domains?.length || 0} TCO domains in database`);

  if (domains?.length > 0) {
    domains.forEach((domain) => {
      console.log(`   📚 Domain ${domain.domain_number}: ${domain.title} (${domain.exam_weight}%)`);
    });
  }
}

deploySchema().catch(console.error);
