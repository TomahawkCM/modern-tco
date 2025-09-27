#!/usr/bin/env tsx

/**
 * Enhanced module seeding script with flags support
 *
 * Seed study_modules and study_sections from MDX files in src/content/modules.
 *
 * Flags:
 * --dry-run              - Preview what would be done without making changes
 * --replace-domain=NAME  - Only process modules matching the specified domain
 * --verbose              - Show detailed output
 * --help                 - Show help message
 *
 * Examples:
 * npm run content:seed:modules -- --dry-run
 * npm run content:seed:modules -- --replace-domain="Asking Questions"
 * npm run content:seed:modules -- --replace-domain="Taking Action" --dry-run
 *
 * Requirements:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (server key)
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';
import { parseArgs } from 'node:util';

// Terminal colors for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

type Section = {
  title: string;
  content: string;
  order: number;
  type: 'overview' | 'learning_objectives' | 'procedures' | 'troubleshooting' | 'exam_prep' | 'references';
  estimated?: number;
  keyPoints?: string[];
};

type CLIOptions = {
  dryRun: boolean;
  replaceDomain?: string;
  verbose: boolean;
  help: boolean;
};

function printHelp(): void {
  console.log(`
${colors.bright}Enhanced Module Seeding Script${colors.reset}

${colors.cyan}Usage:${colors.reset}
  npm run content:seed:modules -- [options]

${colors.cyan}Options:${colors.reset}
  --dry-run              Preview changes without modifying the database
  --replace-domain=NAME  Only process modules matching the specified domain
  --verbose              Show detailed output for each operation
  --help                 Show this help message

${colors.cyan}Examples:${colors.reset}
  # Preview all changes
  npm run content:seed:modules -- --dry-run

  # Replace only modules in "Asking Questions" domain
  npm run content:seed:modules -- --replace-domain="Asking Questions"

  # Preview changes for a specific domain with verbose output
  npm run content:seed:modules -- --replace-domain="Taking Action" --dry-run --verbose

${colors.cyan}Available Domains:${colors.reset}
  - Asking Questions
  - Refining Questions & Targeting
  - Taking Action
  - Navigation and Basic Module Functions
  - Report Generation and Data Export

${colors.dim}Note: Domain names are case-sensitive${colors.reset}
  `);
}

function parseCliArgs(): CLIOptions {
  const { values } = parseArgs({
    options: {
      'dry-run': {
        type: 'boolean',
        default: false,
      },
      'replace-domain': {
        type: 'string',
      },
      'verbose': {
        type: 'boolean',
        default: false,
      },
      'help': {
        type: 'boolean',
        default: false,
      },
    },
    strict: false,
    allowPositionals: true,
  });

  return {
    dryRun: values['dry-run'] || false,
    replaceDomain: values['replace-domain'],
    verbose: values['verbose'] || false,
    help: values['help'] || false,
  };
}

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

function formatDomain(domain: string): string {
  // Map common domain variations to standard names
  const domainMap: Record<string, string> = {
    'asking-questions': 'Asking Questions',
    'asking_questions': 'Asking Questions',
    'refining-questions': 'Refining Questions & Targeting',
    'refining_questions': 'Refining Questions & Targeting',
    'taking-action': 'Taking Action',
    'taking_action': 'Taking Action',
    'navigation': 'Navigation and Basic Module Functions',
    'navigation-and-basic-module-functions': 'Navigation and Basic Module Functions',
    'report-generation': 'Report Generation and Data Export',
    'report_generation': 'Report Generation and Data Export',
  };

  const normalized = domain.toLowerCase().replace(/[_\s]+/g, '-');
  return domainMap[normalized] || domain;
}

async function main() {
  const options = parseCliArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  console.log(`${colors.bright}🚀 Enhanced Module Seeding Script${colors.reset}\n`);

  if (options.dryRun) {
    console.log(`${colors.yellow}⚠️  DRY RUN MODE - No changes will be made${colors.reset}`);
  }

  if (options.replaceDomain) {
    console.log(`${colors.cyan}🎯 Targeting domain: ${colors.bright}${options.replaceDomain}${colors.reset}`);
  }

  if (options.verbose) {
    console.log(`${colors.dim}📝 Verbose mode enabled${colors.reset}`);
  }

  const supabaseUrl = assertEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = assertEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl, serviceKey);

  const dir = path.join(process.cwd(), 'src', 'content', 'modules');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));

  if (files.length === 0) {
    console.log(`${colors.red}No MDX files found under src/content/modules${colors.reset}`);
    return;
  }

  console.log(`\n${colors.green}✓${colors.reset} Found ${colors.bright}${files.length}${colors.reset} MDX files.\n`);

  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const f of files) {
    const full = path.join(dir, f);
    const raw = fs.readFileSync(full, 'utf8');
    const { data: fm, content } = matter(raw);

    const id: string = String(fm.id || '').trim();
    const title: string = String(fm.title || path.basename(f, '.mdx'));
    const rawDomain: string = String(fm.domainEnum || fm.domainSlug || fm.domain || 'unknown');
    const domain = formatDomain(rawDomain);

    // Check if we should process this module
    if (options.replaceDomain && domain !== options.replaceDomain) {
      if (options.verbose) {
        console.log(`${colors.dim}⏭️  Skipping ${f}: domain "${domain}" doesn't match filter${colors.reset}`);
      }
      skippedCount++;
      continue;
    }

    const description: string | null = fm.description ? String(fm.description) : null;
    const weightRaw = typeof fm.blueprintWeight === 'number' ? fm.blueprintWeight : undefined;
    const examWeight = weightRaw && weightRaw <= 1 ? Math.round(weightRaw * 100) : weightRaw || 0;
    const est = parseEstimatedMinutes(fm.estimatedTime);
    const learningObjectives: string[] = Array.isArray(fm.learningObjectives)
      ? fm.learningObjectives
      : (Array.isArray(fm.objectives) ? fm.objectives : []);
    const version = String(fm.version || '1');

    if (!id) {
      console.warn(`${colors.yellow}⚠️  Skipping ${f}: missing id in frontmatter${colors.reset}`);
      skippedCount++;
      continue;
    }

    console.log(`\n${colors.cyan}📦 Processing module:${colors.reset} ${colors.bright}${id}${colors.reset} (${title})`);
    console.log(`   ${colors.dim}Domain: ${domain}${colors.reset}`);

    if (options.verbose) {
      console.log(`   ${colors.dim}Description: ${description || 'None'}${colors.reset}`);
      console.log(`   ${colors.dim}Exam Weight: ${examWeight}%${colors.reset}`);
      console.log(`   ${colors.dim}Estimated Time: ${est ? `${est} minutes` : 'Not specified'}${colors.reset}`);
      console.log(`   ${colors.dim}Learning Objectives: ${learningObjectives.length}${colors.reset}`);
    }

    if (options.dryRun) {
      console.log(`   ${colors.yellow}[DRY RUN] Would upsert module${colors.reset}`);

      const sections = parseSections(content);
      if (sections.length > 0) {
        console.log(`   ${colors.yellow}[DRY RUN] Would delete existing sections for module ${id}${colors.reset}`);
        console.log(`   ${colors.yellow}[DRY RUN] Would insert ${sections.length} sections${colors.reset}`);

        if (options.verbose) {
          sections.forEach((s, i) => {
            console.log(`     ${colors.dim}Section ${i + 1}: ${s.title}${colors.reset}`);
          });
        }
      }

      processedCount++;
      continue;
    }

    // Actually perform the database operations
    try {
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

      const { data: mod, error: modErr } = await supabase
        .from('study_modules')
        .upsert(upsertModule, { onConflict: 'id' })
        .select('*')
        .single();

      if (modErr) {
        console.error(`   ${colors.red}❌ Upsert failed: ${modErr.message}${colors.reset}`);
        errorCount++;
        continue;
      }

      console.log(`   ${colors.green}✅ Module upserted successfully${colors.reset}`);

      // Clear existing sections for this module id to avoid duplication
      const { error: deleteErr } = await supabase
        .from('study_sections')
        .delete()
        .eq('module_id', id);

      if (deleteErr && options.verbose) {
        console.warn(`   ${colors.yellow}⚠️  Warning deleting sections: ${deleteErr.message}${colors.reset}`);
      }

      const sections = parseSections(content);
      if (sections.length === 0) {
        console.log(`   ${colors.dim}(no sections found)${colors.reset}`);
        processedCount++;
        continue;
      }

      const rows = sections.map((s) => ({
        module_id: id,
        title: s.title,
        content: s.content,
        section_type: s.type,
        order_index: s.order,
        estimated_time_minutes: s.estimated ?? null,
        key_points: s.keyPoints || [],
        procedures: [],
        troubleshooting: [],
        references: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data: inserted, error: secErr } = await supabase
        .from('study_sections')
        .insert(rows)
        .select('id');

      if (secErr) {
        console.error(`   ${colors.red}❌ Sections insert failed: ${secErr.message}${colors.reset}`);
        errorCount++;
      } else {
        console.log(`   ${colors.green}✅ Inserted ${inserted?.length || 0} sections${colors.reset}`);
        processedCount++;
      }

    } catch (error) {
      console.error(`   ${colors.red}❌ Unexpected error: ${error}${colors.reset}`);
      errorCount++;
    }
  }

  // Summary
  console.log(`\n${colors.bright}📊 Summary:${colors.reset}`);
  console.log(`   ${colors.green}✅ Processed: ${processedCount} modules${colors.reset}`);

  if (skippedCount > 0) {
    console.log(`   ${colors.yellow}⏭️  Skipped: ${skippedCount} modules${colors.reset}`);
  }

  if (errorCount > 0) {
    console.log(`   ${colors.red}❌ Errors: ${errorCount} modules${colors.reset}`);
  }

  if (options.dryRun) {
    console.log(`\n${colors.yellow}ℹ️  This was a dry run. To apply changes, run without --dry-run flag${colors.reset}`);
  }

  console.log(`\n${colors.green}✨ Done!${colors.reset}\n`);
}

main().catch((e) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, e);
  process.exit(1);
});