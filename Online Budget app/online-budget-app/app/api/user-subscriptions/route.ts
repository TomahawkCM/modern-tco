import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createUserSubscriptionSchema } from "@/server/schemas/user-subscription";
import { listSubscriptions, createSubscription } from "@/server/user-subscriptions";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscriptions = await listSubscriptions(supabase, user.id);
    return NextResponse.json(subscriptions);
  } catch {
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

  const parsed = createUserSubscriptionSchema.safeParse(body);
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
    const subscription = await createSubscription(supabase, user.id, parsed.data);
    return NextResponse.json(subscription, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
