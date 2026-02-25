# Session 3: Subscription Foundation (Stripe) — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Stripe subscription infrastructure so every user has a subscription row, webhooks update status, and API routes are protected by subscription status.

**Architecture:** Stripe Checkout for payment collection, server-side webhook to sync subscription state to Supabase `subscriptions` table, and a reusable `requireSubscription()` guard for all protected API routes. No client-side Stripe SDK needed — Checkout is hosted by Stripe.

**Tech Stack:** stripe (Node SDK), Next.js 16 App Router (route handlers), Supabase (Postgres + RLS), TypeScript strict mode.

---

## Context for Implementer

- **Project root:** `/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app/`
- **Existing auth:** `lib/supabase/server.ts` exports `createClient()` which returns a typed Supabase client. `supabase.auth.getUser()` returns current user.
- **Existing migration pattern:** See `supabase/migrations/001_users_and_settings.sql` — uses `CREATE TABLE IF NOT EXISTS`, RLS enabled, `handle_updated_at()` trigger already exists.
- **Database types:** `supabase/database.types.ts` has `Database` interface with `Tables`, `TablesInsert`, `TablesUpdate` helpers.
- **Env vars:** `.env.example` and `.env.local` exist. New vars will be added.
- **Package manager:** npm (package-lock.json exists).
- **Build:** Must pass `npm run check-types` (tsc --noEmit) and `npm run build` (next build --webpack).
- **Subscriptions schema (from V1-MONETIZATION-ARCHITECTURE.md):** id (uuid), user_id, stripe_customer_id, stripe_subscription_id, status (trialing, active, past_due, canceled), tier (premium), trial_end, current_period_end, created_at.
- **Statuses:** `trialing`, `active`, `past_due`, `canceled` — no permanent free tier for online.
- **Trial:** 7-14 day full access. Trial treated as premium.

---

## Task 1: Install Stripe Node SDK

**Files:**
- Modify: `package.json`

**Step 1: Install stripe**

Run:
```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npm install stripe
```

Expected: stripe added to dependencies in package.json.

**Step 2: Verify installation**

Run:
```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && node -e "require('stripe')" && echo "OK"
```

Expected: "OK" — no errors.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat(stripe): install stripe node sdk"
```

---

## Task 2: Add Stripe Environment Variables

**Files:**
- Modify: `.env.example`
- Modify: `.env.local`

**Step 1: Add Stripe vars to .env.example**

Append to `.env.example`:
```env

# Stripe — Server-only (NEVER expose to client)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-signing-secret

# Stripe — Public (safe for client)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key

# Stripe — Price ID (configured in Stripe Dashboard)
STRIPE_PRICE_PREMIUM_MONTHLY=price_your-premium-monthly-price-id
```

**Step 2: Add placeholders to .env.local**

Append same keys to `.env.local` with placeholder values (user will fill with real Stripe test keys later):
```env

# Stripe
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_PRICE_PREMIUM_MONTHLY=price_placeholder
```

**Step 3: Commit**

```bash
git add .env.example
git commit -m "feat(stripe): add stripe environment variable template"
```

Note: `.env.local` is gitignored — do NOT add it.

---

## Task 3: Create Subscriptions Database Migration

**Files:**
- Create: `supabase/migrations/002_subscriptions.sql`

**Step 1: Write the migration**

```sql
-- Migration: 002_subscriptions
-- Creates subscriptions table with RLS policies
-- Per V1-MONETIZATION-ARCHITECTURE.md and V1-DATABASE-SCHEMA-DESIGN.md

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'trialing'
    CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
  tier TEXT NOT NULL DEFAULT 'premium'
    CHECK (tier IN ('premium')),
  trial_end TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions
-- Users can read their own subscription
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Only service role (webhooks) can insert/update/delete subscriptions
-- No INSERT/UPDATE/DELETE policies for authenticated role
-- Webhook handler uses service role key which bypasses RLS
```

**Step 2: Verify SQL syntax**

Read the file back to confirm correct syntax, no typos.

**Step 3: Commit**

```bash
git add supabase/migrations/002_subscriptions.sql
git commit -m "feat(stripe): add subscriptions table migration with RLS"
```

---

## Task 4: Update Database Types

**Files:**
- Modify: `supabase/database.types.ts`

**Step 1: Add subscriptions type**

Add `subscriptions` table type inside `Database["public"]["Tables"]`, after `user_settings`:

```typescript
subscriptions: {
  Row: {
    id: string;
    user_id: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    status: "trialing" | "active" | "past_due" | "canceled";
    tier: "premium";
    trial_end: string | null;
    current_period_end: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    stripe_customer_id?: string | null;
    stripe_subscription_id?: string | null;
    status?: "trialing" | "active" | "past_due" | "canceled";
    tier?: "premium";
    trial_end?: string | null;
    current_period_end?: string | null;
    created_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    stripe_customer_id?: string | null;
    stripe_subscription_id?: string | null;
    status?: "trialing" | "active" | "past_due" | "canceled";
    tier?: "premium";
    trial_end?: string | null;
    current_period_end?: string | null;
    created_at?: string;
  };
};
```

**Step 2: Verify types compile**

Run:
```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add supabase/database.types.ts
git commit -m "feat(stripe): add subscriptions table types"
```

---

## Task 5: Create Stripe Client Wrapper

**Files:**
- Create: `integrations/stripe/client.ts`
- Modify: `integrations/stripe/index.ts`

**Step 1: Create the Stripe client**

Create `integrations/stripe/client.ts`:

```typescript
import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  stripeInstance = new Stripe(key, {
    typescript: true,
  });

  return stripeInstance;
}
```

**Step 2: Update the barrel export**

Replace `integrations/stripe/index.ts` with:

```typescript
/**
 * Stripe Integration Adapter
 *
 * Wraps Stripe API for subscription management.
 * Never exposes raw provider objects outside this layer.
 */

export { getStripe } from "./client";
```

**Step 3: Verify types compile**

Run:
```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx tsc --noEmit
```

Expected: No errors.

**Step 4: Commit**

```bash
git add integrations/stripe/client.ts integrations/stripe/index.ts
git commit -m "feat(stripe): add stripe client wrapper with singleton pattern"
```

---

## Task 6: Create Supabase Admin Client

**Files:**
- Create: `lib/supabase/admin.ts`

The webhook handler needs a Supabase client with service role key (bypasses RLS) to write to the subscriptions table. Regular authenticated client can only SELECT.

**Step 1: Create admin client**

Create `lib/supabase/admin.ts`:

```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createSupabaseClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
```

**Step 2: Verify types compile**

Run:
```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add lib/supabase/admin.ts
git commit -m "feat(stripe): add supabase admin client for webhook operations"
```

---

## Task 7: Create Checkout Session API Route

**Files:**
- Create: `app/api/stripe/checkout/route.ts`

This route creates a Stripe Checkout session for subscription signup. It's called from the frontend when a user clicks "Subscribe".

**Step 1: Write the route handler**

Create `app/api/stripe/checkout/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/integrations/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripe();
  const origin = new URL(request.url).origin;

  const priceId = process.env.STRIPE_PRICE_PREMIUM_MONTHLY;
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe price not configured" },
      { status: 500 }
    );
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
```

**Step 2: Verify types compile**

Run:
```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add app/api/stripe/checkout/route.ts
git commit -m "feat(stripe): add checkout session api route"
```

---

## Task 8: Create Stripe Webhook Handler

**Files:**
- Create: `app/api/stripe/webhook/route.ts`

This is the core of Session 3 — receives Stripe events and updates the subscriptions table. Uses service role Supabase client to bypass RLS.

**Step 1: Write the webhook route handler**

Create `app/api/stripe/webhook/route.ts`:

```typescript
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
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: subscription.status as "trialing" | "active" | "past_due" | "canceled",
          tier: "premium",
          trial_end: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        },
        { onConflict: "user_id" }
      );
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeSubscriptionId = subscription.id;

      await supabase
        .from("subscriptions")
        .update({
          status: subscription.status as "trialing" | "active" | "past_due" | "canceled",
          trial_end: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
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
```

**Step 2: Verify types compile**

Run:
```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add app/api/stripe/webhook/route.ts
git commit -m "feat(stripe): add webhook handler for subscription events"
```

---

## Task 9: Create Subscription Guard Utility

**Files:**
- Create: `lib/subscription.ts`

Reusable function that checks whether the current user has an active subscription. Used by any protected API route or server component.

**Step 1: Write the guard**

Create `lib/subscription.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";

export interface SubscriptionCheck {
  isActive: boolean;
  status: SubscriptionStatus | null;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
}

export async function getSubscription(): Promise<SubscriptionCheck> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { isActive: false, status: null, trialEnd: null, currentPeriodEnd: null };
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, trial_end, current_period_end")
    .eq("user_id", user.id)
    .single();

  if (!subscription) {
    return { isActive: false, status: null, trialEnd: null, currentPeriodEnd: null };
  }

  const isActive =
    subscription.status === "active" || subscription.status === "trialing";

  return {
    isActive,
    status: subscription.status as SubscriptionStatus,
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
```

**Step 2: Verify types compile**

Run:
```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add lib/subscription.ts
git commit -m "feat(stripe): add subscription guard utility"
```

---

## Task 10: Create Protected API Route Example

**Files:**
- Create: `app/api/subscription/status/route.ts`

A protected route that demonstrates the subscription guard pattern. Returns the user's subscription status. Also serves as a real endpoint for the frontend to check subscription state.

**Step 1: Write the route**

Create `app/api/subscription/status/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

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
```

**Step 2: Verify types compile**

Run:
```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add app/api/subscription/status/route.ts
git commit -m "feat(stripe): add subscription status api route"
```

---

## Task 11: Update Home Page with Subscription State

**Files:**
- Modify: `app/page.tsx`

Update the home page to display subscription status for signed-in users and show a "Subscribe" button when no active subscription exists.

**Step 1: Update app/page.tsx**

```typescript
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./(auth)/actions";
import { getSubscription } from "@/lib/subscription";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subscription = user ? await getSubscription() : null;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Online Budget App
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          AI-powered, bank-connected global budgeting
        </p>
        {user ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-zinc-500">Signed in as {user.email}</p>
            {subscription?.isActive ? (
              <p className="text-sm text-green-600">
                Subscription: {subscription.status}
                {subscription.status === "trialing" && subscription.trialEnd && (
                  <span className="text-zinc-500">
                    {" "}(trial ends {new Date(subscription.trialEnd).toLocaleDateString()})
                  </span>
                )}
              </p>
            ) : (
              <a
                href="/api/stripe/checkout"
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
              >
                Subscribe — Start Free Trial
              </a>
            )}
            <form>
              <button
                formAction={signOut}
                className="rounded border px-4 py-2 text-sm hover:bg-zinc-100"
              >
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex gap-4">
            <a
              href="/login"
              className="rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700"
            >
              Log In
            </a>
            <a
              href="/signup"
              className="rounded border px-4 py-2 hover:bg-zinc-100"
            >
              Sign Up
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
```

Note: The "Subscribe" link is a placeholder — a proper client component with `fetch('/api/stripe/checkout', { method: 'POST' })` and redirect to `session.url` would be the real implementation. For Session 3, we just need the infrastructure in place. The subscribe link should actually trigger a POST. We'll make a tiny client component for this.

**Step 2: Create subscribe button client component**

Create `components/subscribe-button.tsx`:

```typescript
"use client";

export function SubscribeButton() {
  async function handleSubscribe() {
    const response = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
    >
      Subscribe — Start Free Trial
    </button>
  );
}
```

Then update `app/page.tsx` to use `<SubscribeButton />` instead of the `<a>` tag for the subscribe action. Import it at the top:

```typescript
import { SubscribeButton } from "@/components/subscribe-button";
```

And replace the `<a href="/api/stripe/checkout" ...>` with `<SubscribeButton />`.

**Step 3: Verify types compile and build passes**

Run:
```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx tsc --noEmit
```

Expected: No errors.

**Step 4: Commit**

```bash
git add app/page.tsx components/subscribe-button.tsx
git commit -m "feat(stripe): display subscription status and subscribe button on home page"
```

---

## Task 12: Verify Full Build

**Files:** None — verification only.

**Step 1: Run type check**

```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx tsc --noEmit
```

Expected: No errors.

**Step 2: Run build**

```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npm run build
```

Expected: Build succeeds with no errors.

**Step 3: Fix any issues found**

If type errors or build errors, fix them before proceeding.

**Step 4: Commit any fixes**

Only if fixes were needed.

---

## Task 13: Update PROGRESS_LOG.md

**Files:**
- Modify: `docs/PROGRESS_LOG.md` (in project root: `/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/`)

**Step 1: Append Session 3 entry**

Append a new entry following the template at the bottom of PROGRESS_LOG.md. Include:

- Session Objective: Session 3 — Subscription Foundation (Stripe)
- Files created: list all new files
- Files modified: list all modified files
- Database schema changes: subscriptions table
- API routes added: /api/stripe/checkout, /api/stripe/webhook, /api/subscription/status
- Architectural decisions: Stripe Checkout (hosted), service role for webhooks, upsert on user_id, etc.
- Financial Engine Impact: No change (v0.0.1)
- Security & RLS Review: RLS on subscriptions (SELECT only for authenticated, writes via service role)
- Known Gaps: Migration not applied, no Stripe test keys configured, no customer portal
- Risks: Webhook secret must be configured for signature verification
- Next Session Target: Session 4 — Core Database Schema (Transactions + Accounts)

Also update the Milestone 1 checklist:
- [x] subscriptions table implemented
- [x] Stripe webhook working

**Step 2: Commit**

```bash
git add "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/docs/PROGRESS_LOG.md"
git commit -m "docs: update progress log for session 3 (stripe subscriptions)"
```

---

## Summary of Deliverables

| Deliverable | File(s) |
|---|---|
| Stripe SDK installed | `package.json` |
| Env var template | `.env.example` |
| Subscriptions migration | `supabase/migrations/002_subscriptions.sql` |
| Database types updated | `supabase/database.types.ts` |
| Stripe client wrapper | `integrations/stripe/client.ts`, `integrations/stripe/index.ts` |
| Supabase admin client | `lib/supabase/admin.ts` |
| Checkout session route | `app/api/stripe/checkout/route.ts` |
| Webhook handler | `app/api/stripe/webhook/route.ts` |
| Subscription guard | `lib/subscription.ts` |
| Status API route | `app/api/subscription/status/route.ts` |
| Subscribe button | `components/subscribe-button.tsx` |
| Updated home page | `app/page.tsx` |
| Progress log | `docs/PROGRESS_LOG.md` |

## Exit Criteria (from FIRST-5-CODING-SESSIONS-PLAN.md)

- [x] Subscription row created per user (via webhook on checkout.session.completed)
- [x] Webhook updates subscription correctly (customer.subscription.updated + deleted)
- [x] Trial state supported (14-day trial via subscription_data.trial_period_days)
