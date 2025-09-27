// Direct schema creation using service role key
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("🚀 Creating TCO Study Platform Schema...");
console.log("URL:", supabaseUrl);
console.log("Using SERVICE ROLE key for full database access");

const supabase = createClient(supabaseUrl, serviceRoleKey);

const schemaSQL = `
-- Create UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Study Domains Table (5 TCO certification domains)
CREATE TABLE IF NOT EXISTS study_domains (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  domain_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  exam_weight INTEGER NOT NULL,
  estimated_time_minutes INTEGER DEFAULT 180,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Modules Table (detailed content modules per domain)
CREATE TABLE IF NOT EXISTS study_modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES study_domains(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  learning_objectives TEXT[], -- PostgreSQL array for objectives
  section_number INTEGER,
  estimated_time_minutes INTEGER DEFAULT 30,
  difficulty_level TEXT DEFAULT 'intermediate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Sections Table (sub-sections within modules)
CREATE TABLE IF NOT EXISTS study_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES study_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  section_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practice Questions Table (exam practice questions)
CREATE TABLE IF NOT EXISTS practice_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES study_domains(id) ON DELETE CASCADE,
  module_id UUID REFERENCES study_modules(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  options JSONB, -- PostgreSQL JSONB for flexible question options
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty_level TEXT DEFAULT 'intermediate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_study_modules_domain_id ON study_modules(domain_id);
CREATE INDEX IF NOT EXISTS idx_study_sections_module_id ON study_sections(module_id);
CREATE INDEX IF NOT EXISTS idx_practice_questions_domain_id ON practice_questions(domain_id);
CREATE INDEX IF NOT EXISTS idx_practice_questions_module_id ON practice_questions(module_id);

-- Insert initial TCO certification domains
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

-- Enable Row Level Security
ALTER TABLE study_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read access for all users" ON study_domains FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON study_modules FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON study_sections FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON practice_questions FOR SELECT USING (true);
`;

async function createSchema() {
  try {
    console.log("📊 Executing schema creation...");

    const { data, error } = await supabase.rpc("exec_sql", {
      sql: schemaSQL,
    });

    if (error) {
      console.log("❌ Schema creation failed:", error.message);

      // Try alternative approach with individual queries
      console.log("🔄 Trying individual table creation...");

      const queries = schemaSQL.split(";").filter((q) => q.trim());
      for (let i = 0; i < queries.length; i++) {
        const query = queries[i].trim();
        if (query) {
          console.log(`   Running query ${i + 1}/${queries.length}`);
          const { error: queryError } = await supabase.rpc("exec_sql", { sql: query });
          if (queryError) {
            console.log(`   ❌ Query failed: ${queryError.message}`);
          } else {
            console.log(`   ✅ Query succeeded`);
          }
        }
      }
    } else {
      console.log("✅ Schema creation succeeded:", data);
    }

    // Verify tables were created
    console.log("\\n🔍 Verifying table creation...");
    const { data: domains, error: domainsError } = await supabase.from("study_domains").select("*");

    if (domainsError) {
      console.log("❌ Verification failed:", domainsError.message);
    } else {
      console.log("🎉 SUCCESS! Tables created and accessible");
      console.log(`   study_domains: ${domains?.length || 0} records`);
    }
  } catch (error) {
    console.log("❌ Unexpected error:", error.message);
  }
}

createSchema();
