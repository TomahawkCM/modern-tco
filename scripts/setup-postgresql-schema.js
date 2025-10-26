#!/usr/bin/env node

/**
 * PostgreSQL Schema Setup for TCO Content Integration Pipeline
 * Creates comprehensive database schema using Supabase service role
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("🏗️  Setting up PostgreSQL schema for TCO content integration...");
console.log(`📍 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Using service role key: ${serviceRoleKey ? "Present" : "Missing"}`);

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing required environment variables");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "Set" : "Missing");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", serviceRoleKey ? "Set" : "Missing");
  process.exit(1);
}

// Initialize Supabase client with service role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createSchema() {
  try {
    console.log("\n🔧 Creating UUID extension...");

    // Create UUID extension
    const { error: extensionError } = await supabase.rpc("exec_sql", {
      sql: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
    });

    if (extensionError && !extensionError.message.includes("already exists")) {
      console.error("❌ Error creating UUID extension:", extensionError);
      throw extensionError;
    }
    console.log("✅ UUID extension ready");

    console.log("\n🏗️  Creating study_modules table...");

    // Create study_modules table
    const moduleTableSQL = `
      CREATE TABLE IF NOT EXISTS study_modules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        domain TEXT NOT NULL,
        title TEXT NOT NULL,
        exam_weight INTEGER NOT NULL,
        content_lines INTEGER,
        estimated_time_minutes INTEGER,
        description TEXT,
        learning_objectives TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: moduleError } = await supabase.rpc("exec_sql", { sql: moduleTableSQL });
    if (moduleError) {
      console.error("❌ Error creating study_modules table:", moduleError);
      throw moduleError;
    }
    console.log("✅ study_modules table created");

    console.log("\n📝 Creating study_sections table...");

    // Create study_sections table
    const sectionTableSQL = `
      CREATE TABLE IF NOT EXISTS study_sections (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        module_id UUID REFERENCES study_modules(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        section_type TEXT CHECK (section_type IN ('overview', 'concepts', 'procedures', 'examples', 'exam_prep', 'lab')),
        order_index INTEGER NOT NULL,
        estimated_time INTEGER,
        key_points TEXT[],
        procedures TEXT[],
        references TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: sectionError } = await supabase.rpc("exec_sql", { sql: sectionTableSQL });
    if (sectionError) {
      console.error("❌ Error creating study_sections table:", sectionError);
      throw sectionError;
    }
    console.log("✅ study_sections table created");

    console.log("\n❓ Creating study_questions table...");

    // Create study_questions table
    const questionTableSQL = `
      CREATE TABLE IF NOT EXISTS study_questions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        module_id UUID REFERENCES study_modules(id) ON DELETE CASCADE,
        section_id UUID REFERENCES study_sections(id) ON DELETE SET NULL,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL DEFAULT 'multiple_choice',
        options JSONB,
        correct_answer TEXT,
        explanation TEXT,
        difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5) DEFAULT 3,
        tags TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: questionError } = await supabase.rpc("exec_sql", { sql: questionTableSQL });
    if (questionError) {
      console.error("❌ Error creating study_questions table:", questionError);
      throw questionError;
    }
    console.log("✅ study_questions table created");

    console.log("\n👤 Creating user_progress table...");

    // Create user_progress table
    const progressTableSQL = `
      CREATE TABLE IF NOT EXISTS user_progress (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        module_id UUID REFERENCES study_modules(id) ON DELETE CASCADE,
        section_id UUID REFERENCES study_sections(id) ON DELETE CASCADE,
        completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
        time_spent_minutes INTEGER DEFAULT 0,
        last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, module_id, section_id)
      );
    `;

    const { error: progressError } = await supabase.rpc("exec_sql", { sql: progressTableSQL });
    if (progressError) {
      console.error("❌ Error creating user_progress table:", progressError);
      throw progressError;
    }
    console.log("✅ user_progress table created");

    console.log("\n🚀 Creating performance indexes...");

    // Create performance indexes
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_study_sections_module_order ON study_sections(module_id, order_index);
      CREATE INDEX IF NOT EXISTS idx_study_questions_module ON study_questions(module_id);
      CREATE INDEX IF NOT EXISTS idx_user_progress_user_module ON user_progress(user_id, module_id);
      CREATE INDEX IF NOT EXISTS idx_user_progress_last_accessed ON user_progress(last_accessed DESC);
    `;

    const { error: indexError } = await supabase.rpc("exec_sql", { sql: indexSQL });
    if (indexError) {
      console.error("❌ Error creating indexes:", indexError);
      throw indexError;
    }
    console.log("✅ Performance indexes created");

    console.log("\n⏰ Creating update trigger function...");

    // Create update trigger
    const triggerSQL = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_study_modules_updated_at ON study_modules;
      CREATE TRIGGER update_study_modules_updated_at BEFORE UPDATE
          ON study_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    const { error: triggerError } = await supabase.rpc("exec_sql", { sql: triggerSQL });
    if (triggerError) {
      console.error("❌ Error creating trigger:", triggerError);
      throw triggerError;
    }
    console.log("✅ Update trigger created");

    console.log("\n🎉 PostgreSQL schema setup completed successfully!");
    console.log("\n📊 Schema Summary:");
    console.log("   ✅ study_modules - 5 TCO certification domains");
    console.log("   ✅ study_sections - Parsed markdown sections");
    console.log("   ✅ study_questions - Practice questions and labs");
    console.log("   ✅ user_progress - Progress tracking");
    console.log("   ✅ Performance indexes and triggers");

    return true;
  } catch (error) {
    console.error("\n❌ Schema setup failed:", error);
    throw error;
  }
}

async function verifySchema() {
  try {
    console.log("\n🔍 Verifying schema setup...");

    // Check if tables exist and get basic info
    const tables = ["study_modules", "study_sections", "study_questions", "user_progress"];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error(`❌ Error accessing ${table}:`, error);
      } else {
        console.log(`✅ ${table} table accessible (${data?.length || 0} rows)`);
      }
    }
  } catch (error) {
    console.error("❌ Schema verification failed:", error);
  }
}

// Main execution
async function main() {
  try {
    await createSchema();
    await verifySchema();
    console.log("\n🚀 Ready for content migration!");
  } catch (error) {
    console.error("\n💥 Setup failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createSchema, verifySchema };
