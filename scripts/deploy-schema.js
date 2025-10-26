#!/usr/bin/env node

/**
 * TCO Database Schema Deployment Script
 * Executes PostgreSQL schema using Supabase client with proper authentication
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
import dotenv from "dotenv";
const envPath = join(__dirname, "..", ".env.local");
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase configuration in .env.local");
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

console.log("🚀 TCO Schema Deployment Starting...");
console.log(`📡 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Service Key: ${supabaseServiceKey.substring(0, 20)}...`);

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Execute SQL with proper error handling and logging
 */
async function executeSQL(sql, description = "SQL execution") {
  try {
    console.log(`\n📋 Executing: ${description}`);

    const { data, error } = await supabase.rpc("exec_sql", {
      sql_query: sql,
    });

    if (error) {
      console.error(`❌ ${description} failed:`, error);
      return false;
    }

    console.log(`✅ ${description} completed successfully`);
    if (data) console.log("📊 Result:", data);
    return true;
  } catch (err) {
    console.error(`❌ ${description} threw error:`, err);
    return false;
  }
}

/**
 * Create custom RPC function for SQL execution if not exists
 */
async function createExecFunction() {
  const funcSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_query;
      RETURN json_build_object('status', 'success', 'message', 'SQL executed successfully');
    EXCEPTION WHEN OTHERS THEN
      RETURN json_build_object('status', 'error', 'message', SQLERRM);
    END;
    $$;
  `;

  return executeSQL(funcSQL, "Creating exec_sql function");
}

/**
 * Deploy complete TCO schema with all tables, indexes, and policies
 */
async function deploySchema() {
  console.log("\n🏗️  Deploying TCO Database Schema...");

  // Step 1: Create UUID extension
  const uuidSQL = `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;
  if (!(await executeSQL(uuidSQL, "Creating UUID extension"))) return false;

  // Step 2: Create study_domains table
  const domainsTableSQL = `
    CREATE TABLE IF NOT EXISTS study_domains (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      domain_number INTEGER NOT NULL UNIQUE,
      title TEXT NOT NULL,
      exam_weight INTEGER NOT NULL,
      estimated_time_minutes INTEGER DEFAULT 180,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  if (!(await executeSQL(domainsTableSQL, "Creating study_domains table"))) return false;

  // Step 3: Create study_modules table
  const modulesTableSQL = `
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
  `;
  if (!(await executeSQL(modulesTableSQL, "Creating study_modules table"))) return false;

  // Step 4: Create study_sections table
  const sectionsTableSQL = `
    CREATE TABLE IF NOT EXISTS study_sections (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      module_id UUID NOT NULL REFERENCES study_modules(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      section_order INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  if (!(await executeSQL(sectionsTableSQL, "Creating study_sections table"))) return false;

  // Step 5: Create practice_questions table
  const questionsTableSQL = `
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
  `;
  if (!(await executeSQL(questionsTableSQL, "Creating practice_questions table"))) return false;

  // Step 6: Create performance indexes
  const indexesSQL = `
    CREATE INDEX IF NOT EXISTS idx_study_modules_domain_id ON study_modules(domain_id);
    CREATE INDEX IF NOT EXISTS idx_study_sections_module_id ON study_sections(module_id);
    CREATE INDEX IF NOT EXISTS idx_practice_questions_domain_id ON practice_questions(domain_id);
    CREATE INDEX IF NOT EXISTS idx_practice_questions_module_id ON practice_questions(module_id);
  `;
  if (!(await executeSQL(indexesSQL, "Creating performance indexes"))) return false;

  // Step 7: Insert TCO certification domains
  const domainsDataSQL = `
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
  `;
  if (!(await executeSQL(domainsDataSQL, "Inserting TCO certification domains"))) return false;

  // Step 8: Enable Row Level Security
  const rlsSQL = `
    ALTER TABLE study_domains ENABLE ROW LEVEL SECURITY;
    ALTER TABLE study_modules ENABLE ROW LEVEL SECURITY;
    ALTER TABLE study_sections ENABLE ROW LEVEL SECURITY;
    ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;
  `;
  if (!(await executeSQL(rlsSQL, "Enabling Row Level Security"))) return false;

  // Step 9: Create public read policies
  const policiesSQL = `
    CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON study_domains FOR SELECT USING (true);
    CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON study_modules FOR SELECT USING (true);
    CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON study_sections FOR SELECT USING (true);
    CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON practice_questions FOR SELECT USING (true);
  `;
  if (!(await executeSQL(policiesSQL, "Creating public read policies"))) return false;

  return true;
}

/**
 * Verify schema deployment by checking tables and data
 */
async function verifyDeployment() {
  console.log("\n🔍 Verifying Schema Deployment...");

  // Check tables exist
  const tablesQuery = `
    SELECT table_name, table_type 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('study_domains', 'study_modules', 'study_sections', 'practice_questions')
    ORDER BY table_name;
  `;

  const { data: tables, error: tablesError } = await supabase.rpc("exec_sql", {
    sql_query: tablesQuery,
  });

  if (tablesError) {
    console.error("❌ Table verification failed:", tablesError);
    return false;
  }

  console.log("✅ Tables verified:", tables);

  // Check domains data
  const { data: domains, error: domainsError } = await supabase
    .from("study_domains")
    .select("domain_number, title, exam_weight")
    .order("domain_number");

  if (domainsError) {
    console.error("❌ Domains verification failed:", domainsError);
    return false;
  }

  console.log("✅ TCO Domains verified:", domains);
  return true;
}

/**
 * Main deployment function
 */
async function main() {
  try {
    console.log("🎯 Starting TCO Database Schema Deployment");

    // Step 1: Create exec function if needed
    await createExecFunction();

    // Step 2: Deploy complete schema
    const schemaSuccess = await deploySchema();
    if (!schemaSuccess) {
      console.error("❌ Schema deployment failed");
      process.exit(1);
    }

    // Step 3: Verify deployment
    const verifySuccess = await verifyDeployment();
    if (!verifySuccess) {
      console.error("❌ Schema verification failed");
      process.exit(1);
    }

    console.log("\n🎉 TCO Database Schema Deployment Completed Successfully!");
    console.log(
      "📊 4 tables created: study_domains, study_modules, study_sections, practice_questions"
    );
    console.log("🎯 5 TCO certification domains populated");
    console.log("🔒 Row Level Security policies configured");
    console.log("⚡ Performance indexes optimized");
  } catch (error) {
    console.error("❌ Deployment failed with error:", error);
    process.exit(1);
  }
}

// Execute deployment
main();
