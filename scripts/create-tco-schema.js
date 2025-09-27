#!/usr/bin/env node

/**
 * Create TCO PostgreSQL Schema using Supabase Client
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log("🐘 Creating TCO PostgreSQL Schema via Supabase...");
console.log("📍 URL:", supabaseUrl);

async function createTCOSchema() {
  console.log("🔧 Step 1: Creating PostgreSQL tables...");

  try {
    // Check if tables already exist
    const { data: existingTables, error: checkError } = await supabase
      .from("study_domains")
      .select("id")
      .limit(1);

    if (!checkError) {
      console.log("✅ Tables already exist, verifying structure...");
      return await verifySchema();
    }

    console.log("📋 Tables do not exist, creating schema...");

    // Since we can't use RPC, let's create tables using individual operations
    // This will be done via SQL Editor or manual approach

    console.log("🚨 MANUAL SCHEMA CREATION REQUIRED:");
    console.log("1. Open Supabase Dashboard -> SQL Editor");
    console.log("2. Copy and run this SQL:");
    console.log("\n-- TCO Database Schema");
    console.log('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log("");
    console.log("CREATE TABLE IF NOT EXISTS study_domains (");
    console.log("  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,");
    console.log("  domain_number INTEGER NOT NULL UNIQUE,");
    console.log("  title TEXT NOT NULL,");
    console.log("  exam_weight INTEGER NOT NULL,");
    console.log("  estimated_time_minutes INTEGER DEFAULT 180,");
    console.log("  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),");
    console.log("  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()");
    console.log(");");
    console.log("");
    console.log("CREATE TABLE IF NOT EXISTS study_modules (");
    console.log("  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,");
    console.log("  domain_id UUID NOT NULL REFERENCES study_domains(id) ON DELETE CASCADE,");
    console.log("  title TEXT NOT NULL,");
    console.log("  content TEXT NOT NULL,");
    console.log("  learning_objectives TEXT[],");
    console.log("  section_number INTEGER,");
    console.log("  estimated_time_minutes INTEGER DEFAULT 30,");
    console.log("  difficulty_level TEXT DEFAULT 'intermediate',");
    console.log("  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),");
    console.log("  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()");
    console.log(");");
    console.log("");
    console.log("CREATE TABLE IF NOT EXISTS study_sections (");
    console.log("  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,");
    console.log("  module_id UUID NOT NULL REFERENCES study_modules(id) ON DELETE CASCADE,");
    console.log("  title TEXT NOT NULL,");
    console.log("  content TEXT NOT NULL,");
    console.log("  section_order INTEGER NOT NULL DEFAULT 1,");
    console.log("  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),");
    console.log("  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()");
    console.log(");");
    console.log("");
    console.log("CREATE TABLE IF NOT EXISTS practice_questions (");
    console.log("  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,");
    console.log("  domain_id UUID NOT NULL REFERENCES study_domains(id) ON DELETE CASCADE,");
    console.log("  module_id UUID REFERENCES study_modules(id) ON DELETE CASCADE,");
    console.log("  question_text TEXT NOT NULL,");
    console.log("  question_type TEXT DEFAULT 'multiple_choice',");
    console.log("  options JSONB,");
    console.log("  correct_answer TEXT NOT NULL,");
    console.log("  explanation TEXT,");
    console.log("  difficulty_level TEXT DEFAULT 'intermediate',");
    console.log("  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),");
    console.log("  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()");
    console.log(");");
    console.log("");
    console.log("-- Create indexes");
    console.log(
      "CREATE INDEX IF NOT EXISTS idx_study_modules_domain_id ON study_modules(domain_id);"
    );
    console.log(
      "CREATE INDEX IF NOT EXISTS idx_study_sections_module_id ON study_sections(module_id);"
    );
    console.log(
      "CREATE INDEX IF NOT EXISTS idx_practice_questions_domain_id ON practice_questions(domain_id);"
    );
    console.log(
      "CREATE INDEX IF NOT EXISTS idx_practice_questions_module_id ON practice_questions(module_id);"
    );
    console.log("");
    console.log("-- Insert TCO domains");
    console.log(
      "INSERT INTO study_domains (domain_number, title, exam_weight, estimated_time_minutes) VALUES"
    );
    console.log("(1, 'Asking Questions', 22, 180),");
    console.log("(2, 'Refining Questions & Targeting', 23, 200),");
    console.log("(3, 'Taking Action', 15, 150),");
    console.log("(4, 'Navigation & Module Functions', 23, 180),");
    console.log("(5, 'Reporting & Data Export', 17, 160)");
    console.log("ON CONFLICT (domain_number) DO UPDATE SET");
    console.log("  title = EXCLUDED.title,");
    console.log("  exam_weight = EXCLUDED.exam_weight,");
    console.log("  estimated_time_minutes = EXCLUDED.estimated_time_minutes,");
    console.log("  updated_at = NOW();");
    console.log("");
    console.log("-- Enable RLS");
    console.log("ALTER TABLE study_domains ENABLE ROW LEVEL SECURITY;");
    console.log("ALTER TABLE study_modules ENABLE ROW LEVEL SECURITY;");
    console.log("ALTER TABLE study_sections ENABLE ROW LEVEL SECURITY;");
    console.log("ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;");
    console.log("");
    console.log("-- Create policies");
    console.log(
      'CREATE POLICY "Enable read access for all users" ON study_domains FOR SELECT USING (true);'
    );
    console.log(
      'CREATE POLICY "Enable read access for all users" ON study_modules FOR SELECT USING (true);'
    );
    console.log(
      'CREATE POLICY "Enable read access for all users" ON study_sections FOR SELECT USING (true);'
    );
    console.log(
      'CREATE POLICY "Enable read access for all users" ON practice_questions FOR SELECT USING (true);'
    );
    console.log("");
    console.log("3. After running the SQL, run this script again to verify");

    return false;
  } catch (error) {
    console.error("❌ Error in schema creation:", error.message);
    return false;
  }
}

async function verifySchema() {
  console.log("🔍 Verifying TCO PostgreSQL schema...");

  try {
    // Test all tables
    const { data: domains, error: domainError } = await supabase
      .from("study_domains")
      .select("id, domain_number, title, exam_weight")
      .order("domain_number");

    if (domainError) {
      console.error("❌ study_domains table error:", domainError.message);
      return false;
    }

    console.log(`✅ study_domains: ${domains.length} domains found`);
    domains.forEach((d) => console.log(`   ${d.domain_number}: ${d.title} (${d.exam_weight}%)`));

    // Test modules table
    const { data: modules, error: moduleError } = await supabase
      .from("study_modules")
      .select("id")
      .limit(1);

    if (moduleError) {
      console.error("❌ study_modules table error:", moduleError.message);
      return false;
    }

    console.log("✅ study_modules table accessible");

    // Test sections table
    const { data: sections, error: sectionError } = await supabase
      .from("study_sections")
      .select("id")
      .limit(1);

    if (sectionError) {
      console.error("❌ study_sections table error:", sectionError.message);
      return false;
    }

    console.log("✅ study_sections table accessible");

    // Test questions table
    const { data: questions, error: questionError } = await supabase
      .from("practice_questions")
      .select("id")
      .limit(1);

    if (questionError) {
      console.error("❌ practice_questions table error:", questionError.message);
      return false;
    }

    console.log("✅ practice_questions table accessible");

    console.log("🎉 TCO PostgreSQL schema verified successfully!");
    console.log("✅ Ready for content migration: npm run db:migrate");

    return true;
  } catch (error) {
    console.error("❌ Schema verification failed:", error.message);
    return false;
  }
}

async function main() {
  try {
    console.log("🚀 TCO PostgreSQL Schema Creation Starting...");

    const schemaReady = await createTCOSchema();

    if (schemaReady) {
      console.log("✅ TCO PostgreSQL schema ready for content migration!");
      console.log("🚀 Next step: npm run db:migrate");
    } else {
      console.log("❌ Schema creation requires manual intervention");
      console.log("📋 Follow the SQL instructions above, then run this script again");
    }

    return schemaReady;
  } catch (error) {
    console.error("💥 Schema creation failed:", error.message);
    return false;
  }
}

// Execute if run directly
if (require.main === module) {
  main()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("💥 Unexpected error:", error);
      process.exit(1);
    });
}

module.exports = { main, verifySchema };
