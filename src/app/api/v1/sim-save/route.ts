import type { NextRequest } from 'next/server';
// TEMPORARILY DISABLED: Simulator uses content-parser.ts which imports Node.js 'fs' module
// This causes build issues with Turbopack due to mixed server/client imports
// TODO: Refactor content-parser.ts to separate server/client concerns
// See Archon task: "Refactor content-parser.ts for Turbopack compatibility"
// import { runSimulator } from '@/lib/simulator-runner';
import {
  withErrorTracking,
  ApiError,
  apiSuccess
} from '@/lib/error-tracking';
import { rateLimit, createRateLimitResponse } from '@/lib/rate-limit';
import {
  SimSaveRequestSchema,
  validateRequest
} from '@/lib/api/schemas';

export const POST = withErrorTracking(
  async (request: NextRequest) => {
    // TEMPORARILY DISABLED: Simulator functionality disabled during Next.js 16 migration
    // Will be re-enabled after content-parser.ts refactoring
    throw new ApiError(
      'Simulator temporarily disabled during Next.js 16 migration. Will be restored soon.',
      503,
      'SIMULATOR_TEMPORARILY_DISABLED'
    );

    // SECURITY: Rate limiting - 10 requests per 15 minutes
    // const rateLimitResult = await rateLimit(request);
    // if (!rateLimitResult.success) {
    //   return createRateLimitResponse(rateLimitResult);
    // }

    // Check if simulator is enabled in production
    // if (process.env.NODE_ENV === 'production' && process.env['ENABLE_SIMULATOR'] !== 'true') {
    //   throw new ApiError('Simulator endpoints are disabled in production', 501, 'SIMULATOR_DISABLED');
    // }

    // VALIDATION: Zod schema validation with automatic type inference
    // const { name, question } = await validateRequest(request, SimSaveRequestSchema);

    // Run the simulator
    // try {
    //   const result = await runSimulator([
    //     '--json',
    //     '--save',
    //     name,
    //     '-q',
    //     question
    //   ]);

    //   if (result?.ok === false) {
    //     throw new ApiError(
    //       result.error ?? 'Simulator execution failed',
    //       400,
    //       'SIMULATOR_ERROR'
    //     );
    //   }

    //   return apiSuccess(result);
    // } catch (error) {
    //   // Re-throw ApiErrors as-is
    //   if (error instanceof ApiError) {
    //     throw error;
    //   }

    //   // Wrap other errors
    //   throw new ApiError(
    //     'Simulator invocation failed',
    //     500,
    //     'SIMULATOR_INVOCATION_FAILED'
    //   );
    // }
  },
  { endpoint: '/api/sim-save' }
);
