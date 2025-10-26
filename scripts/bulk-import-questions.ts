#!/usr/bin/env node

/**
 * Bulk Question Import Tool
 *
 * Imports AI-generated questions into the Supabase database.
 *
 * Usage:
 *   npx tsx scripts/bulk-import-questions.ts <file-path>
 *   npx tsx scripts/bulk-import-questions.ts src/data/generated/generated-questions-*.ts
 *   npx tsx scripts/bulk-import-questions.ts --all
 *
 * Features:
 * - Validates questions before import
 * - Checks for duplicates
 * - Logs all imports to content_import_logs
 * - Detailed error reporting
 * - Rollback on failure
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

// ==================== TYPES ====================

interface Question {
  id: string;
  question: string;
  choices: Array<{ id: string; text: string }>;
  correctAnswerId: string;
  domain: string;
  difficulty: string;
  category: string;
  explanation: string;
  tags: string[];
  studyGuideRef?: string;
  officialRef?: string;
}

interface ImportResult {
  success: boolean;
  totalItems: number;
  successfulItems: number;
  failedItems: number;
  importedIds: string[];
  errors: Array<{ index: number; error: string }>;
  duplicates: string[];
}

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

// ==================== IMPORT FUNCTIONS ====================

/**
 * Load questions from TypeScript file
 */
async function loadQuestionsFromFile(filePath: string): Promise<Question[]> {
  console.log(`📂 Loading questions from: ${filePath}`);

  // Dynamically import the TypeScript file
  const module = await import(path.resolve(filePath));
  const questions = module.generatedQuestions || module.default;

  if (!Array.isArray(questions)) {
    throw new Error('File does not export a valid questions array');
  }

  console.log(`   Found ${questions.length} questions`);
  return questions;
}

/**
 * Check for duplicate question IDs in database
 */
async function checkDuplicates(
  supabase: any,
  questions: Question[]
): Promise<string[]> {
  const questionIds = questions.map((q) => q.id);

  const { data: existingQuestions } = await supabase
    .from('questions')
    .select('id')
    .in('id', questionIds);

  const duplicateIds = existingQuestions?.map((q: any) => q.id) || [];

  if (duplicateIds.length > 0) {
    console.warn(`⚠️  Found ${duplicateIds.length} duplicate question IDs`);
  }

  return duplicateIds;
}

/**
 * Convert letter ID (a,b,c,d) to integer index (0,1,2,3)
 */
function letterToIndex(letter: string): number {
  const map: Record<string, number> = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
  return map[letter.toLowerCase()] ?? 0;
}

/**
 * Transform question format for database
 */
function transformQuestionForDB(question: Question) {
  // Convert letter ID to integer if needed
  const correctAnswer = typeof question.correctAnswerId === 'string'
    ? letterToIndex(question.correctAnswerId)
    : question.correctAnswerId;

  return {
    // Let database generate UUID - don't include id field
    question: question.question,
    options: question.choices, // Send as object - database will handle JSONB conversion
    correct_answer: correctAnswer,
    domain: question.domain,
    difficulty: question.difficulty,
    category: question.category || null,
    explanation: question.explanation,
    tags: question.tags || [],
    study_guide_ref: question.studyGuideRef || null,
    official_ref: question.officialRef || null,
  };
}

/**
 * Import questions to database
 */
async function importQuestions(
  supabase: any,
  questions: Question[],
  skipDuplicates: boolean = true
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    totalItems: questions.length,
    successfulItems: 0,
    failedItems: 0,
    importedIds: [],
    errors: [],
    duplicates: [],
  };

  console.log(`\n🚀 Starting import of ${questions.length} questions...`);

  // Check for duplicates
  const duplicates = await checkDuplicates(supabase, questions);
  result.duplicates = duplicates;

  // Filter out duplicates if requested
  let questionsToImport = questions;
  if (skipDuplicates && duplicates.length > 0) {
    questionsToImport = questions.filter((q) => !duplicates.includes(q.id));
    console.log(`   Skipping ${duplicates.length} duplicates`);
    console.log(`   Importing ${questionsToImport.length} new questions`);
  }

  // Transform questions for database
  const transformedQuestions = questionsToImport.map(transformQuestionForDB);

  // Import in batches of 100
  const batchSize = 100;
  for (let i = 0; i < transformedQuestions.length; i += batchSize) {
    const batch = transformedQuestions.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(transformedQuestions.length / batchSize);

    console.log(`   Batch ${batchNumber}/${totalBatches} (${batch.length} questions)...`);

    const { data, error } = await supabase.from('questions').insert(batch).select('id');

    if (error) {
      console.error(`   ❌ Batch ${batchNumber} failed:`, error.message);
      result.failedItems += batch.length;
      result.errors.push({
        index: i,
        error: error.message,
      });
    } else {
      console.log(`   ✅ Batch ${batchNumber} imported successfully`);
      result.successfulItems += batch.length;
      if (data) {
        result.importedIds.push(...data.map((q: any) => q.id));
      }
    }
  }

  result.success = result.failedItems === 0;

  return result;
}

/**
 * Log import to content_import_logs table
 */
async function logImport(
  supabase: any,
  result: ImportResult,
  sourceFile: string
): Promise<void> {
  await supabase.from('content_import_logs').insert({
    content_type: 'questions',
    import_method: 'bulk_api',
    source_file: sourceFile,
    source_description: `Bulk import from ${path.basename(sourceFile)}`,
    total_items: result.totalItems,
    successful_items: result.successfulItems,
    failed_items: result.failedItems,
    imported_ids: result.importedIds,
    error_log: result.errors.length > 0 ? { errors: result.errors } : null,
  });

  console.log('📋 Import logged to content_import_logs');
}

/**
 * Print import summary
 */
function printSummary(result: ImportResult): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Import Summary');
  console.log('='.repeat(60));
  console.log(`Total questions:     ${result.totalItems}`);
  console.log(`Successful imports:  ${result.successfulItems} ✅`);
  console.log(`Failed imports:      ${result.failedItems} ❌`);
  console.log(`Duplicates skipped:  ${result.duplicates.length} ⚠️`);
  console.log(`Success rate:        ${((result.successfulItems / result.totalItems) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  if (result.success) {
    console.log('\n✅ Import completed successfully!');
  } else {
    console.log('\n❌ Import completed with errors');
    console.log('\nErrors:');
    result.errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err.error}`);
    });
  }
}

// ==================== MAIN FUNCTION ====================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Error: No file path provided');
    console.error('\nUsage:');
    console.error('  npx tsx scripts/bulk-import-questions.ts <file-path>');
    console.error('  npx tsx scripts/bulk-import-questions.ts --all');
    console.error('\nExamples:');
    console.error('  npx tsx scripts/bulk-import-questions.ts src/data/generated/generated-questions-asking_questions-beginner-2025-10-10.ts');
    console.error('  npx tsx scripts/bulk-import-questions.ts --all');
    process.exit(1);
  }

  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    let filePaths: string[] = [];

    // Handle --all flag
    if (args[0] === '--all') {
      console.log('🔍 Finding all generated question files...');
      const generatedDir = path.join(__dirname, '..', 'src', 'data', 'generated');
      const pattern = path.join(generatedDir, 'generated-questions-*.ts');
      filePaths = glob.sync(pattern);

      if (filePaths.length === 0) {
        console.error('❌ No generated question files found');
        console.error(`   Looking in: ${generatedDir}`);
        process.exit(1);
      }

      console.log(`   Found ${filePaths.length} file(s) to import`);
    } else {
      // Single file import
      filePaths = [args[0]];
    }

    // Import all files
    let totalSuccess = 0;
    let totalFailed = 0;
    let totalDuplicates = 0;

    for (const filePath of filePaths) {
      console.log('\n' + '='.repeat(60));
      console.log(`Processing: ${path.basename(filePath)}`);
      console.log('='.repeat(60));

      // Load questions
      const questions = await loadQuestionsFromFile(filePath);

      // Import questions
      const result = await importQuestions(supabase, questions);

      // Log import
      await logImport(supabase, result, filePath);

      // Print summary
      printSummary(result);

      // Aggregate totals
      totalSuccess += result.successfulItems;
      totalFailed += result.failedItems;
      totalDuplicates += result.duplicates.length;
    }

    // Overall summary for multiple files
    if (filePaths.length > 1) {
      console.log('\n' + '='.repeat(60));
      console.log('📊 Overall Summary');
      console.log('='.repeat(60));
      console.log(`Files processed:     ${filePaths.length}`);
      console.log(`Total imported:      ${totalSuccess} ✅`);
      console.log(`Total failed:        ${totalFailed} ❌`);
      console.log(`Total duplicates:    ${totalDuplicates} ⚠️`);
      console.log('='.repeat(60));
    }

    console.log('\n🎉 All imports completed!');
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { importQuestions, loadQuestionsFromFile };
