import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSubscription } from "@/lib/subscription";
import { handleChat } from "@/server/chat";

/**
 * Simple in-memory rate limiter.
 * Maps userId → { count, windowStart }.
 * Resets every 60 seconds per user.
 */
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit
  if (isRateLimited(user.id)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a minute." },
      { status: 429 }
    );
  }

  // 3. Enforce subscription
  try {
    await requireSubscription();
  } catch {
    return NextResponse.json(
      { error: "Subscription required" },
      { status: 403 }
    );
  }

  // 4. Parse and validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("message" in body) ||
    typeof (body as Record<string, unknown>).message !== "string"
  ) {
    return NextResponse.json(
      { error: "Missing required field: message (string)" },
      { status: 400 }
    );
  }

  const message = ((body as Record<string, unknown>).message as string).trim();
  if (message.length === 0 || message.length > 500) {
    return NextResponse.json(
      { error: "message must be 1-500 characters" },
      { status: 400 }
    );
  }

  // 5. Delegate to server layer
  try {
    const result = await handleChat(supabase, user.id, message);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
