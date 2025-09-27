import { Choice, Difficulty, Question, QuestionCategory, TCODomain } from "@/types/exam";
import type { Json, QuestionInsert, QuestionUpdate, Tables } from "../types/supabase"; // Import Json
import { supabase } from "./supabase";

/**
 * Database-driven Question Service
 * Replaces hardcoded questionLoader with Supabase integration
 * Provides production-scale question management with proper domain weighting
 */

export class QuestionService {
  private mapChoiceIdToDb(value: string): number | string {
    // Prefer numeric 0..3 for common schemas; fall back to passthrough if not match
    const v = (value || '').toString().toLowerCase();
    const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
    if (v in map) return map[v];
    const n = Number(v);
    return Number.isFinite(n) ? (n as number) : v;
  }
  // --- Mapping helpers: DB <-> App enums ---
  private mapDbDifficultyToUi(value: string | null | undefined): Difficulty {
    switch ((value || "").toLowerCase()) {
      case "beginner":
        return Difficulty.BEGINNER;
      case "intermediate":
        return Difficulty.INTERMEDIATE;
      case "advanced":
        return Difficulty.ADVANCED;
      case "expert":
        return Difficulty.EXPERT;
      default:
        // Fallback: if it's already a UI value, return as-is; else default to Intermediate
        if (
          value === Difficulty.BEGINNER ||
          value === Difficulty.INTERMEDIATE ||
          value === Difficulty.ADVANCED ||
          value === Difficulty.EXPERT
        )
          return value as Difficulty;
        return Difficulty.INTERMEDIATE;
    }
  }

  private mapUiDifficultyToDb(value: Difficulty | string | null | undefined): string {
    const v = (value || "").toString();
    switch (v) {
      case Difficulty.BEGINNER:
      case "beginner":
        return "beginner";
      case Difficulty.INTERMEDIATE:
      case "intermediate":
        return "intermediate";
      case Difficulty.ADVANCED:
      case "advanced":
        return "advanced";
      case Difficulty.EXPERT:
      case "expert":
        return "expert";
      default:
        return "intermediate";
    }
  }

  private DOMAIN_DB_TO_UI: Record<string, TCODomain> = {
    ASKING_QUESTIONS: TCODomain.ASKING_QUESTIONS,
    REFINING_QUESTIONS: TCODomain.REFINING_QUESTIONS,
    REFINING_TARGETING: TCODomain.REFINING_TARGETING,
    TAKING_ACTION: TCODomain.TAKING_ACTION,
    NAVIGATION_MODULES: TCODomain.NAVIGATION_MODULES,
    NAVIGATION_BASIC_MODULE_FUNCTIONS: TCODomain.NAVIGATION_MODULES,
    REPORTING_EXPORT: TCODomain.REPORTING_EXPORT,
    REPORTING_DATA_EXPORT: TCODomain.REPORTING_EXPORT,
    SECURITY: TCODomain.SECURITY,
    FUNDAMENTALS: TCODomain.FUNDAMENTALS,
    TROUBLESHOOTING: TCODomain.TROUBLESHOOTING,
  };

  private mapDbDomainToUi(value: string | null | undefined): TCODomain {
    if (!value) return TCODomain.FUNDAMENTALS;
    const key = value.toUpperCase();
    if (this.DOMAIN_DB_TO_UI[key]) return this.DOMAIN_DB_TO_UI[key];
    // If received a UI value already, return as TCODomain
    const possible = Object.values(TCODomain).find((v) => v === value);
    return (possible as TCODomain) || TCODomain.FUNDAMENTALS;
  }

  private DOMAIN_UI_TO_DB: Record<string, string> = {
    // Legacy uppercase enum codes (supported if an older schema uses codes)
    [TCODomain.ASKING_QUESTIONS]: "ASKING_QUESTIONS",
    [TCODomain.REFINING_QUESTIONS]: "REFINING_QUESTIONS",
    [TCODomain.REFINING_TARGETING]: "REFINING_TARGETING",
    [TCODomain.TAKING_ACTION]: "TAKING_ACTION",
    [TCODomain.NAVIGATION_MODULES]: "NAVIGATION_MODULES",
    [TCODomain.REPORTING_EXPORT]: "REPORTING_EXPORT",
    [TCODomain.SECURITY]: "SECURITY",
    [TCODomain.FUNDAMENTALS]: "FUNDAMENTALS",
    [TCODomain.TROUBLESHOOTING]: "TROUBLESHOOTING",
  };

  private mapUiDomainToDb(value: TCODomain | string): string {
    const display = value as string;
    // Preferred: store/display domain text as-is (matches current DB)
    if (Object.values(TCODomain).includes(display as TCODomain)) return display;
    // Fallback: map to legacy code
    const ui = (value as TCODomain) || TCODomain.FUNDAMENTALS;
    return this.DOMAIN_UI_TO_DB[ui] || TCODomain.FUNDAMENTALS;
  }

  private CATEGORY_DB_TO_UI: Record<string, QuestionCategory> = {
    PLATFORM_FUNDAMENTALS: QuestionCategory.PLATFORM_FUNDAMENTALS,
    CONSOLE_PROCEDURES: QuestionCategory.CONSOLE_PROCEDURES,
    TROUBLESHOOTING: QuestionCategory.TROUBLESHOOTING,
    PRACTICAL_SCENARIOS: QuestionCategory.PRACTICAL_SCENARIOS,
    LINEAR_CHAIN: QuestionCategory.LINEAR_CHAIN,
  };

  private mapDbCategoryToUi(value: string | null | undefined): QuestionCategory {
    if (!value) return QuestionCategory.PLATFORM_FUNDAMENTALS;
    const key = value.toUpperCase();
    if (this.CATEGORY_DB_TO_UI[key]) return this.CATEGORY_DB_TO_UI[key];
    const possible = Object.values(QuestionCategory).find((v) => v === value);
    return (possible as QuestionCategory) || QuestionCategory.PLATFORM_FUNDAMENTALS;
  }

  private CATEGORY_UI_TO_DB: Record<QuestionCategory, string> = {
    [QuestionCategory.PLATFORM_FUNDAMENTALS]: "PLATFORM_FUNDAMENTALS",
    [QuestionCategory.CONSOLE_PROCEDURES]: "CONSOLE_PROCEDURES",
    [QuestionCategory.TROUBLESHOOTING]: "TROUBLESHOOTING",
    [QuestionCategory.PRACTICAL_SCENARIOS]: "PRACTICAL_SCENARIOS",
    [QuestionCategory.LINEAR_CHAIN]: "LINEAR_CHAIN",
  } as any;

  private mapUiCategoryToDb(value: QuestionCategory | string): string {
    const ui = (value as QuestionCategory) || QuestionCategory.PLATFORM_FUNDAMENTALS;
    return this.CATEGORY_UI_TO_DB[ui] || "PLATFORM_FUNDAMENTALS";
  }

  /**
   * Get all questions from database
   */
  async getAllQuestions(): Promise<Question[]> {
    const res: any = await supabase.from("questions").select("*").order("created_at");
    const { data, error } = res;

    if (error) {
      throw new Error(`Failed to fetch questions: ${error.message}`);
    }

    return this.transformDatabaseQuestions(data ?? []);
  }

  /**
   * Get questions by specific domain
   */
  async getQuestionsByDomain(domain: TCODomain): Promise<Question[]> {
    const dbDomain = this.mapUiDomainToDb(domain);
    const res: any = await supabase
      .from("questions")
      .select("*")
      .eq("domain", dbDomain)
      .order("created_at");
    const { data, error } = res;

    if (error) {
      throw new Error(`Failed to fetch questions for domain ${domain}: ${error.message}`);
    }

    return this.transformDatabaseQuestions(data ?? []);
  }

  /**
   * Get questions by difficulty level
   */
  async getQuestionsByDifficulty(difficulty: Difficulty): Promise<Question[]> {
    const dbDifficulty = this.mapUiDifficultyToDb(difficulty);
    const res: any = await supabase
      .from("questions")
      .select("*")
      .eq("difficulty", dbDifficulty)
      .order("created_at");
    const { data, error } = res;

    if (error) {
      throw new Error(`Failed to fetch questions for difficulty ${difficulty}: ${error.message}`);
    }

    return this.transformDatabaseQuestions(data ?? []);
  }

  /**
   * Get questions by category
   */
  async getQuestionsByCategory(category: QuestionCategory): Promise<Question[]> {
    const dbCategory = this.mapUiCategoryToDb(category);
    const res: any = await supabase
      .from("questions")
      .select("*")
      .eq("category", dbCategory) // Use DB enum code
      .order("created_at");
    const { data, error } = res;

    if (error) {
      throw new Error(`Failed to fetch questions for category ${category}: ${error.message}`);
    }

    return this.transformDatabaseQuestions(data ?? []);
  }

  /**
   * Get weighted random questions based on TCO domain percentages
   * Uses database function for optimal performance
   */
  async getWeightedRandomQuestions(count: number): Promise<Question[]> {
    const res: any = await (supabase as any).rpc("get_weighted_random_questions", {
      question_count: count,
    });

    const { data, error } = res;

    if (error) {
      throw new Error(`Failed to fetch weighted random questions: ${error.message}`);
    }

    // Transform the JSONB data back to Question objects
  const rows = (data ?? []) as { question_data: Json }[];
  return rows.map((row) => (row.question_data as unknown) as Question);
  }

  /**
   * Get questions for mock exam (105 questions with proper weighting)
   */
  async getMockExamQuestions(): Promise<Question[]> {
    return this.getWeightedRandomQuestions(105);
  }

  /**
   * Get random questions across all domains (no weighting)
   */
  async getRandomQuestions(count: number): Promise<Question[]> {
    const res: any = await supabase
      .from("questions")
      .select("*")
      .order("RANDOM()")
      .limit(count);
    const { data, error } = res;
    if (error) {
      throw new Error(`Failed to fetch random questions: ${error.message}`);
    }
    return this.transformDatabaseQuestions(data ?? []);
  }

  /**
   * Get practice questions for specific domain
   */
  async getPracticeQuestions(domain: TCODomain, count: number = 10): Promise<Question[]> {
    const dbDomain = this.mapUiDomainToDb(domain);
    const res: any = await supabase
      .from("questions")
      .select("*")
      .eq("domain", dbDomain)
      .order("RANDOM()")
      .limit(count);
    const { data, error } = res;

    if (error) {
      throw new Error(`Failed to fetch practice questions: ${error.message}`);
    }

    return this.transformDatabaseQuestions(data ?? []);
  }

  /**
   * Get question statistics from database
   */
  async getQuestionStats(): Promise<{
    totalQuestions: number;
    domainDistribution: Record<TCODomain, number>;
    difficultyDistribution: Record<Difficulty, number>;
    categoryDistribution: Record<QuestionCategory, number>;
  }> {
    // Get total count
    const totalResult: any = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true });
    const totalQuestions = totalResult?.count ?? 0;

    // Get domain distribution without aggregates (compatible with strict PostgREST configs)
    const domainRes: any = await supabase.from("questions").select("domain");
    const domainRows = (domainRes?.data ?? []) as Array<{ domain: string | null }>;
    const domainError = domainRes?.error;

    if (domainError) {
      throw new Error(`Failed to fetch domain statistics: ${domainError.message}`);
    }

    // Get difficulty distribution
  const diffRes: any = await supabase.from("questions").select("difficulty");
  const difficultyData = diffRes?.data ?? [];

  // Get category distribution
  const catRes: any = await supabase.from("questions").select("category");
  const categoryData = catRes?.data ?? [];

    // Process distributions
    const domainDistribution: Record<TCODomain, number> = {} as Record<TCODomain, number>;
    const difficultyDistribution: Record<Difficulty, number> = {} as Record<Difficulty, number>;
    const categoryDistribution: Record<QuestionCategory, number> = {} as Record<
      QuestionCategory,
      number
    >;

    // Initialize with zeros
    Object.values(TCODomain).forEach((domain) => {
      domainDistribution[domain] = 0;
    });
    Object.values(Difficulty).forEach((difficulty) => {
      difficultyDistribution[difficulty] = 0;
    });
    Object.values(QuestionCategory).forEach((category) => {
      categoryDistribution[category] = 0;
    });

    // Count from domain statistics view
    domainRows.forEach((row) => {
      const uiDomain = this.mapDbDomainToUi((row.domain || undefined) as string | undefined);
      domainDistribution[uiDomain] = (domainDistribution[uiDomain] || 0) + 1;
    });

    // Count difficulties
    (difficultyData as any[]).forEach((row) => {
      const d = this.mapDbDifficultyToUi(row.difficulty as string);
      difficultyDistribution[d] = (difficultyDistribution[d] || 0) + 1;
    });

    // Count categories
    (categoryData as any[]).forEach((row) => {
      const c = this.mapDbCategoryToUi(row.category as string);
      categoryDistribution[c] = (categoryDistribution[c] || 0) + 1;
    });

    return {
      totalQuestions: totalQuestions || 0,
      domainDistribution,
      difficultyDistribution,
      categoryDistribution,
    };
  }

  /**
   * Search questions by text content
   */
  async searchQuestions(searchTerm: string): Promise<Question[]> {
    const res: any = await supabase
      .from("questions")
      .select("*")
      .or(`question.ilike.%${searchTerm}%,explanation.ilike.%${searchTerm}%`)
      .order("created_at");
    const { data, error } = res;

    if (error) {
      throw new Error(`Failed to search questions: ${error.message}`);
    }

    return this.transformDatabaseQuestions(data ?? []);
  }

  /**
   * Get questions by tags
   */
  async getQuestionsByTags(tags: string[]): Promise<Question[]> {
    const res: any = await supabase
      .from("questions")
      .select("*")
      .overlaps("tags", tags)
      .order("created_at");
    const { data, error } = res;

    if (error) {
      throw new Error(`Failed to fetch questions by tags: ${error.message}`);
    }

    return this.transformDatabaseQuestions(data ?? []);
  }

  /**
   * Validate question database integrity
   */
  async validateQuestionDatabase(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check for questions without proper structure
      const invalidRes: any = await supabase
        .from("questions")
        .select("id, question, options, correct_answer") // Select options and correct_answer
        .or("question.is.null,options.is.null,correct_answer.is.null"); // Check options and correct_answer
      const invalidQuestions = invalidRes?.data ?? [];

      if (invalidQuestions.length > 0) {
        errors.push(`Found ${invalidQuestions.length} questions with missing required fields`);
      }

      // Check for orphaned correct answer IDs
      const qwcRes: any = await supabase.from("questions").select("id, options, correct_answer");
      const questionsWithChoices = qwcRes?.data ?? [];

      questionsWithChoices.forEach((q: any) => {
        if (q.options && Array.isArray(q.options)) {
          // Normalize choice ids as strings
          const choiceIds = (q.options as unknown as Array<any>).map((c, idx) => {
            if (c && typeof c === 'object' && 'id' in c) return String((c as any).id);
            // fallback: index-based ids a/b/c/d
            return ['a','b','c','d'][idx] || String(idx);
          });

          const normalizeAnswer = (val: any): string => {
            if (typeof val === 'number') return ['a','b','c','d'][val] || String(val);
            if (typeof val === 'string') {
              const map: Record<string,string> = { '0':'a','1':'b','2':'c','3':'d' };
              return map[val] || val;
            }
            return String(val ?? 'a');
          };

          const normalized = normalizeAnswer(q.correct_answer);
          if (!choiceIds.includes(normalized)) {
            errors.push(`Question ${q.id}: Correct answer ID '${q.correct_answer}' not found in choices`);
          }
        } else {
          errors.push(`Question ${q.id}: Choices are missing or not an array.`);
        }
      });

      // Check domain distribution
    const stats = await this.getQuestionStats();
      const expectedDistribution = {
        [TCODomain.ASKING_QUESTIONS]: 22,
        [TCODomain.REFINING_QUESTIONS]: 23,
        [TCODomain.TAKING_ACTION]: 15,
        [TCODomain.NAVIGATION_MODULES]: 23,
        [TCODomain.REPORTING_EXPORT]: 17,
      };

      Object.entries(expectedDistribution).forEach(([domain, expectedPercentage]) => {
        const actualCount = stats.domainDistribution[domain as TCODomain];
        const actualPercentage = (actualCount / stats.totalQuestions) * 100;
        const deviation = Math.abs(actualPercentage - expectedPercentage);

        if (deviation > 5) {
          warnings.push(
            `Domain ${domain}: Expected ~${expectedPercentage}%, got ${actualPercentage.toFixed(1)}%`
          );
        }
      });
    } catch (error) {
      errors.push(`Database validation failed: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Transform database question format to application format
   */
  private transformDatabaseQuestions(dbQuestions: any[]): Question[] {
    const list = Array.isArray(dbQuestions) ? dbQuestions : dbQuestions ? [dbQuestions] : [];

    return list.map((dbQ: any) => {
      const rawCorrect: any = (dbQ as any).correct_answer;
      let correctAnswerId: string;
      if (typeof rawCorrect === 'number') {
        const map = ['a','b','c','d'];
        correctAnswerId = map[rawCorrect] || String(rawCorrect);
      } else if (typeof rawCorrect === 'string') {
        // Normalize numeric strings
        const map: Record<string,string> = { '0':'a','1':'b','2':'c','3':'d' };
        correctAnswerId = map[rawCorrect] || rawCorrect;
      } else {
        correctAnswerId = String(rawCorrect ?? 'a');
      }

      return ({
      id: dbQ.id,
      question: dbQ.question,
      choices: (dbQ.options as unknown as Choice[]) || [], // Map options to choices, cast to unknown first
      correctAnswerId,
      domain: this.mapDbDomainToUi(dbQ.domain as string),
      difficulty: this.mapDbDifficultyToUi(dbQ.difficulty as string),
      category: this.mapDbCategoryToUi(dbQ.category as string),
      explanation: dbQ.explanation || "",
      tags: dbQ.tags || [],
      studyGuideRef: dbQ.study_guide_ref || dbQ.references || "",
      createdAt: dbQ.created_at ? new Date(dbQ.created_at) : undefined,
      updatedAt: dbQ.updated_at ? new Date(dbQ.updated_at) : undefined, // Map updated_at
    });
    });
  }

  /**
   * Add new question to database
   */
  async addQuestion(question: Omit<Question, "id">): Promise<Question> {
    const dbQuestion: QuestionInsert = {
      question: question.question,
      options: question.choices as unknown as Json, // Cast choices to Json
      correct_answer: this.mapChoiceIdToDb(question.correctAnswerId) as any,
      domain: this.mapUiDomainToDb(question.domain),
      difficulty: this.mapUiDifficultyToDb(question.difficulty),
      category: this.mapUiCategoryToDb(question.category),
      explanation: question.explanation || null,
      tags: question.tags || [],
      // study_guide_ref omitted for broader schema compatibility
      // Optional relational columns intentionally omitted for broader schema compatibility
      created_at: question.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: question.updatedAt?.toISOString() || new Date().toISOString(),
    };

    const res: any = await supabase.from("questions").insert(dbQuestion as any).select().single();
    const { data, error } = res;

    if (error) {
      throw new Error(`Failed to add question: ${error.message}`);
    }

    // transformDatabaseQuestions accepts single object or array
    return this.transformDatabaseQuestions(data)[0];
  }

  /**
   * Update existing question
   */
  async updateQuestion(id: string, updates: Partial<Omit<Question, "id">>): Promise<Question> {
    const dbUpdates: QuestionUpdate = {
      // Only include properties that are actually being updated
      ...(updates.question && { question: updates.question }),
      ...(updates.choices && { options: updates.choices as unknown as Json }), // Cast choices to Json
      ...(updates.correctAnswerId && {
        correct_answer: this.mapChoiceIdToDb(updates.correctAnswerId as string) as any,
      }),
      ...(updates.domain && { domain: this.mapUiDomainToDb(updates.domain) }),
      ...(updates.difficulty && { difficulty: this.mapUiDifficultyToDb(updates.difficulty) }),
      ...(updates.category && { category: this.mapUiCategoryToDb(updates.category) }),
      ...(updates.explanation && { explanation: updates.explanation }),
      ...(updates.tags && { tags: updates.tags }),
      // study_guide_ref intentionally omitted
      ...(updates.createdAt && { created_at: updates.createdAt.toISOString() }),
      updated_at: new Date().toISOString(), // Always update updated_at
    };

    const res: any = await (supabase as any)
      .from("questions")
      .update(dbUpdates as any)
      .eq("id", id)
      .select()
      .single();
    const { data, error } = res;

    if (error) {
      throw new Error(`Failed to update question: ${error.message}`);
    }

    return this.transformDatabaseQuestions(data)[0];
  }

  /**
   * Delete question
   */
  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase.from("questions").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete question: ${error.message}`);
    }
  }
}

// Export singleton instance
export const questionService = new QuestionService();

// Legacy compatibility - provide same interface as questionLoader
export const getAllQuestions = () => questionService.getAllQuestions();
export const getQuestionsByDomain = (domain: TCODomain) =>
  questionService.getQuestionsByDomain(domain);
export const getQuestionsByDifficulty = (difficulty: Difficulty) =>
  questionService.getQuestionsByDifficulty(difficulty);
export const getQuestionsByCategory = (category: QuestionCategory) =>
  questionService.getQuestionsByCategory(category);
export const getWeightedRandomQuestions = (count: number) =>
  questionService.getWeightedRandomQuestions(count);
export const getQuestionStats = () => questionService.getQuestionStats();
export const validateQuestionDatabase = () => questionService.validateQuestionDatabase();
