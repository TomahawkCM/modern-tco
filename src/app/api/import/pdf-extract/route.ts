/**
 * PDF AI Extraction API Route
 * POST: Receives PDF as FormData, uses OpenAI Vision API (GPT-4o) for extraction.
 * Returns structured transaction data.
 */

import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

// Zod schema for validated response
const TransactionSchema = z.object({
  date: z.string(), // ISO 8601
  description: z.string(),
  amount: z.number(),
  currency: z.string().optional(),
  type: z.enum(["debit", "credit"]).optional(),
  balance: z.number().optional(),
});

const ExtractionResponseSchema = z.object({
  transactions: z.array(TransactionSchema),
  currency: z.string().optional(),
  statementInfo: z
    .object({
      bankName: z.string().optional(),
      accountNumber: z.string().optional(),
      statementPeriod: z.string().optional(),
      openingBalance: z.number().optional(),
      closingBalance: z.number().optional(),
    })
    .optional(),
});

const EXTRACTION_PROMPT = `Extract all transactions from this bank statement PDF.
The statement may be in any language. For each transaction, extract:
- date: The transaction date in ISO 8601 format (YYYY-MM-DD)
- description: The transaction description/payee/narrative
- amount: The transaction amount as a decimal number (positive for credits/deposits, negative for debits/withdrawals)
- currency: ISO 4217 currency code if visible (e.g., USD, EUR, GBP)
- type: "debit" or "credit"
- balance: Running balance after this transaction, if shown

Also extract statement-level info if available:
- bankName: Name of the issuing bank
- accountNumber: Account number (last 4 digits only for privacy)
- statementPeriod: Statement period description
- openingBalance: Opening/beginning balance
- closingBalance: Closing/ending balance

Return a JSON object with "transactions" array and optional "statementInfo" and "currency" fields.
Do NOT include any markdown formatting or code fences in the response - return ONLY valid JSON.`;

export async function POST(request: NextRequest) {
  try {
    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "NO_API_KEY", messageKey: "apiErrors.noApiKey" },
        { status: 503 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "NO_FILE_PROVIDED", messageKey: "apiErrors.noFileProvided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "FILE_MUST_BE_PDF", messageKey: "apiErrors.fileMustBePdf" },
        { status: 400 }
      );
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "FILE_TOO_LARGE", messageKey: "apiErrors.fileTooLarge", details: { maxSize: "20MB" } },
        { status: 400 }
      );
    }

    // Convert PDF to base64 for the file content type
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const fileData = `data:application/pdf;base64,${base64}`;

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // Call GPT-4o with native PDF file input
    // Uses the 'file' content type which supports PDFs directly (added March 2025)
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 16384,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: EXTRACTION_PROMPT },
            {
              type: "file",
              file: {
                file_data: fileData,
                filename: file.name || "statement.pdf",
              },
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "NO_AI_RESPONSE", messageKey: "apiErrors.noAiResponse" },
        { status: 500 }
      );
    }

    // Parse and validate JSON response
    let parsed: any;
    try {
      // Clean potential markdown formatting from response
      const cleaned = content
        .replace(/^```json?\s*/i, "")
        .replace(/```\s*$/, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("[PDF Extract] Failed to parse AI response:", content);
      return NextResponse.json(
        { error: "FAILED_TO_PARSE_RESPONSE", messageKey: "apiErrors.failedToParseResponse", rawResponse: content },
        { status: 500 }
      );
    }

    // Validate with Zod
    const validated = ExtractionResponseSchema.safeParse(parsed);
    if (!validated.success) {
      console.error("[PDF Extract] Validation failed:", validated.error);
      // Return the raw parsed data anyway, with a warning
      return NextResponse.json({
        ...parsed,
        warning: "RESPONSE_VALIDATION_ISSUES",
        warningMessageKey: "apiErrors.responseValidationIssues",
        confidence: 0.7,
        tokensUsed: response.usage?.total_tokens,
      });
    }

    return NextResponse.json({
      ...validated.data,
      confidence: 0.9,
      tokensUsed: response.usage?.total_tokens,
    });
  } catch (error) {
    console.error("[PDF Extract] Error:", error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        return NextResponse.json(
          { error: "RATE_LIMIT_EXCEEDED", messageKey: "apiErrors.rateLimitExceeded" },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "AI_API_ERROR", messageKey: "apiErrors.aiApiError", details: { message: error.message } },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      {
        error: "UNKNOWN_ERROR",
        messageKey: "apiErrors.unknownError",
        details: error instanceof Error ? { message: error.message } : undefined,
      },
      { status: 500 }
    );
  }
}
