const { createClient } = require("@supabase/supabase-js");

// Use the correct project from .env.local (qnwcwoutgarhqxlgsjzs)
const supabaseUrl = "https://qnwcwoutgarhqxlgsjzs.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud2N3b3V0Z2FyaHF4bGdzanpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY3MzQyOCwiZXhwIjoyMDcyMjQ5NDI4fQ.U_FDgUC__dtFPVd5jrTpmwaWiDWJ701w4lRbe4qy1T4";

console.log("🚀 Final TCO Database Schema Deployment");
console.log("📍 Project: qnwcwoutgarhqxlgsjzs");
console.log("🔗 URL:", supabaseUrl);
console.log("");

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function deploySchema() {
  console.log("🔍 Testing connection...");

  try {
    // Test with a simple query that should work
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .limit(1);

    if (error && !error.message.includes("relation") && !error.message.includes("does not exist")) {
      console.log("❌ Connection failed:", error.message);
      return;
    }

    console.log("✅ Connection successful!");
    console.log("");

    // Execute schema creation using raw SQL
    console.log("📝 Creating database schema...");

    const schemaSQLs = [
      {
        name: "UUID Extension",
        sql: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
      },
      {
        name: "study_domains table",
        sql: `CREATE TABLE IF NOT EXISTS study_domains (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          domain_number INTEGER NOT NULL UNIQUE,
          title TEXT NOT NULL,
          exam_weight INTEGER NOT NULL,
          estimated_time_minutes INTEGER DEFAULT 180,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,
      },
      {
        name: "study_modules table",
        sql: `CREATE TABLE IF NOT EXISTS study_modules (
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
        );`,
      },
      {
        name: "study_sections table",
        sql: `CREATE TABLE IF NOT EXISTS study_sections (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          module_id UUID NOT NULL REFERENCES study_modules(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          section_order INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,
      },
      {
        name: "practice_questions table",
        sql: `CREATE TABLE IF NOT EXISTS practice_questions (
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
        );`,
      },
      {
        name: "Performance indexes",
        sql: `CREATE INDEX IF NOT EXISTS idx_study_modules_domain_id ON study_modules(domain_id);
              CREATE INDEX IF NOT EXISTS idx_study_sections_module_id ON study_sections(module_id);
              CREATE INDEX IF NOT EXISTS idx_practice_questions_domain_id ON practice_questions(domain_id);
              CREATE INDEX IF NOT EXISTS idx_practice_questions_module_id ON practice_questions(module_id);`,
      },
      {
        name: "TCO Domain Data",
        sql: `INSERT INTO study_domains (domain_number, title, exam_weight, estimated_time_minutes) VALUES
              (1, 'Asking Questions', 22, 180),
              (2, 'Refining Questions & Targeting', 23, 200), 
              (3, 'Taking Action', 15, 150),
              (4, 'Navigation & Module Functions', 23, 180),
              (5, 'Reporting & Data Export', 17, 160)
              ON CONFLICT (domain_number) DO UPDATE SET
                title = EXCLUDED.title,
                exam_weight = EXCLUDED.exam_weight,
                estimated_time_minutes = EXCLUDED.estimated_time_minutes,
                updated_at = NOW();`,
      },
      {
        name: "Row Level Security",
        sql: `ALTER TABLE study_domains ENABLE ROW LEVEL SECURITY;
              ALTER TABLE study_modules ENABLE ROW LEVEL SECURITY;
              ALTER TABLE study_sections ENABLE ROW LEVEL SECURITY;
              ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;`,
      },
      {
        name: "Public Read Policies",
        sql: `DROP POLICY IF EXISTS "Enable read access for all users" ON study_domains;
              DROP POLICY IF EXISTS "Enable read access for all users" ON study_modules;
              DROP POLICY IF EXISTS "Enable read access for all users" ON study_sections;
              DROP POLICY IF EXISTS "Enable read access for all users" ON practice_questions;
              
              CREATE POLICY "Enable read access for all users" ON study_domains FOR SELECT USING (true);
              CREATE POLICY "Enable read access for all users" ON study_modules FOR SELECT USING (true);
              CREATE POLICY "Enable read access for all users" ON study_sections FOR SELECT USING (true);
              CREATE POLICY "Enable read access for all users" ON practice_questions FOR SELECT USING (true);`,
      },
    ];

    for (const { name, sql } of schemaSQLs) {
      try {
        console.log(`📝 Creating ${name}...`);
        const { error } = await supabase.rpc("exec", { sql });

        if (error) {
          console.log(`❌ Failed ${name}: ${error.message}`);
        } else {
          console.log(`✅ Success: ${name}`);
        }
      } catch (err) {
        console.log(`❌ Error ${name}: ${err.message}`);
      }
    }

    // Verify deployment
    console.log("");
    console.log("🔍 Verifying deployment...");
    const { data: domains, error: domainsError } = await supabase
      .from("study_domains")
      .select("*")
      .order("domain_number");

    if (domainsError) {
      console.log("❌ Verification failed:", domainsError.message);
    } else {
      console.log(`✅ Found ${domains?.length || 0} TCO domains`);
      domains?.forEach((domain) => {
        console.log(
          `   📚 Domain ${domain.domain_number}: ${domain.title} (${domain.exam_weight}%)`
        );
      });
    }

    console.log("");
    console.log("🎉 TCO Database Schema Deployment Complete!");
  } catch (err) {
    console.log("❌ Deployment failed:", err.message);
  }
}

deploySchema();
