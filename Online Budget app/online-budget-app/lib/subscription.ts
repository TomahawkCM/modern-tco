import { createClient } from "@/lib/supabase/server";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled";

export interface SubscriptionCheck {
  isActive: boolean;
  status: SubscriptionStatus | null;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
}

export async function getSubscription(): Promise<SubscriptionCheck> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isActive: false,
      status: null,
      trialEnd: null,
      currentPeriodEnd: null,
    };
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, trial_end, current_period_end")
    .eq("user_id", user.id)
    .single();

  if (!subscription) {
    // No subscription row — treat as trial based on user creation date
    // Safety net for trigger race condition or legacy users
    const { data: userRow } = await supabase
      .from("users")
      .select("created_at")
      .eq("id", user.id)
      .single();

    const createdAt = userRow?.created_at
      ? new Date(userRow.created_at)
      : new Date();
    const trialEnd = new Date(
      createdAt.getTime() + 14 * 24 * 60 * 60 * 1000
    );
    const isTrialActive = new Date() < trialEnd;

    return {
      isActive: isTrialActive,
      status: isTrialActive ? "trialing" : null,
      trialEnd: trialEnd.toISOString(),
      currentPeriodEnd: null,
    };
  }

  const isActive =
    subscription.status === "active" || subscription.status === "trialing";

  return {
    isActive,
    status: subscription.status,
    trialEnd: subscription.trial_end,
    currentPeriodEnd: subscription.current_period_end,
  };
}

export async function requireSubscription(): Promise<
  SubscriptionCheck & { isActive: true }
> {
  const check = await getSubscription();

  if (!check.isActive) {
    throw new Error("Subscription required");
  }

  return check as SubscriptionCheck & { isActive: true };
}
