import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitAuth, createRateLimitResponse } from "@/lib/rate-limit";
import { getStripe } from "@/integrations/stripe";

export async function POST(request: Request) {
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

  const stripe = getStripe();
  const origin = new URL(request.url).origin;

  const priceId = process.env.STRIPE_PRICE_PREMIUM_MONTHLY;
  if (!priceId) {
    return NextResponse.json({ error: "Stripe price not configured" }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email,
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=canceled`,
    subscription_data: {
      trial_period_days: 14,
      metadata: { user_id: user.id },
    },
    metadata: { user_id: user.id },
  });

  return NextResponse.json({ url: session.url });
}
