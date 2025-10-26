/**
 * Rate Limiting Utility for Next.js App Router API Routes
 *
 * Implements IP-based rate limiting with in-memory storage
 * Default: 10 requests per 15 minutes per IP
 *
 * Usage:
 *   import { rateLimit } from '@/lib/rate-limit';
 *
 *   export async function POST(request: Request) {
 *     const rateLimitResult = await rateLimit(request);
 *     if (!rateLimitResult.success) {
 *       return new Response('Too Many Requests', {
 *         status: 429,
 *         headers: rateLimitResult.headers,
 *       });
 *     }
 *     // ... handle request
 *   }
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  headers: Record<string, string>;
}

interface RateLimitConfig {
  interval: number; // milliseconds
  uniqueTokenPerInterval: number; // max requests per interval
}

// In-memory store for rate limits (resets on server restart)
// For production, consider Redis or Upstash Rate Limit
const rateLimitStore = new Map<string, RateLimitStore>();

/**
 * Clean up expired entries from rate limit store
 * Runs every 5 minutes to prevent memory leaks
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Extract client IP address from request
 * Supports: x-forwarded-for, x-real-ip, and direct connection IP
 */
function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to a default (for development)
  return 'unknown-ip';
}

/**
 * Rate limit API requests based on IP address
 *
 * @param request - The incoming Request object
 * @param config - Rate limit configuration (optional)
 * @returns RateLimitResult with success status and headers
 */
export async function rateLimit(
  request: Request,
  config: RateLimitConfig = {
    interval: 15 * 60 * 1000, // 15 minutes
    uniqueTokenPerInterval: 10, // 10 requests
  }
): Promise<RateLimitResult> {
  const ip = getClientIP(request);
  const key = `rate-limit:${ip}`;
  const now = Date.now();

  // Get existing rate limit data or create new
  let tokenData = rateLimitStore.get(key);

  if (!tokenData || now > tokenData.resetTime) {
    // Reset or initialize rate limit
    tokenData = {
      count: 0,
      resetTime: now + config.interval,
    };
    rateLimitStore.set(key, tokenData);
  }

  // Increment request count
  tokenData.count += 1;

  const remaining = Math.max(0, config.uniqueTokenPerInterval - tokenData.count);
  const reset = Math.ceil(tokenData.resetTime / 1000); // Unix timestamp in seconds
  const resetMs = tokenData.resetTime - now;
  const retryAfter = Math.ceil(resetMs / 1000); // Seconds until reset

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': config.uniqueTokenPerInterval.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };

  // Check if rate limit exceeded
  if (tokenData.count > config.uniqueTokenPerInterval) {
    headers['Retry-After'] = retryAfter.toString();

    return {
      success: false,
      limit: config.uniqueTokenPerInterval,
      remaining: 0,
      reset,
      headers,
    };
  }

  return {
    success: true,
    limit: config.uniqueTokenPerInterval,
    remaining,
    reset,
    headers,
  };
}

/**
 * Higher rate limit for authenticated users
 * 30 requests per 15 minutes
 */
export async function rateLimitAuth(request: Request): Promise<RateLimitResult> {
  return rateLimit(request, {
    interval: 15 * 60 * 1000,
    uniqueTokenPerInterval: 30,
  });
}

/**
 * Stricter rate limit for expensive operations (e.g., AI generation)
 * 5 requests per hour
 */
export async function rateLimitStrict(request: Request): Promise<RateLimitResult> {
  return rateLimit(request, {
    interval: 60 * 60 * 1000, // 1 hour
    uniqueTokenPerInterval: 5,
  });
}

/**
 * Create a standardized 429 error response
 */
export function createRateLimitResponse(rateLimitResult: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${rateLimitResult.headers['Retry-After']} seconds.`,
      limit: rateLimitResult.limit,
      remaining: 0,
      reset: rateLimitResult.reset,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...rateLimitResult.headers,
      },
    }
  );
}
