/**
 * Server-side error tracking service
 * Handles error logging with PII masking and optional PostHog integration
 */

import { headers } from 'next/headers';
import { PostHog } from 'posthog-node';
import {
  createSafeError,
  maskHeaders,
  maskObject,
  maskUrl
} from './pii-masker';

export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  [key: string]: unknown;
}

interface ErrorLog {
  timestamp: string;
  severity: ErrorSeverity;
  message: string;
  error?: unknown;
  context?: ErrorContext;
  stack?: string;
  environment: string;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private posthog: PostHog | null = null;
  private isDevelopment: boolean;
  private isProduction: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';

    // Initialize PostHog for production error tracking
    if (this.isProduction && process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      try {
        this.posthog = new PostHog(
          process.env.NEXT_PUBLIC_POSTHOG_KEY,
          {
            host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
            flushAt: 1, // Send events immediately in serverless environment
            flushInterval: 0 // Disable time-based flushing
          }
        );
      } catch (error) {
        console.error('Failed to initialize PostHog for error tracking:', error);
      }
    }
  }

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  /**
   * Extracts request context from Next.js headers
   */
  private async getRequestContext(request?: Request): Promise<Partial<ErrorContext>> {
    const context: Partial<ErrorContext> = {};

    try {
      if (request) {
        context.method = request.method;
        context.endpoint = maskUrl(request.url);

        // Get headers safely
        const headersObj: Record<string, string> = {};
        request.headers.forEach((value, key) => {
          headersObj[key] = value;
        });
        const maskedHeaders = maskHeaders(headersObj);

        // Extract useful non-PII headers for debugging
        context.userAgent = maskedHeaders['user-agent'] as string;
        context.referer = maskedHeaders['referer'] as string;
        context.contentType = maskedHeaders['content-type'] as string;
      } else {
        // Try to get headers from Next.js context
        const headersList = await headers();
        const headersObj: Record<string, string> = {};
        headersList.forEach((value, key) => {
          headersObj[key] = value;
        });
        const maskedHeaders = maskHeaders(headersObj);

        context.userAgent = maskedHeaders['user-agent'] as string;
        context.referer = maskedHeaders['referer'] as string;
      }

      // Add request ID if available
      context.requestId = Math.random().toString(36).substring(7);

    } catch (error) {
      // Fail silently - context extraction should not break error logging
      console.error('Failed to extract request context:', error);
    }

    return context;
  }

  /**
   * Logs an error with appropriate severity and context
   */
  public async logError(
    error: unknown,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    context?: ErrorContext,
    request?: Request
  ): Promise<void> {
    try {
      // Get request context if available
      const requestContext = await this.getRequestContext(request);

      // Merge contexts with PII masking
      const fullContext = maskObject({
        ...requestContext,
        ...context
      } as any) as ErrorContext;

      // Create safe error object
      const safeError = createSafeError(error);

      // Create log entry
      const logEntry: ErrorLog = {
        timestamp: new Date().toISOString(),
        severity,
        message: safeError.message,
        error: safeError,
        context: fullContext,
        stack: safeError.stack,
        environment: this.isProduction ? 'production' : 'development'
      };

      // Console logging (structured for log aggregation)
      if (this.isDevelopment) {
        // Pretty print in development
        console.error('\n🔴 ERROR TRACKED:', {
          ...logEntry,
          formattedTime: new Date(logEntry.timestamp).toLocaleString()
        });
      } else {
        // JSON format for production log aggregation
        console.error(JSON.stringify(logEntry));
      }

      // Send to PostHog if available
      if (this.posthog && this.isProduction) {
        try {
          this.posthog.capture({
            distinctId: fullContext.userId || 'anonymous',
            event: 'api_error',
            properties: {
              severity,
              endpoint: fullContext.endpoint,
              method: fullContext.method,
              statusCode: fullContext.statusCode,
              errorMessage: safeError.message,
              errorName: safeError.name,
              requestId: fullContext.requestId,
              environment: logEntry.environment,
              timestamp: logEntry.timestamp
            }
          });

          // Ensure events are sent in serverless environment
          await this.posthog.flush();
        } catch (posthogError) {
          console.error('Failed to send error to PostHog:', posthogError);
        }
      }

      // Write to file in development (optional)
      if (this.isDevelopment && process.env.ERROR_LOG_FILE) {
        await this.writeToFile(logEntry);
      }

    } catch (loggingError) {
      // Last resort - log the logging error
      console.error('Critical: Failed to log error:', loggingError);
      console.error('Original error:', error);
    }
  }

  /**
   * Logs informational messages
   */
  public async logInfo(message: string, context?: ErrorContext, request?: Request): Promise<void> {
    await this.logError(new Error(message), ErrorSeverity.INFO, context, request);
  }

  /**
   * Logs warning messages
   */
  public async logWarning(message: string, context?: ErrorContext, request?: Request): Promise<void> {
    await this.logError(new Error(message), ErrorSeverity.WARNING, context, request);
  }

  /**
   * Logs critical errors that require immediate attention
   */
  public async logCritical(error: unknown, context?: ErrorContext, request?: Request): Promise<void> {
    await this.logError(error, ErrorSeverity.CRITICAL, context, request);
  }

  /**
   * Write error to file (development only)
   */
  private async writeToFile(logEntry: ErrorLog): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, `errors-${new Date().toISOString().split('T')[0]}.log`);

      // Ensure log directory exists
      await fs.mkdir(logDir, { recursive: true });

      // Append to log file
      await fs.appendFile(
        logFile,
        JSON.stringify(logEntry) + '\n',
        'utf-8'
      );
    } catch (fileError) {
      console.error('Failed to write error to file:', fileError);
    }
  }

  /**
   * Cleanup method for serverless environments
   */
  public async shutdown(): Promise<void> {
    if (this.posthog) {
      await this.posthog.shutdown();
    }
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();

// Export convenience functions
export async function trackError(
  error: unknown,
  context?: ErrorContext,
  request?: Request
): Promise<void> {
  return errorTracker.logError(error, ErrorSeverity.ERROR, context, request);
}

export async function trackWarning(
  message: string,
  context?: ErrorContext,
  request?: Request
): Promise<void> {
  return errorTracker.logWarning(message, context, request);
}

export async function trackInfo(
  message: string,
  context?: ErrorContext,
  request?: Request
): Promise<void> {
  return errorTracker.logInfo(message, context, request);
}

export async function trackCritical(
  error: unknown,
  context?: ErrorContext,
  request?: Request
): Promise<void> {
  return errorTracker.logCritical(error, context, request);
}
