/**
 * Error Handling Utilities
 * Security: Sanitizes error messages for production to prevent information leakage
 */

/**
 * Sanitize error for client response
 * - Development: Returns full error details
 * - Production: Returns generic message only
 *
 * @param error - The error to sanitize
 * @param context - Optional context for logging (e.g., "flashcard_generation")
 * @returns Sanitized error message safe for client
 */
export function sanitizeError(error: unknown, context?: string): string {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Log full error server-side (with context if provided)
  if (context) {
    console.error(`[${context}] Error:`, error);
  } else {
    console.error("Error:", error);
  }

  // Return detailed error in development, generic in production
  if (isDevelopment) {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  // Production: Generic error messages only
  return "An unexpected error occurred. Please try again later.";
}

/**
 * Create standardized error response for API routes
 *
 * @param error - The error to respond with
 * @param context - Optional context for logging
 * @param statusCode - HTTP status code (default: 500)
 * @returns Object safe for NextResponse.json()
 */
export function createErrorResponse(
  error: unknown,
  context?: string,
  statusCode: number = 500
): { error: string; status: number } {
  return {
    error: sanitizeError(error, context),
    status: statusCode,
  };
}

/**
 * Mask personally identifiable information (PII) for logging
 *
 * @param value - Value that may contain PII
 * @returns Masked value safe for logs
 */
export function maskPII(value: string | null | undefined): string {
  if (!value) return "[empty]";

  // Email masking: user@example.com -> u***@example.com
  if (value.includes("@")) {
    const [username, domain] = value.split("@");
    return `${username[0]}***@${domain}`;
  }

  // UUID masking: show first/last 4 chars only
  if (value.length === 36 && value.includes("-")) {
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
  }

  // Generic: show first 3 chars
  if (value.length > 6) {
    return `${value.slice(0, 3)}***`;
  }

  return "***";
}

/**
 * Log operation with structured context (production-safe)
 *
 * @param operation - Operation name (e.g., "question_generation")
 * @param success - Whether operation succeeded
 * @param metadata - Additional context (PII will be masked)
 */
export function logOperation(
  operation: string,
  success: boolean,
  metadata?: Record<string, any>
): void {
  const sanitizedMetadata: Record<string, any> = {};

  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      // Mask sensitive fields
      if (["email", "userId", "user_id", "id"].includes(key)) {
        sanitizedMetadata[key] = maskPII(String(value));
      } else {
        sanitizedMetadata[key] = value;
      }
    }
  }

  const logEntry = {
    operation,
    success,
    timestamp: new Date().toISOString(),
    ...sanitizedMetadata,
  };

  if (success) {
    console.log(`[${operation}] Success:`, logEntry);
  } else {
    console.error(`[${operation}] Failure:`, logEntry);
  }
}

/**
 * Error classes for better error handling
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = "Insufficient permissions") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class RateLimitError extends Error {
  constructor(message: string = "Too many requests") {
    super(message);
    this.name = "RateLimitError";
  }
}
