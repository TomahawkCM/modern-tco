#!/usr/bin/env tsx
/**
 * Check database tables and apply migrations if needed
 * Week 2.3: Question Bank Integration
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('\n🔍 Checking existing tables...\n');

  const tables = [
    'flashcards',
    'flashcard_reviews',
    'flashcard_decks',
    'flashcard_deck_cards',
    'question_reviews',
    'question_review_attempts',
    'review_sessions',
  ];

  const results: Record<string, boolean> = {};

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('id').limit(1);

    if (error) {
      if (error.message.includes('does not exist')) {
        results[table] = false;
        console.log(`❌ ${table} - NOT EXISTS`);
      } else {
        console.log(`⚠️  ${table} - ERROR: ${error.message}`);
        results[table] = false;
      }
    } else {
      results[table] = true;
      console.log(`✅ ${table} - EXISTS`);
    }
  }

  return results;
}

async function applyMigration(filename: string) {
  console.log(`\n📝 Applying migration: ${filename}...`);

  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', filename);

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    return false;
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');

  try {
    // Execute the SQL using rpc (Supabase SQL execution)
    // Note: This requires exec_sql function in Supabase or we need to use REST API
    console.log('⚠️  Cannot apply migrations programmatically.');
    console.log('ℹ️  Please apply migrations using Supabase Dashboard or CLI:');
    console.log(`   1. Go to: ${supabaseUrl}/project/_/sql`);
    console.log(`   2. Copy and paste the SQL from: ${migrationPath}`);
    console.log(`   3. Click "Run" to execute`);
    console.log('');
    return false;
  } catch (error) {
    console.error(`❌ Error applying migration: ${error}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Week 2.3: Database Migration Check\n');
  console.log(`📊 Supabase URL: ${supabaseUrl}`);

  const tables = await checkTables();

  // Check if flashcard tables exist
  const flashcardTablesExist =
    tables.flashcards &&
    tables.flashcard_reviews &&
    tables.flashcard_decks &&
    tables.flashcard_deck_cards;

  const questionReviewTablesExist =
    tables.question_reviews && tables.question_review_attempts && tables.review_sessions;

  console.log('\n📊 Summary:');
  console.log(`   Flashcard System: ${flashcardTablesExist ? '✅ READY' : '❌ NEEDS MIGRATION'}`);
  console.log(
    `   Question Reviews: ${questionReviewTablesExist ? '✅ READY' : '❌ NEEDS MIGRATION'}`
  );

  if (!flashcardTablesExist || !questionReviewTablesExist) {
    console.log('\n⚠️  MIGRATIONS NEEDED!');
    console.log('\nTo apply migrations:');
    console.log(
      '1. Open Supabase SQL Editor: https://qnwcwoutgarhqxlgsjzs.supabase.co/project/_/sql'
    );
    console.log('2. Apply these migrations in order:');

    if (!flashcardTablesExist) {
      console.log('   → supabase/migrations/20251002000001_add_flashcards_system.sql');
    }
    if (!questionReviewTablesExist) {
      console.log('   → supabase/migrations/20251002000002_add_question_reviews.sql');
    }

    console.log('\nOr use Supabase CLI (if Docker running):');
    console.log('   npx supabase db push');
  } else {
    console.log('\n✅ All tables ready! Database migrations applied successfully.');
  }
}

main().catch(console.error);
