#!/usr/bin/env tsx

/**
 * Verify RLS Policy for Anonymous Flashcard Access
 *
 * Tests that anonymous users can now read the flashcard library
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create client with ANON key (same as browser would use)
const supabase = createClient(supabaseUrl, anonKey);

async function verifyAccess() {
  console.log('\n🔍 Verifying Anonymous Flashcard Access...\n');

  try {
    // Test 1: Count total flashcards
    console.log('Test 1: Counting flashcards...');
    const { count, error: countError } = await supabase
      .from('flashcard_library')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Failed to count flashcards');
      console.log('   Error:', countError.message);
      console.log('\n⚠️  RLS policy may not be applied correctly');
      return;
    }

    console.log(`✅ Total flashcards: ${count}`);

    // Test 2: Fetch sample flashcards
    console.log('\nTest 2: Fetching sample flashcards...');
    const { data, error: fetchError } = await supabase
      .from('flashcard_library')
      .select('id, front, domain, difficulty')
      .limit(5);

    if (fetchError) {
      console.log('❌ Failed to fetch flashcards');
      console.log('   Error:', fetchError.message);
      return;
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} sample flashcards:`);
    data?.forEach((card, i) => {
      console.log(`   ${i + 1}. [${card.domain}] ${card.difficulty}: ${card.front.substring(0, 60)}...`);
    });

    // Test 3: Check domain distribution
    console.log('\nTest 3: Checking domain distribution...');
    const { data: domains, error: domainError } = await supabase
      .from('flashcard_library')
      .select('domain');

    if (domainError) {
      console.log('❌ Failed to fetch domains');
      console.log('   Error:', domainError.message);
      return;
    }

    const domainCounts = domains?.reduce((acc: any, card: any) => {
      acc[card.domain] = (acc[card.domain] || 0) + 1;
      return acc;
    }, {});

    console.log('✅ Domain distribution:');
    Object.entries(domainCounts || {}).forEach(([domain, count]) => {
      console.log(`   ${domain}: ${count}`);
    });

    console.log('\n' + '═'.repeat(80));
    console.log('🎉 SUCCESS! Anonymous users can now browse flashcards!');
    console.log('═'.repeat(80));
    console.log('\n📍 Next Steps:');
    console.log('   1. Visit: http://localhost:3000/flashcards');
    console.log('   2. Click: "Library (AI)" tab');
    console.log('   3. You should see all flashcards displayed');
    console.log('   4. Test filters and search functionality\n');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

verifyAccess();
