/**
 * API Route Handler Wrapper
 * Provides consistent error handling and tracking for all API routes
 */

import { type NextRequest, NextResponse } from 'next/server';
import { trackError, trackWarning, type ErrorContext } from './error-tracker';

export type ApiHandler = (
  request: NextRequest,
  params?: any
) => Promise<NextResponse | Response>;

export interface ApiErrorResponse {
  ok: false;
  error: string;
  requestId?: string;
  timestamp?: string;
}

export interface ApiSuccessResponse<T = any> {
  ok: true;
  data?: T;
  requestId?: string;
}

/**
 * Standard API error class with status code
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Wraps an API handler with error tracking and consistent error responses
 */
export function withErrorTracking(
  handler: ApiHandler,
  options: {
    endpoint?: string;
    requireAuth?: boolean;
    rateLimit?: number;
  } = {}
): ApiHandler {
  return async (request: NextRequest, params?: any): Promise<NextResponse> => {
    const requestId = Math.random().toString(36).substring(7);
    const startTime = Date.now();

    // Create base context
    const context: ErrorContext = {
      requestId,
      endpoint: options.endpoint || request.url,
      method: request.method,
    };

    try {
      // Optional: Add authentication check
      if (options.requireAuth) {
        // This is a placeholder - implement based on your auth system
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
          throw new ApiError('Authentication required', 401, 'AUTH_REQUIRED');
        }
      }

      // Call the actual handler
      const response = await handler(request, params);

      // Track slow API calls as warnings
      const duration = Date.now() - startTime;
      if (duration > 3000) {
        await trackWarning(
          `Slow API call: ${duration}ms`,
          { ...context, duration },
          request
        );
      }

      // Add request ID to successful responses
      if (response instanceof NextResponse) {
        response.headers.set('x-request-id', requestId);
      }

      return response as NextResponse;

    } catch (error) {
      const duration = Date.now() - startTime;

      // Determine status code
      let statusCode = 500;
      let errorMessage = 'Internal server error';
      let errorCode = 'INTERNAL_ERROR';

      if (error instanceof ApiError) {
        statusCode = error.statusCode;
        errorMessage = error.message;
        errorCode = error.code || 'API_ERROR';
      } else if (error instanceof Error) {
        // Check for common error patterns
        if (error.message.includes('Invalid JSON')) {
          statusCode = 400;
          errorMessage = 'Invalid request body';
          errorCode = 'INVALID_JSON';
        } else if (error.message.includes('not found')) {
          statusCode = 404;
          errorMessage = 'Resource not found';
          errorCode = 'NOT_FOUND';
        } else if (error.message.includes('unauthorized') || error.message.includes('auth')) {
          statusCode = 401;
          errorMessage = 'Unauthorized';
          errorCode = 'UNAUTHORIZED';
        } else if (error.message.includes('forbidden')) {
          statusCode = 403;
          errorMessage = 'Forbidden';
          errorCode = 'FORBIDDEN';
        } else {
          // For unexpected errors, use a generic message in production
          errorMessage = process.env.NODE_ENV === 'development'
            ? error.message
            : 'An error occurred processing your request';
        }
      }

      // Track the error
      await trackError(
        error,
        {
          ...context,
          statusCode,
          duration,
          errorCode
        },
        request
      );

      // Return error response
      const errorResponse: ApiErrorResponse = {
        ok: false,
        error: errorMessage,
        requestId,
        timestamp: new Date().toISOString()
      };

      // Add more details in development
      if (process.env.NODE_ENV === 'development') {
        (errorResponse as any).stack = error instanceof Error ? error.stack : undefined;
        (errorResponse as any).code = errorCode;
      }

      return NextResponse.json(errorResponse, {
        status: statusCode,
        headers: {
          'x-request-id': requestId
        }
      });
    }
  };
}

/**
 * Helper to create consistent success responses
 */
export function apiSuccess<T = any>(
  data: T,
  options: {
    status?: number;
    headers?: HeadersInit;
    requestId?: string;
  } = {}
): NextResponse {
  const response: ApiSuccessResponse<T> = {
    ok: true,
    data,
    requestId: options.requestId
  };

  return NextResponse.json(response, {
    status: options.status || 200,
    headers: options.headers
  });
}

/**
 * Helper to create consistent error responses
 */
export function apiError(
  message: string,
  status = 500,
  options: {
    code?: string;
    requestId?: string;
  } = {}
): NextResponse {
  const response: ApiErrorResponse = {
    ok: false,
    error: message,
    requestId: options.requestId,
    timestamp: new Date().toISOString()
  };

  if (process.env.NODE_ENV === 'development' && options.code) {
    (response as any).code = options.code;
  }

  return NextResponse.json(response, { status });
}

/**
 * Validates request body against a schema (basic validation)
 */
export function validateBody<T>(
  body: unknown,
  schema: {
    [K in keyof T]: {
      required?: boolean;
      type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
      validate?: (value: any) => boolean;
    }
  }
): T {
  if (!body || typeof body !== 'object') {
    throw new ApiError('Invalid request body', 400, 'INVALID_BODY');
  }

  const validated: any = {};

  for (const [key, rules] of Object.entries(schema) as [keyof T, any][]) {
    const value = (body as any)[key];

    if (rules.required && value === undefined) {
      throw new ApiError(`Missing required field: ${String(key)}`, 400, 'MISSING_FIELD');
    }

    if (value !== undefined) {
      if (rules.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rules.type) {
          throw new ApiError(
            `Invalid type for ${String(key)}: expected ${rules.type}, got ${actualType}`,
            400,
            'INVALID_TYPE'
          );
        }
      }

      if (rules.validate && !rules.validate(value)) {
        throw new ApiError(
          `Validation failed for field: ${String(key)}`,
          400,
          'VALIDATION_FAILED'
        );
      }

      validated[key] = value;
    }
  }

  return validated as T;
}