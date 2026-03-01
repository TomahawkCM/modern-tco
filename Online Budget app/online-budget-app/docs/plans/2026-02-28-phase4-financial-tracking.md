# Phase 4: Financial Tracking — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add subscriptions, loans (4 pages), investments, properties (2 pages), and net worth tracking — 9 new pages total, 8 new Supabase tables, 5 server function files, 14 API route files, and 5 i18n namespaces.

**Architecture:** Server components fetch data from Supabase via server functions, pass props to client companion components. Client components call API routes for mutations. All financial amounts stored as `amount_minor` (integer cents). Charts use lazy-loaded recharts. Loan amortization reuses the existing calculator engine.

**Tech Stack:** Next.js 16, React 19, Supabase (PostgreSQL + RLS), TypeScript 5.9, Zod, recharts (lazy), shadcn/ui, next-intl

---

## File Inventory

All paths relative to `Online Budget app/online-budget-app/`.

### New Files to Create (46 files)

**Migration & Types (2):**

- `supabase/migrations/009_financial_tracking.sql`
- (modify) `supabase/database.types.ts` — add 8 table definitions

**Zod Schemas (5):**

- `server/schemas/user-subscription.ts`
- `server/schemas/loan.ts`
- `server/schemas/investment.ts`
- `server/schemas/property.ts`
- `server/schemas/net-worth.ts`

**Server Functions (5):**

- `server/user-subscriptions.ts`
- `server/loans.ts`
- `server/investments.ts`
- `server/properties.ts`
- `server/net-worth.ts`

**API Routes (14):**

- `app/api/user-subscriptions/route.ts`
- `app/api/user-subscriptions/[id]/route.ts`
- `app/api/loans/route.ts`
- `app/api/loans/[id]/route.ts`
- `app/api/loans/[id]/payments/route.ts`
- `app/api/investments/route.ts`
- `app/api/investments/[id]/route.ts`
- `app/api/investments/[id]/holdings/route.ts`
- `app/api/investments/[id]/holdings/[holdingId]/route.ts`
- `app/api/properties/route.ts`
- `app/api/properties/[id]/route.ts`
- `app/api/net-worth/route.ts`
- `app/api/net-worth/snapshot/route.ts`

**Engine (1):**

- `engine/loans/calculations.ts`

**Pages (9):**

- `app/(app)/subscriptions/page.tsx`
- `app/(app)/loans/page.tsx`
- `app/(app)/loans/new/page.tsx`
- `app/(app)/loans/[id]/page.tsx`
- `app/(app)/loans/[id]/edit/page.tsx`
- `app/(app)/investments/page.tsx`
- `app/(app)/properties/page.tsx`
- `app/(app)/properties/[id]/page.tsx`
- `app/(app)/net-worth/page.tsx`

**Client Components (10):**

- `components/subscriptions/subscription-list.tsx`
- `components/loans/loan-list.tsx`
- `components/loans/loan-form.tsx`
- `components/loans/loan-detail.tsx`
- `components/investments/investment-list.tsx`
- `components/properties/property-list.tsx`
- `components/properties/property-detail.tsx`
- `components/net-worth/net-worth-dashboard.tsx`

**i18n (modify 1):**

- (modify) `i18n/messages/en.json` — add 5 namespaces

---

## Established Patterns (Reference)

### Server Function Pattern (`server/accounts.ts`)

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type { CreateXInput, UpdateXInput } from "./schemas/x";

type XRow = Database["public"]["Tables"]["table_name"]["Row"];

export async function listX(supabase: SupabaseClient<Database>, userId: string): Promise<XRow[]> {
  const { data, error } = await supabase
    .from("table_name")
    .select("*")
    .eq("user_id", userId)
    .order("name")
    .returns<XRow[]>();
  if (error) throw error;
  return data ?? [];
}

export async function createX(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateXInput
): Promise<XRow> {
  const { data, error } = await supabase
    .from("table_name")
    .insert({ user_id: userId, ...input })
    .select("*")
    .returns<XRow[]>()
    .single();
  if (error) throw error;
  return data;
}

export async function updateX(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string,
  input: UpdateXInput
): Promise<XRow> {
  const { data, error } = await supabase
    .from("table_name")
    .update(input)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .returns<XRow[]>()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteX(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string
): Promise<void> {
  const { error } = await supabase.from("table_name").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}
```

### API Route Pattern (`app/api/accounts/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createXSchema } from "@/server/schemas/x";
import { createX, listX } from "@/server/x";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const items = await listX(supabase, user.id);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = createXSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  try {
    const item = await createX(supabase, user.id, parsed.data);
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
```

### [id] Route Pattern (`app/api/accounts/[id]/route.ts`)

```typescript
type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  // auth check, then:
  const { id } = await context.params;
  // parse body, validate with updateXSchema, call updateX(supabase, user.id, id, parsed.data)
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  // auth check, then:
  const { id } = await context.params;
  // call deleteX(supabase, user.id, id), return { success: true }
}
```

### Page Pattern (`app/(app)/accounts/page.tsx`)

```typescript
// Server component
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { listX } from "@/server/x";
import { ClientComponent } from "@/components/x/client-component";

export default async function XPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const items = await listX(supabase, user.id);
  const t = await getTranslations("namespace");
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1></div>
      <ClientComponent items={items} />
    </div>
  );
}
```

### Zod Schema Pattern (`server/schemas/account.ts`)

```typescript
import { z } from "zod";
export const createXSchema = z.object({ ... });
export const updateXSchema = z.object({ ... }).refine(data => Object.keys(data).length > 0, { message: "At least one field must be provided" });
export type CreateXInput = z.infer<typeof createXSchema>;
export type UpdateXInput = z.infer<typeof updateXSchema>;
```

### RLS Pattern (4 policies per table)

```sql
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "table_select_own" ON public.table_name FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "table_insert_own" ON public.table_name FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "table_update_own" ON public.table_name FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "table_delete_own" ON public.table_name FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

### Chart Pattern (`components/charts/lazy-charts.tsx`)

```typescript
import {
  LazyPieChart,
  LazyAreaChart,
  Pie,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "@/components/charts/lazy-charts";
```

---

## Tasks

### Task 1: Create Supabase Migration

**Files:**

- Create: `supabase/migrations/009_financial_tracking.sql`

**Step 1: Write the migration SQL**

```sql
-- Migration: 009_financial_tracking
-- Phase 4: Financial Tracking tables
-- 8 tables: user_subscriptions, excluded_subscription_merchants,
-- loans, loan_payments, investment_accounts, holdings, properties, net_worth_snapshots

-- ============================================================
-- 1. User Subscriptions (recurring payment tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  merchant_name TEXT NOT NULL,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  frequency TEXT NOT NULL DEFAULT 'monthly',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  next_billing_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_subscriptions_select_own" ON public.user_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_subscriptions_insert_own" ON public.user_subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_subscriptions_update_own" ON public.user_subscriptions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_subscriptions_delete_own" ON public.user_subscriptions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 2. Excluded Subscription Merchants (dismiss auto-detected)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.excluded_subscription_merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  merchant_token TEXT NOT NULL,
  UNIQUE(user_id, merchant_token)
);

CREATE INDEX IF NOT EXISTS idx_excluded_sub_merchants_user_id ON public.excluded_subscription_merchants(user_id);

ALTER TABLE public.excluded_subscription_merchants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "excluded_sub_merchants_select_own" ON public.excluded_subscription_merchants
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "excluded_sub_merchants_insert_own" ON public.excluded_subscription_merchants
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "excluded_sub_merchants_update_own" ON public.excluded_subscription_merchants
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "excluded_sub_merchants_delete_own" ON public.excluded_subscription_merchants
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 3. Loans
-- ============================================================
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  loan_type TEXT NOT NULL,
  original_balance_minor INTEGER NOT NULL,
  current_balance_minor INTEGER NOT NULL,
  interest_rate NUMERIC(5,2) NOT NULL,
  minimum_payment_minor INTEGER NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loans_user_id ON public.loans(user_id);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loans_select_own" ON public.loans
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "loans_insert_own" ON public.loans
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "loans_update_own" ON public.loans
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "loans_delete_own" ON public.loans
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 4. Loan Payments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  amount_minor INTEGER NOT NULL,
  payment_date DATE NOT NULL,
  principal_minor INTEGER,
  interest_minor INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loan_payments_user_id ON public.loan_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON public.loan_payments(loan_id);

ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loan_payments_select_own" ON public.loan_payments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "loan_payments_insert_own" ON public.loan_payments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "loan_payments_update_own" ON public.loan_payments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "loan_payments_delete_own" ON public.loan_payments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 5. Investment Accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.investment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  institution TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_investment_accounts_user_id ON public.investment_accounts(user_id);

ALTER TABLE public.investment_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investment_accounts_select_own" ON public.investment_accounts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "investment_accounts_insert_own" ON public.investment_accounts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "investment_accounts_update_own" ON public.investment_accounts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "investment_accounts_delete_own" ON public.investment_accounts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 6. Holdings (belong to investment accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  investment_account_id UUID NOT NULL REFERENCES public.investment_accounts(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT,
  shares NUMERIC(12,4) NOT NULL,
  purchase_price_minor INTEGER NOT NULL,
  purchase_date DATE,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON public.holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_investment_account_id ON public.holdings(investment_account_id);

ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "holdings_select_own" ON public.holdings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "holdings_insert_own" ON public.holdings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "holdings_update_own" ON public.holdings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "holdings_delete_own" ON public.holdings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 7. Properties
-- ============================================================
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  purchase_price_minor INTEGER,
  current_value_minor INTEGER,
  mortgage_balance_minor INTEGER DEFAULT 0,
  monthly_expenses_minor INTEGER DEFAULT 0,
  purchase_date DATE,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "properties_select_own" ON public.properties
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "properties_insert_own" ON public.properties
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "properties_update_own" ON public.properties
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "properties_delete_own" ON public.properties
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 8. Net Worth Snapshots
-- ============================================================
CREATE TABLE IF NOT EXISTS public.net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_assets_minor INTEGER NOT NULL,
  total_liabilities_minor INTEGER NOT NULL,
  net_worth_minor INTEGER NOT NULL,
  breakdown JSONB,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_net_worth_snapshots_user_id ON public.net_worth_snapshots(user_id);

ALTER TABLE public.net_worth_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "net_worth_snapshots_select_own" ON public.net_worth_snapshots
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "net_worth_snapshots_insert_own" ON public.net_worth_snapshots
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "net_worth_snapshots_update_own" ON public.net_worth_snapshots
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "net_worth_snapshots_delete_own" ON public.net_worth_snapshots
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

**Step 2: Add type definitions to `supabase/database.types.ts`**

Add Row/Insert/Update types for all 8 tables following the exact pattern of existing tables (see `accounts` table type for reference). Key types:

- `user_subscriptions` — frequency: string, is_active: boolean, category_id: string | null
- `excluded_subscription_merchants` — merchant_token: string
- `loans` — loan_type: string, interest_rate: number, status: string
- `loan_payments` — loan_id: string, principal_minor: number | null, interest_minor: number | null
- `investment_accounts` — account_type: string, institution: string | null
- `holdings` — investment_account_id: string, shares: number, purchase_price_minor: number
- `properties` — address: string, all \_minor fields: number | null
- `net_worth_snapshots` — snapshot_date: string, breakdown: Json | null, UNIQUE(user_id, snapshot_date)

**Step 3: Run type check**

Run: `npx tsc --noEmit --project tsconfig.json` (from online-budget-app root)
Expected: No new errors from the type additions

**Step 4: Commit**

```bash
git add supabase/migrations/009_financial_tracking.sql supabase/database.types.ts
git commit -m "feat(budget): add Phase 4 migration — 8 financial tracking tables with RLS"
```

---

### Task 2: Create Zod Schemas

**Files:**

- Create: `server/schemas/user-subscription.ts`
- Create: `server/schemas/loan.ts`
- Create: `server/schemas/investment.ts`
- Create: `server/schemas/property.ts`
- Create: `server/schemas/net-worth.ts`

Follow the exact pattern from `server/schemas/account.ts`:

- `z.object()` for create schemas
- `z.object().refine()` for update schemas (at least one field required)
- Export `type CreateXInput = z.infer<typeof createXSchema>` and `UpdateXInput`

**Step 1: Create `server/schemas/user-subscription.ts`**

Fields: `merchant_name` (string, min 1), `amount_minor` (number, int), `currency` (string, 3 chars), `frequency` (enum: weekly/biweekly/monthly/quarterly/annual), `category_id` (uuid, optional), `next_billing_date` (date string, optional), `is_active` (boolean, optional, default true), `notes` (string, optional).

**Step 2: Create `server/schemas/loan.ts`**

Create schema fields: `name` (string, min 1), `loan_type` (enum: mortgage/auto/personal/student/other), `original_balance_minor` (number, int, positive), `current_balance_minor` (number, int), `interest_rate` (number, min 0, max 100), `minimum_payment_minor` (number, int, optional, default 0), `start_date` (date string, optional), `end_date` (date string, optional), `status` (enum: active/paid_off/refinanced/defaulted, optional, default 'active'), `currency` (3 chars).

Also create `createLoanPaymentSchema`: `loan_id` (uuid), `amount_minor` (int), `payment_date` (date string), `principal_minor` (int, optional), `interest_minor` (int, optional), `notes` (string, optional).

**Step 3: Create `server/schemas/investment.ts`**

Create account schema: `name` (string, min 1), `account_type` (enum: brokerage/rrsp/tfsa/401k/ira/roth_ira/other), `institution` (string, optional), `currency` (3 chars).

Create holding schema: `investment_account_id` (uuid), `symbol` (string, min 1, max 10), `name` (string, optional), `shares` (number, positive), `purchase_price_minor` (int), `purchase_date` (date string, optional), `currency` (3 chars).

**Step 4: Create `server/schemas/property.ts`**

Fields: `address` (string, min 1), `purchase_price_minor` (int, optional), `current_value_minor` (int, optional), `mortgage_balance_minor` (int, optional, default 0), `monthly_expenses_minor` (int, optional, default 0), `purchase_date` (date string, optional), `currency` (3 chars), `notes` (string, optional).

**Step 5: Create `server/schemas/net-worth.ts`**

Snapshot schema (only used for POST): `snapshot_date` (date string), `total_assets_minor` (int), `total_liabilities_minor` (int), `net_worth_minor` (int), `breakdown` (z.record or z.any, optional), `currency` (3 chars).

**Step 6: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 7: Commit**

```bash
git add server/schemas/user-subscription.ts server/schemas/loan.ts server/schemas/investment.ts server/schemas/property.ts server/schemas/net-worth.ts
git commit -m "feat(budget): add Zod schemas for Phase 4 entities"
```

---

### Task 3: Create Server Functions

**Files:**

- Create: `server/user-subscriptions.ts`
- Create: `server/loans.ts`
- Create: `server/investments.ts`
- Create: `server/properties.ts`
- Create: `server/net-worth.ts`

Follow `server/accounts.ts` pattern exactly: `SupabaseClient<Database>` param, `userId` param, typed returns using `Database["public"]["Tables"]["x"]["Row"]`.

**Step 1: Create `server/user-subscriptions.ts`**

Functions:

- `listSubscriptions(supabase, userId)` — select \*, order by merchant_name
- `createSubscription(supabase, userId, input)` — insert, return row
- `updateSubscription(supabase, userId, id, input)` — update, return row
- `deleteSubscription(supabase, userId, id)` — delete
- `listExcludedMerchants(supabase, userId)` — select from excluded_subscription_merchants
- `excludeMerchant(supabase, userId, merchantToken)` — insert into excluded_subscription_merchants
- `unexcludeMerchant(supabase, userId, merchantToken)` — delete from excluded

**Step 2: Create `server/loans.ts`**

Functions:

- `listLoans(supabase, userId)` — order by name
- `getLoan(supabase, userId, loanId)` — single, handle PGRST116 → null
- `createLoan(supabase, userId, input)` — insert, return
- `updateLoan(supabase, userId, loanId, input)` — update, return
- `deleteLoan(supabase, userId, loanId)` — delete
- `listLoanPayments(supabase, userId, loanId)` — filter by loan_id, order by payment_date desc
- `createLoanPayment(supabase, userId, input)` — insert into loan_payments

**Step 3: Create `server/investments.ts`**

Functions:

- `listInvestmentAccounts(supabase, userId)` — order by name
- `getInvestmentAccount(supabase, userId, id)` — single
- `createInvestmentAccount(supabase, userId, input)`
- `updateInvestmentAccount(supabase, userId, id, input)`
- `deleteInvestmentAccount(supabase, userId, id)`
- `listHoldings(supabase, userId, investmentAccountId)` — filter by investment_account_id, order by symbol
- `createHolding(supabase, userId, input)`
- `updateHolding(supabase, userId, holdingId, input)`
- `deleteHolding(supabase, userId, holdingId)`

**Step 4: Create `server/properties.ts`**

Functions:

- `listProperties(supabase, userId)` — order by address
- `getProperty(supabase, userId, id)` — single
- `createProperty(supabase, userId, input)`
- `updateProperty(supabase, userId, id, input)`
- `deleteProperty(supabase, userId, id)`

**Step 5: Create `server/net-worth.ts`**

Functions:

- `getLatestNetWorth(supabase, userId)` — select \*, order by snapshot_date desc, limit 1
- `listNetWorthSnapshots(supabase, userId)` — order by snapshot_date desc
- `createNetWorthSnapshot(supabase, userId, input)` — insert, uses upsert on (user_id, snapshot_date)

**Step 6: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 7: Commit**

```bash
git add server/user-subscriptions.ts server/loans.ts server/investments.ts server/properties.ts server/net-worth.ts
git commit -m "feat(budget): add server functions for Phase 4 financial tracking"
```

---

### Task 4: Create API Routes

**Files:** 14 route files (see inventory above)

All routes follow the exact pattern from `app/api/accounts/route.ts` and `app/api/accounts/[id]/route.ts`.

**Step 1: Create subscription routes**

- `app/api/user-subscriptions/route.ts` — GET (listSubscriptions), POST (createSubscription)
- `app/api/user-subscriptions/[id]/route.ts` — PATCH (updateSubscription), DELETE (deleteSubscription)

**Step 2: Create loan routes**

- `app/api/loans/route.ts` — GET (listLoans), POST (createLoan)
- `app/api/loans/[id]/route.ts` — GET (getLoan), PATCH (updateLoan), DELETE (deleteLoan)
- `app/api/loans/[id]/payments/route.ts` — GET (listLoanPayments, needs loan_id from params), POST (createLoanPayment)

For `payments/route.ts`, the RouteContext is `{ params: Promise<{ id: string }> }` where `id` is the loan_id. Pass it when calling `listLoanPayments(supabase, user.id, id)` and inject it into `createLoanPayment` input.

**Step 3: Create investment routes**

- `app/api/investments/route.ts` — GET (listInvestmentAccounts), POST (createInvestmentAccount)
- `app/api/investments/[id]/route.ts` — GET (getInvestmentAccount), PATCH (updateInvestmentAccount), DELETE (deleteInvestmentAccount)
- `app/api/investments/[id]/holdings/route.ts` — GET (listHoldings), POST (createHolding)
- `app/api/investments/[id]/holdings/[holdingId]/route.ts` — PATCH (updateHolding), DELETE (deleteHolding)

For holdings routes, context params are `Promise<{ id: string; holdingId: string }>`. The `id` is the investment account ID — pass it to verify ownership.

**Step 4: Create property routes**

- `app/api/properties/route.ts` — GET (listProperties), POST (createProperty)
- `app/api/properties/[id]/route.ts` — GET (getProperty), PATCH (updateProperty), DELETE (deleteProperty)

**Step 5: Create net worth routes**

- `app/api/net-worth/route.ts` — GET: returns `{ latest: ..., history: [...] }` by calling both `getLatestNetWorth` and `listNetWorthSnapshots`
- `app/api/net-worth/snapshot/route.ts` — POST (createNetWorthSnapshot)

**Step 6: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 7: Commit**

```bash
git add app/api/user-subscriptions/ app/api/loans/ app/api/investments/ app/api/properties/ app/api/net-worth/
git commit -m "feat(budget): add API routes for Phase 4 financial tracking"
```

---

### Task 5: Create Loan Engine Wrapper

**Files:**

- Create: `engine/loans/calculations.ts`

**Step 1: Create the file**

Re-export the amortization functions from the calculator engine:

```typescript
/**
 * Loan Calculations — thin re-exports from calculator engine
 *
 * The amortization engine in engine/calculators/amortization.ts already
 * implements everything needed. We re-export here for cleaner imports
 * from loan-related components.
 */

export {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  calculateAffordability,
} from "@/engine/calculators/amortization";

export type {
  AmortizationInput,
  AmortizationResult,
  AmortizationEntry,
} from "@/engine/calculators/types";
```

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 3: Commit**

```bash
git add engine/loans/calculations.ts
git commit -m "feat(budget): add loan engine re-exports from calculator amortization"
```

---

### Task 6: Add i18n Namespaces

**Files:**

- Modify: `i18n/messages/en.json` — add 5 namespaces

**Step 1: Add namespaces to en.json**

Add these 5 top-level keys to `i18n/messages/en.json`:

```json
"subscriptions": {
  "title": "Subscriptions",
  "description": "Manage your recurring payments",
  "addSubscription": "Add Subscription",
  "editSubscription": "Edit Subscription",
  "deleteSubscription": "Delete Subscription",
  "confirmDelete": "Are you sure you want to delete this subscription?",
  "noSubscriptions": "No subscriptions yet",
  "noSubscriptionsDescription": "Add your first subscription to start tracking recurring costs.",
  "fields": {
    "merchantName": "Merchant Name",
    "merchantNamePlaceholder": "e.g., Netflix, Spotify",
    "amount": "Amount",
    "frequency": "Billing Frequency",
    "category": "Category",
    "nextBillingDate": "Next Billing Date",
    "notes": "Notes",
    "active": "Active"
  },
  "frequencies": {
    "weekly": "Weekly",
    "biweekly": "Bi-weekly",
    "monthly": "Monthly",
    "quarterly": "Quarterly",
    "annual": "Annual"
  },
  "stats": {
    "active": "Active",
    "monthly": "Monthly Cost",
    "annual": "Annual Cost",
    "upcoming": "Upcoming (7 days)"
  },
  "costChart": "Cost Breakdown"
},
"loans": {
  "title": "Loans",
  "description": "Track and manage your loans",
  "addLoan": "Add Loan",
  "editLoan": "Edit Loan",
  "deleteLoan": "Delete Loan",
  "confirmDelete": "Are you sure you want to delete this loan and all its payments?",
  "newLoan": "New Loan",
  "noLoans": "No loans yet",
  "noLoansDescription": "Add your first loan to start tracking your debt.",
  "detail": "Loan Detail",
  "fields": {
    "name": "Loan Name",
    "namePlaceholder": "e.g., Home Mortgage",
    "loanType": "Loan Type",
    "originalBalance": "Original Balance",
    "currentBalance": "Current Balance",
    "interestRate": "Interest Rate (%)",
    "minimumPayment": "Minimum Payment",
    "startDate": "Start Date",
    "endDate": "End Date",
    "status": "Status",
    "currency": "Currency"
  },
  "types": {
    "mortgage": "Mortgage",
    "auto": "Auto Loan",
    "personal": "Personal Loan",
    "student": "Student Loan",
    "other": "Other"
  },
  "statuses": {
    "active": "Active",
    "paid_off": "Paid Off",
    "refinanced": "Refinanced",
    "defaulted": "Defaulted"
  },
  "stats": {
    "totalDebt": "Total Debt",
    "monthlyPayments": "Monthly Payments",
    "avgRate": "Avg Interest Rate",
    "debtFreeDate": "Debt-Free Date"
  },
  "payments": {
    "title": "Payment History",
    "addPayment": "Record Payment",
    "date": "Date",
    "amount": "Amount",
    "principal": "Principal",
    "interest": "Interest",
    "notes": "Notes",
    "noPayments": "No payments recorded yet"
  },
  "amortization": {
    "title": "Amortization Schedule",
    "month": "Month",
    "payment": "Payment",
    "principal": "Principal",
    "interest": "Interest",
    "balance": "Balance",
    "extraPayment": "Extra Payment"
  },
  "paidOff": "paid off",
  "progress": "Progress"
},
"investments": {
  "title": "Investments",
  "description": "Track your investment portfolio",
  "addAccount": "Add Account",
  "editAccount": "Edit Account",
  "deleteAccount": "Delete Account",
  "confirmDeleteAccount": "This will permanently delete the account and all its holdings.",
  "noAccounts": "No investment accounts yet",
  "noAccountsDescription": "Add your first investment account to start tracking.",
  "addHolding": "Add Holding",
  "editHolding": "Edit Holding",
  "deleteHolding": "Delete Holding",
  "confirmDeleteHolding": "This will permanently remove this holding.",
  "fields": {
    "name": "Account Name",
    "namePlaceholder": "e.g., Retirement RRSP",
    "accountType": "Account Type",
    "institution": "Institution",
    "institutionPlaceholder": "e.g., Wealthsimple",
    "currency": "Currency"
  },
  "holdingFields": {
    "symbol": "Symbol",
    "symbolPlaceholder": "e.g., VFV.TO",
    "holdingName": "Name (Optional)",
    "shares": "Shares",
    "purchasePrice": "Purchase Price",
    "purchaseDate": "Purchase Date",
    "currency": "Currency"
  },
  "accountTypes": {
    "brokerage": "Brokerage",
    "rrsp": "RRSP",
    "tfsa": "TFSA",
    "401k": "401(k)",
    "ira": "IRA",
    "roth_ira": "Roth IRA",
    "other": "Other"
  },
  "stats": {
    "totalValue": "Total Value",
    "totalCost": "Total Cost",
    "gainLoss": "Gain/Loss",
    "return": "Return"
  },
  "portfolio": "Portfolio Allocation",
  "holdings": "holdings",
  "showDetails": "Show Details",
  "hideDetails": "Hide Details"
},
"properties": {
  "title": "Properties",
  "description": "Track your real estate portfolio",
  "addProperty": "Add Property",
  "editProperty": "Edit Property",
  "deleteProperty": "Delete Property",
  "confirmDelete": "Are you sure you want to delete this property?",
  "noProperties": "No properties yet",
  "noPropertiesDescription": "Add your first property to track real estate.",
  "detail": "Property Detail",
  "fields": {
    "address": "Address",
    "addressPlaceholder": "e.g., 123 Main St",
    "purchasePrice": "Purchase Price",
    "currentValue": "Current Value",
    "mortgageBalance": "Mortgage Balance",
    "monthlyExpenses": "Monthly Expenses",
    "purchaseDate": "Purchase Date",
    "currency": "Currency",
    "notes": "Notes"
  },
  "stats": {
    "totalValue": "Total Value",
    "totalEquity": "Total Equity",
    "totalMortgage": "Total Mortgage",
    "monthlyExpenses": "Monthly Expenses"
  },
  "equity": "Equity"
},
"netWorth": {
  "title": "Net Worth",
  "description": "Track your total financial picture",
  "takeSnapshot": "Take Snapshot",
  "snapshotTaken": "Snapshot recorded",
  "noData": "No net worth data yet",
  "noDataDescription": "Add accounts, investments, and properties, then take a snapshot.",
  "current": "Current Net Worth",
  "history": "Net Worth History",
  "breakdown": "Breakdown",
  "assets": "Total Assets",
  "liabilities": "Total Liabilities",
  "categories": {
    "accounts": "Bank Accounts",
    "investments": "Investments",
    "properties": "Properties",
    "loans": "Loans"
  }
}
```

**Step 2: Regenerate locale files**

Run: `npx tsx scripts/generate-locales.ts`
Expected: All locale files updated

**Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 4: Commit**

```bash
git add i18n/messages/
git commit -m "feat(budget): add i18n namespaces for Phase 4 (subscriptions, loans, investments, properties, netWorth)"
```

---

### Task 7: Create Subscription Page + Components

**Files:**

- Create: `app/(app)/subscriptions/page.tsx` (server component)
- Create: `components/subscriptions/subscription-list.tsx` (client component)

**Step 1: Create server page `app/(app)/subscriptions/page.tsx`**

Follows accounts page pattern:

- `createClient()`, `getUser()`, fetch `user_settings` for currency/locale
- Call `listSubscriptions(supabase, user.id)`
- `getTranslations("subscriptions")`
- Render page header + `<SubscriptionList>` client component
- Pass: subscriptions array, currency, locale, formatAmount fn

**Step 2: Create client component `components/subscriptions/subscription-list.tsx`**

Features (simplified from offline app — no auto-detection in server version):

- Summary stat cards: active count, monthly cost, annual cost, upcoming charges (7 days)
- Subscription grid (Card components) with merchant name, amount, frequency badge, next billing date
- "Add Subscription" dialog with form fields (merchant_name, amount, frequency select, category, next_billing_date, notes)
- Edit dialog (reuses same form)
- Delete confirmation dialog
- PieChart breakdown by frequency
- Empty state when no subscriptions
- All strings via `useTranslations("subscriptions")` and `useTranslations("common")`
- Mutations via `fetch("/api/user-subscriptions", ...)` and `router.refresh()`

UI components to use: Card, Button, Dialog, Input, Label, Select, Badge, LazyPieChart, Pie, Cell, ResponsiveContainer, Tooltip

**Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 4: Commit**

```bash
git add app/\(app\)/subscriptions/ components/subscriptions/
git commit -m "feat(budget): add subscriptions page with CRUD and cost chart"
```

---

### Task 8: Create Loan Pages + Components

**Files:**

- Create: `app/(app)/loans/page.tsx` (server)
- Create: `app/(app)/loans/new/page.tsx` (server)
- Create: `app/(app)/loans/[id]/page.tsx` (server)
- Create: `app/(app)/loans/[id]/edit/page.tsx` (server)
- Create: `components/loans/loan-list.tsx` (client)
- Create: `components/loans/loan-form.tsx` (client — shared by new + edit)
- Create: `components/loans/loan-detail.tsx` (client)

**Step 1: Create `app/(app)/loans/page.tsx`**

Server component:

- Fetch all loans via `listLoans(supabase, user.id)`
- Compute summary stats: total debt (sum current_balance_minor), monthly obligations (sum minimum_payment_minor), weighted avg interest rate
- Pass to `<LoanList>` client component

**Step 2: Create `components/loans/loan-list.tsx`**

Features:

- 4 stat cards: Total Debt, Monthly Payments, Avg Interest Rate, # Active Loans
- Loan cards in grid: name, type badge, current balance, monthly payment, progress bar (original - current / original \* 100), interest rate
- Each card links to `/loans/[id]`
- "Add Loan" button links to `/loans/new`
- Filter by type (Select) and status (Select)
- Empty state

**Step 3: Create `components/loans/loan-form.tsx`**

Shared form component used by both new and edit pages:

- Props: `initialData?: LoanRow`, `onSubmit: (data) => Promise<void>`, `isSubmitting: boolean`
- Fields: name, loan_type (Select), original_balance (currency input), current_balance, interest_rate, minimum_payment, start_date, end_date, currency
- Convert dollar inputs to \_minor (multiply by 100) before calling onSubmit
- Use `useTranslations("loans")`

**Step 4: Create `app/(app)/loans/new/page.tsx`**

Server component with `<LoanForm>` — client component calls `fetch("/api/loans", { method: "POST" })`, then redirects to `/loans` on success.

**Step 5: Create `app/(app)/loans/[id]/page.tsx`**

Server component:

- Fetch loan via `getLoan(supabase, user.id, id)`
- Fetch payments via `listLoanPayments(supabase, user.id, id)`
- Generate amortization schedule using `generateAmortizationSchedule({ principal: loan.original_balance_minor / 100, annualRate: loan.interest_rate, termMonths })` — estimate termMonths from start_date/end_date or default 360
- Pass all to `<LoanDetail>` client component

**Step 6: Create `components/loans/loan-detail.tsx`**

Features:

- Loan summary card (name, type, balance, rate, status)
- Amortization AreaChart (lazy-loaded) showing balance vs interest over time
- Payment history table (date, amount, principal, interest, notes)
- "Record Payment" dialog
- "Edit" link to `/loans/[id]/edit`, "Delete" button with confirmation
- Extra payment calculator: input extra amount → recalculate amortization → show savings

**Step 7: Create `app/(app)/loans/[id]/edit/page.tsx`**

Server component:

- Fetch existing loan via `getLoan()`
- Render `<LoanForm initialData={loan}>` — on submit calls `fetch(\`/api/loans/${id}\`, { method: "PATCH" })`, then redirects to `/loans/[id]`

**Step 8: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 9: Commit**

```bash
git add app/\(app\)/loans/ components/loans/
git commit -m "feat(budget): add loan pages (list, new, detail, edit) with amortization charts"
```

---

### Task 9: Create Investment Page + Components

**Files:**

- Create: `app/(app)/investments/page.tsx` (server)
- Create: `components/investments/investment-list.tsx` (client)

**Step 1: Create `app/(app)/investments/page.tsx`**

Server component:

- Fetch investment accounts via `listInvestmentAccounts(supabase, user.id)`
- For each account, fetch holdings via `listHoldings(supabase, user.id, account.id)`
- Compute portfolio totals (total value = sum of shares \* purchase_price_minor for each holding, since we don't have live prices in server version)
- Pass accounts with holdings to `<InvestmentList>`

**Step 2: Create `components/investments/investment-list.tsx`**

Features (simplified from offline — no live market prices):

- 4 stat cards: Total Value, Total Cost, Gain/Loss, Return %
- Investment account cards (expandable): name, type badge, institution, summary stats
- Holdings table within each account: symbol, name, shares, purchase price, value, actions (edit, delete)
- "Add Account" dialog (name, account_type Select, institution, currency)
- "Add Holding" dialog (symbol, name, shares, purchase_price, purchase_date, currency)
- Edit/Delete dialogs for both accounts and holdings
- Portfolio allocation PieChart (by account or by symbol)
- Empty state

**Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 4: Commit**

```bash
git add app/\(app\)/investments/ components/investments/
git commit -m "feat(budget): add investments page with portfolio allocation chart"
```

---

### Task 10: Create Property Pages + Components

**Files:**

- Create: `app/(app)/properties/page.tsx` (server)
- Create: `app/(app)/properties/[id]/page.tsx` (server)
- Create: `components/properties/property-list.tsx` (client)
- Create: `components/properties/property-detail.tsx` (client)

**Step 1: Create `app/(app)/properties/page.tsx`**

Server component:

- Fetch properties via `listProperties(supabase, user.id)`
- Compute totals: total value, total equity (value - mortgage), total mortgage, total monthly expenses
- Pass to `<PropertyList>`

**Step 2: Create `components/properties/property-list.tsx`**

Features:

- 4 stat cards: Total Value, Total Equity, Total Mortgage, Monthly Expenses
- Property cards in grid: address, current value, mortgage balance, equity, monthly expenses
- Each card links to `/properties/[id]`
- "Add Property" dialog (address, purchase_price, current_value, mortgage_balance, monthly_expenses, purchase_date, notes, currency)
- Edit/Delete in dialog
- Empty state

**Step 3: Create `app/(app)/properties/[id]/page.tsx`**

Server component:

- Fetch property via `getProperty(supabase, user.id, id)`
- Compute equity = current_value_minor - mortgage_balance_minor
- Pass to `<PropertyDetail>`

**Step 4: Create `components/properties/property-detail.tsx`**

Features:

- Property info card (address, purchase date, notes)
- Financial stats: current value, purchase price, mortgage balance, equity, monthly expenses
- Equity breakdown PieChart (equity vs mortgage)
- Edit/Delete buttons
- Link back to `/properties`

**Step 5: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 6: Commit**

```bash
git add app/\(app\)/properties/ components/properties/
git commit -m "feat(budget): add property pages (list + detail) with equity tracking"
```

---

### Task 11: Create Net Worth Page + Components

**Files:**

- Create: `app/(app)/net-worth/page.tsx` (server)
- Create: `components/net-worth/net-worth-dashboard.tsx` (client)

**Step 1: Create `app/(app)/net-worth/page.tsx`**

Server component:

- Fetch latest snapshot via `getLatestNetWorth(supabase, user.id)`
- Fetch snapshot history via `listNetWorthSnapshots(supabase, user.id)`
- Also fetch current data for live calculation:
  - `listAccounts(supabase, user.id)` — sum balance_minor
  - `listInvestmentAccounts(supabase, user.id)` + holdings — sum shares \* purchase_price_minor
  - `listProperties(supabase, user.id)` — sum current_value_minor
  - `listLoans(supabase, user.id)` — sum current_balance_minor (liability)
- Compute live net worth = accounts + investments + properties - loans
- Pass everything to `<NetWorthDashboard>`

**Step 2: Create `components/net-worth/net-worth-dashboard.tsx`**

Features:

- Current net worth hero card (large number)
- Assets vs Liabilities summary
- Breakdown cards by category (Bank Accounts, Investments, Properties, Loans)
- "Take Snapshot" button — calls `fetch("/api/net-worth/snapshot", { method: "POST" })` with current values, then `router.refresh()`
- Net Worth History AreaChart (lazy-loaded) — x-axis: date, y-axis: net_worth_minor
- Empty state if no data

**Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 4: Commit**

```bash
git add app/\(app\)/net-worth/ components/net-worth/
git commit -m "feat(budget): add net worth page with historical chart and snapshot"
```

---

### Task 12: Final Verification

**Step 1: Run full type check**

Run: `npx tsc --noEmit`
Expected: PASS — zero errors

**Step 2: Run tests**

Run: `npm test`
Expected: All existing tests still pass (no regressions)

**Step 3: Update implementation guide**

Mark all Phase 4 tasks as done (`[x]`) in `Online Budget app/docs/FEATURE-PARITY-IMPLEMENTATION-GUIDE.md`

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(budget): complete Phase 4 — financial tracking (subscriptions, loans, investments, properties, net worth)"
```

---

## Execution Notes

- **No tests to write:** This phase is infrastructure + UI. Existing tests must not regress. Unit tests for the amortization engine already exist.
- **No auto-detection in server version:** The offline app's subscription auto-detection relies on IndexedDB transactions. The online server version provides manual subscription CRUD only. Auto-detection can be added later when transaction volume grows.
- **No live market prices:** The offline app uses `getBatchStockPrices()`. The server version shows purchase price \* shares as value. A market data integration can be added in a future phase.
- **Amounts:** All `_minor` fields are integer cents. Convert to dollars for display: `(amountMinor / 100).toFixed(2)`. Use the engine's `formatMoney()` when possible.
- **Charts:** Always import from `@/components/charts/lazy-charts.tsx` to get SSR-safe recharts.
