#!/usr/bin/env tsx

/**
 * Seed study_modules and study_sections from MDX files in src/content/modules.
 *
 * - Uses gray-matter to read frontmatter
 * - Parses sections with simple markdown heuristics (## = section, ### = subsection)
 * - Upserts study_modules by frontmatter.id
 * - Inserts sections ordered by appearance
 *
 * Requirements:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (server key)
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';

type Section = {
  title: string;
  content: string;
  order: number;
  type: 'overview' | 'learning_objectives' | 'procedures' | 'troubleshooting' | 'exam_prep' | 'references';
  estimated?: number;
  keyPoints?: string[];
};

function assertEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function parseEstimatedMinutes(s?: string | null): number | undefined {
  if (!s) return undefined;
  const m = String(s).trim().toLowerCase();
  // 45 min, 90 minutes, 3 hours, 3.5 hours, 3h
  const minMatch = m.match(/^(\d+(?:\.\d+)?)\s*(min|minutes|m)$/);
  if (minMatch) return Math.round(parseFloat(minMatch[1]));
  const hrMatch = m.match(/^(\d+(?:\.\d+)?)\s*(hour|hours|h)$/);
  if (hrMatch) return Math.round(parseFloat(hrMatch[1]) * 60);
  return undefined;
}

function parseSections(markdown: string): Section[] {
  const lines = markdown.split(/\r?\n/);
  const sections: Section[] = [];
  let current: Section | null = null;

  const flush = () => {
    if (current) {
      current.content = current.content.trim() + '\n';
      sections.push(current);
      current = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('## ') || line.startsWith('# ')) {
      flush();
      let title = line.replace(/^#{1,2}\s+/, '').trim();
      let estimated: number | undefined = undefined;
      // Extract estimated time in heading like "(45 minutes)" or "(3 hours)"
      const m = title.match(/\(([^)]+)\)\s*$/);
      if (m) {
        const mins = parseEstimatedMinutes(m[1]);
        if (typeof mins === 'number' && mins > 0) estimated = mins;
        // Store title without the trailing estimate parentheses
        title = title.replace(/\s*\([^)]*\)\s*$/, '').trim();
      }
      current = { title, content: '', order: sections.length + 1, type: 'overview', estimated };
      continue;
    }
    if (!current) {
      // Skip text before first section header
      continue;
    }
    current.content += raw + '\n';
  }
  flush();
  return sections;
}

async function main() {
  const supabaseUrl = assertEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = assertEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl, serviceKey);

  const dir = path.join(process.cwd(), 'src', 'content', 'modules');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));
  if (files.length === 0) {
    console.log('No MDX files found under src/content/modules');
    return;
  }

  console.log(`Found ${files.length} MDX files.`);
  for (const f of files) {
    const full = path.join(dir, f);
    const raw = fs.readFileSync(full, 'utf8');
    const { data: fm, content } = matter(raw);

    const id: string = String(fm.id || '').trim();
    const title: string = String(fm.title || path.basename(f, '.mdx'));
    const domain: string = String(fm.domainEnum || fm.domainSlug || 'unknown');
    const description: string | null = fm.description ? String(fm.description) : null;
    const weightRaw = typeof fm.blueprintWeight === 'number' ? fm.blueprintWeight : undefined;
    const examWeight = weightRaw && weightRaw <= 1 ? Math.round(weightRaw * 100) : weightRaw || 0;
    const est = parseEstimatedMinutes(fm.estimatedTime);
    const learningObjectives: string[] = Array.isArray(fm.learningObjectives) ? fm.learningObjectives : (Array.isArray(fm.objectives) ? fm.objectives : []);
    const version = String(fm.version || '1');

    if (!id) {
      console.warn(`Skipping ${f}: missing id in frontmatter`);
      continue;
    }

    console.log(`\nUpserting module: ${id} (${title})`);
    const upsertModule: any = {
      id,
      domain,
      title,
      description,
      exam_weight: examWeight,
      estimated_time_minutes: est ?? null,
      learning_objectives: learningObjectives,
      references: [],
      exam_prep: [],
      version,
      updated_at: new Date().toISOString(),
    };

    const { data: mod, error: modErr } = await supabase.from('study_modules').upsert(upsertModule, { onConflict: 'id' }).select('*').single();
    if (modErr) {
      console.error(`  ❌ Upsert failed: ${modErr.message}`);
      continue;
    }
    console.log(`  ✅ Module upserted: ${mod.id}`);

    // Clear existing sections for this module id to avoid duplication
    await supabase.from('study_sections').delete().eq('module_id', id);

    const sections = parseSections(content);
    if (sections.length === 0) {
      console.log('  (no sections found)');
      continue;
    }

    const rows = sections.map((s) => ({
      module_id: id,
      title: s.title,
      content: s.content,
      section_type: s.type,
      order_index: s.order,
      estimated_time_minutes: null,
      key_points: s.keyPoints || [],
      procedures: [],
      troubleshooting: [],
      references: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data: inserted, error: secErr } = await supabase.from('study_sections').insert(rows).select('id');
    if (secErr) {
      console.error(`  ❌ Sections insert failed: ${secErr.message}`);
    } else {
      console.log(`  ✅ Inserted ${inserted?.length || 0} sections`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
