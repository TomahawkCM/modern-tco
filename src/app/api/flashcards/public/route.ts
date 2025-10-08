import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { schedule, type SRRating } from "@/lib/sr";
import {
  type Flashcard,
  type FlashcardReview,
  type FlashcardStats,
  fromSRCardState,
  toSRCardState,
} from "@/types/flashcard";

const STATIC_USER_ID =
  process.env.FLASHCARD_STATIC_USER_ID ||
  process.env.NEXT_PUBLIC_FLASHCARD_STATIC_USER_ID ||
  "5e244287-40af-4cad-aa90-5a7be354940a";

if (!STATIC_USER_ID) {
  throw new Error(
    "FLASHCARD_STATIC_USER_ID (or NEXT_PUBLIC_FLASHCARD_STATIC_USER_ID) must be configured for static flashcard mode."
  );
}

const STATIC_API_ERROR =
  "Flashcard API is not available. Ensure SUPABASE_SERVICE_ROLE_KEY is configured on the server.";

type CardsQuery = {
  dueOnly?: boolean;
  newOnly?: boolean;
  moduleId?: string | null;
  domain?: string | null;
  deckId?: string | null;
  limit?: number | null;
};

function parseBooleanFlag(value: string | null): boolean {
  if (!value) return false;
  return value === "true" || value === "1" || value.toLowerCase() === "yes";
}

function parseLimit(value: string | null, fallback: number): number {
  const parsed = value ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function calculateStreaks(reviewDates: string[]): {
  longest: number;
  current: number;
} {
  if (reviewDates.length === 0) return { longest: 0, current: 0 };

  const reviewDays = new Set(
    reviewDates.map((date) => new Date(date).toDateString())
  );

  const sortedDays = Array.from(reviewDays).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let streakCount = 0;
  let prevDate = new Date(sortedDays[0]);

  for (const dayStr of sortedDays) {
    const day = new Date(dayStr);
    const diffDays = Math.floor(
      (prevDate.getTime() - day.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 1) {
      streakCount++;
      longestStreak = Math.max(longestStreak, streakCount);
    } else {
      streakCount = 1;
    }

    prevDate = day;
  }

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();

  if (sortedDays[0] === today || sortedDays[0] === yesterday) {
    currentStreak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prevDay = new Date(sortedDays[i - 1]);
      const currDay = new Date(sortedDays[i]);
      const diff = Math.floor(
        (prevDay.getTime() - currDay.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff === 1) currentStreak++;
      else break;
    }
  }

  return { longest: longestStreak, current: currentStreak };
}

function ensureSupabase() {
  if (!supabaseAdmin) {
    throw new Error(STATIC_API_ERROR);
  }
  return supabaseAdmin;
}

async function fetchCards(query: CardsQuery) {
  const client = ensureSupabase();
  const { dueOnly, newOnly, moduleId, domain, deckId, limit } = query;
  const nowIso = new Date().toISOString();

  if (deckId) {
    const { data, error } = await client
      .from("flashcard_deck_cards")
      .select("flashcards(*)")
      .eq("deck_id", deckId);

    if (error) {
      throw new Error(error.message);
    }

    let cards = (data || [])
      .map((row) => row.flashcards as Flashcard | null)
      .filter(Boolean) as Flashcard[];

    if (dueOnly) {
      cards = cards.filter((card) => card.srs_due <= nowIso);
      cards.sort(
        (a, b) => new Date(a.srs_due).getTime() - new Date(b.srs_due).getTime()
      );
    } else {
      cards.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    if (newOnly) {
      cards = cards.filter((card) => card.srs_reps === 0);
    }

    if (typeof limit === "number" && limit > 0) {
      cards = cards.slice(0, limit);
    }

    return cards;
  }

  let builder = client
    .from("flashcards")
    .select("*")
    .eq("user_id", STATIC_USER_ID);

  if (moduleId) {
    builder = builder.eq("module_id", moduleId);
  }

  if (domain) {
    builder = builder.contains("tags", [domain]);
  }

  if (newOnly) {
    builder = builder.eq("srs_reps", 0);
  }

  if (dueOnly) {
    builder = builder.lte("srs_due", nowIso).order("srs_due", {
      ascending: true,
    });
  } else {
    builder = builder.order("created_at", { ascending: false });
  }

  if (typeof limit === "number" && limit > 0) {
    builder = builder.limit(limit);
  }

  const { data, error } = await builder;
  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Flashcard[];
}

async function buildStats(): Promise<FlashcardStats> {
  const client = ensureSupabase();

  const { data: cards, error } = await client
    .from("flashcards")
    .select("*")
    .eq("user_id", STATIC_USER_ID);

  if (error) {
    throw new Error(error.message);
  }

  if (!cards || cards.length === 0) {
    return {
      totalCards: 0,
      dueToday: 0,
      newCards: 0,
      learningCards: 0,
      matureCards: 0,
      avgRetentionRate: 0,
      longestStreak: 0,
      currentStreak: 0,
    };
  }

  const flashcards = cards as Flashcard[];
  const nowIso = new Date().toISOString();

  const totalCards = flashcards.length;
  const dueToday = flashcards.filter((card) => card.srs_due <= nowIso).length;
  const newCards = flashcards.filter((card) => card.srs_reps === 0).length;
  const learningCards = flashcards.filter(
    (card) => card.srs_reps > 0 && card.srs_reps < 2
  ).length;
  const matureCards = flashcards.filter((card) => card.srs_reps >= 2).length;

  const totalReviews = flashcards.reduce(
    (sum, card) => sum + card.total_reviews,
    0
  );
  const totalCorrect = flashcards.reduce(
    (sum, card) => sum + card.correct_reviews,
    0
  );
  const avgRetentionRate =
    totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

  const { data: reviewRows } = await client
    .from("flashcard_reviews")
    .select("reviewed_at")
    .eq("user_id", STATIC_USER_ID)
    .order("reviewed_at", { ascending: false });

  const streaks = calculateStreaks(
    (reviewRows || []).map((row) => row.reviewed_at)
  );

  return {
    totalCards,
    dueToday,
    newCards,
    learningCards,
    matureCards,
    avgRetentionRate,
    longestStreak: streaks.longest,
    currentStreak: streaks.current,
  };
}

async function handleReview(body: Record<string, unknown>) {
  const client = ensureSupabase();
  const flashcardId = body.flashcardId as string | undefined;
  const rating = body.rating as SRRating | undefined;
  const timeSpentSeconds = Number(body.timeSpentSeconds ?? body.timeSpent);

  if (!flashcardId || !rating || !Number.isFinite(timeSpentSeconds)) {
    return NextResponse.json(
      { error: "Missing flashcardId, rating, or timeSpentSeconds" },
      { status: 400 }
    );
  }

  const { data: flashcard, error: fetchError } = await client
    .from("flashcards")
    .select("*")
    .eq("id", flashcardId)
    .eq("user_id", STATIC_USER_ID)
    .single();

  if (fetchError || !flashcard) {
    return NextResponse.json(
      { error: fetchError?.message || "Flashcard not found" },
      { status: fetchError ? 500 : 404 }
    );
  }

  const typedFlashcard = flashcard as Flashcard;

  const currentState = toSRCardState(typedFlashcard);
  const newState = schedule(currentState, rating, new Date());
  const srsUpdates = fromSRCardState(typedFlashcard, newState);

  const isCorrect = rating === "good" || rating === "easy";
  const newTotalReviews = typedFlashcard.total_reviews + 1;
  const newCorrectReviews =
    typedFlashcard.correct_reviews + (isCorrect ? 1 : 0);

  const avgTime = typedFlashcard.average_recall_time_seconds || 0;
  const newAvgTime = Math.round(
    (avgTime * typedFlashcard.total_reviews + timeSpentSeconds) /
      newTotalReviews
  );

  const { data: updatedFlashcard, error: updateError } = await client
    .from("flashcards")
    .update({
      ...srsUpdates,
      total_reviews: newTotalReviews,
      correct_reviews: newCorrectReviews,
      average_recall_time_seconds: newAvgTime,
      last_reviewed_at: new Date().toISOString(),
    })
    .eq("id", flashcardId)
    .select()
    .single();

  if (updateError || !updatedFlashcard) {
    return NextResponse.json(
      { error: updateError?.message || "Failed to update flashcard" },
      { status: 500 }
    );
  }

  const { data: review, error: reviewError } = await client
    .from("flashcard_reviews")
    .insert({
      flashcard_id: flashcardId,
      user_id: STATIC_USER_ID,
      rating,
      time_spent_seconds: timeSpentSeconds,
      reviewed_at: new Date().toISOString(),
      srs_interval_before: typedFlashcard.srs_interval,
      srs_interval_after: (updatedFlashcard as Flashcard).srs_interval,
      srs_ease_before: typedFlashcard.srs_ease,
      srs_ease_after: (updatedFlashcard as Flashcard).srs_ease,
    })
    .select()
    .single();

  if (reviewError || !review) {
    return NextResponse.json(
      { error: reviewError?.message || "Failed to record review" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    flashcard: updatedFlashcard as Flashcard,
    review: review as FlashcardReview,
  });
}

export async function GET(request: Request) {
  try {
    const client = ensureSupabase();
    if (!client) {
      return NextResponse.json({ error: STATIC_API_ERROR }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "stats": {
        const stats = await buildStats();
        return NextResponse.json(stats, { status: 200 });
      }
      case "cards": {
        const cards = await fetchCards({
          dueOnly: parseBooleanFlag(searchParams.get("dueOnly")),
          newOnly: parseBooleanFlag(searchParams.get("newOnly")),
          moduleId: searchParams.get("moduleId"),
          domain: searchParams.get("domain"),
          deckId: searchParams.get("deckId"),
          limit: parseLimit(searchParams.get("limit"), 0),
        });
        return NextResponse.json({ cards }, { status: 200 });
      }
      default:
        return NextResponse.json(
          { error: "Unsupported action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[flashcards/public] GET error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error retrieving flashcards",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const client = ensureSupabase();
    if (!client) {
      return NextResponse.json({ error: STATIC_API_ERROR }, { status: 500 });
    }

    const body = await request.json();
    const action = body.action as string | undefined;

    if (action === "review") {
      return await handleReview(body);
    }

    return NextResponse.json(
      { error: "Unsupported action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[flashcards/public] POST error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error handling flashcard request",
      },
      { status: 500 }
    );
  }
}
