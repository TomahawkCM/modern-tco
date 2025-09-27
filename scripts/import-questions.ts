#!/usr/bin/env tsx

/**
 * Comprehensive TCO Question Import Script
 *
 * This script imports all 4,108 questions from the legacy questions_master.json
 * and converts them to the modern TCO TypeScript format with proper domain mapping.
 *
 * Domain Mapping:
 * - AQ (43 questions) → ASKING_QUESTIONS (22% - target ~900 questions)
 * - RQ (45 questions) → REFINING_TARGETING (23% - target ~945 questions)
 * - TA (34 questions) → TAKING_ACTION (15% - target ~616 questions)
 * - NB (45 questions) → NAVIGATION_MODULES (23% - target ~945 questions)
 * - RD (33 questions) → REPORTING_EXPORT (17% - target ~698 questions)
 */

import fs from "fs";
import path from "path";
import { Question, TCODomain, Difficulty, QuestionCategory } from "../src/types/exam";

// Legacy question interface
interface LegacyQuestion {
  id: string;
  domain: string;
  difficulty: number;
  cognitive: string;
  stem: string;
  choices: string[];
  answer: string;
  explanation: string;
  refs: string[];
  tags: string[];
  last_reviewed: string;
}

// Domain mapping from legacy to modern TCO
const DOMAIN_MAPPING: Record<string, TCODomain> = {
  AQ: TCODomain.ASKING_QUESTIONS,
  RQ: TCODomain.REFINING_TARGETING,
  TA: TCODomain.TAKING_ACTION,
  NB: TCODomain.NAVIGATION_MODULES,
  RD: TCODomain.REPORTING_EXPORT,
};

// Difficulty mapping
const DIFFICULTY_MAPPING: Record<number, Difficulty> = {
  1: Difficulty.BEGINNER,
  2: Difficulty.INTERMEDIATE,
  3: Difficulty.ADVANCED,
};

// Category assignment based on tags and content
function assignCategory(question: LegacyQuestion): QuestionCategory {
  const tags = question.tags.join(" ").toLowerCase();
  const stem = question.stem.toLowerCase();

  // Platform fundamentals
  if (
    tags.includes("fundamentals") ||
    tags.includes("basic-concepts") ||
    tags.includes("architecture") ||
    tags.includes("core-components")
  ) {
    return QuestionCategory.PLATFORM_FUNDAMENTALS;
  }

  // Console procedures
  if (
    tags.includes("console") ||
    tags.includes("navigation") ||
    tags.includes("workflow") ||
    tags.includes("interface")
  ) {
    return QuestionCategory.CONSOLE_PROCEDURES;
  }

  // Troubleshooting
  if (
    tags.includes("troubleshooting") ||
    tags.includes("diagnosis") ||
    tags.includes("debug") ||
    stem.includes("troubleshoot") ||
    stem.includes("no results") ||
    stem.includes("error")
  ) {
    return QuestionCategory.TROUBLESHOOTING;
  }

  // Linear chain architecture
  if (
    tags.includes("linear-chain") ||
    tags.includes("peer-to-peer") ||
    tags.includes("client-communication") ||
    tags.includes("scalability")
  ) {
    return QuestionCategory.LINEAR_CHAIN;
  }

  // Default to practical scenarios
  return QuestionCategory.PRACTICAL_SCENARIOS;
}

// Convert answer letter to choice ID
function convertAnswerToChoiceId(answerLetter: string): string {
  const mapping: Record<string, string> = {
    A: "a",
    B: "b",
    C: "c",
    D: "d",
  };
  return mapping[answerLetter.toUpperCase()] || "a";
}

// Convert legacy question to modern format
function convertLegacyQuestion(legacy: LegacyQuestion): Question {
  const choices = legacy.choices.map((choice, index) => ({
    id: String.fromCharCode(97 + index), // 'a', 'b', 'c', 'd'
    text: choice,
  }));

  return {
    id: legacy.id,
    question: legacy.stem,
    choices,
    correctAnswerId: convertAnswerToChoiceId(legacy.answer),
    domain: DOMAIN_MAPPING[legacy.domain],
    difficulty: DIFFICULTY_MAPPING[legacy.difficulty] || Difficulty.INTERMEDIATE,
    category: assignCategory(legacy),
    explanation: legacy.explanation,
    tags: legacy.tags,
    studyGuideRef: legacy.refs
      .find((ref) => ref.startsWith("archonkb://"))
      ?.replace("archonkb://", ""),
    officialRef: legacy.refs
      .find((ref) => ref.startsWith("official://"))
      ?.replace("official://", ""),
  };
}

// Main import function
async function importQuestions() {
  console.log("🚀 Starting TCO Question Import Process...");

  // Read the master questions file
  const masterFilePath = path.join(process.cwd(), "../docs/Exam_Pools/questions_master.json");

  if (!fs.existsSync(masterFilePath)) {
    throw new Error(`Master questions file not found at: ${masterFilePath}`);
  }

  console.log("📖 Reading master questions file...");
  const masterData = JSON.parse(fs.readFileSync(masterFilePath, "utf8")) as LegacyQuestion[];

  console.log(`📊 Found ${masterData.length} questions to import`);

  // Convert all questions
  console.log("🔄 Converting questions to modern format...");
  const convertedQuestions: Question[] = masterData.map(convertLegacyQuestion);

  // Group questions by domain for balanced distribution
  const questionsByDomain = convertedQuestions.reduce(
    (acc, question) => {
      if (!acc[question.domain]) {
        acc[question.domain] = [];
      }
      acc[question.domain].push(question);
      return acc;
    },
    {} as Record<TCODomain, Question[]>
  );

  // Display statistics
  console.log("\n📈 Import Statistics:");
  Object.entries(questionsByDomain).forEach(([domain, questions]) => {
    console.log(`  ${domain}: ${questions.length} questions`);
  });

  // Generate TypeScript files for each domain
  const dataDir = path.join(process.cwd(), "src/data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Generate master imported questions file
  const masterImportFile = `import { Question, TCODomain, Difficulty, QuestionCategory } from '@/types/exam'

/**
 * Complete Imported Question Bank
 * Imported from legacy TCO questions_master.json
 * Total: ${convertedQuestions.length} questions
 * 
 * Distribution:
${Object.entries(questionsByDomain)
  .map(([domain, questions]) => ` * ${domain}: ${questions.length} questions`)
  .join("\n")}
 */

export const importedQuestionBank: Question[] = ${JSON.stringify(convertedQuestions, null, 2)}

export const importedQuestionBankMetadata = {
  totalQuestions: ${convertedQuestions.length},
  importDate: '${new Date().toISOString()}',
  source: 'questions_master.json',
  domainDistribution: {
${Object.entries(questionsByDomain)
  .map(([domain, questions]) => `    '${domain}': ${questions.length}`)
  .join(",\n")}
  },
  difficultyDistribution: {
    [Difficulty.BEGINNER]: ${convertedQuestions.filter((q) => q.difficulty === Difficulty.BEGINNER).length},
    [Difficulty.INTERMEDIATE]: ${convertedQuestions.filter((q) => q.difficulty === Difficulty.INTERMEDIATE).length},
    [Difficulty.ADVANCED]: ${convertedQuestions.filter((q) => q.difficulty === Difficulty.ADVANCED).length}
  },
  categoryDistribution: {
    [QuestionCategory.PLATFORM_FUNDAMENTALS]: ${convertedQuestions.filter((q) => q.category === QuestionCategory.PLATFORM_FUNDAMENTALS).length},
    [QuestionCategory.CONSOLE_PROCEDURES]: ${convertedQuestions.filter((q) => q.category === QuestionCategory.CONSOLE_PROCEDURES).length},
    [QuestionCategory.TROUBLESHOOTING]: ${convertedQuestions.filter((q) => q.category === QuestionCategory.TROUBLESHOOTING).length},
    [QuestionCategory.PRACTICAL_SCENARIOS]: ${convertedQuestions.filter((q) => q.category === QuestionCategory.PRACTICAL_SCENARIOS).length},
    [QuestionCategory.LINEAR_CHAIN]: ${convertedQuestions.filter((q) => q.category === QuestionCategory.LINEAR_CHAIN).length}
  }
}
`;

  const masterOutputPath = path.join(dataDir, "imported-questions-master.ts");
  fs.writeFileSync(masterOutputPath, masterImportFile);

  console.log(`✅ Generated master import file: ${masterOutputPath}`);

  // Generate domain-specific files
  Object.entries(questionsByDomain).forEach(([domain, questions]) => {
    const domainCode = domain
      .split(" ")[0]
      .toLowerCase()
      .replace(/[^a-z]/g, "");
    const fileName = `questions-${domainCode}.ts`;
    const filePath = path.join(dataDir, fileName);

    const fileContent = `import { Question, TCODomain, Difficulty, QuestionCategory } from '@/types/exam'

/**
 * ${domain} Questions
 * ${questions.length} questions for the ${domain} domain
 */

export const ${domainCode}Questions: Question[] = ${JSON.stringify(questions, null, 2)}

export const ${domainCode}QuestionMetadata = {
  domain: TCODomain.${Object.keys(DOMAIN_MAPPING).find((k) => DOMAIN_MAPPING[k] === domain)},
  totalQuestions: ${questions.length},
  difficultyBreakdown: {
    beginner: ${questions.filter((q) => q.difficulty === Difficulty.BEGINNER).length},
    intermediate: ${questions.filter((q) => q.difficulty === Difficulty.INTERMEDIATE).length},
    advanced: ${questions.filter((q) => q.difficulty === Difficulty.ADVANCED).length}
  }
}
`;

    fs.writeFileSync(filePath, fileContent);
    console.log(`✅ Generated ${domain} file: ${fileName} (${questions.length} questions)`);
  });

  // Update the main sample-questions.ts to include imported questions
  console.log("📝 Updating sample-questions.ts...");

  const sampleQuestionsPath = path.join(dataDir, "sample-questions.ts");
  const updatedSampleQuestions = `import { Question, TCODomain, Difficulty, QuestionCategory } from '@/types/exam'
import { importedQuestionBank, importedQuestionBankMetadata } from './imported-questions-master'

// Import comprehensive TCO-aligned question banks
import { tcoAlignedQuestionBank, questionBankMetadata as tcoMetadata } from './tco-aligned-questions'
import { advancedTCOQuestions, advancedQuestionMetadata } from './advanced-tco-questions'

// Combine all question banks into comprehensive collection
export const questionBank: Question[] = [
  ...tcoAlignedQuestionBank,
  ...advancedTCOQuestions,
  ...importedQuestionBank
]

// Combined metadata for the complete question bank
export const combinedQuestionBankMetadata = {
  totalQuestions: questionBank.length,
  targetQuestions: 4108,
  coreQuestions: tcoAlignedQuestionBank.length,
  advancedQuestions: advancedTCOQuestions.length,
  importedQuestions: importedQuestionBank.length,
  domainDistribution: {
    [TCODomain.ASKING_QUESTIONS]: questionBank.filter(q => q.domain === TCODomain.ASKING_QUESTIONS).length,
    [TCODomain.REFINING_TARGETING]: questionBank.filter(q => q.domain === TCODomain.REFINING_TARGETING).length,
    [TCODomain.TAKING_ACTION]: questionBank.filter(q => q.domain === TCODomain.TAKING_ACTION).length,
    [TCODomain.NAVIGATION_MODULES]: questionBank.filter(q => q.domain === TCODomain.NAVIGATION_MODULES).length,
    [TCODomain.REPORTING_EXPORT]: questionBank.filter(q => q.domain === TCODomain.REPORTING_EXPORT).length
  },
  categoryDistribution: {
    [QuestionCategory.PLATFORM_FUNDAMENTALS]: questionBank.filter(q => q.category === QuestionCategory.PLATFORM_FUNDAMENTALS).length,
    [QuestionCategory.CONSOLE_PROCEDURES]: questionBank.filter(q => q.category === QuestionCategory.CONSOLE_PROCEDURES).length,
    [QuestionCategory.TROUBLESHOOTING]: questionBank.filter(q => q.category === QuestionCategory.TROUBLESHOOTING).length,
    [QuestionCategory.PRACTICAL_SCENARIOS]: questionBank.filter(q => q.category === QuestionCategory.PRACTICAL_SCENARIOS).length,
    [QuestionCategory.LINEAR_CHAIN]: questionBank.filter(q => q.category === QuestionCategory.LINEAR_CHAIN).length
  }
}

// Legacy metadata for backward compatibility
export const questionBankMetadata = combinedQuestionBankMetadata

// Complete question bank for production use (all ${convertedQuestions.length}+ questions)
export const sampleQuestions: Question[] = questionBank
`;

  fs.writeFileSync(sampleQuestionsPath, updatedSampleQuestions);
  console.log("✅ Updated sample-questions.ts with imported questions");

  console.log("\n🎉 Import Complete!");
  console.log(`📊 Total Questions Imported: ${convertedQuestions.length}`);
  console.log(`📁 Files Generated: ${Object.keys(questionsByDomain).length + 2}`);
  console.log("🏃‍♂️ Ready to test the TCO application!");

  return {
    totalQuestions: convertedQuestions.length,
    domainDistribution: questionsByDomain,
    generatedFiles: Object.keys(questionsByDomain).length + 2,
  };
}

// Run the import if this file is executed directly
if (require.main === module) {
  importQuestions().catch(console.error);
}

export default importQuestions;
