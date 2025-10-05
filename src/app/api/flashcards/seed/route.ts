import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import * as fs from 'fs';
import * as path from 'path';

interface FlashcardLibraryItem {
  front_text: string;
  back_text: string;
  card_type?: string;
  source?: string;
  hint?: string;
  explanation?: string;
  tags?: string[];
  domain?: string;
  difficulty?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = body.user_id;

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Check if flashcards already exist for this user (idempotent)
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('flashcards')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing flashcards:', checkError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({
        message: 'Flashcards already seeded for this user',
        count: 0,
        alreadySeeded: true
      });
    }

    // Load flashcard library from file system
    const libraryPath = path.join(process.cwd(), 'flashcards-library.json');

    if (!fs.existsSync(libraryPath)) {
      return NextResponse.json({ error: 'Flashcard library not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(libraryPath, 'utf-8');
    const flashcards: FlashcardLibraryItem[] = JSON.parse(fileContent);

    // Prepare flashcards for insertion with proper type casting
    const flashcardsToInsert = flashcards.map((card) => {
      // Combine tags with domain and difficulty info
      const enhancedTags = [
        ...(card.tags || []),
        ...(card.domain ? [card.domain] : []),
        ...(card.difficulty ? [`difficulty:${card.difficulty}`] : [])
      ];

      return {
        user_id: userId,
        front_text: card.front_text,
        back_text: card.back_text,
        card_type: (card.card_type || 'concept') as 'basic' | 'cloze' | 'concept' | 'diagram' | 'code',
        source: (card.source || 'auto_generated') as 'manual' | 'auto_generated' | 'quiz_failure' | 'video_concept',
        hint: card.hint || null,
        explanation: card.explanation || null,
        tags: enhancedTags,

        // Initialize SM-2 spaced repetition values
        srs_due: new Date().toISOString(),
        srs_interval: 0,
        srs_ease: 2.5,
        srs_reps: 0,
        srs_lapses: 0,

        // Initialize performance tracking
        total_reviews: 0,
        correct_reviews: 0,
      };
    });

    // Insert flashcards in batches to avoid payload size limits
    const batchSize = 100;
    let totalInserted = 0;
    const errors: any[] = [];

    for (let i = 0; i < flashcardsToInsert.length; i += batchSize) {
      const batch = flashcardsToInsert.slice(i, i + batchSize);

      const { data, error } = await supabaseAdmin
        .from('flashcards')
        .insert(batch)
        .select();

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        errors.push(error);
      } else {
        totalInserted += data?.length || 0;
      }
    }

    // Calculate domain distribution for response
    const distribution = {
      'asking-questions': flashcards.filter(c => c.domain === 'asking-questions').length,
      'refining-targeting': flashcards.filter(c => c.domain === 'refining-targeting').length,
      'taking-action': flashcards.filter(c => c.domain === 'taking-action').length,
      'navigation': flashcards.filter(c => c.domain === 'navigation').length,
      'reporting': flashcards.filter(c => c.domain === 'reporting').length,
    };

    return NextResponse.json({
      message: `Successfully seeded ${totalInserted} flashcards!`,
      count: totalInserted,
      distribution,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Error seeding flashcards:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Check if user has any flashcards
    const { data, error } = await supabaseAdmin
      .from('flashcards')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.error('Error checking flashcard status:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      seeded: data && data.length > 0,
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Error checking seed status:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
