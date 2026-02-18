/**
 * Bank Detection API
 *
 * POST /api/bank/detect
 *
 * Request Body:
 * {
 *   headers: string[],              // CSV column headers
 *   transactionSamples: string[],   // 5-10 sample transaction descriptions
 *   useAI?: boolean                 // Whether to use AI detection (default: true)
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   bankKey: string | null,
 *   bankName: string | null,
 *   confidence: number,
 *   detectionMethod: string,
 *   reasoning?: string
 * }
 *
 * Flow:
 * 1. Fast signature pattern matching
 * 2. AI-powered pattern analysis (server-side, no CORS!)
 * 3. Header-based fuzzy matching
 * 4. Generic fallback (never returns null)
 * 5. Optionally stores learned format in bank_formats table
 */

import { type NextRequest, NextResponse } from "next/server";
import { detectBank } from "@/lib/ai/smart-bank-detection";
import { saveBankFormat, lookupBankFormat } from "@/lib/collective-learning-service";
import { BANK_CONFIGS } from "@/lib/parsers/csv-parser";
import { isOnlineMode } from "@/config/features";

// Types
interface BankDetectionRequest {
  headers: string[];
  transactionSamples: string[];
  useAI?: boolean;
  learnFormat?: boolean; // Whether to save this format to collective learning
}

interface BankDetectionResponse {
  success: boolean;
  bankKey: string | null;
  bankName: string | null;
  confidence: number;
  detectionMethod: "ai-pattern" | "header-fuzzy" | "header-exact" | "unknown";
  reasoning?: string;
  error?: string;
}

// ============================================================================
// API Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = (await request.json()) as BankDetectionRequest;

    // Validation
    if (!body.headers || !Array.isArray(body.headers) || body.headers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid headers array",
        } as BankDetectionResponse,
        { status: 400 }
      );
    }

    if (
      !body.transactionSamples ||
      !Array.isArray(body.transactionSamples) ||
      body.transactionSamples.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid transactionSamples array",
        } as BankDetectionResponse,
        { status: 400 }
      );
    }

    // Server-side detection (no CORS issues!)
    // In standalone mode, disable AI path - use pattern matching only
    const useAI = body.useAI !== false && isOnlineMode();
    const result = await detectBank(body.transactionSamples, body.headers, useAI);

    // Optional: Learn this format for collective intelligence
    if (body.learnFormat && result.bankKey && result.confidence >= 0.7) {
      try {
        const bankConfig = BANK_CONFIGS[result.bankKey];
        if (bankConfig) {
          // Check if format already exists
          const existing = await lookupBankFormat(result.bankKey);

          if (!existing) {
            // Save new bank format
            await saveBankFormat({
              bankName: bankConfig.name,
              bankSlug: result.bankKey,
              columnMappings: {
                date: bankConfig.dateColumn,
                description: bankConfig.descriptionColumn,
                amount: bankConfig.amountColumn,
              },
              dateFormat: bankConfig.dateFormat,
              hasHeaderRow: true,
              amountFormat: "single",
              confidence: result.confidence,
              successfulImports: 1,
              failedImports: 0,
            });

            console.log("[BankDetectAPI] Learned new bank format:", result.bankKey);
          }
        }
      } catch (learningError) {
        // Don't fail the request if learning fails
        console.error("[BankDetectAPI] Error learning format:", learningError);
      }
    }

    // Return detection result
    return NextResponse.json({
      success: true,
      bankKey: result.bankKey,
      bankName: result.bankName,
      confidence: result.confidence,
      detectionMethod: result.detectionMethod,
      reasoning: result.reasoning,
    } as BankDetectionResponse);
  } catch (error) {
    console.error("[BankDetectAPI] Detection error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        bankKey: null,
        bankName: null,
        confidence: 0,
        detectionMethod: "unknown" as const,
      } as BankDetectionResponse,
      { status: 500 }
    );
  }
}
