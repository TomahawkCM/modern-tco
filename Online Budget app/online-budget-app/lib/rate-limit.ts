/**
 * Rate Limiting Utility for Next.js App Router API Routes
 *
 * Implements IP-based rate limiting with in-memory storage.
 * Default: 10 requests per 15 minutes per IP.
 *
 * Usage:
 *   import { rateLimit, createRateLimitResponse } from '@/lib/rate-limit';
 *
 *   export async function POST(request: Request) {
 *     const result = await rateLimit(request);
 *     if (!result.success) return createRateLimitResponse(result);
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

// In-memory store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitStore>();

/**
 * Clean up expired entries every 5 minutes to prevent memory leaks
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Extract client IP from request headers
 */
function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? forwarded;

  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;

  return "unknown-ip";
}

/**
 * Rate limit API requests based on IP address
 */
export async function rateLimit(
  request: Request,
  config: RateLimitConfig = {
    interval: 15 * 60 * 1000, // 15 minutes
    uniqueTokenPerInterval: 10,
  }
): Promise<RateLimitResult> {
  const ip = getClientIP(request);
  const key = `rate-limit:${ip}`;
  const now = Date.now();

  let tokenData = rateLimitStore.get(key);

  if (!tokenData || now > tokenData.resetTime) {
    tokenData = { count: 0, resetTime: now + config.interval };
    rateLimitStore.set(key, tokenData);
  }

  tokenData.count += 1;

  const remaining = Math.max(0, config.uniqueTokenPerInterval - tokenData.count);
  const reset = Math.ceil(tokenData.resetTime / 1000);
  const retryAfter = Math.ceil((tokenData.resetTime - now) / 1000);

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": config.uniqueTokenPerInterval.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
  };

  if (tokenData.count > config.uniqueTokenPerInterval) {
    headers["Retry-After"] = retryAfter.toString();
    return { success: false, limit: config.uniqueTokenPerInterval, remaining: 0, reset, headers };
  }

  return {
    success: true,
    limit: config.uniqueTokenPerInterval,
    remaining,
    reset,
    headers,
  };
}

/** 30 requests per 15 minutes — for authenticated mutation routes */
export async function rateLimitAuth(request: Request): Promise<RateLimitResult> {
  return rateLimit(request, {
    interval: 15 * 60 * 1000,
    uniqueTokenPerInterval: 30,
  });
}

/** 5 requests per hour — for expensive operations (AI chat) */
export async function rateLimitStrict(request: Request): Promise<RateLimitResult> {
  return rateLimit(request, {
    interval: 60 * 60 * 1000,
    uniqueTokenPerInterval: 5,
  });
}

/** Standardized 429 JSON response */
export function createRateLimitResponse(rateLimitResult: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Too Many Requests",
      message: `Rate limit exceeded. Try again in ${rateLimitResult.headers["Retry-After"]} seconds.`,
      limit: rateLimitResult.limit,
      remaining: 0,
      reset: rateLimitResult.reset,
    }),
    {
      status: 429,
      headers: { "Content-Type": "application/json", ...rateLimitResult.headers },
    }
  );
}
