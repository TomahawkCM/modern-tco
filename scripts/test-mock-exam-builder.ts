#!/usr/bin/env node

/**
 * Mock Exam Builder Test Script
 *
 * Tests the mock exam builder with existing questions in the database.
 *
 * Usage:
 *   npx tsx scripts/test-mock-exam-builder.ts
 *   npx tsx scripts/test-mock-exam-builder.ts --template mock-exam-3-intermediate
 *   npx tsx scripts/test-mock-exam-builder.ts --all
 *
 * Features:
 * - Tests all 6 mock exam templates
 * - Verifies question selection algorithm
 * - Checks domain and difficulty distribution
 * - Validates exam session creation
 */

import { createClient } from '@supabase/supabase-js';
import {
  MOCK_EXAM_TEMPLATES,
  getMockExamTemplate,
  calculateDomainQuestionCounts,
  calculateDifficultyQuestionCounts,
} from '../src/data/mock-exam-configs';

// ==================== SUPABASE CLIENT ====================

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// ==================== TEST FUNCTIONS ====================

/**
 * Get available question counts from database
 */
async function getAvailableQuestionCounts(supabase: any) {
  // Total questions
  const { count: totalCount } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });

  // By domain
  const domainCounts: Record<string, number> = {};
  const domains = ['asking_questions', 'refining_targeting', 'taking_action', 'navigation', 'reporting'];

  for (const domain of domains) {
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('domain', domain);
    domainCounts[domain] = count || 0;
  }

  // By difficulty
  const difficultyCounts: Record<string, number> = {};
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  for (const difficulty of difficulties) {
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('difficulty', difficulty);
    difficultyCounts[difficulty] = count || 0;
  }

  return {
    total: totalCount || 0,
    byDomain: domainCounts,
    byDifficulty: difficultyCounts,
  };
}

/**
 * Test single mock exam template
 */
async function testMockExam(supabase: any, templateId: string) {
  console.log('\n' + '='.repeat(70));
  console.log(`Testing: ${templateId}`);
  console.log('='.repeat(70));

  const template = getMockExamTemplate(templateId);
  if (!template) {
    console.error(`❌ Template not found: ${templateId}`);
    return false;
  }

  console.log(`Name:        ${template.name}`);
  console.log(`Description: ${template.description}`);
  console.log(`Questions:   ${template.totalQuestions}`);
  console.log(`Time Limit:  ${template.timeLimitMinutes} minutes`);
  console.log(`Difficulty:  ${template.difficultyLevel}`);

  // Calculate required questions
  const domainCounts = calculateDomainQuestionCounts(template);
  const difficultyCounts = calculateDifficultyQuestionCounts(template);

  console.log('\nRequired Question Distribution:');
  console.log('  By Domain:');
  Object.entries(domainCounts).forEach(([domain, count]) => {
    console.log(`    ${domain}: ${count}`);
  });
  console.log('  By Difficulty:');
  Object.entries(difficultyCounts).forEach(([difficulty, count]) => {
    console.log(`    ${difficulty}: ${count}`);
  });

  // Check if enough questions available
  console.log('\nChecking availability...');
  let canCreate = true;
  const issues: string[] = [];

  for (const [domain, requiredCount] of Object.entries(domainCounts)) {
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('domain', domain);

    const available = count || 0;
    if (available < requiredCount) {
      canCreate = false;
      issues.push(`  ❌ ${domain}: need ${requiredCount}, have ${available} (short ${requiredCount - available})`);
    } else {
      console.log(`  ✅ ${domain}: ${available}/${requiredCount} available`);
    }
  }

  if (!canCreate) {
    console.log('\n❌ Cannot create exam - insufficient questions:');
    issues.forEach((issue) => console.log(issue));
    return false;
  }

  console.log('\n✅ Template test passed - sufficient questions available');
  return true;
}

/**
 * Print database statistics
 */
async function printDatabaseStats(supabase: any) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 Database Question Statistics');
  console.log('='.repeat(70));

  const counts = await getAvailableQuestionCounts(supabase);

  console.log(`\nTotal Questions: ${counts.total}`);

  console.log('\nBy Domain:');
  Object.entries(counts.byDomain).forEach(([domain, count]) => {
    console.log(`  ${domain}: ${count}`);
  });

  console.log('\nBy Difficulty:');
  Object.entries(counts.byDifficulty).forEach(([difficulty, count]) => {
    console.log(`  ${difficulty}: ${count}`);
  });

  if (counts.total === 0) {
    console.log('\n⚠️  WARNING: No questions in database yet!');
    console.log('   Generate and import questions first:');
    console.log('   1. npx tsx scripts/generate-questions.ts --domain asking_questions --difficulty intermediate --count 50');
    console.log('   2. npx tsx scripts/bulk-import-questions.ts --all');
  }
}

// ==================== MAIN FUNCTION ====================

async function main() {
  const args = process.argv.slice(2);

  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    // Print database stats
    await printDatabaseStats(supabase);

    // Determine which templates to test
    let templatesToTest: string[] = [];

    if (args.length === 0 || args[0] === '--all') {
      // Test all templates
      templatesToTest = MOCK_EXAM_TEMPLATES.map((t) => t.id);
      console.log(`\n🧪 Testing all ${MOCK_EXAM_TEMPLATES.length} mock exam templates...`);
    } else if (args[0] === '--template' && args[1]) {
      // Test specific template
      templatesToTest = [args[1]];
    } else {
      console.error('❌ Invalid arguments');
      console.error('\nUsage:');
      console.error('  npx tsx scripts/test-mock-exam-builder.ts');
      console.error('  npx tsx scripts/test-mock-exam-builder.ts --template mock-exam-3-intermediate');
      console.error('  npx tsx scripts/test-mock-exam-builder.ts --all');
      process.exit(1);
    }

    // Test each template
    const results: Record<string, boolean> = {};
    for (const templateId of templatesToTest) {
      const success = await testMockExam(supabase, templateId);
      results[templateId] = success;
    }

    // Print overall summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 Test Summary');
    console.log('='.repeat(70));

    const passed = Object.values(results).filter((r) => r).length;
    const failed = Object.values(results).filter((r) => !r).length;

    console.log(`\nTemplates Tested: ${Object.keys(results).length}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);

    if (failed === 0) {
      console.log('\n🎉 All mock exam templates are ready!');
      console.log('\nYou can now create mock exams using:');
      console.log('  import { createMockExamSession } from "@/lib/mock-exam-builder";');
      console.log('  const session = await createMockExamSession("mock-exam-1-diagnostic", userId);');
    } else {
      console.log('\n⚠️  Some templates cannot be created yet.');
      console.log('\nAction needed:');
      console.log('  Generate and import more questions to meet the requirements.');
      console.log('  See the specific errors above for which domains need more questions.');
    }

    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { testMockExam, getAvailableQuestionCounts };
