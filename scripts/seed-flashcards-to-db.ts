/**
 * Seed World-Class TCO Flashcards to Database
 *
 * This script loads the generated flashcard library (flashcards-library.json)
 * and seeds it to the Supabase database for user access.
 *
 * Usage:
 * - Development: npx tsx scripts/seed-flashcards-to-db.ts
 * - Production: Run via Supabase SQL or admin panel
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedFlashcards() {
  console.log('💾 TCO Flashcard Database Seeding\n');
  console.log('='.repeat(60));

  try {
    // Load flashcard library
    const libraryPath = path.join(process.cwd(), 'flashcards-library.json');

    if (!fs.existsSync(libraryPath)) {
      console.error(`❌ Flashcard library not found at: ${libraryPath}`);
      console.log('   Run "npx tsx scripts/generate-tco-flashcards.ts" first');
      process.exit(1);
    }

    const flashcards = JSON.parse(fs.readFileSync(libraryPath, 'utf-8'));
    console.log(`\n📚 Loaded ${flashcards.length} flashcards from library\n`);

    // Option 1: Get existing user
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(10);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.log('⚠️  No users found in database.');
      console.log('   Options:');
      console.log('   1. Create a user account via /auth/signup');
      console.log('   2. Manually import flashcards-library.json via Supabase SQL\n');

      // Provide SQL import template
      console.log('📋 Manual SQL Import Template:\n');
      console.log('-- Run this in Supabase SQL Editor after replacing USER_ID');
      console.log('-- Get USER_ID from profiles table\n');
      console.log('INSERT INTO flashcards (');
      console.log('  user_id, front_text, back_text, card_type, source,');
      console.log('  hint, explanation, tags, module_id, domain, difficulty,');
      console.log('  srs_due, srs_interval, srs_ease, srs_reps, srs_lapses,');
      console.log('  total_reviews, correct_reviews');
      console.log(') VALUES');
      console.log('  -- Load JSON data here from flashcards-library.json\n');

      process.exit(1);
    }

    console.log(`✅ Found ${users.length} users:\n`);
    users.forEach((u, idx) => {
      console.log(`  ${idx + 1}. ${u.email} (ID: ${u.id})`);
    });

    // Prompt for user selection (in production, use first user or all users)
    const targetUserId = users[0].id; // Use first user for demo
    console.log(`\n🎯 Seeding flashcards for user: ${users[0].email}\n`);

    // Check if user already has flashcards
    const { data: existing } = await supabase
      .from('flashcards')
      .select('id')
      .eq('user_id', targetUserId)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('⚠️  User already has flashcards.');
      console.log('   Delete existing flashcards first to re-seed:\n');
      console.log(`   DELETE FROM flashcards WHERE user_id = '${targetUserId}';\n`);
      process.exit(1);
    }

    // Prepare flashcards for insertion
    const flashcardsToInsert = flashcards.map((card: any) => ({
      user_id: targetUserId,
      ...card,
      srs_due: new Date().toISOString(), // Due immediately
      srs_interval: 0,
      srs_ease: 2.5,
      srs_reps: 0,
      srs_lapses: 0,
      total_reviews: 0,
      correct_reviews: 0,
    }));

    // Insert in batches
    const batchSize = 100;
    let totalInserted = 0;

    for (let i = 0; i < flashcardsToInsert.length; i += batchSize) {
      const batch = flashcardsToInsert.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('flashcards')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        continue;
      }

      totalInserted += data?.length || 0;
      console.log(`  ✅ Batch ${Math.floor(i / batchSize) + 1}: ${data?.length} cards inserted`);
    }

    console.log(`\n🎉 Successfully seeded ${totalInserted} flashcards!`);
    console.log(`\n📊 Distribution:`);

    // Show distribution
    const distribution: Record<string, number> = {};
    flashcards.forEach((card: any) => {
      distribution[card.domain] = (distribution[card.domain] || 0) + 1;
    });

    Object.entries(distribution).forEach(([domain, count]) => {
      console.log(`  ${domain}: ${count} cards`);
    });

    console.log('\n✅ Seeding complete! Users can now access flashcards at /flashcards\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run
seedFlashcards();
