import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSubscription } from "@/lib/subscription";
import { rateLimitStrict, createRateLimitResponse } from "@/lib/rate-limit";
import { handleChat } from "@/server/chat";

export async function POST(request: NextRequest) {
  // 1. Rate limit (strict — 5/hour for AI chat)
  const rl = await rateLimitStrict(request);
  if (!rl.success) return createRateLimitResponse(rl);

  // 2. Authenticate
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Enforce subscription
  try {
    await requireSubscription();
  } catch {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  }

  // 4. Parse and validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
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
    return NextResponse.json({ error: "message must be 1-500 characters" }, { status: 400 });
  }

  // 5. Delegate to server layer
  try {
    const result = await handleChat(supabase, user.id, message);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 });
  }
}
