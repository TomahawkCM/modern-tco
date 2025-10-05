#!/usr/bin/env tsx

/**
 * Question Bank Import CLI
 *
 * Imports questions into the question bank for spaced repetition reviews.
 * This is separate from the exam question import system.
 *
 * Usage:
 *   npx tsx scripts/import-to-question-bank.ts <file> [--format=legacy|json]
 *   npx tsx scripts/import-to-question-bank.ts data/questions.json
 *
 * File Formats:
 *   - legacy: Old exam format with domain/difficulty/cognitive
 *   - json: Direct question bank format
 */

import fs from "fs";
import path from "path";

// Question Bank types (matching questionBank.ts)
interface Question {
  id: string;
  moduleId: string;
  sectionId: string;
  concept: string;
  question: string;
  type: "multiple-choice" | "true-false" | "fill-blank";
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  tags?: string[];
}

// CLI colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Map legacy domain names to moduleIds
function mapDomain(domain: string): string {
  const mapping: Record<string, string> = {
    "ASKING QUESTIONS": "asking-questions",
    "REFINING TARGETING": "refining-questions",
    "TAKING ACTION": "taking-action",
    "NAVIGATION MODULES": "navigation-modules",
    "REPORTING EXPORT": "reporting-export",
    "AQ": "asking-questions",
    "RQ": "refining-questions",
    "TA": "taking-action",
    "NB": "navigation-modules",
    "RD": "reporting-export",
    "foundation": "platform-foundation",
    "asking": "asking-questions",
    "refining": "refining-questions",
    "action": "taking-action",
    "troubleshooting": "troubleshooting",
    "advanced": "advanced-topics",
  };

  const normalized = domain.toLowerCase().replace(/[^a-z0-9]/g, "-");
  return mapping[domain] || mapping[normalized] || normalized;
}

// Map difficulty to easy/medium/hard
function mapDifficulty(diff: any): "easy" | "medium" | "hard" {
  if (typeof diff === "number") {
    if (diff <= 1) return "easy";
    if (diff >= 3) return "hard";
    return "medium";
  }

  const normalized = String(diff).toLowerCase();
  if (normalized.includes("easy") || normalized.includes("beginner")) return "easy";
  if (normalized.includes("hard") || normalized.includes("advanced")) return "hard";
  return "medium";
}

// Convert legacy exam question to question bank format
function convertLegacyQuestion(legacy: any, index: number): Question {
  return {
    id: legacy.id || `imported-${index}`,
    moduleId: mapDomain(legacy.domain || "unknown"),
    sectionId: legacy.section || "",
    concept: legacy.concept || legacy.category || legacy.tags?.[0] || "General",
    question: legacy.stem || legacy.question || legacy.text || "",
    type: legacy.choices && legacy.choices.length > 0 ? "multiple-choice" : "true-false",
    options: legacy.choices,
    correctAnswer: legacy.answer || legacy.correctAnswer || "",
    explanation: legacy.explanation || legacy.rationale || "",
    difficulty: mapDifficulty(legacy.difficulty),
    tags: legacy.tags || [],
  };
}

// Main import function
async function importToQuestionBank() {
  log("\n╔═══════════════════════════════════════╗", "cyan");
  log("║  Question Bank Import Utility        ║", "cyan");
  log("╚═══════════════════════════════════════╝", "cyan");

  const args = process.argv.slice(2);

  if (args.length === 0) {
    log("\nUsage:", "yellow");
    log("  npx tsx scripts/import-to-question-bank.ts <file> [--format=legacy|json]", "cyan");
    log("\nExamples:", "yellow");
    log("  npx tsx scripts/import-to-question-bank.ts data/questions.json", "cyan");
    log("  npx tsx scripts/import-to-question-bank.ts data/legacy.json --format=legacy", "cyan");
    process.exit(1);
  }

  const filePath = args[0];
  const format = args.find(a => a.startsWith("--format="))?.split("=")[1] || "json";

  // Check file exists
  if (!fs.existsSync(filePath)) {
    log(`\n✗ Error: File not found: ${filePath}`, "red");
    process.exit(1);
  }

  log(`\n📖 Reading questions from: ${filePath}`, "blue");
  log(`   Format: ${format}`, "cyan");

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(fileContent);

  let questions: Question[] = [];

  if (format === "legacy") {
    // Convert legacy format
    const legacyQuestions = Array.isArray(data) ? data : data.questions || [];
    log(`   Found ${legacyQuestions.length} legacy questions`, "cyan");

    questions = legacyQuestions.map((lq: any, idx: number) => convertLegacyQuestion(lq, idx));
    log(`   ✓ Converted ${questions.length} questions`, "green");
  } else {
    // Direct JSON format
    questions = Array.isArray(data) ? data : data.questions || [];
    log(`   ✓ Loaded ${questions.length} questions`, "green");
  }

  // Statistics
  log("\n📊 Statistics:", "blue");

  const byModule: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  const byType: Record<string, number> = {};

  questions.forEach(q => {
    byModule[q.moduleId] = (byModule[q.moduleId] || 0) + 1;
    byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
    byType[q.type] = (byType[q.type] || 0) + 1;
  });

  log("\n  By Module:", "cyan");
  Object.entries(byModule).forEach(([module, count]) => {
    log(`    ${module}: ${count}`, "reset");
  });

  log("\n  By Difficulty:", "cyan");
  Object.entries(byDifficulty).forEach(([diff, count]) => {
    log(`    ${diff}: ${count}`, "reset");
  });

  log("\n  By Type:", "cyan");
  Object.entries(byType).forEach(([type, count]) => {
    log(`    ${type}: ${count}`, "reset");
  });

  // Generate output file for question bank
  const outputDir = path.join(process.cwd(), "src/data/question-bank");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().split("T")[0];
  const outputFile = path.join(outputDir, `imported-${timestamp}.json`);

  fs.writeFileSync(outputFile, JSON.stringify(questions, null, 2));

  log(`\n💾 Saved to: ${outputFile}`, "green");

  // Generate TypeScript file
  const tsFile = path.join(outputDir, `imported-${timestamp}.ts`);
  const tsContent = `/**
 * Imported Question Bank
 * Generated: ${new Date().toISOString()}
 * Source: ${path.basename(filePath)}
 * Total: ${questions.length} questions
 */

import { Question } from "@/lib/questionBank";

export const importedQuestions: Question[] = ${JSON.stringify(questions, null, 2)};

export const importedQuestionsMetadata = {
  totalQuestions: ${questions.length},
  importDate: "${new Date().toISOString()}",
  source: "${path.basename(filePath)}",
  byModule: ${JSON.stringify(byModule, null, 2)},
  byDifficulty: ${JSON.stringify(byDifficulty, null, 2)},
  byType: ${JSON.stringify(byType, null, 2)},
};
`;

  fs.writeFileSync(tsFile, tsContent);
  log(`💾 TypeScript file: ${tsFile}`, "green");

  // Instructions
  log("\n📝 Next Steps:", "yellow");
  log("1. Import the questions in your code:", "cyan");
  log(`   import { importedQuestions } from "@/data/question-bank/imported-${timestamp}";`, "reset");
  log(`   import { addQuestions } from "@/lib/questionBank";`, "reset");
  log(`   addQuestions(importedQuestions);`, "reset");
  log("\n2. Or manually add them via localStorage in browser console:", "cyan");
  log(`   Use the JSON file: ${path.basename(outputFile)}`, "reset");

  log("\n✅ Import complete!", "green");
}

// Run
if (require.main === module) {
  importToQuestionBank().catch(error => {
    log(`\n✗ Fatal error: ${error}`, "red");
    process.exit(1);
  });
}

export default importToQuestionBank;
