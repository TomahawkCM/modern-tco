/**
 * Security utilities for Query Builder
 * Provides input sanitization, validation, and XSS prevention
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 * @param input - Raw user input
 * @param options - Sanitization options
 * @returns Sanitized string
 */
export function sanitizeInput(
  input: string,
  options: {
    allowHTML?: boolean;
    allowScripts?: boolean;
    maxLength?: number;
    pattern?: RegExp;
  } = {}
): string {
  const {
    allowHTML = false,
    allowScripts = false,
    maxLength = 10000,
    pattern
  } = options;

  // Trim and length check
  let sanitized = input.trim().substring(0, maxLength);

  // Pattern validation
  if (pattern && !pattern.test(sanitized)) {
    throw new Error('Input does not match required pattern');
  }

  // HTML sanitization
  if (allowHTML) {
    // Use DOMPurify for HTML content
    const config = allowScripts
      ? {}
      : {
          FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
          FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
        };
    sanitized = DOMPurify.sanitize(sanitized, config);
  } else {
    // Escape HTML entities for plain text
    sanitized = escapeHtml(sanitized);
  }

  return sanitized;
}

/**
 * Escape HTML entities in a string
 * @param text - Text to escape
 * @returns Escaped text
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return text.replace(/[&<>"'/]/g, char => map[char]);
}

/**
 * Validate and sanitize Tanium query syntax
 * @param query - Raw query string
 * @returns Sanitized query
 */
export function sanitizeTaniumQuery(query: string): string {
  // Remove potentially dangerous characters while preserving query syntax
  const dangerous = /[;\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
  let sanitized = query.replace(dangerous, '');

  // Validate query structure
  const validQueryPattern = /^(Get|get)\s+[\w\s,\[\]"\(\)=<>!-]+\s+(from|FROM)\s+(all machines|ALL MACHINES|[\w\s"]+)(\s+(with|WITH)\s+[\w\s,\[\]"\(\)=<>!-]+)?$/;

  if (!validQueryPattern.test(sanitized.trim())) {
    // If not a valid query format, escape special characters
    sanitized = sanitized
      .replace(/'/g, "''") // Escape single quotes
      .replace(/"/g, '""') // Escape double quotes
      .replace(/\\/g, '\\\\'); // Escape backslashes
  }

  // Limit query length
  const MAX_QUERY_LENGTH = 5000;
  return sanitized.substring(0, MAX_QUERY_LENGTH);
}

/**
 * Validate sensor names to prevent injection
 * @param sensorName - Sensor name to validate
 * @returns Valid sensor name or throws error
 */
export function validateSensorName(sensorName: string): string {
  // Allow only alphanumeric, spaces, and specific special chars
  const validPattern = /^[\w\s\-_.]+$/;

  if (!validPattern.test(sensorName)) {
    throw new Error(`Invalid sensor name: ${sensorName}`);
  }

  // Check against known malicious patterns
  const blacklist = [
    'script',
    'javascript:',
    'data:',
    'vbscript:',
    'onload',
    'onerror',
    'onclick'
  ];

  const lowerName = sensorName.toLowerCase();
  for (const pattern of blacklist) {
    if (lowerName.includes(pattern)) {
      throw new Error(`Potentially malicious sensor name: ${sensorName}`);
    }
  }

  return sensorName;
}

/**
 * Sanitize filter values based on their data type
 * @param value - Filter value
 * @param dataType - Expected data type
 * @returns Sanitized value
 */
export function sanitizeFilterValue(
  value: any,
  dataType: 'text' | 'number' | 'date' | 'boolean'
): any {
  switch (dataType) {
    case 'text':
      if (typeof value !== 'string') {
        throw new Error('Expected string value for text filter');
      }
      // Escape special regex characters if used in pattern matching
      return value
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .substring(0, 1000); // Limit length

    case 'number':
      const num = Number(value);
      if (isNaN(num) || !isFinite(num)) {
        throw new Error('Invalid number value');
      }
      // Prevent extremely large numbers that could cause issues
      if (Math.abs(num) > Number.MAX_SAFE_INTEGER) {
        throw new Error('Number exceeds safe range');
      }
      return num;

    case 'date':
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date value');
      }
      return date.toISOString();

    case 'boolean':
      return Boolean(value);

    default:
      throw new Error(`Unknown data type: ${dataType}`);
  }
}

/**
 * Validate and sanitize export filename
 * @param filename - Requested filename
 * @param extension - File extension
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string, extension: string): string {
  // Remove path traversal attempts
  let safe = filename.replace(/[\/\\:*?"<>|]/g, '_');

  // Remove leading dots
  safe = safe.replace(/^\.+/, '');

  // Limit length
  const maxLength = 200;
  if (safe.length > maxLength) {
    safe = safe.substring(0, maxLength);
  }

  // Ensure extension is safe
  const safeExtensions = ['csv', 'json', 'txt', 'xml'];
  const ext = extension.toLowerCase().replace(/^\./, '');

  if (!safeExtensions.includes(ext)) {
    throw new Error(`Unsupported file extension: ${extension}`);
  }

  // Add timestamp if no filename provided
  if (!safe || safe.trim() === '') {
    safe = `export_${Date.now()}`;
  }

  return `${safe}.${ext}`;
}

/**
 * Create a Content Security Policy for the query builder
 * @returns CSP header value
 */
export function getContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for some UI libraries
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.tanium.com", // Adjust based on API endpoints
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
}

/**
 * Rate limiting for query execution
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  constructor(
    private maxAttempts: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}

  check(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];

    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(
      time => now - time < this.windowMs
    );

    if (validAttempts.length >= this.maxAttempts) {
      return false; // Rate limit exceeded
    }

    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);

    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const queryRateLimiter = new RateLimiter(10, 60000); // 10 queries per minute

/**
 * Validate query complexity to prevent DoS
 * @param query - Query to validate
 * @returns true if query is within acceptable complexity
 */
export function validateQueryComplexity(query: string): boolean {
  // Check query length
  if (query.length > 5000) {
    throw new Error('Query is too long');
  }

  // Count sensors (prevent too many)
  const sensorMatches = query.match(/and\s+\w+/gi) || [];
  if (sensorMatches.length > 20) {
    throw new Error('Too many sensors in query (max 20)');
  }

  // Count nested conditions (prevent deep nesting)
  const nestedParens = query.match(/\(/g) || [];
  if (nestedParens.length > 10) {
    throw new Error('Query has too many nested conditions');
  }

  // Check for regex patterns that could be expensive
  const regexPattern = /matches\s+"[^"]*"/gi;
  const regexMatches = query.match(regexPattern) || [];
  for (const match of regexMatches) {
    const pattern = match.match(/"([^"]*)"/)?.[1];
    if (pattern && pattern.includes('*') && pattern.length > 100) {
      throw new Error('Regex pattern is too complex');
    }
  }

  return true;
}

/**
 * Log security events for auditing
 */
export function logSecurityEvent(
  event: 'xss_attempt' | 'injection_attempt' | 'rate_limit' | 'invalid_input',
  details: Record<string, any>
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server'
  };

  // In production, send to logging service
  console.warn('[SECURITY]', logEntry);

  // Could also send to analytics
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture('security_event', logEntry);
  }
}