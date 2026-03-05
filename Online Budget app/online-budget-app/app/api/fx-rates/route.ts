import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitAuth, createRateLimitResponse } from "@/lib/rate-limit";
import { getRates } from "@/lib/currency";

export async function GET(request: NextRequest) {
  const rl = await rateLimitAuth(request);
  if (!rl.success) return createRateLimitResponse(rl);

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const base = searchParams.get("base");
  const targetsParam = searchParams.get("targets");

  if (!base || !targetsParam) {
    return NextResponse.json({ error: "Missing required params: base, targets" }, { status: 400 });
  }

  const targets = targetsParam.split(",").map((t) => t.trim().toUpperCase());

  try {
    const rates = await getRates(base.toUpperCase(), targets, supabase);
    return NextResponse.json(rates);
  } catch (err) {
    console.error("[fx-rates]", err);
    return NextResponse.json({ error: "Failed to fetch exchange rates" }, { status: 502 });
  }
}
