#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
// Load env from .env.local if present, else .env
const envLocal = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal }); else dotenv.config();
import { questionService } from "@/lib/questionService";

async function main() {
  const stats = await questionService.getQuestionStats();
  const { totalQuestions, domainDistribution, difficultyDistribution, categoryDistribution } = stats;

  console.log("Question Bank Summary");
  console.log("======================");
  console.log(`Total Questions: ${totalQuestions}`);
  console.log("\nBy Domain:");
  for (const [k, v] of Object.entries(domainDistribution)) {
    console.log(`- ${k}: ${v}`);
  }
  console.log("\nBy Difficulty:");
  for (const [k, v] of Object.entries(difficultyDistribution)) {
    console.log(`- ${k}: ${v}`);
  }
  console.log("\nBy Category:");
  for (const [k, v] of Object.entries(categoryDistribution)) {
    console.log(`- ${k}: ${v}`);
  }

  // Machine-readable output as JSON for pipelines
  console.log("\nJSON:");
  console.log(JSON.stringify(stats, null, 2));
}

main();
