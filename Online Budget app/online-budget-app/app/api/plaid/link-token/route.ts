import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitAuth, createRateLimitResponse } from "@/lib/rate-limit";
import { createLinkToken, isPlaidConfigured } from "@/integrations/plaid";

export async function POST(request: NextRequest) {
  const rl = await rateLimitAuth(request);
  if (!rl.success) return createRateLimitResponse(rl);

  if (!isPlaidConfigured()) {
    return NextResponse.json({ error: "Bank sync is not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const linkToken = await createLinkToken(user.id);
    return NextResponse.json({ link_token: linkToken });
  } catch (err) {
    console.error("[plaid/link-token]", err);
    return NextResponse.json({ error: "Failed to create link token" }, { status: 500 });
  }
}
