/**
 * PII (Personally Identifiable Information) masking utilities
 * Masks sensitive data in error logs and tracking to ensure compliance
 */

type MaskableData = string | number | boolean | null | undefined | MaskableObject | MaskableData[];
type MaskableObject = { [key: string]: MaskableData };

const PII_PATTERNS = {
  email: /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
  ipv4: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
  ipv6: /\b(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}\b/gi,
  phone: /(\+?[0-9]{1,3}[-.\s]?)?\(?[0-9]{1,4}\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  jwt: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g,
  apiKey: /\b[A-Za-z0-9]{32,}\b/g,
  uuid: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
};

const SENSITIVE_FIELD_NAMES = [
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'api_key',
  'apikey',
  'auth',
  'authorization',
  'cookie',
  'session',
  'ssn',
  'social_security',
  'credit_card',
  'creditcard',
  'cc_number',
  'cvv',
  'pin',
  'private_key',
  'privatekey',
  'email',
  'phone',
  'tel',
  'mobile',
  'address',
  'street',
  'zip',
  'postal',
  'dob',
  'date_of_birth',
  'birthdate',
  'user_id',
  'userid',
  'username',
  'user_name',
  'first_name',
  'firstname',
  'last_name',
  'lastname',
  'full_name',
  'fullname',
  'name',
];

const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'x-api-key',
  'x-auth-token',
  'x-csrf-token',
  'x-access-token',
];

/**
 * Masks sensitive strings based on PII patterns
 */
export function maskString(str: string): string {
  if (!str || typeof str !== 'string') return str;

  let masked = str;

  // Mask email addresses (keep domain for debugging)
  masked = masked.replace(PII_PATTERNS.email, (match, localPart, domain) => {
    const maskedLocal = localPart.charAt(0) + '***';
    return `${maskedLocal}@${domain}`;
  });

  // Mask IP addresses
  masked = masked.replace(PII_PATTERNS.ipv4, '***.***.***,***');
  masked = masked.replace(PII_PATTERNS.ipv6, '****:****:****:****:****:****:****:****');

  // Mask phone numbers
  masked = masked.replace(PII_PATTERNS.phone, '***-***-****');

  // Mask SSN
  masked = masked.replace(PII_PATTERNS.ssn, '***-**-****');

  // Mask credit card numbers
  masked = masked.replace(PII_PATTERNS.creditCard, '**** **** **** ****');

  // Mask JWTs (keep header for debugging)
  masked = masked.replace(PII_PATTERNS.jwt, (match) => {
    const parts = match.split('.');
    if (parts.length >= 2) {
      return parts[0] + '.*****.***';
    }
    return '***JWT***';
  });

  // Mask long API keys (but keep first few chars for debugging)
  masked = masked.replace(PII_PATTERNS.apiKey, (match) => {
    if (match.length > 40) {
      return match.substring(0, 4) + '...' + match.substring(match.length - 4);
    }
    return match;
  });

  // Mask UUIDs (keep first segment for debugging)
  masked = masked.replace(PII_PATTERNS.uuid, (match) => {
    const parts = match.split('-');
    return parts[0] + '-****-****-****-************';
  });

  return masked;
}

/**
 * Recursively masks sensitive data in objects
 */
export function maskObject<T extends MaskableData>(obj: T, depth = 0, maxDepth = 10): T {
  // Prevent infinite recursion
  if (depth > maxDepth) {
    return '[MAX_DEPTH_EXCEEDED]' as T;
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return maskString(obj) as T;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => maskObject(item, depth + 1, maxDepth)) as T;
  }

  const masked: MaskableObject = {};
  for (const [key, value] of Object.entries(obj as MaskableObject)) {
    const lowerKey = key.toLowerCase();

    // Check if field name is sensitive
    const isSensitiveField = SENSITIVE_FIELD_NAMES.some(field =>
      lowerKey.includes(field)
    );

    if (isSensitiveField) {
      // Completely mask sensitive fields
      if (typeof value === 'string' && value.length > 0) {
        masked[key] = `[REDACTED:${key}]`;
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = '[REDACTED:OBJECT]';
      } else if (typeof value === 'number') {
        masked[key] = '[REDACTED:NUMBER]';
      } else {
        masked[key] = '[REDACTED]';
      }
    } else {
      // Recursively mask nested objects
      masked[key] = maskObject(value, depth + 1, maxDepth);
    }
  }

  return masked as T;
}

/**
 * Masks headers object, with special handling for sensitive headers
 */
export function maskHeaders(headers: Record<string, string | string[]>): Record<string, string | string[]> {
  const masked: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();

    if (SENSITIVE_HEADERS.includes(lowerKey)) {
      // Keep header present but mask value
      if (Array.isArray(value)) {
        masked[key] = value.map(() => '[REDACTED:HEADER]');
      } else {
        masked[key] = '[REDACTED:HEADER]';
      }
    } else if (lowerKey.includes('auth') || lowerKey.includes('token') || lowerKey.includes('key')) {
      // Be extra cautious with auth-related headers
      masked[key] = '[REDACTED:AUTH]';
    } else {
      // Apply standard masking to header values
      if (Array.isArray(value)) {
        masked[key] = value.map(v => maskString(v));
      } else {
        masked[key] = maskString(value);
      }
    }
  }

  return masked;
}

/**
 * Masks URL, preserving structure but hiding sensitive query params
 */
export function maskUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const maskedParams = new URLSearchParams();

    for (const [key, value] of params.entries()) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_FIELD_NAMES.some(field => lowerKey.includes(field))) {
        maskedParams.set(key, '[REDACTED]');
      } else {
        maskedParams.set(key, maskString(value));
      }
    }

    urlObj.search = maskedParams.toString();
    return urlObj.toString();
  } catch {
    // If URL parsing fails, apply basic string masking
    return maskString(url);
  }
}

/**
 * Creates a safe error object for logging
 */
export function createSafeError(error: unknown): {
  message: string;
  stack?: string;
  name?: string;
  code?: string;
  [key: string]: unknown;
} {
  if (!error) {
    return { message: 'Unknown error' };
  }

  if (error instanceof Error) {
    const safeError: Record<string, unknown> = {
      message: maskString(error.message),
      name: error.name,
      stack: error.stack ? maskString(error.stack) : undefined,
    };

    // Copy additional properties but mask them
    for (const key in error) {
      if (!['message', 'name', 'stack'].includes(key)) {
        safeError[key] = maskObject((error as any)[key]);
      }
    }

    return safeError as {
      message: string;
      stack?: string;
      name?: string;
      code?: string;
      [key: string]: unknown;
    };
  }

  if (typeof error === 'string') {
    return { message: maskString(error) };
  }

  if (typeof error === 'object') {
    return maskObject(error as MaskableObject) as any;
  }

  return { message: String(error) };
}
