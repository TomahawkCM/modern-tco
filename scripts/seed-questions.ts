#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
// Load env from .env.local if present, else .env
const envLocal = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal }); else dotenv.config();
import { Difficulty, QuestionCategory, TCODomain, type Question } from "@/types/exam";
import { supabaseAdmin } from "@/lib/supabase";

type DomainPlan = { domain: TCODomain; count: number; topics: string[] };

const PLAN: DomainPlan[] = [
  { domain: TCODomain.ASKING_QUESTIONS, count: 48, topics: [
    "Sensors", "Natural Language Questions", "Question Builder", "Parameterized Questions", "Result Interpretation", "Performance"
  ] },
  { domain: TCODomain.REFINING_TARGETING, count: 51, topics: [
    "Dynamic Computer Groups", "Filters AND/OR/NOT", "RBAC Targeting", "Drill-down", "Complex Criteria", "Optimization"
  ] },
  { domain: TCODomain.TAKING_ACTION, count: 33, topics: [
    "Packages", "Approvals", "Maintenance Windows", "Pilot Groups", "Rollback", "Monitoring"
  ] },
  { domain: TCODomain.NAVIGATION_MODULES, count: 51, topics: [
    "Console Navigation", "Module Workflows", "Dashboards", "Roles & Permissions", "Troubleshooting", "Integration"
  ] },
  { domain: TCODomain.REPORTING_EXPORT, count: 37, topics: [
    "Report Formats", "Scheduling", "Data Integrity", "Distribution", "Performance", "Compliance"
  ] },
];

const DIFFS: Difficulty[] = [Difficulty.BEGINNER, Difficulty.INTERMEDIATE, Difficulty.ADVANCED];
const CATS: QuestionCategory[] = [
  QuestionCategory.PLATFORM_FUNDAMENTALS,
  QuestionCategory.CONSOLE_PROCEDURES,
  QuestionCategory.PRACTICAL_SCENARIOS,
  QuestionCategory.TROUBLESHOOTING,
];

function buildQuestion(idx: number, domain: TCODomain, topic: string): Omit<Question, "id"> {
  const difficulty = DIFFS[idx % DIFFS.length];
  const category = CATS[idx % CATS.length];
  const stem = `In Tanium (${topic}), which choice best follows official TCO guidance for ${domain.toLowerCase()}?`;
  const choices = [
    { id: "a", text: `Apply ${topic} without validation across all endpoints` },
    { id: "b", text: `Use ${topic} with scoped targeting, validation, and monitoring per best practices` },
    { id: "c", text: `Ignore ${topic} in production environments` },
    { id: "d", text: `Rely on ad hoc manual steps instead of ${topic}` },
  ];
  const explanation = `TCO best practice is to use structured, validated workflows. ${topic} should be applied with appropriate targeting, validation, and monitoring to ensure safe and effective operations aligned to the TCO exam.`;
  return {
    question: stem,
    choices,
    correctAnswerId: "b",
    domain,
    difficulty,
    category,
    explanation,
    tags: ["TCO", topic.toLowerCase().replace(/\s+/g, '-')],
  };
}

async function seed() {
  if (!supabaseAdmin) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY not set. Seeding requires service role to bypass RLS.");
    process.exit(1);
  }
  let created = 0;
  for (const plan of PLAN) {
    for (let i = 0; i < plan.count; i++) {
      const topic = plan.topics[i % plan.topics.length];
      const q = buildQuestion(i, plan.domain, topic);
      try {
        // Map to DB shape minimally to reduce schema coupling
        const choiceMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
        const diffMap: Record<string, string> = {
          [Difficulty.BEGINNER]: "beginner",
          [Difficulty.INTERMEDIATE]: "intermediate",
          [Difficulty.ADVANCED]: "advanced",
          [Difficulty.EXPERT]: "expert",
        } as any;
        const catMap: Record<QuestionCategory, string> = {
          [QuestionCategory.PLATFORM_FUNDAMENTALS]: "PLATFORM_FUNDAMENTALS",
          [QuestionCategory.CONSOLE_PROCEDURES]: "CONSOLE_PROCEDURES",
          [QuestionCategory.PRACTICAL_SCENARIOS]: "PRACTICAL_SCENARIOS",
          [QuestionCategory.TROUBLESHOOTING]: "TROUBLESHOOTING",
          [QuestionCategory.LINEAR_CHAIN]: "LINEAR_CHAIN",
        } as any;

        const payload: any = {
          question: q.question,
          options: q.choices,
          correct_answer: choiceMap[(q.correctAnswerId || 'a').toLowerCase()] ?? 0,
          // Use UI string values for domain to satisfy domain check constraint
          domain: q.domain,
          difficulty: diffMap[q.difficulty] ?? "intermediate",
          category: catMap[q.category] ?? "PLATFORM_FUNDAMENTALS",
          explanation: q.explanation || null,
          tags: q.tags || [],
        };

        const { error } = await (supabaseAdmin as any)
          .from("questions")
          .insert(payload);
        if (error) throw new Error(error.message);
        created++;
        if (created % 25 === 0) console.log(`Inserted ${created} questions...`);
      } catch (e: any) {
        console.warn(`Skip insert due to error: ${e?.message || e}`);
      }
    }
  }
  console.log(`✅ Seed complete. Insert attempts: ${PLAN.reduce((a,b)=>a+b.count,0)}, created: ${created}`);
}

seed().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
