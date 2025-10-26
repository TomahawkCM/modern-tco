import type { Question } from "@/lib/questionBank";
import { supabase } from "@/lib/supabase";

interface ReadOnlyQuestionOptions {
  domain?: string;
  tags?: string[];
  limit?: number;
}

type QuestionsRow = {
  id: string;
  question: string;
  options: string[] | Record<string, unknown> | null;
  correct_answer: number;
  explanation: string | null;
  module_id: string | null;
  domain: string | null;
  tags: string[] | null;
  difficulty: string | null;
};

const DEFAULT_LIMIT = 3;

const difficultyMap: Record<string, Question["difficulty"]> = {
  beginner: "easy",
  easy: "easy",
  foundation: "easy",
  intermediate: "medium",
  medium: "medium",
  advanced: "hard",
  expert: "hard",
};

function normalizeDifficulty(value: string | null): Question["difficulty"] {
  if (!value) return "medium";
  const lower = value.toLowerCase();
  return difficultyMap[lower] ?? "medium";
}

function normalizeOptions(raw: QuestionsRow["options"]): string[] {
  if (Array.isArray(raw)) {
    return raw.map((option) => (typeof option === "string" ? option : JSON.stringify(option)));
  }

  if (raw && typeof raw === "object") {
    return Object.values(raw).map((option) =>
      typeof option === "string" ? option : JSON.stringify(option)
    );
  }

  return [];
}

export async function getReadOnlyQuestions(
  opts: ReadOnlyQuestionOptions = {}
): Promise<Question[]> {
  const { domain, tags, limit = DEFAULT_LIMIT } = opts;

  try {
    let query = supabase
      .from("questions")
      .select(
        "id, question, options, correct_answer, explanation, module_id, domain, tags, difficulty"
      )
      .limit(limit);

    if (domain) {
      query = query.eq("domain", domain);
    }

    if (tags && tags.length > 0) {
      query = query.contains("tags", tags);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.warn("Failed to load read-only questions", { error });
      return [];
    }

    return (data as QuestionsRow[]).map((row) => {
      const options = normalizeOptions(row.options);
      const safeIndex = Number.isFinite(row.correct_answer) ? row.correct_answer : 0;
      const correctAnswer = options[safeIndex] ?? "";

      return {
        id: row.id,
        moduleId: row.module_id ?? row.domain ?? "learn-experimental",
        sectionId: row.domain ?? "learn-experimental",
        concept: row.tags?.[0] ?? row.domain ?? "Mastery",
        question: row.question,
        type: "multiple-choice",
        options: options.length > 0 ? options : undefined,
        correctAnswer,
        explanation: row.explanation ?? "",
        difficulty: normalizeDifficulty(row.difficulty),
        tags: row.tags ?? undefined,
      } satisfies Question;
    });
  } catch (error) {
    console.error("Unexpected error loading read-only questions", error);
    return [];
  }
}
