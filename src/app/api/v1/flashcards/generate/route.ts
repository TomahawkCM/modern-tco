import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { rateLimitStrict, createRateLimitResponse } from "@/lib/rate-limit";
import {
  FlashcardGenerateRequestSchema,
  GeneratedFlashcard,
  validateRequest,
  createValidatedResponse,
  FlashcardGenerateResponseSchema,
} from "@/lib/api/schemas";

// ==================== AI FLASHCARD GENERATION API ====================
// Generates intelligent flashcards from module content using AI
// Supports both Anthropic Claude and OpenAI GPT-4
// Now with Zod schema validation for type safety

export async function POST(request: NextRequest) {
  // SECURITY: Rate limiting - 5 requests per hour (AI generation is expensive)
  const rateLimitResult = await rateLimitStrict(request);
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    // VALIDATION: Zod schema validation with automatic type inference
    const { moduleId, moduleTitle, domain, learningObjectives, difficulty, count } =
      await validateRequest(request, FlashcardGenerateRequestSchema);

    // Type is automatically inferred from schema! No manual validation needed.

    // Check for API keys (prefer Anthropic)
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!anthropicKey && !openaiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "No AI API key configured. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY",
        },
        { status: 500 }
      );
    }

    // Generate flashcards using available AI provider
    let flashcards: GeneratedFlashcard[];

    if (anthropicKey) {
      flashcards = await generateWithAnthropic(
        anthropicKey,
        moduleTitle,
        domain,
        learningObjectives,
        difficulty,
        count
      );
    } else {
      flashcards = await generateWithOpenAI(
        openaiKey!,
        moduleTitle,
        domain,
        learningObjectives,
        difficulty,
        count
      );
    }

    // RESPONSE: Validated response with Zod schema
    return createValidatedResponse(
      FlashcardGenerateResponseSchema,
      {
        success: true,
        flashcards,
        count: flashcards.length,
        provider: anthropicKey ? "anthropic" : "openai",
      }
    );
  } catch (error) {
    // Security fix: Use sanitized error messages (no internal details in production)
    const { sanitizeError } = await import('@/lib/error-handler');
    const sanitizedMessage = sanitizeError(error, 'flashcard_generation');

    // Return validated error response
    return createValidatedResponse(
      FlashcardGenerateResponseSchema,
      {
        success: false,
        error: sanitizedMessage,
      },
      500
    );
  }
}

// ==================== ANTHROPIC CLAUDE GENERATION ====================

async function generateWithAnthropic(
  apiKey: string,
  moduleTitle: string,
  domain: string,
  learningObjectives: string[],
  difficulty: string,
  count: number
): Promise<GeneratedFlashcard[]> {
  const anthropic = new Anthropic({ apiKey });

  const prompt = buildPrompt(moduleTitle, domain, learningObjectives, difficulty, count);

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    temperature: 0.7,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  return parseFlashcards(responseText);
}

// ==================== OPENAI GPT-4 GENERATION ====================

async function generateWithOpenAI(
  apiKey: string,
  moduleTitle: string,
  domain: string,
  learningObjectives: string[],
  difficulty: string,
  count: number
): Promise<GeneratedFlashcard[]> {
  const openai = new OpenAI({ apiKey });

  const prompt = buildPrompt(moduleTitle, domain, learningObjectives, difficulty, count);

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "You are an expert Tanium TCO certification instructor creating high-quality spaced repetition flashcards.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  });

  const responseText = completion.choices[0]?.message?.content || "";

  return parseFlashcards(responseText);
}

// ==================== PROMPT BUILDER ====================

function buildPrompt(
  moduleTitle: string,
  domain: string,
  learningObjectives: string[],
  difficulty: string,
  count: number
): string {
  const objectivesText =
    learningObjectives.length > 0
      ? learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join("\n")
      : "General Tanium TCO concepts and best practices";

  return `Create ${count} high-quality flashcards for the Tanium TCO certification exam.

**Module**: ${moduleTitle}
**Domain**: ${domain}
**Difficulty**: ${difficulty}
**Learning Objectives**:
${objectivesText}

**Instructions**:
1. Create ${count} flashcards based on the learning objectives above
2. Difficulty level "${difficulty}":
   - easy: Basic definitions, simple recall
   - medium: Application of concepts, procedures
   - hard: Analysis, synthesis, troubleshooting scenarios
3. Flashcard types to use:
   - basic: Simple Q&A
   - concept: Explain a concept
   - cloze: Fill in the blank
   - code: Code or command examples
4. Include hints and explanations when helpful
5. Use active recall principles (test knowledge, not just recognition)

**Output Format** (JSON array):
[
  {
    "front": "Question or prompt",
    "back": "Answer or explanation",
    "hint": "Optional hint",
    "explanation": "Optional additional context",
    "type": "basic|concept|cloze|code",
    "tags": ["tag1", "tag2"]
  }
]

Generate ONLY valid JSON. No additional text or markdown.`;
}

// ==================== RESPONSE PARSER ====================

function parseFlashcards(responseText: string): GeneratedFlashcard[] {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```json?\n?/g, "").replace(/```\n?/g, "");
    }

    const parsed = JSON.parse(jsonText);

    // Validate structure
    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array");
    }

    // Validate and normalize each flashcard
    const flashcards: GeneratedFlashcard[] = parsed.map((card: any) => {
      if (!card.front || !card.back) {
        throw new Error("Flashcard missing front or back");
      }

      return {
        front: String(card.front).trim(),
        back: String(card.back).trim(),
        hint: card.hint ? String(card.hint).trim() : undefined,
        explanation: card.explanation ? String(card.explanation).trim() : undefined,
        type: normalizeType(card.type),
        tags: Array.isArray(card.tags)
          ? card.tags.map((t: any) => String(t).trim())
          : [],
      };
    });

    return flashcards;
  } catch (error) {
    console.error("[parseFlashcards] Parse error:", error);
    console.error("[parseFlashcards] Response text:", responseText);
    throw new Error(
      `Failed to parse AI response: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

function normalizeType(type: any): "basic" | "concept" | "cloze" | "code" | "diagram" {
  const typeStr = String(type || "basic").toLowerCase();
  if (["concept", "cloze", "code", "diagram"].includes(typeStr)) {
    return typeStr as "concept" | "cloze" | "code" | "diagram";
  }
  return "basic";
}
