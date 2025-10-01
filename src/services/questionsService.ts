/**
 * Questions Service
 * Manages fetching and caching questions from Supabase
 */

import { supabase } from "@/lib/supabase";
import type { Difficulty, Question, QuestionCategory, TCODomain } from "@/types/exam";
import type { Database } from "@/types/database.types";

type DBQuestion = Database["public"]["Tables"]["questions"]["Row"];

// Cache for questions to avoid repeated fetches
let questionsCache: Question[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Convert database question to application question format
 */
function convertDBQuestionToQuestion(dbQuestion: DBQuestion): Question {
  // Parse JSON fields
  const choices =
    typeof dbQuestion.options === "string"
      ? JSON.parse(dbQuestion.options)
      : dbQuestion.options;

  const tags =
    typeof dbQuestion.tags === "string" ? JSON.parse(dbQuestion.tags) : dbQuestion.tags || [];

  return {
    id: dbQuestion.id,
    question: dbQuestion.question,
    choices,
    correctAnswerId: dbQuestion.correct_answer as any,
    domain: dbQuestion.domain as TCODomain,
    difficulty: dbQuestion.difficulty as Difficulty,
    category: dbQuestion.category as QuestionCategory,
    explanation: dbQuestion.explanation || "",
    tags,
    studyGuideRef: dbQuestion.study_guide_ref || undefined,
    createdAt: dbQuestion.created_at ? new Date(dbQuestion.created_at) : undefined,
    updatedAt: dbQuestion.updated_at ? new Date(dbQuestion.updated_at) : undefined,
  };
}

/**
 * Fetch all questions from Supabase
 */
export async function fetchQuestions(forceRefresh = false): Promise<Question[]> {
  // Check cache first
  const now = Date.now();
  if (!forceRefresh && questionsCache && now - cacheTimestamp < CACHE_DURATION) {
    return questionsCache;
  }

  try {
    const res: any = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    const { data, error } = res;

    if (error) {
      // Check if error is about missing table (expected in development)
      const isTableMissing =
        error.code === "PGRST116" ||
        error.message?.includes('relation "public.questions" does not exist') ||
        error.message?.includes("table 'public.questions' in the schema");

      if (isTableMissing) {
        // Silently fall back for missing table - this is expected
        console.log("Database table not found, using fallback data");
        return [];
      }

      // Log other unexpected errors
      console.error("Unexpected error fetching questions:", error.message);

      // Fall back to cached data if available
      if (questionsCache) {
        return questionsCache;
      }

      // Return empty array instead of throwing for missing table
      return [];
    }

    if (!data || data.length === 0) {
      console.warn("No questions found in database");
      // Return empty array instead of throwing
      return [];
    }

    // Convert database questions to application format (safely)
    const questions = (data as unknown[]).map((row) => convertDBQuestionToQuestion(row as DBQuestion));

    // Update cache
    questionsCache = questions;
    cacheTimestamp = now;

    return questions;
  } catch (error) {
    // Check if it's a table missing error (expected)
    const isTableMissing =
      error &&
      ((error as any).code === "PGRST116" ||
        (error as any).message?.includes('relation "public.questions" does not exist') ||
        (error as any).message?.includes("table 'public.questions' in the schema"));

    if (isTableMissing) {
      // Silently return empty array for missing table
      return [];
    }

    // Log unexpected errors only
    console.error("Unexpected error fetching questions:", (error as Error).message);

    // If we have cached data, return it
    if (questionsCache) {
      return questionsCache;
    }

    // As a last resort, return empty array
    return [];
  }
}

/**
 * Fetch questions by domain
 */
export async function fetchQuestionsByDomain(domain: TCODomain): Promise<Question[]> {
  try {
    const res: any = await supabase
      .from("questions")
      .select("*")
      .eq("domain", domain)
      .order("created_at", { ascending: false });

    const { data, error } = res;

    if (error) {
      console.error(`Error fetching questions for domain ${domain}:`, error);
      throw error;
    }

  return ((data ?? []) as unknown[]).map((r) => convertDBQuestionToQuestion(r as DBQuestion));
  } catch (error) {
    console.error(`Failed to fetch questions for domain ${domain}:`, error);
    return [];
  }
}

/**
 * Fetch questions by difficulty
 */
export async function fetchQuestionsByDifficulty(difficulty: Difficulty): Promise<Question[]> {
  try {
    const res: any = await supabase
      .from("questions")
      .select("*")
      .eq("difficulty", difficulty)
      .order("created_at", { ascending: false });

    const { data, error } = res;

    if (error) {
      console.error(`Error fetching questions for difficulty ${difficulty}:`, error);
      throw error;
    }

  return ((data ?? []) as unknown[]).map((r) => convertDBQuestionToQuestion(r as DBQuestion));
  } catch (error) {
    console.error(`Failed to fetch questions for difficulty ${difficulty}:`, error);
    return [];
  }
}

/**
 * Fetch questions by category
 */
export async function fetchQuestionsByCategory(category: QuestionCategory): Promise<Question[]> {
  try {
    const res: any = await supabase
      .from("questions")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });

    const { data, error } = res;

    if (error) {
      console.error(`Error fetching questions for category ${category}:`, error);
      throw error;
    }

  return ((data ?? []) as unknown[]).map((r) => convertDBQuestionToQuestion(r as DBQuestion));
  } catch (error) {
    console.error(`Failed to fetch questions for category ${category}:`, error);
    return [];
  }
}

/**
 * Search questions by text
 */
export async function searchQuestions(searchText: string): Promise<Question[]> {
  try {
    const res: any = await supabase
      .from("questions")
      .select("*")
      .or(`question.ilike.%${searchText}%,explanation.ilike.%${searchText}%`)
      .order("created_at", { ascending: false });

    const { data, error } = res;

    if (error) {
      console.error(`Error searching questions for "${searchText}":`, error);
      throw error;
    }

  return ((data ?? []) as unknown[]).map((r) => convertDBQuestionToQuestion(r as DBQuestion));
  } catch (error) {
    console.error(`Failed to search questions for "${searchText}":`, error);
    return [];
  }
}

/**
 * Get a single question by ID
 */
export async function fetchQuestionById(id: string): Promise<Question | null> {
  try {
    const res: any = await supabase.from("questions").select("*").eq("id", id).single();

    const { data, error } = res;

    if (error) {
      console.error(`Error fetching question ${id}:`, error);
      return null;
    }

    return data ? convertDBQuestionToQuestion(data as DBQuestion) : null;
  } catch (error) {
    console.error(`Failed to fetch question ${id}:`, error);
    return null;
  }
}

/**
 * Get questions with filters
 */
export async function fetchQuestionsWithFilters(filters: {
  domains?: TCODomain[];
  difficulties?: Difficulty[];
  categories?: QuestionCategory[];
  tags?: string[];
  limit?: number;
}): Promise<Question[]> {
  try {
    let query = supabase.from("questions").select("*");

    // Apply filters
    if (filters.domains && filters.domains.length > 0) {
      query = query.in("domain", filters.domains);
    }

    if (filters.difficulties && filters.difficulties.length > 0) {
      query = query.in("difficulty", filters.difficulties);
    }

    if (filters.categories && filters.categories.length > 0) {
      query = query.in("category", filters.categories);
    }

    if (filters.tags && filters.tags.length > 0) {
      // For tags, we need to check if any of the filter tags are in the question's tags array
      // This is more complex with Supabase and might need a different approach
      // For now, we'll fetch all and filter client-side
    }

    // Apply limit
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    // Order by creation date
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching filtered questions:", error);
      throw error;
    }

    let questions = (data || []).map(convertDBQuestionToQuestion);

    // Client-side tag filtering if needed
    if (filters.tags && filters.tags.length > 0) {
      questions = questions.filter(
        (q) => q.tags && filters.tags!.some((tag) => q.tags!.includes(tag))
      );
    }

    return questions;
  } catch (error) {
    console.error("Failed to fetch filtered questions:", error);
    return [];
  }
}

/**
 * Clear the questions cache
 */
export function clearQuestionsCache() {
  questionsCache = null;
  cacheTimestamp = 0;
}

/**
 * Subscribe to real-time question updates
 */
export function subscribeToQuestions(callback: (payload: any) => void) {
  return supabase
    .channel("questions_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "questions",
      },
      (payload) => {
        // Clear cache on any change
        clearQuestionsCache();
        callback(payload);
      }
    )
    .subscribe();
}

/**
 * Load questions with fallback to static data
 * This is a transitional function that tries Supabase first,
 * then falls back to static data if needed
 */
export async function loadQuestionsWithFallback(): Promise<Question[]> {
  try {
    // Try to fetch from Supabase first
    const questions = await fetchQuestions();

    if (questions.length > 0) {
      console.log(`Loaded ${questions.length} questions from Supabase`);
      return questions;
    }

    // If no questions in database, silently fall back to full imported question bank
    // Dynamic import to avoid circular dependencies
    const { importedQuestionBank } = await import("@/data/imported-questions-master");
    console.log(`Falling back to imported question bank: ${importedQuestionBank.length} questions`);
    return importedQuestionBank;
  } catch (error) {
    // Check if it's a table missing error (expected)
    const isTableMissing =
      error &&
      ((error as any).code === "PGRST116" ||
        (error as any).message?.includes('relation "public.questions" does not exist') ||
        (error as any).message?.includes("table 'public.questions' in the schema"));

    if (!isTableMissing) {
      // Only log unexpected errors
      console.error("Unexpected error loading questions:", (error as Error).message);
    }

    // Fall back to full imported question bank
    const { importedQuestionBank } = await import("@/data/imported-questions-master");
    console.log(
      `Emergency fallback to imported question bank: ${importedQuestionBank.length} questions`
    );
    return importedQuestionBank;
  }
}
