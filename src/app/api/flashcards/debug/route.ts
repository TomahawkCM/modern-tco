import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Debug endpoint to diagnose flashcard system issues
 * GET /api/flashcards/debug
 */
export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {}
  };

  // Check 1: Supabase Admin Client
  (diagnostics.checks as Record<string, unknown>).supabaseAdmin = {
    exists: !!supabaseAdmin,
    envVarExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    status: supabaseAdmin ? '✅ Configured' : '❌ Missing SUPABASE_SERVICE_ROLE_KEY'
  };

  // Check 2: Flashcard Library File
  const libraryPath = path.join(process.cwd(), 'flashcards-library.json');
  (diagnostics.checks as Record<string, unknown>).flashcardLibrary = {
    path: libraryPath,
    exists: fs.existsSync(libraryPath),
    status: fs.existsSync(libraryPath) ? '✅ File exists' : '❌ File not found'
  };

  if (fs.existsSync(libraryPath)) {
    try {
      const fileContent = fs.readFileSync(libraryPath, 'utf-8');
      const flashcards = JSON.parse(fileContent) as unknown[];
      const libCheck = (diagnostics.checks as Record<string, unknown>).flashcardLibrary as Record<string, unknown>;
      libCheck.count = flashcards.length;
      libCheck.fileSize = fs.statSync(libraryPath).size;
    } catch (error) {
      const libCheck = (diagnostics.checks as Record<string, unknown>).flashcardLibrary as Record<string, unknown>;
      libCheck.parseError = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  // Check 3: Database Connection & Table
  if (supabaseAdmin) {
    try {
      // Try to query the flashcards table
      const { data, error } = await supabaseAdmin
        .from('flashcards')
        .select('id')
        .limit(1);

      (diagnostics.checks as Record<string, unknown>).database = {
        connected: true,
        flashcardsTableExists: !error,
        status: error ? `❌ ${error.message}` : '✅ Table accessible',
        error: error ? {
          message: error.message,
          code: (error as { code?: string }).code,
          details: (error as { details?: string }).details,
          hint: (error as { hint?: string }).hint
        } : null
      };
    } catch (error) {
      (diagnostics.checks as Record<string, unknown>).database = {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: '❌ Database query failed'
      };
    }
  } else {
    (diagnostics.checks as Record<string, unknown>).database = {
      status: '❌ Cannot check - supabaseAdmin not configured'
    };
  }

  // Check 4: Environment Variables (partial)
  (diagnostics.checks as Record<string, unknown>).environmentVariables = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV: process.env.NODE_ENV
  };

  // Summary
  const checks = diagnostics.checks as Record<string, { status?: string }>;
  const failedChecks = Object.entries(checks)
    .filter(([, check]) => check.status?.includes('❌'))
    .map(([name]) => name);

  diagnostics.summary = {
    overallStatus: failedChecks.length === 0 ? '✅ All systems operational' : '⚠️ Issues detected',
    failedChecks,
    recommendation: failedChecks.length > 0
      ? `Fix the following: ${failedChecks.join(', ')}`
      : 'System ready for flashcard operations'
  };

  return NextResponse.json(diagnostics, {
    status: failedChecks.length === 0 ? 200 : 500
  });
}
