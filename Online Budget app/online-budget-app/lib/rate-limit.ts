/**
 * Rate Limiting Utility for Next.js App Router API Routes
 *
 * Implements IP-based rate limiting with Supabase-backed persistent storage.
 * Falls back to in-memory storage if Supabase is unavailable.
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

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";

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
  prefix?: string; // key prefix for namespacing (e.g. "login", "signup")
}

// ── In-memory fallback ──────────────────────────────────────────────

interface MemoryEntry {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, MemoryEntry>();

function cleanupMemoryStore() {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.resetTime) memoryStore.delete(key);
  }
}

setInterval(cleanupMemoryStore, 5 * 60 * 1000);

// ── Supabase admin client (singleton) ───────────────────────────────

type TypedSupabaseClient = ReturnType<typeof createSupabaseClient<Database>>;
let adminClient: TypedSupabaseClient | null = null;

function getAdminClient(): TypedSupabaseClient | null {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  adminClient = createSupabaseClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}

// ── IP extraction ───────────────────────────────────────────────────

function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? forwarded;

  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;

  return "unknown-ip";
}

// ── Supabase-backed rate limiter ────────────────────────────────────

async function rateLimitWithSupabase(
  key: string,
  config: RateLimitConfig,
  supabase: TypedSupabaseClient
): Promise<{ count: number; windowStart: Date }> {
  const now = new Date();

  // Try to get existing entry
  const { data: existing } = await supabase
    .from("rate_limits")
    .select("count, window_start, window_ms")
    .eq("key", key)
    .single();

  if (existing) {
    const windowEnd = new Date(new Date(existing.window_start).getTime() + existing.window_ms);

    if (now < windowEnd) {
      // Within window — increment
      const { data: updated } = await supabase
        .from("rate_limits")
        .update({ count: existing.count + 1 })
        .eq("key", key)
        .select("count, window_start")
        .single();

      return {
        count: updated?.count ?? existing.count + 1,
        windowStart: new Date(updated?.window_start ?? existing.window_start),
      };
    }

    // Window expired — reset
    const { data: reset } = await supabase
      .from("rate_limits")
      .update({
        count: 1,
        window_start: now.toISOString(),
        window_ms: config.interval,
      })
      .eq("key", key)
      .select("count, window_start")
      .single();

    return {
      count: reset?.count ?? 1,
      windowStart: new Date(reset?.window_start ?? now),
    };
  }

  // No entry — create new
  await supabase.from("rate_limits").upsert({
    key,
    count: 1,
    window_start: now.toISOString(),
    window_ms: config.interval,
  });

  return { count: 1, windowStart: now };
}

// ── In-memory fallback rate limiter ─────────────────────────────────

function rateLimitWithMemory(
  key: string,
  config: RateLimitConfig
): { count: number; resetTime: number } {
  const now = Date.now();
  let entry = memoryStore.get(key);

  if (!entry || now > entry.resetTime) {
    entry = { count: 0, resetTime: now + config.interval };
    memoryStore.set(key, entry);
  }

  entry.count += 1;
  return { count: entry.count, resetTime: entry.resetTime };
}

// ── Main rate limit function ────────────────────────────────────────

export async function rateLimit(
  request: Request,
  config: RateLimitConfig = {
    interval: 15 * 60 * 1000, // 15 minutes
    uniqueTokenPerInterval: 10,
  }
): Promise<RateLimitResult> {
  const ip = getClientIP(request);
  const prefix = config.prefix || "default";
  const key = `rate-limit:${prefix}:${ip}`;

  let count: number;
  let resetTime: number;

  const supabase = getAdminClient();

  if (supabase) {
    try {
      const result = await rateLimitWithSupabase(key, config, supabase);
      count = result.count;
      resetTime = result.windowStart.getTime() + config.interval;
    } catch {
      // Supabase unavailable — fall back to memory
      const result = rateLimitWithMemory(key, config);
      count = result.count;
      resetTime = result.resetTime;
    }
  } else {
    const result = rateLimitWithMemory(key, config);
    count = result.count;
    resetTime = result.resetTime;
  }

  const remaining = Math.max(0, config.uniqueTokenPerInterval - count);
  const reset = Math.ceil(resetTime / 1000);
  const retryAfter = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": config.uniqueTokenPerInterval.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
  };

  if (count > config.uniqueTokenPerInterval) {
    headers["Retry-After"] = retryAfter.toString();
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

// ── Preset rate limiters ────────────────────────────────────────────

/** 30 requests per 15 minutes — for authenticated mutation routes */
export async function rateLimitAuth(request: Request): Promise<RateLimitResult> {
  return rateLimit(request, {
    interval: 15 * 60 * 1000,
    uniqueTokenPerInterval: 30,
    prefix: "auth-mutation",
  });
}

/** 5 requests per hour — for expensive operations (AI chat) */
export async function rateLimitStrict(request: Request): Promise<RateLimitResult> {
  return rateLimit(request, {
    interval: 60 * 60 * 1000,
    uniqueTokenPerInterval: 5,
    prefix: "strict",
  });
}

/** 5 login attempts per minute */
export async function rateLimitLogin(request: Request): Promise<RateLimitResult> {
  return rateLimit(request, {
    interval: 60 * 1000,
    uniqueTokenPerInterval: 5,
    prefix: "login",
  });
}

/** 3 signup attempts per minute */
export async function rateLimitSignup(request: Request): Promise<RateLimitResult> {
  return rateLimit(request, {
    interval: 60 * 1000,
    uniqueTokenPerInterval: 3,
    prefix: "signup",
  });
}

/** 2 password reset attempts per minute */
export async function rateLimitPasswordReset(request: Request): Promise<RateLimitResult> {
  return rateLimit(request, {
    interval: 60 * 1000,
    uniqueTokenPerInterval: 2,
    prefix: "password-reset",
  });
}

// ── Response helper ─────────────────────────────────────────────────

/** Standardized 429 JSON response */
export function createRateLimitResponse(rateLimitResult: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Too Many Requests",
      message: `Rate limit exceeded. Try again later.`,
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
