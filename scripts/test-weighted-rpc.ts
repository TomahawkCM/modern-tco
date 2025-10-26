#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
// Load env from .env.local if present
const envLocal = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal });
else dotenv.config();

import { questionService } from "@/lib/questionService";

async function main() {
  const count = Number(process.argv[2] || 105);
  console.log(`Requesting ${count} weighted questions via RPC...`);
  const qs = await questionService.getWeightedRandomQuestions(count);
  console.log(`Received: ${qs.length}`);
  const byDomain = new Map<string, number>();
  for (const q of qs) {
    byDomain.set(q.domain as string, (byDomain.get(q.domain as string) || 0) + 1);
  }
  console.log("Domain breakdown:");
  for (const [k, v] of byDomain.entries()) {
    console.log(`- ${k}: ${v}`);
  }
}

main().catch((e) => {
  console.error('RPC test failed:', e?.message || e);
  process.exit(1);
});

