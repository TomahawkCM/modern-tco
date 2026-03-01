import { NextResponse } from "next/server";
import { getStripe } from "@/integrations/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const userId = session.metadata?.user_id;
      if (!userId) break;

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;

      if (!subscriptionId || !customerId) break;

      // Fetch the subscription to get trial_end and current_period_end
      const subscription =
        await stripe.subscriptions.retrieve(subscriptionId);

      const periodEnd =
        subscription.items.data[0]?.current_period_end ?? null;

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: subscription.status as
            | "trialing"
            | "active"
            | "past_due"
            | "canceled",
          tier: "premium" as const,
          trial_end: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          current_period_end: periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null,
        },
        { onConflict: "user_id" }
      );
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeSubscriptionId = subscription.id;
      const updatedPeriodEnd =
        subscription.items.data[0]?.current_period_end ?? null;

      await supabase
        .from("subscriptions")
        .update({
          status: subscription.status as
            | "trialing"
            | "active"
            | "past_due"
            | "canceled",
          trial_end: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          current_period_end: updatedPeriodEnd
            ? new Date(updatedPeriodEnd * 1000).toISOString()
            : null,
        })
        .eq("stripe_subscription_id", stripeSubscriptionId);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeSubscriptionId = subscription.id;

      await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", stripeSubscriptionId);
      break;
    }

    default:
      // Unhandled event type — ignore silently
      break;
  }

  return NextResponse.json({ received: true });
}
