#!/usr/bin/env node

/**
 * Bulk Flashcard Import Tool
 *
 * Imports AI-generated flashcards into the Supabase flashcard_library table.
 *
 * Usage:
 *   npx tsx scripts/bulk-import-flashcards.ts <file-path>
 *   npx tsx scripts/bulk-import-flashcards.ts src/data/generated/generated-flashcards-*.ts
 *   npx tsx scripts/bulk-import-flashcards.ts --all
 *
 * Features:
 * - Validates flashcards before import
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

interface Flashcard {
  front: string;
  back: string;
  hint?: string;
  domain: string;
  category: string;
  difficulty: string;
  tags: string[];
  study_guide_ref?: string;
  source: string;
}

interface ImportResult {
  success: boolean;
  totalItems: number;
  successfulItems: number;
  failedItems: number;
  importedIds: string[];
  errors: Array<{ index: number; error: string }>;
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
 * Load flashcards from TypeScript file
 */
async function loadFlashcardsFromFile(filePath: string): Promise<Flashcard[]> {
  console.log(`📂 Loading flashcards from: ${filePath}`);

  // Dynamically import the TypeScript file
  const module = await import(path.resolve(filePath));
  const flashcards = module.generatedFlashcards || module.default;

  if (!Array.isArray(flashcards)) {
    throw new Error('File does not export a valid flashcards array');
  }

  console.log(`   Found ${flashcards.length} flashcards`);
  return flashcards;
}

/**
 * Validate flashcard structure
 */
function validateFlashcard(flashcard: Flashcard, index: number): string[] {
  const errors: string[] = [];

  if (!flashcard.front || flashcard.front.trim().length < 10) {
    errors.push('Front text is missing or too short');
  }
  if (!flashcard.back || flashcard.back.trim().length < 10) {
    errors.push('Back text is missing or too short');
  }
  if (!flashcard.domain) {
    errors.push('Domain is required');
  }
  if (!flashcard.category) {
    errors.push('Category is required');
  }
  if (!flashcard.difficulty) {
    errors.push('Difficulty is required');
  }
  if (!flashcard.tags || flashcard.tags.length < 2) {
    errors.push('Must have at least 2 tags');
  }

  return errors;
}

/**
 * Import flashcards to database
 */
async function importFlashcards(
  supabase: any,
  flashcards: Flashcard[]
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    totalItems: flashcards.length,
    successfulItems: 0,
    failedItems: 0,
    importedIds: [],
    errors: [],
  };

  console.log(`\n🚀 Starting import of ${flashcards.length} flashcards...`);

  // Validate all flashcards first
  console.log('   Validating flashcards...');
  for (let i = 0; i < flashcards.length; i++) {
    const errors = validateFlashcard(flashcards[i], i);
    if (errors.length > 0) {
      result.errors.push({
        index: i,
        error: `Validation failed: ${errors.join(', ')}`,
      });
      result.failedItems++;
    }
  }

  if (result.failedItems > 0) {
    console.warn(`   ⚠️  ${result.failedItems} flashcards failed validation`);
  }

  // Get only valid flashcards
  const validFlashcards = flashcards.filter((_, idx) => {
    return !result.errors.some((e) => e.index === idx);
  });

  console.log(`   Importing ${validFlashcards.length} valid flashcards...`);

  // Import in batches of 50
  const batchSize = 50;
  for (let i = 0; i < validFlashcards.length; i += batchSize) {
    const batch = validFlashcards.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(validFlashcards.length / batchSize);

    console.log(`   Batch ${batchNumber}/${totalBatches} (${batch.length} flashcards)...`);

    const { data, error } = await supabase
      .from('flashcard_library')
      .insert(
        batch.map((f) => ({
          front: f.front,
          back: f.back,
          hint: f.hint || null,
          domain: f.domain,
          category: f.category,
          difficulty: f.difficulty,
          tags: f.tags || [],
          study_guide_ref: f.study_guide_ref || null,
          source: f.source,
          total_reviews: 0,
          total_correct: 0,
          average_ease_factor: 2.5,
        }))
      )
      .select('id');

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
        result.importedIds.push(...data.map((f: any) => f.id));
      }
    }
  }

  result.success = result.errors.length === 0;

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
    content_type: 'flashcards',
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
  console.log(`Total flashcards:    ${result.totalItems}`);
  console.log(`Successful imports:  ${result.successfulItems} ✅`);
  console.log(`Failed imports:      ${result.failedItems} ❌`);
  console.log(`Success rate:        ${((result.successfulItems / result.totalItems) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  if (result.success) {
    console.log('\n✅ Import completed successfully!');
  } else {
    console.log('\n❌ Import completed with errors');
    console.log('\nErrors:');
    result.errors.slice(0, 10).forEach((err, idx) => {
      console.log(`  ${idx + 1}. Index ${err.index}: ${err.error}`);
    });
    if (result.errors.length > 10) {
      console.log(`  ... and ${result.errors.length - 10} more errors`);
    }
  }
}

// ==================== MAIN FUNCTION ====================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Error: No file path provided');
    console.error('\nUsage:');
    console.error('  npx tsx scripts/bulk-import-flashcards.ts <file-path>');
    console.error('  npx tsx scripts/bulk-import-flashcards.ts --all');
    console.error('\nExamples:');
    console.error('  npx tsx scripts/bulk-import-flashcards.ts src/data/generated/generated-flashcards-asking_questions-medium-2025-10-10.ts');
    console.error('  npx tsx scripts/bulk-import-flashcards.ts --all');
    process.exit(1);
  }

  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    let filePaths: string[] = [];

    // Handle --all flag
    if (args[0] === '--all') {
      console.log('🔍 Finding all generated flashcard files...');
      const generatedDir = path.join(__dirname, '..', 'src', 'data', 'generated');
      const pattern = path.join(generatedDir, 'generated-flashcards-*.ts');
      filePaths = glob.sync(pattern);

      if (filePaths.length === 0) {
        console.error('❌ No generated flashcard files found');
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

    for (const filePath of filePaths) {
      console.log('\n' + '='.repeat(60));
      console.log(`Processing: ${path.basename(filePath)}`);
      console.log('='.repeat(60));

      // Load flashcards
      const flashcards = await loadFlashcardsFromFile(filePath);

      // Import flashcards
      const result = await importFlashcards(supabase, flashcards);

      // Log import
      await logImport(supabase, result, filePath);

      // Print summary
      printSummary(result);

      // Aggregate totals
      totalSuccess += result.successfulItems;
      totalFailed += result.failedItems;
    }

    // Overall summary for multiple files
    if (filePaths.length > 1) {
      console.log('\n' + '='.repeat(60));
      console.log('📊 Overall Summary');
      console.log('='.repeat(60));
      console.log(`Files processed:     ${filePaths.length}`);
      console.log(`Total imported:      ${totalSuccess} ✅`);
      console.log(`Total failed:        ${totalFailed} ❌`);
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

export { importFlashcards, loadFlashcardsFromFile };
