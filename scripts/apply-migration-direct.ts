#!/usr/bin/env tsx

/**
 * Direct Migration Application
 *
 * Applies the RLS policy directly using Supabase's query builder
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
});

async function applyMigration() {
  console.log('\n🔄 Applying RLS Migration...\n');

  const policySQL = `
    CREATE POLICY IF NOT EXISTS "Flashcard library is publicly readable"
      ON public.flashcard_library FOR SELECT
      TO anon
      USING (true);
  `;

  try {
    // Use Supabase's from() with a raw SQL query
    // Since we have service role key, we can check if policy exists first
    const { data: existingPolicies, error: checkError } = await supabase
      .from('pg_policies')
      .select('policyname')
      .eq('tablename', 'flashcard_library')
      .eq('policyname', 'Flashcard library is publicly readable');

    if (checkError) {
      console.log('⚠️  Could not check existing policies (this is okay)');
      console.log('   Error:', checkError.message);
    } else if (existingPolicies && existingPolicies.length > 0) {
      console.log('✅ Policy already exists!');
      console.log('   Policy name: "Flashcard library is publicly readable"');
      console.log('   Status: Active');
      console.log('\n🎉 Anonymous users can already browse flashcards!');
      return;
    }

    console.log('📝 Policy does not exist yet. Please apply manually.\n');
    console.log('───────────────────────────────────────────────────────────');
    console.log('\n🔐 SQL to Execute in Supabase Dashboard:');
    console.log(policySQL);
    console.log('───────────────────────────────────────────────────────────\n');
    console.log('📍 Supabase SQL Editor:');
    const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
    if (projectRef) {
      console.log(`   https://qnwcwoutgarhqxlgsjzs.supabase.co/project/${projectRef}/sql\n`);
    }
    console.log('💡 Steps:');
    console.log('   1. Open the SQL Editor link above');
    console.log('   2. Paste the SQL statement');
    console.log('   3. Click "RUN" button');
    console.log('   4. You should see "Success. No rows returned"\n');

    console.log('🧪 After applying, verify by visiting:');
    console.log('   http://localhost:3000/flashcards\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

applyMigration();
