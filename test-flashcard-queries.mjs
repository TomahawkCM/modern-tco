import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const userId = '5e244287-40af-4cad-aa90-5a7be354940a';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQueries() {
  const now = new Date().toISOString();

  // Test getDueFlashcards query
  console.log('\n1. Testing getDueFlashcards (lte srs_due):');
  const { data: dueCards, error: dueError } = await supabase
    .from("flashcards")
    .select()
    .eq("user_id", userId)
    .lte("srs_due", now)
    .order("srs_due", { ascending: true })
    .limit(20);

  console.log('   Count:', dueCards?.length || 0);
  console.log('   Error:', dueError?.message || 'none');
  if (dueCards && dueCards.length > 0) {
    console.log('   Sample srs_due:', dueCards[0].srs_due);
  }

  // Test getNewFlashcards query
  console.log('\n2. Testing getNewFlashcards (srs_reps = 0):');
  const { data: newCards, error: newError } = await supabase
    .from("flashcards")
    .select()
    .eq("user_id", userId)
    .eq("srs_reps", 0)
    .order("created_at", { ascending: false })
    .limit(5);

  console.log('   Count:', newCards?.length || 0);
  console.log('   Error:', newError?.message || 'none');

  // Test total count for user
  console.log('\n3. Testing total flashcards for user:');
  const { count, error: countError } = await supabase
    .from("flashcards")
    .select('*', { count: 'exact', head: true })
    .eq("user_id", userId);

  console.log('   Count:', count);
  console.log('   Error:', countError?.message || 'none');

  // Test sample cards
  console.log('\n4. Sample flashcard data:');
  const { data: samples, error: sampleError } = await supabase
    .from("flashcards")
    .select('id, srs_due, srs_reps, created_at')
    .eq("user_id", userId)
    .limit(3);

  console.log('   Samples:', JSON.stringify(samples, null, 2));
}

testQueries();
