/**
 * Zod Schemas for API Request/Response Validation
 *
 * This file contains type-safe validation schemas for all API endpoints.
 * Benefits:
 * - Runtime type validation with Zod
 * - Automatic TypeScript type inference
 * - Consistent error messages across APIs
 * - Easy schema composition and reuse
 *
 * @see https://zod.dev for Zod documentation
 */

import { z, type ZodIssue } from 'zod';

// ==================== COMMON SCHEMAS ====================

/**
 * Standard API success response
 */
export const ApiSuccessSchema = z.object({
  ok: z.literal(true),
  data: z.unknown().optional(),
  message: z.string().optional(),
});

/**
 * Standard API error response
 */
export const ApiErrorSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  requestId: z.string().optional(),
  timestamp: z.string().optional(),
});

// ==================== FLASHCARDS API ====================

/**
 * POST /api/flashcards/generate
 * Generate AI flashcards from module content
 */
export const FlashcardGenerateRequestSchema = z.object({
  moduleId: z.string().min(1, 'Module ID is required'),
  moduleTitle: z.string().optional().default('TCO Module'),
  domain: z.string().optional().default('general'),
  learningObjectives: z.array(z.string()).optional().default([]),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  count: z.number().int().positive().max(50).optional().default(10),
});

export const GeneratedFlashcardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
  hint: z.string().optional(),
  explanation: z.string().optional(),
  type: z.enum(['basic', 'concept', 'cloze', 'code', 'diagram']),
  tags: z.array(z.string()).optional(),
});

export const FlashcardGenerateResponseSchema = z.object({
  success: z.boolean(),
  flashcards: z.array(GeneratedFlashcardSchema).optional(),
  count: z.number().optional(),
  error: z.string().optional(),
  provider: z.enum(['anthropic', 'openai']).optional(),
});

/**
 * GET /api/flashcards/public
 * Retrieve public flashcards for a module
 */
export const FlashcardPublicQuerySchema = z.object({
  moduleId: z.string().optional(),
  domain: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

// ==================== SIMULATOR API ====================

/**
 * POST /api/sim-run
 * Execute a saved Tanium query
 */
export const SimRunRequestSchema = z.object({
  name: z.string().min(1, 'Query name is required').max(100),
  format: z.enum(['json', 'csv']).optional().default('json'),
});

export const SimRunResponseSchema = z.object({
  ok: z.boolean(),
  headers: z.array(z.string()).optional(),
  rows: z.array(z.array(z.unknown())).optional(),
  error: z.string().optional(),
});

/**
 * POST /api/sim-eval
 * Evaluate a Tanium query in real-time
 */
export const SimEvalRequestSchema = z.object({
  question: z.string().min(1, 'Question is required').max(1000),
  format: z.enum(['json', 'csv']).optional().default('json'),
  outFile: z.string().optional(),
});

export const SimEvalResponseSchema = SimRunResponseSchema;

/**
 * POST /api/sim-save
 * Save a Tanium query for later execution
 */
export const SimSaveRequestSchema = z.object({
  name: z.string().min(1, 'Query name is required').max(100),
  question: z.string().min(1, 'Question is required').max(1000),
});

export const SimSaveResponseSchema = z.object({
  ok: z.boolean(),
  saved: z.boolean().optional(),
  name: z.string().optional(),
  error: z.string().optional(),
});

/**
 * GET /api/sim-saved
 * List all saved queries
 */
export const SimSavedQuerySchema = z.object({
  format: z.enum(['json', 'list']).optional().default('json'),
});

export const SimSavedResponseSchema = z.object({
  ok: z.boolean(),
  queries: z.array(z.string()).optional(),
  count: z.number().optional(),
  error: z.string().optional(),
});

/**
 * GET /api/sim-meta
 * Get simulator metadata and configuration
 */
export const SimMetaResponseSchema = z.object({
  ok: z.boolean(),
  version: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
  error: z.string().optional(),
});

// ==================== STUDY API ====================

/**
 * GET /api/study/content
 * Retrieve study module content by domain
 */
export const StudyContentQuerySchema = z.object({
  domain: z.string().optional(), // "asking-questions", "1", etc.
});

export const StudyContentRequestSchema = z.object({
  moduleId: z.string().min(1, 'Module ID is required'),
  sectionId: z.string().optional(),
  includeMetadata: z.boolean().optional().default(false),
});

export const StudyContentResponseSchema = z.object({
  success: z.boolean(),
  content: z.unknown().optional(), // ParsedModule structure
  metadata: z.record(z.string(), z.unknown()).optional(),
  error: z.string().optional(),
  details: z.string().optional(),
});

// ==================== STRIPE API ====================

/**
 * POST /api/stripe/create-checkout-session (Mock Version)
 * Create a mock Stripe checkout session
 * Note: When Stripe is fully integrated, use StripeCheckoutRequestSchema instead
 */
export const StripeCheckoutMockRequestSchema = z.object({
  plan: z.enum(['free', 'pro', 'team']).optional().default('pro'),
});

/**
 * POST /api/stripe/create-checkout-session (Production Version)
 * Create a Stripe checkout session with full Stripe integration
 */
export const StripeCheckoutRequestSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  userId: z.string().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const StripeCheckoutResponseSchema = z.object({
  success: z.boolean(),
  sessionId: z.string().optional(),
  url: z.string().url().optional(),
  error: z.string().optional(),
});

// ==================== HEALTH CHECK API ====================

/**
 * GET /api/health
 * System health check endpoint
 */
export const HealthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.string(),
  uptime: z.number().optional(),
  version: z.string().optional(),
  services: z.record(z.string(), z.object({
    status: z.enum(['up', 'down']),
    latency: z.number().optional(),
  })).optional(),
});

// ==================== TYPE INFERENCE ====================

// Infer TypeScript types from Zod schemas
export type FlashcardGenerateRequest = z.infer<typeof FlashcardGenerateRequestSchema>;
export type GeneratedFlashcard = z.infer<typeof GeneratedFlashcardSchema>;
export type FlashcardGenerateResponse = z.infer<typeof FlashcardGenerateResponseSchema>;
export type FlashcardPublicQuery = z.infer<typeof FlashcardPublicQuerySchema>;

export type SimRunRequest = z.infer<typeof SimRunRequestSchema>;
export type SimRunResponse = z.infer<typeof SimRunResponseSchema>;
export type SimEvalRequest = z.infer<typeof SimEvalRequestSchema>;
export type SimEvalResponse = z.infer<typeof SimEvalResponseSchema>;
export type SimSaveRequest = z.infer<typeof SimSaveRequestSchema>;
export type SimSaveResponse = z.infer<typeof SimSaveResponseSchema>;
export type SimSavedQuery = z.infer<typeof SimSavedQuerySchema>;
export type SimSavedResponse = z.infer<typeof SimSavedResponseSchema>;
export type SimMetaResponse = z.infer<typeof SimMetaResponseSchema>;

export type StudyContentQuery = z.infer<typeof StudyContentQuerySchema>;
export type StudyContentRequest = z.infer<typeof StudyContentRequestSchema>;
export type StudyContentResponse = z.infer<typeof StudyContentResponseSchema>;

export type StripeCheckoutMockRequest = z.infer<typeof StripeCheckoutMockRequestSchema>;
export type StripeCheckoutRequest = z.infer<typeof StripeCheckoutRequestSchema>;
export type StripeCheckoutResponse = z.infer<typeof StripeCheckoutResponseSchema>;

export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;

// ==================== VALIDATION HELPERS ====================

/**
 * Validates request body against a Zod schema
 * Throws ApiError on validation failure
 *
 * @example
 * ```typescript
 * const body = await validateRequest(request, FlashcardGenerateRequestSchema);
 * // body is now typed as FlashcardGenerateRequest
 * ```
 */
export async function validateRequest<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((err: ZodIssue) =>
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');

      throw new Error(`Validation failed: ${errors}`);
    }

    return result.data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON body');
    }
    throw error;
  }
}

/**
 * Validates query parameters against a Zod schema
 *
 * @example
 * ```typescript
 * const query = validateQuery(request.url, FlashcardPublicQuerySchema);
 * // query is now typed as FlashcardPublicQuery
 * ```
 */
export function validateQuery<T extends z.ZodTypeAny>(
  url: string,
  schema: T
): z.infer<T> {
  const {searchParams} = new URL(url);
  const params = Object.fromEntries(searchParams.entries());

  const result = schema.safeParse(params);

  if (!result.success) {
    const errors = result.error.issues.map((err: ZodIssue) =>
      `${err.path.join('.')}: ${err.message}`
    ).join(', ');

    throw new Error(`Query validation failed: ${errors}`);
  }

  return result.data;
}

/**
 * Type-safe response builder with schema validation
 *
 * @example
 * ```typescript
 * return createValidatedResponse(
 *   FlashcardGenerateResponseSchema,
 *   { success: true, flashcards: [...], count: 10 }
 * );
 * ```
 */
export function createValidatedResponse<T extends z.ZodTypeAny>(
  schema: T,
  data: z.infer<T>,
  status = 200
): Response {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error('[API] Response validation failed:', result.error);
    // In production, return validated data anyway to avoid breaking clients
    // Log the error for monitoring
  }

  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
