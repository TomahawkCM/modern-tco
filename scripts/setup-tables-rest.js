#!/usr/bin/env node

/**
 * Direct Table Creation using Supabase REST API
 * Creates tables and inserts data for TCO Study Platform
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log("🏗️  Setting up TCO Database Tables...");
console.log("📍 Supabase URL:", supabaseUrl);

async function setupTables() {
  try {
    // Try to insert domains first to see if tables exist
    console.log("📊 Attempting to insert TCO domain data...");

    const domains = [
      { domain_number: 1, title: "Asking Questions", exam_weight: 22, estimated_time_minutes: 180 },
      {
        domain_number: 2,
        title: "Refining Questions & Targeting",
        exam_weight: 23,
        estimated_time_minutes: 200,
      },
      { domain_number: 3, title: "Taking Action", exam_weight: 15, estimated_time_minutes: 150 },
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

    // Insert domains one by one to handle conflicts
    for (const domain of domains) {
      const { data, error } = await supabase
        .from("study_domains")
        .upsert(domain, { onConflict: "domain_number" })
        .select();

      if (error) {
        console.error(`❌ Error with domain ${domain.domain_number}:`, error.message);
        if (error.code === "PGRST205") {
          console.log("🚨 Table does not exist. You need to create the schema first.");
          console.log("📝 Please run this SQL in your Supabase SQL Editor:");
          console.log(`
-- Create study_domains table
CREATE TABLE IF NOT EXISTS study_domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  exam_weight INTEGER NOT NULL,
  estimated_time_minutes INTEGER DEFAULT 180,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_modules table  
CREATE TABLE IF NOT EXISTS study_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create study_sections table
CREATE TABLE IF NOT EXISTS study_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES study_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  section_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create practice_questions table
CREATE TABLE IF NOT EXISTS practice_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
          `);
          return false;
        }
      } else {
        console.log(`✅ Domain ${domain.domain_number}: ${domain.title} ready`);
      }
    }

    console.log("🎉 Domain data setup complete!");
    return true;
  } catch (error) {
    console.error("❌ Setup failed:", error);
    return false;
  }
}

// Check if tables exist by attempting to query them
async function checkTables() {
  try {
    const { data, error } = await supabase.from("study_domains").select("*").limit(1);

    if (error) {
      if (error.code === "PGRST205") {
        console.log("🚨 Tables do not exist yet");
        return false;
      }
      throw error;
    }

    console.log("✅ Tables exist and are accessible");
    return true;
  } catch (error) {
    console.error("❌ Error checking tables:", error);
    return false;
  }
}

// Main execution
async function main() {
  const tablesExist = await checkTables();

  if (!tablesExist) {
    console.log("🏗️  Tables need to be created first");
    await setupTables();
  } else {
    console.log("📊 Tables exist, setting up domain data...");
    const success = await setupTables();
    if (success) {
      console.log("🎉 Database is ready for content migration!");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Setup failed:", error);
    process.exit(1);
  });
