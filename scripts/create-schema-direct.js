#!/usr/bin/env node

/**
 * Direct Schema Creation Script for TCO Study Platform
 * Creates database schema using Supabase client with service role
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log("🏗️  Creating TCO Database Schema...");
console.log("📍 Supabase URL:", supabaseUrl);

async function createSchema() {
  try {
    // First, create the domains table with raw SQL
    const domainsSql = `
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
    `;

    const modulesSql = `
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
    `;

    const sectionsSql = `
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
    `;

    const questionsSql = `
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
    `;

    // Execute each table creation
    console.log("📝 Creating study_domains table...");
    const { error: domainsError } = await supabase.rpc("exec", { sql: domainsSql });
    if (domainsError && !domainsError.message.includes("already exists")) {
      console.error("❌ Error creating domains table:", domainsError);
      throw domainsError;
    }

    console.log("📝 Creating study_modules table...");
    const { error: modulesError } = await supabase.rpc("exec", { sql: modulesSql });
    if (modulesError && !modulesError.message.includes("already exists")) {
      console.error("❌ Error creating modules table:", modulesError);
      throw modulesError;
    }

    console.log("📝 Creating study_sections table...");
    const { error: sectionsError } = await supabase.rpc("exec", { sql: sectionsSql });
    if (sectionsError && !sectionsError.message.includes("already exists")) {
      console.error("❌ Error creating sections table:", sectionsError);
      throw sectionsError;
    }

    console.log("📝 Creating practice_questions table...");
    const { error: questionsError } = await supabase.rpc("exec", { sql: questionsSql });
    if (questionsError && !questionsError.message.includes("already exists")) {
      console.error("❌ Error creating questions table:", questionsError);
      throw questionsError;
    }

    // Insert domain data
    console.log("📊 Inserting TCO domain data...");
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

    for (const domain of domains) {
      const { error } = await supabase
        .from("study_domains")
        .upsert(domain, { onConflict: "domain_number" });

      if (error) {
        console.error(`❌ Error inserting domain ${domain.domain_number}:`, error);
      } else {
        console.log(`✅ Domain ${domain.domain_number}: ${domain.title} inserted`);
      }
    }

    console.log("🎉 Database schema created successfully!");
    console.log("📊 Ready for content migration");
  } catch (error) {
    console.error("❌ Schema creation failed:", error);
    throw error;
  }
}

// Run the schema creation
createSchema()
  .then(() => {
    console.log("✅ Schema creation complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Schema creation failed:", error);
    process.exit(1);
  });
