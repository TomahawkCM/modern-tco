#!/usr/bin/env tsx
/**
 * Link relationships between modules and questions using domain/mdx_id
 * - Sets questions.module_id where domain matches study_modules.domain
 * - Optionally logs any unmatched domains
 */
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

function assertEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function main() {
  const url = assertEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = assertEnv('SUPABASE_SERVICE_ROLE_KEY');
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  console.log('🔗 Linking questions to modules...');
  // Detect if questions.module_id exists
  let hasModuleId = true;
  try {
    const t = await admin.from('questions').select('module_id').limit(1);
    if (t.error) hasModuleId = false;
  } catch {
    hasModuleId = false;
  }
  if (!hasModuleId) {
    console.log('ℹ️  questions.module_id column not found. Skipping link step.');
    return;
  }
  // Load modules
  const { data: modules, error: modErr } = await admin
    .from('study_modules')
    .select('id, domain, title');
  if (modErr) throw new Error(`Failed to load modules: ${modErr.message}`);
  const domainToModule: Record<string, string> = {};
  for (const m of modules || []) {
    const key = (m.domain || '').toString().trim().toLowerCase();
    if (key) domainToModule[key] = m.id as string;
  }

  // Fetch questions missing module_id
  const { data: questions, error: qErr } = await admin
    .from('questions')
    .select('id, domain, category, module_id')
    .is('module_id', null);
  if (qErr) throw new Error(`Failed to load questions: ${qErr.message}`);

  let updated = 0;
  let unmatched = 0;
  for (const q of questions || []) {
    const raw = ((q.domain as string) || (q.category as string) || '').toString();
    const key = normalizeDomain(raw);
    const modId = domainToModule[key];
    if (!modId) {
      unmatched++;
      continue;
    }
    const { error: updErr } = await admin
      .from('questions')
      .update({ module_id: modId })
      .eq('id', q.id);
    if (updErr) {
      console.warn(`⚠️  Failed to link question ${q.id}: ${updErr.message}`);
      continue;
    }
    updated++;
  }

  console.log(`✅ Linked ${updated} questions to modules`);
  if (unmatched > 0) console.log(`⚠️  ${unmatched} questions did not match a module domain`);
}

function normalizeDomain(input: string): string {
  const s = (input || '').toString().trim().toLowerCase();
  if (!s) return '';
  // Canonical keys are based on study_modules.domain lowercased
  const map: Record<string, string> = {
    // Asking Questions
    'asking questions': 'asking questions',
    'asking_questions': 'asking questions',
    'domain1': 'asking questions',
    // Refining Questions & Targeting
    'refining questions & targeting': 'refining questions & targeting',
    'refining questions and targeting': 'refining questions & targeting',
    'refining questions': 'refining questions & targeting',
    'refining_questions': 'refining questions & targeting',
    'refining-targeting': 'refining questions & targeting',
    'domain2': 'refining questions & targeting',
    // Taking Action
    'taking action': 'taking action',
    'taking action — packages & actions': 'taking action',
    'taking action - packages & actions': 'taking action',
    'taking action - packages and actions': 'taking action',
    'taking_action': 'taking action',
    'domain3': 'taking action',
    // Navigation → use DB key when present in modules
    'navigation & basic module functions': 'navigation_modules',
    'navigation and basic module functions': 'navigation_modules',
    'navigation_basic_modules': 'navigation_modules',
    'navigation modules': 'navigation_modules',
    'domain4': 'navigation_modules',
    // Reporting → use DB key when present in modules
    'reporting & data export': 'reporting_export',
    'report generation and data export': 'reporting_export',
    'report generation & data export': 'reporting_export',
    'reporting_data_export': 'reporting_export',
    'domain5': 'reporting_export',
    // Foundation
    'platform_foundation': 'platform_foundation',
    'tanium platform foundation': 'platform_foundation',
    'foundation': 'platform_foundation',
    'fundamentals': 'platform_foundation',
  };
  if (map[s]) return map[s];
  // Normalize common punctuation/whitespace
  const compact = s.replace(/\s*&\s*/g, ' & ').replace(/\s+/g, ' ').trim();
  if (map[compact]) return map[compact];
  return s;
}

main().catch((e) => {
  console.error('Linking failed:', e?.message || e);
  process.exit(1);
});
