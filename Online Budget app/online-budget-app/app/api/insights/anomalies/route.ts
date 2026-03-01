import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSubscription } from "@/lib/subscription";
import { getAnomalies } from "@/server/insights";

export async function GET() {
  // 1. Authenticate
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Enforce subscription before any LLM call
  try {
    await requireSubscription();
  } catch {
    return NextResponse.json(
      { error: "Subscription required" },
      { status: 403 }
    );
  }

  // 3. Delegate to server layer
  try {
    const result = await getAnomalies(supabase, user.id);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to detect anomalies" },
      { status: 500 }
    );
  }
}
