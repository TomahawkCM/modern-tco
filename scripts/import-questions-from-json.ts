#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { supabaseAdmin } from '@/lib/supabase';

// Load env
const envLocal = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal }); else dotenv.config();

type JsonBank = {
  meta?: any;
  questions: Array<{
    id?: string;
    module?: string;
    domain?: string;
    question: string;
    options: Array<string> | Array<{ id?: string; text: string }>;
    correctAnswer?: number | string; // index or letter
    difficulty?: string;
    explanation?: string;
    tags?: string[];
    weight?: number;
  }>;
};

function toChoices(opts: any[]): Array<{ id: string; text: string }> {
  if (!Array.isArray(opts)) return [];
  if (opts.length > 0 && typeof opts[0] === 'object' && 'text' in (opts[0] as any)) {
    // Already in shape
    return (opts as any[]).map((o, i) => ({ id: ['a','b','c','d'][i] || String(i), text: (o as any).text }));
  }
  return (opts as string[]).map((t, i) => ({ id: ['a','b','c','d'][i] || String(i), text: t }));
}

function toCorrectId(val: any, optionsLen: number): string {
  const map = ['a','b','c','d'];
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    if (['a','b','c','d'].includes(s)) return s;
    const n = Number(s);
    if (Number.isFinite(n)) {
      if (n >= 0 && n < optionsLen) return map[n] || 'a';
      if (n >= 1 && n <= optionsLen) return map[n-1] || 'a';
    }
    return 'a';
  }
  if (typeof val === 'number') {
    if (val >= 0 && val < optionsLen) return map[val] || 'a';
    if (val >= 1 && val <= optionsLen) return map[val-1] || 'a';
  }
  return 'a';
}

function mapModuleToDomain(moduleName?: string): string {
  const s = (moduleName || '').toLowerCase();
  if (s.includes('asking')) return 'Asking Questions';
  if (s.includes('refining')) return 'Refining Questions & Targeting';
  if (s.includes('taking')) return 'Taking Action';
  if (s.includes('navigation')) return 'Navigation and Basic Module Functions';
  if (s.includes('report')) return 'Report Generation and Data Export';
  if (s.includes('foundation')) return 'Fundamentals';
  return 'Fundamentals';
}

function normDifficulty(d?: string): string {
  const s = (d || '').toLowerCase();
  if (['beginner','intermediate','advanced','expert'].includes(s)) return s;
  return 'intermediate';
}

async function main() {
  const file = process.argv[2] || 'src/content/questions/comprehensive-assessment-bank.json';
  if (!fs.existsSync(file)) {
    console.error(`JSON not found: ${file}`);
    process.exit(1);
  }
  if (!supabaseAdmin) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY; cannot import');
    process.exit(1);
  }
  const raw = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(raw) as JsonBank;
  const questions = data.questions || [];
  console.log(`Importing ${questions.length} questions from ${path.relative(process.cwd(), file)}...`);

  let upserted = 0;
  for (const q of questions) {
    try {
      const choices = toChoices(q.options || []);
      const correct = toCorrectId(q.correctAnswer, choices.length);
      const domain = mapModuleToDomain(q.module);
      const payload: any = {
        question: q.question,
        options: choices,
        correct_answer: ['a','b','c','d'].indexOf(correct), // store as 0..3 if schema uses int
        domain,
        difficulty: normDifficulty(q.difficulty),
        category: 'PLATFORM_FUNDAMENTALS',
        explanation: q.explanation || null,
        tags: q.tags || [],
      };
      const { error } = await (supabaseAdmin as any)
        .from('questions')
        .upsert(payload, { onConflict: 'id' });
      if (error) throw new Error(error.message);
      upserted++;
      if (upserted % 25 === 0) console.log(`Upserted ${upserted}...`);
    } catch (e: any) {
      console.warn(`Skip ${q.id || '(no-id)'}: ${e?.message || e}`);
    }
  }
  console.log(`✅ Import complete. Upserted: ${upserted}/${questions.length}`);
}

main().catch((e) => {
  console.error('Import failed:', e?.message || e);
  process.exit(1);
});
