import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimitAuth, createRateLimitResponse } from "@/lib/rate-limit";
import { exchangePublicToken, isPlaidConfigured } from "@/integrations/plaid";
import { createConnectedBank } from "@/server/connected-banks";
import { encrypt } from "@/lib/encryption";

const exchangeSchema = z.object({
  public_token: z.string().min(1),
  institution_id: z.string().uuid().nullable().optional(),
});

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = exchangeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    // Exchange public token for access token
    const { accessToken } = await exchangePublicToken(parsed.data.public_token);

    // Encrypt the access token before storing
    const encryptedToken = encrypt(accessToken);

    // Create connected bank record
    const bank = await createConnectedBank(supabase, user.id, {
      provider: "plaid",
      access_token_encrypted: encryptedToken,
      institution_id: parsed.data.institution_id ?? null,
      status: "active",
    });

    return NextResponse.json({ id: bank.id, status: bank.status }, { status: 201 });
  } catch (err) {
    console.error("[plaid/exchange-token]", err);
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 });
  }
}
