import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await getSubscription();

  return NextResponse.json({
    userId: user.id,
    subscription: {
      isActive: subscription.isActive,
      status: subscription.status,
      trialEnd: subscription.trialEnd,
      currentPeriodEnd: subscription.currentPeriodEnd,
    },
  });
}
