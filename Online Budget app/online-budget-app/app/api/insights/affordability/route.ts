import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSubscription } from "@/lib/subscription";
import { getAffordability } from "@/server/insights";

export async function GET(request: NextRequest) {
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

  // 3. Validate query parameters
  const params = request.nextUrl.searchParams;
  const amountRaw = params.get("amount_minor");
  const item = params.get("item");
  const isRecurringRaw = params.get("is_recurring");

  if (!amountRaw || !item) {
    return NextResponse.json(
      { error: "Missing required parameters: amount_minor, item" },
      { status: 400 }
    );
  }

  const amountMinor = parseInt(amountRaw, 10);
  if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
    return NextResponse.json(
      { error: "amount_minor must be a positive integer" },
      { status: 400 }
    );
  }

  const itemDescription = item.trim();
  if (itemDescription.length === 0 || itemDescription.length > 200) {
    return NextResponse.json(
      { error: "item must be 1-200 characters" },
      { status: 400 }
    );
  }

  const isRecurring = isRecurringRaw === "true";

  // 4. Delegate to server layer
  try {
    const result = await getAffordability(
      supabase,
      user.id,
      amountMinor,
      itemDescription,
      isRecurring
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to check affordability" },
      { status: 500 }
    );
  }
}
