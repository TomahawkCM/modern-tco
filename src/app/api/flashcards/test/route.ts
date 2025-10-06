import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEV_USER_ID = '5e244287-40af-4cad-aa90-5a7be354940a';

export async function GET() {
  try {
    const now = new Date().toISOString();

    // Test getDueFlashcards query
    const { data: dueCards, error: dueError } = await supabase
      .from("flashcards")
      .select()
      .eq("user_id", DEV_USER_ID)
      .lte("srs_due", now)
      .order("srs_due", { ascending: true })
      .limit(20);

    // Test getNewFlashcards query
    const { data: newCards, error: newError } = await supabase
      .from("flashcards")
      .select()
      .eq("user_id", DEV_USER_ID)
      .eq("srs_reps", 0)
      .order("created_at", { ascending: false })
      .limit(5);

    // Test getFlashcardStats query
    const { data: allCards, error: statsError } = await supabase
      .from("flashcards")
      .select()
      .eq("user_id", DEV_USER_ID);

    return NextResponse.json({
      timestamp: now,
      userId: DEV_USER_ID,
      queries: {
        getDueFlashcards: {
          count: dueCards?.length || 0,
          error: dueError?.message || null,
          sample: dueCards?.[0] || null
        },
        getNewFlashcards: {
          count: newCards?.length || 0,
          error: newError?.message || null
        },
        getFlashcardStats: {
          count: allCards?.length || 0,
          error: statsError?.message || null
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
