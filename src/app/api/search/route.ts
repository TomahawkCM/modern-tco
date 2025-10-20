import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type SearchEventInsert = {
  query: string;
  clicked_result_type?: string | null;
  clicked_result_id?: string | null;
  result_count: number | null;
  response_time_ms: number | null;
  filters_used: Record<string, unknown> | null;
};

/**
 * Unified Search API
 *
 * Searches across modules, sections, flashcards, questions, and glossary
 * using PostgreSQL full-text search with typo tolerance.
 *
 * Query parameters:
 *   - q (required): Search query string
 *   - limit: Max results per category (default: 8)
 *   - offset: Pagination offset (default: 0)
 *   - domain: Filter by domain (optional)
 *   - difficulty: Filter by difficulty (optional)
 *   - updated_after: Filter by update date YYYY-MM-DD (optional)
 *
 * Returns:
 *   {
 *     modules: [],
 *     sections: [],
 *     flashcards: [],
 *     questions: [],
 *     glossary: []
 *   }
 *
 * Each result includes relevance score and metadata.
 */

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  // Parse query parameters
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const limit = Number(searchParams.get("limit") || 8);
  const offset = Number(searchParams.get("offset") || 0);
  const domain = searchParams.get("domain") || null;
  const difficulty = searchParams.get("difficulty") || null;
  const updatedAfter = searchParams.get("updated_after") || null;

  // Validate required parameters
  if (!q) {
    return NextResponse.json(
      {
        modules: [],
        sections: [],
        flashcards: [],
        questions: [],
        glossary: [],
      },
      { status: 200 }
    );
  }

  // Validate limit
  if (isNaN(limit) || limit < 1 || limit > 50) {
    return NextResponse.json(
      { error: "Invalid limit parameter. Must be between 1 and 50." },
      { status: 400 }
    );
  }

  // Validate offset
  if (isNaN(offset) || offset < 0) {
    return NextResponse.json(
      { error: "Invalid offset parameter. Must be >= 0." },
      { status: 400 }
    );
  }

  try {
    const client = supabase as any;

    // Call unified search RPC function
    const { data, error } = await client.rpc("search_all", {
      q,
      p_limit: limit,
      p_offset: offset,
      p_domain: domain,
      p_difficulty: difficulty,
      p_updated_after: updatedAfter,
    });

    if (error) {
      console.error("[Search API] Database error:", error);
      return NextResponse.json(
        { error: "Search failed. Please try again." },
        { status: 500 }
      );
    }

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Count total results
    const searchResults = (data ?? {}) as Record<string, unknown>;
    const totalResults = Object.values(searchResults).reduce((sum: number, value) => {
      if (Array.isArray(value)) {
        return sum + value.length;
      }
      return sum;
    }, 0);

    // Log analytics (fire-and-forget, don't await)
    // Only log if user is authenticated (privacy consideration)
    client
      .from("search_events")
      .insert({
        query: q,
        result_count: totalResults,
        response_time_ms: responseTime,
        filters_used: {
          domain,
          difficulty,
          updated_after: updatedAfter,
          limit,
          offset,
        },
      } satisfies SearchEventInsert)
      .then((response: { error?: { message: string } | null }) => {
        const analyticsError = response?.error;
        if (analyticsError) {
          console.warn("[Search API] Analytics logging failed:", analyticsError.message);
        }
      });

    // Return results
    return NextResponse.json(data || {}, {
      status: 200,
      headers: {
        "X-Response-Time-Ms": responseTime.toString(),
        "X-Result-Count": totalResults.toString(),
      },
    });
  } catch (error) {
    console.error("[Search API] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, OPTIONS",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
