import type { NextRequest } from 'next/server';
import { TaniumQueryEngine } from '@/lib/tanium-query-engine';
import {
  withErrorTracking,
  ApiError,
  apiSuccess
} from '@/lib/error-tracking';
import { rateLimit, createRateLimitResponse } from '@/lib/rate-limit';
import {
  SimEvalRequestSchema,
  validateRequest
} from '@/lib/api/schemas';

// Initialize the query engine with sample data
const queryEngine = new TaniumQueryEngine();

export const POST = withErrorTracking(
  async (request: NextRequest) => {
    // SECURITY: Rate limiting - 10 requests per 15 minutes
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    // Note: This endpoint uses TypeScript TaniumQueryEngine (no Python dependency)
    // Safe to run in production on Vercel serverless

    // VALIDATION: Zod schema validation with automatic type inference
    const { question, format, outFile } = await validateRequest(request, SimEvalRequestSchema);

    console.log('[sim-eval] Processing query:', question);

    // Execute query using TypeScript engine
    try {
      const result = await queryEngine.query(question, {
        format: format ?? 'json',
        useCache: true,
        timeout: 5000
      });

      console.log('[sim-eval] Query result:', {
        ok: result.ok,
        hasHeaders: !!result.headers,
        headersCount: result.headers?.length,
        hasRows: !!result.rows,
        rowsCount: result.rows?.length,
        error: result.error
      });

      // Handle file output if requested
      if (outFile && result.ok) {
        // For now, just add the filename to the result
        // In production, this would write to a file or cloud storage
        (result as any).outputFile = outFile;
      }

      if (result?.ok === false) {
        throw new ApiError(
          result.error ?? 'Query execution failed',
          400,
          'QUERY_ERROR'
        );
      }

      return apiSuccess(result);
    } catch (error) {
      // Re-throw ApiErrors as-is
      if (error instanceof ApiError) {
        throw error;
      }

      // Wrap other errors
      console.error('[sim-eval] Execution error:', error);
      throw new ApiError(
        'Simulator invocation failed',
        500,
        'SIMULATOR_INVOCATION_FAILED'
      );
    }
  },
  { endpoint: '/api/sim-eval' }
);