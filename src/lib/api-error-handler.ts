import { NextResponse } from 'next/server';
import { analytics } from './analytics';

interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

interface ErrorContext {
  endpoint: string;
  method: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Masks PII from error data
 */
function maskPII(data: any): any {
  if (!data) return data;

  if (typeof data === 'string') {
    // Mask email addresses
    data = data.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, '***@***.***');
    // Mask phone numbers
    data = data.replace(/(\+?[1-9]\d{1,14})/g, '***-***-****');
    // Mask credit card numbers
    data = data.replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, '****-****-****-****');
    // Mask SSN
    data = data.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****');
    // Mask API keys (common patterns)
    data = data.replace(/\b[A-Za-z0-9]{32,}\b/g, '***API_KEY***');
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(maskPII);
  }

  if (typeof data === 'object') {
    const masked: any = {};
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'cookie', 'session', 'credit', 'ssn', 'phone', 'email'];

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        masked[key] = '***REDACTED***';
      } else {
        masked[key] = maskPII(value);
      }
    }
    return masked;
  }

  return data;
}

/**
 * Logs error to monitoring services
 */
async function logError(error: Error | ApiError, context: ErrorContext) {
  const maskedError = {
    message: maskPII(error.message),
    stack: error instanceof Error ? maskPII(error.stack) : undefined,
    details: 'details' in error ? maskPII(error.details) : undefined,
    context: maskPII(context),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', maskedError);
  }

  // Track error in analytics
  if (analytics?.capture) {
    try {
      await analytics.capture('api_error', {
        endpoint: context.endpoint,
        method: context.method,
        status: 'status' in error ? error.status : 500,
        error_message: maskedError.message,
        ...context.metadata,
      });
    } catch (trackingError) {
      console.error('[Analytics Error]', trackingError);
    }
  }

  // If Sentry is configured, send error
  if (typeof window === 'undefined' && global.Sentry) {
    try {
      global.Sentry.captureException(error, {
        contexts: {
          api: maskedError.context,
        },
        tags: {
          endpoint: context.endpoint,
          method: context.method,
        },
        extra: maskedError.details,
      });
    } catch (sentryError) {
      console.error('[Sentry Error]', sentryError);
    }
  }

  // Could also send to external logging service like Datadog, LogDNA, etc.
  // Example: await sendToExternalLogger(maskedError);
}

/**
 * Standardized error response handler for API routes
 */
export async function handleApiError(
  error: Error | ApiError | unknown,
  context: ErrorContext
): Promise<NextResponse> {
  let apiError: ApiError;

  if (error instanceof Error) {
    apiError = {
      message: error.message,
      status: 500,
      details: error.stack,
    };
  } else if (typeof error === 'object' && error && 'status' in error) {
    apiError = error as ApiError;
  } else {
    apiError = {
      message: 'An unexpected error occurred',
      status: 500,
      details: error,
    };
  }

  // Log the error
  await logError(apiError, context);

  // Return sanitized error response
  const responseBody = {
    ok: false,
    error: maskPII(apiError.message),
    code: apiError.code,
    // Only include details in development
    ...(process.env.NODE_ENV === 'development' && { details: maskPII(apiError.details) }),
  };

  return NextResponse.json(responseBody, { status: apiError.status });
}

/**
 * Wrapper for API route handlers with automatic error tracking
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  endpoint: string
): T {
  return (async (...args: Parameters<T>) => {
    const request = args[0] as Request;
    const {method} = request;

    try {
      return await handler(...args);
    } catch (error) {
      // Extract user ID from request if available
      let userId: string | undefined;
      try {
        const authHeader = request.headers.get('authorization');
        // Parse JWT or session token to get user ID
        // This is a placeholder - implement based on your auth system
        userId = authHeader ? 'user_from_token' : undefined;
      } catch {}

      return handleApiError(error, {
        endpoint,
        method,
        userId,
        metadata: {
          url: request.url,
          // Add any other relevant metadata
        },
      });
    }
  }) as T;
}

// Declare global Sentry type if using Sentry
declare global {
  var Sentry: any;
}