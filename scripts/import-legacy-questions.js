#!/usr/bin/env node

/**
 * Script to import questions from legacy TCO system
 * Converts legacy JSON format to TypeScript format for modern app
 */

const fs = require("fs");
const path = require("path");

// Paths
const LEGACY_QUESTIONS_PATH = path.join(__dirname, "../../docs/Exam_Pools/questions_master.json");
const OUTPUT_PATH = path.join(__dirname, "../src/data/imported-legacy-questions.ts");

// Domain mapping from legacy to new format
const domainMapping = {
  AQ: "ASKING_QUESTIONS",
  RT: "REFINING_TARGETING",
  TA: "TAKING_ACTION",
  NM: "NAVIGATION_MODULES",
  RE: "REPORTING_EXPORT",
};

// Difficulty mapping
const difficultyMapping = {
  1: "BEGINNER",
  2: "INTERMEDIATE",
  3: "ADVANCED",
};

// Category mapping based on cognitive level
const categoryMapping = {
  recall: "PLATFORM_FUNDAMENTALS",
  apply: "CONSOLE_PROCEDURES",
  analyze: "TROUBLESHOOTING",
  evaluate: "PRACTICAL_SCENARIOS",
};

function convertLegacyQuestion(legacyQ, index) {
  // Convert choices from array to objects with id and text
  const choices = legacyQ.choices.map((text, i) => ({
    id: String.fromCharCode(97 + i), // 'a', 'b', 'c', 'd'
    text: text,
  }));

  // Convert answer letter to lowercase
  const correctAnswerId = legacyQ.answer.toLowerCase();

  return {
    id: legacyQ.id || `imported-${index + 1}`,
    question: legacyQ.stem,
    choices: choices,
    correctAnswerId: correctAnswerId,
    domain: `TCODomain.${domainMapping[legacyQ.domain] || "ASKING_QUESTIONS"}`,
    difficulty: `Difficulty.${difficultyMapping[legacyQ.difficulty] || "INTERMEDIATE"}`,
    category: `QuestionCategory.${categoryMapping[legacyQ.cognitive] || "PLATFORM_FUNDAMENTALS"}`,
    explanation: legacyQ.explanation || "",
    tags: legacyQ.tags || [],
    studyGuideRef: legacyQ.refs?.[0] || "",
    officialRef: legacyQ.refs?.[1] || "",
  };
}

function main() {
  try {
    // Read legacy questions
    console.log("Reading legacy questions from:", LEGACY_QUESTIONS_PATH);
    const legacyData = fs.readFileSync(LEGACY_QUESTIONS_PATH, "utf8");
    const legacyQuestions = JSON.parse(legacyData);

    console.log(`Found ${legacyQuestions.length} legacy questions`);

    // Convert questions
    const convertedQuestions = legacyQuestions.map((q, i) => convertLegacyQuestion(q, i));

    // Generate TypeScript file content
    const tsContent = `import { Question, TCODomain, Difficulty, QuestionCategory } from '@/types/exam'

/**
 * Questions imported from legacy TCO system
 * Total: ${convertedQuestions.length} questions
 * Generated: ${new Date().toISOString()}
 */

export const importedLegacyQuestions: Question[] = [
${convertedQuestions
  .map(
    (q) => `  {
    id: '${q.id}',
    question: ${JSON.stringify(q.question)},
    choices: ${JSON.stringify(q.choices, null, 6).replace(/\n/g, "\n    ")},
    correctAnswerId: '${q.correctAnswerId}',
    domain: ${q.domain},
    difficulty: ${q.difficulty},
    category: ${q.category},
    explanation: ${JSON.stringify(q.explanation)},
    tags: ${JSON.stringify(q.tags)},
    studyGuideRef: ${JSON.stringify(q.studyGuideRef)},
    officialRef: ${JSON.stringify(q.officialRef)}
  }`
  )
  .join(",\n")}
]

export const importedQuestionsMetadata = {
  totalQuestions: ${convertedQuestions.length},
  importDate: '${new Date().toISOString()}',
  sourceFile: 'docs/Exam_Pools/questions_master.json',
  domainDistribution: {
    ASKING_QUESTIONS: ${convertedQuestions.filter((q) => q.domain.includes("ASKING_QUESTIONS")).length},
    REFINING_TARGETING: ${convertedQuestions.filter((q) => q.domain.includes("REFINING_TARGETING")).length},
    TAKING_ACTION: ${convertedQuestions.filter((q) => q.domain.includes("TAKING_ACTION")).length},
    NAVIGATION_MODULES: ${convertedQuestions.filter((q) => q.domain.includes("NAVIGATION_MODULES")).length},
    REPORTING_EXPORT: ${convertedQuestions.filter((q) => q.domain.includes("REPORTING_EXPORT")).length}
  }
}
`;

    // Write to file
    console.log("Writing converted questions to:", OUTPUT_PATH);
    fs.writeFileSync(OUTPUT_PATH, tsContent, "utf8");

    console.log(`✅ Successfully imported ${convertedQuestions.length} questions!`);
    console.log("\nDomain distribution:");
    const domainCounts = {};
    convertedQuestions.forEach((q) => {
      const domain = q.domain.split(".")[1];
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    });
    Object.entries(domainCounts).forEach(([domain, count]) => {
      console.log(`  ${domain}: ${count} questions`);
    });
  } catch (error) {
    console.error("Error importing questions:", error);
    process.exit(1);
  }
}

main();
