/* eslint-disable @typescript-eslint/no-require-imports */
import { type Question, TCODomain, Difficulty, QuestionCategory } from "@/types/exam";

// Temporary fallback questions for testing
const fallbackQuestions: Question[] = [
  {
    id: "test-001",
    domain: TCODomain.ASKING_QUESTIONS,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
    difficulty: Difficulty.INTERMEDIATE,
    question: "What is the primary purpose of the Tanium platform?",
    choices: [
      { id: "a", text: "Network monitoring" },
      { id: "b", text: "Endpoint security and management" },
      { id: "c", text: "Web application development" },
      { id: "d", text: "Database management" },
    ],
    correctAnswerId: "b",
    explanation: "Tanium is primarily focused on endpoint security and management at scale.",
    tags: ["fundamentals", "platform"],
  },
];

// Initialize with fallback questions
let questionBank: Question[] = fallbackQuestions;
let loadedMetadata: any = {
  totalQuestions: 1,
  targetQuestions: 1,
  coreQuestions: 1,
};

// Async function to load the full question bank
async function loadFullQuestionBank() {
  try {
    // Attempt to load full question banks with proper ES module import
    const { tcoAlignedQuestionBank, questionBankMetadata: tcoMetadata } = await import(
      "./tco-aligned-questions"
    );

    if (
      tcoAlignedQuestionBank &&
      Array.isArray(tcoAlignedQuestionBank) &&
      tcoAlignedQuestionBank.length > 0
    ) {
      // Update metadata for successful load
      loadedMetadata = {
        totalQuestions: tcoAlignedQuestionBank.length,
        targetQuestions: 4108,
        coreQuestions: tcoAlignedQuestionBank.length,
        advancedQuestions: 0,
        importedQuestions: 0,
      };

      questionBank = [...tcoAlignedQuestionBank];
      console.log(`Loaded ${questionBank.length} questions successfully`);
      return true;
    } else {
      throw new Error("TCO aligned questions not available or empty");
    }
  } catch (error) {
    const e = error as any;
    console.log("Using fallback questions for testing:", e?.message || "Unknown error");
    // Keep fallback questions and metadata as defined above
    return false;
  }
}

// Try to load synchronously with fallback to tco-aligned-questions
try {
  const { tcoAlignedQuestionBank } = require("./tco-aligned-questions");
  if (
    tcoAlignedQuestionBank &&
    Array.isArray(tcoAlignedQuestionBank) &&
    tcoAlignedQuestionBank.length > 0
  ) {
    questionBank = [...tcoAlignedQuestionBank];
    loadedMetadata = {
      totalQuestions: tcoAlignedQuestionBank.length,
      targetQuestions: 4108,
      coreQuestions: tcoAlignedQuestionBank.length,
      advancedQuestions: 0,
      importedQuestions: 0,
    };
    console.log(`Loaded ${questionBank.length} questions from tco-aligned-questions`);
  }
} catch (error) {
  console.log("Could not load tco-aligned-questions synchronously, using fallback");
}

// Combined metadata for the complete question bank
export const combinedQuestionBankMetadata = {
  totalQuestions: questionBank.length,
  targetQuestions: 4108,
  coreQuestions: questionBank.length,
  advancedQuestions: 0,
  importedQuestions: 0,
  domainDistribution: {
    [TCODomain.ASKING_QUESTIONS]: questionBank.filter(
      (q) => q.domain === TCODomain.ASKING_QUESTIONS
    ).length,
    [TCODomain.REFINING_QUESTIONS]: questionBank.filter(
      (q) => q.domain === TCODomain.REFINING_QUESTIONS
    ).length,
    [TCODomain.TAKING_ACTION]: questionBank.filter((q) => q.domain === TCODomain.TAKING_ACTION)
      .length,
    [TCODomain.NAVIGATION_MODULES]: questionBank.filter(
      (q) => q.domain === TCODomain.NAVIGATION_MODULES
    ).length,
    [TCODomain.REPORTING_EXPORT]: questionBank.filter(
      (q) => q.domain === TCODomain.REPORTING_EXPORT
    ).length,
  },
  categoryDistribution: {
    [QuestionCategory.PLATFORM_FUNDAMENTALS]: questionBank.filter(
      (q) => q.category === QuestionCategory.PLATFORM_FUNDAMENTALS
    ).length,
    [QuestionCategory.CONSOLE_PROCEDURES]: questionBank.filter(
      (q) => q.category === QuestionCategory.CONSOLE_PROCEDURES
    ).length,
    [QuestionCategory.TROUBLESHOOTING]: questionBank.filter(
      (q) => q.category === QuestionCategory.TROUBLESHOOTING
    ).length,
    [QuestionCategory.PRACTICAL_SCENARIOS]: questionBank.filter(
      (q) => q.category === QuestionCategory.PRACTICAL_SCENARIOS
    ).length,
    [QuestionCategory.LINEAR_CHAIN]: questionBank.filter(
      (q) => q.category === QuestionCategory.LINEAR_CHAIN
    ).length,
  },
};

// Legacy metadata for backward compatibility
export const questionBankMetadata = combinedQuestionBankMetadata;

// Complete question bank for production use (all 200+ questions)
export const sampleQuestions: Question[] = questionBank;

// Export questionBank directly for questionsService - use the actual questionBank variable
export { questionBank };

// Export the async loader for use by the service layer
export { loadFullQuestionBank };
