import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Search Analytics API
 *
 * Tracks user interactions with search results for analytics and optimization.
 *
 * Request body:
 *   {
 *     query: string,
 *     clicked_result_type: "modules" | "sections" | "flashcards" | "questions" | "glossary",
 *     clicked_result_id: UUID string
 *   }
 *
 * This data helps understand:
 * - What users search for
 * - Which results are most relevant
 * - Search effectiveness
 */

interface AnalyticsPayload {
  query: string;
  clicked_result_type?: string;
  clicked_result_id?: string;
}

type SearchEventInsert = {
  query: string;
  clicked_result_type: string | null;
  clicked_result_id: string | null;
  result_count: number | null;
  response_time_ms: number | null;
  filters_used: Record<string, unknown> | null;
};

const SEARCH_EVENTS_TABLE = 'search_events' as const;

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body: AnalyticsPayload = await req.json();

    // Validate required fields
    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid query field' }, { status: 400 });
    }

    // Validate optional fields
    if (body.clicked_result_type) {
      const validTypes = ['modules', 'sections', 'flashcards', 'questions', 'glossary'];
      if (!validTypes.includes(body.clicked_result_type)) {
        return NextResponse.json(
          {
            error: `Invalid clicked_result_type. Must be one of: ${validTypes.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    if (body.clicked_result_id && typeof body.clicked_result_id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid clicked_result_id. Must be a UUID string.' },
        { status: 400 }
      );
    }

    // Insert analytics event

    const { error } = await (supabase as any).from(SEARCH_EVENTS_TABLE).insert({
      query: body.query.trim(),
      clicked_result_type: body.clicked_result_type ?? null,
      clicked_result_id: body.clicked_result_id ?? null,
      result_count: 0,
      response_time_ms: 0,
      filters_used: {},
    } satisfies SearchEventInsert);

    if (error) {
      console.error('[Search Analytics] Database error:', error);
      return NextResponse.json({ error: 'Failed to log analytics event' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Search Analytics] Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
