#!/usr/bin/env tsx
/**
 * Import 265 Questions into Supabase Database
 * Week 2.3: Question Bank Integration
 *
 * Imports all questions from JSON files into the `questions` table
 * for use in the spaced repetition review system.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Question files to import
const questionFiles = [
  {
    file: "asking-questions.json",
    moduleId: "asking-questions",
    domain: "Asking Questions",
  },
  {
    file: "refining-questions.json",
    moduleId: "refining-questions",
    domain: "Refining & Targeting",
  },
  {
    file: "navigation-modules.json",
    moduleId: "navigation-modules",
    domain: "Navigation & Modules",
  },
  {
    file: "taking-action.json",
    moduleId: "taking-action",
    domain: "Taking Action",
  },
  {
    file: "reporting-export.json",
    moduleId: "reporting-export",
    domain: "Reporting & Export",
  },
  {
    file: "comprehensive-assessment-bank.json",
    moduleId: "comprehensive",
    domain: "Comprehensive",
  },
];

interface QuestionData {
  id: string;
  question: string;
  choices?: any[];
  options?: string[];
  correctAnswerId?: string;
  correctAnswer?: number | string;
  domain: string;
  difficulty?: string;
  category?: string;
  explanation?: string;
  tags?: string[];
  module?: string;
}

// Normalize domains to EXACT valid database domain names
function normalizeDomain(domain: string, module?: string): string {
  const domainLower = domain.toLowerCase();

  // Valid domains from database:
  // - Asking Questions
  // - Fundamentals
  // - Navigation and Basic Module Functions
  // - Refining Questions & Targeting
  // - Report Generation and Data Export
  // - Taking Action

  if (domainLower.includes("ask") || domainLower.includes("question")) {
    return "Asking Questions";
  }

  if (domainLower.includes("refin") || domainLower.includes("target") || domainLower.includes("filter") || domainLower.includes("group")) {
    return "Refining Questions & Targeting";
  }

  if (domainLower.includes("action") || domainLower.includes("package") || domainLower.includes("deploy")) {
    return "Taking Action";
  }

  if (domainLower.includes("navigat") || domainLower.includes("module") || domainLower.includes("console") || domainLower.includes("interact") || domainLower.includes("trends")) {
    return "Navigation and Basic Module Functions";
  }

  if (domainLower.includes("report") || domainLower.includes("export") || domainLower.includes("data") || domainLower.includes("generation")) {
    return "Report Generation and Data Export";
  }

  // Foundation/Architecture/Platform topics
  if (domainLower.includes("foundation") || domainLower.includes("architecture") || domainLower.includes("platform") || domainLower.includes("terminology") || domainLower.includes("communication") || domainLower.includes("fundamental")) {
    return "Fundamentals";
  }

  // Business/efficiency/performance -> Fundamentals
  if (domainLower.includes("business") || domainLower.includes("efficienc") || domainLower.includes("performance") || domainLower.includes("competitive") || domainLower.includes("impact") || domainLower.includes("network") || domainLower.includes("fault") || domainLower.includes("infrastructure")) {
    return "Fundamentals";
  }

  // Default based on module or fallback
  if (module) {
    if (module.toLowerCase().includes("foundation")) return "Fundamentals";
    if (module.toLowerCase().includes("asking")) return "Asking Questions";
    if (module.toLowerCase().includes("refin")) return "Refining Questions & Targeting";
    if (module.toLowerCase().includes("action")) return "Taking Action";
    if (module.toLowerCase().includes("navigat")) return "Navigation and Basic Module Functions";
    if (module.toLowerCase().includes("report")) return "Report Generation and Data Export";
  }

  return "Fundamentals"; // Safe default
}

async function importQuestions() {
  console.log("🚀 Importing 265 Questions into Supabase\n");

  let totalImported = 0;
  let totalSkipped = 0;

  for (const { file, moduleId, domain } of questionFiles) {
    const filePath = path.join(process.cwd(), "src", "content", "questions", file);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${file} - not found`);
      continue;
    }

    console.log(`\n📂 Processing: ${file}...`);

    const content = fs.readFileSync(filePath, "utf-8");
    let questions: QuestionData[] = [];

    try {
      const parsed = JSON.parse(content);

      // Handle both array and object with 'questions' property
      if (Array.isArray(parsed)) {
        questions = parsed;
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        questions = parsed.questions;
      } else {
        console.log(`⚠️  Unexpected format in ${file}`);
        continue;
      }
    } catch (error) {
      console.error(`❌ Error parsing ${file}: ${error}`);
      continue;
    }

    console.log(`   Found ${questions.length} questions`);

    // Transform questions for database
    const dbQuestions = questions.map((q) => {
      // Extract correct answer index
      let correctAnswerIndex = 0;
      if (q.correctAnswerId && q.choices) {
        const choice = q.choices.findIndex((c: any) => c.id === q.correctAnswerId);
        correctAnswerIndex = choice >= 0 ? choice : 0;
      } else if (typeof q.correctAnswer === "number") {
        correctAnswerIndex = q.correctAnswer;
      }

      // Extract options in {id, text} format
      let options: Array<{ id: string; text: string }> = [];
      if (q.choices && Array.isArray(q.choices)) {
        options = q.choices.map((c: any) => ({
          id: c.id || "",
          text: c.text || "",
        }));
      } else if (q.options && Array.isArray(q.options)) {
        options = q.options.map((opt: string, idx: number) => ({
          id: String.fromCharCode(97 + idx), // a, b, c, d
          text: opt,
        }));
      }

      return {
        question: q.question,
        options: options,
        correct_answer: correctAnswerIndex,
        domain: normalizeDomain(q.domain || domain, q.module),
        difficulty: (q.difficulty || "intermediate").toLowerCase(),
        category: q.category || q.domain || "GENERAL",
        explanation: q.explanation || "",
        tags: q.tags || [],
      };
    });

    // Batch insert (not upsert since we don't have IDs)
    const { data, error } = await supabase
      .from("questions")
      .insert(dbQuestions)
      .select();

    if (error) {
      console.error(`   ❌ Error importing: ${error.message}`);
      totalSkipped += questions.length;
    } else {
      const imported = data?.length || questions.length;
      console.log(`   ✅ Imported ${imported} questions`);
      totalImported += imported;
    }
  }

  console.log("\n📊 Import Summary:");
  console.log(`   ✅ Successfully imported: ${totalImported} questions`);
  console.log(`   ⚠️  Skipped/Failed: ${totalSkipped} questions`);
  console.log(`   📝 Total processed: ${totalImported + totalSkipped} questions`);

  // Verify import
  const { count, error: countError } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true });

  if (!countError) {
    console.log(`\n✅ Database verification: ${count} total questions in database`);
  }
}

importQuestions().catch(console.error);
