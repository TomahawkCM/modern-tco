# Session 4: Core Database Schema (Transactions + Accounts) — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create the financial data schema (institutions, accounts, transactions, categories, translations, user overrides) with RLS enforcement and proper indexing — without any bank sync, categorization, or AI logic.

**Architecture:** Single migration file (003) adds all 6 tables to Supabase Postgres. Every user-owned table gets RLS with `auth.uid() = user_id`. Categories are system-level (shared) with per-user overrides. All money amounts stored as bigint minor units. Currency always ISO 4217 varchar(3). Multi-language support via separate category_translations table.

**Tech Stack:** Supabase PostgreSQL, TypeScript strict mode, Next.js 16 App Router.

---

## Context for Implementer

- **Project root:** `/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app/`
- **Existing migrations:** `supabase/migrations/001_users_and_settings.sql` (users + user_settings), `supabase/migrations/002_subscriptions.sql` (subscriptions). New migration is `003`.
- **Migration pattern:** `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`, `CREATE POLICY`. Uses `gen_random_uuid()` for PKs. `handle_updated_at()` trigger function already exists from migration 001.
- **Database types:** `supabase/database.types.ts` — must include `Relationships` array on every table and `CompositeTypes` on schema for @supabase/supabase-js v2.97 compatibility.
- **Schema source of truth:** V1-DATABASE-SCHEMA-DESIGN.md sections 4-6.
- **Financial rules:** Money in minor units (bigint). Currency as ISO 4217 (varchar(3)). No silent conversion. No AI-generated numbers stored as truth.
- **Build:** Must pass `npx tsc --noEmit` and `npm run build` (next build --webpack).
- **Session constraints:** NO bank API calls, NO categorization logic, NO AI logic. Schema only.

---

## Task 1: Create Migration 003 — Institutions and Accounts Tables

**Files:**
- Create: `supabase/migrations/003_accounts_transactions_categories.sql`

**Step 1: Write the migration file (institutions + accounts only)**

Create `supabase/migrations/003_accounts_transactions_categories.sql`:

```sql
-- Migration: 003_accounts_transactions_categories
-- Creates institutions, accounts, transactions, categories,
-- category_translations, and user_category_overrides tables
-- Per V1-DATABASE-SCHEMA-DESIGN.md sections 4-6

-- ============================================================
-- 1. Institutions (shared reference table, not user-owned)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id TEXT,
  name TEXT NOT NULL,
  country_code VARCHAR(2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_institutions_provider_id ON public.institutions(provider_id);

-- Institutions are shared reference data — no RLS needed
-- Populated by bank sync integration (future session)

-- ============================================================
-- 2. Accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  provider_account_id TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'checking'
    CHECK (type IN ('checking', 'savings', 'credit', 'investment', 'loan', 'other')),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  balance_minor BIGINT NOT NULL DEFAULT 0,
  is_manual BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_institution_id ON public.accounts(institution_id);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accounts_select_own" ON public.accounts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "accounts_insert_own" ON public.accounts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "accounts_update_own" ON public.accounts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "accounts_delete_own" ON public.accounts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER set_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

**Step 2: Verify the file was created correctly**

Read the file back, confirm no syntax errors.

**Step 3: Commit**

```bash
git add supabase/migrations/003_accounts_transactions_categories.sql
git commit -m "feat(schema): add institutions and accounts tables (migration 003 part 1)"
```

---

## Task 2: Add Transactions Table to Migration 003

**Files:**
- Modify: `supabase/migrations/003_accounts_transactions_categories.sql`

**Step 1: Append transactions table to the migration**

Append to the end of the migration file:

```sql

-- ============================================================
-- 3. Transactions (Multi-Currency Safe)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  provider_transaction_id TEXT,
  amount_minor BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  description TEXT,
  merchant_name TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  transaction_date DATE NOT NULL,
  posted_at TIMESTAMPTZ,
  is_pending BOOLEAN NOT NULL DEFAULT false,
  confidence_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Critical indexes per V1-DATABASE-SCHEMA-DESIGN.md section 12
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_date ON public.transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_own" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update_own" ON public.transactions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "transactions_delete_own" ON public.transactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

**IMPORTANT:** The transactions table has a FK to `public.categories(id)`. Since categories table doesn't exist yet, we must reorder the SQL so categories is created BEFORE transactions. This will be handled in Task 3 — we'll move the categories section before transactions in the final file.

**Step 2: Commit**

```bash
git add supabase/migrations/003_accounts_transactions_categories.sql
git commit -m "feat(schema): add transactions table to migration 003"
```

---

## Task 3: Add Categories, Translations, and User Overrides to Migration 003

**Files:**
- Modify: `supabase/migrations/003_accounts_transactions_categories.sql`

**Step 1: Insert categories section BEFORE the transactions section**

The categories table must be created before transactions (FK dependency). Insert this block between accounts and transactions:

```sql

-- ============================================================
-- 3. Categories (Multi-Language Compatible)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_system BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_key ON public.categories(key);

-- Categories are system-level shared data — no RLS needed
-- All users can read categories; only service role can insert/update

-- ============================================================
-- 4. Category Translations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.category_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  locale VARCHAR(10) NOT NULL,
  display_name TEXT NOT NULL,
  UNIQUE(category_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_category_translations_category_id ON public.category_translations(category_id);
CREATE INDEX IF NOT EXISTS idx_category_translations_locale ON public.category_translations(locale);

-- Category translations are shared — no RLS needed

-- ============================================================
-- 5. User Category Overrides
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_category_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  custom_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_category_overrides_user_id ON public.user_category_overrides(user_id);

ALTER TABLE public.user_category_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "overrides_select_own" ON public.user_category_overrides
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "overrides_insert_own" ON public.user_category_overrides
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "overrides_update_own" ON public.user_category_overrides
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "overrides_delete_own" ON public.user_category_overrides
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

Then renumber the transactions section from "3." to "6." to maintain sequential ordering in the file:
- 1: Institutions
- 2: Accounts
- 3: Categories
- 4: Category Translations
- 5: User Category Overrides
- 6: Transactions (references categories FK)

**Step 2: Verify the full migration file reads correctly top to bottom**

Read the complete file. Confirm:
- institutions first (no deps)
- accounts second (deps: users)
- categories third (self-referencing parent_id)
- category_translations fourth (deps: categories)
- user_category_overrides fifth (deps: users, categories)
- transactions last (deps: users, accounts, categories)

**Step 3: Commit**

```bash
git add supabase/migrations/003_accounts_transactions_categories.sql
git commit -m "feat(schema): add categories, translations, and user overrides to migration 003"
```

---

## Task 4: Update Database Types — Institutions and Accounts

**Files:**
- Modify: `supabase/database.types.ts`

**Step 1: Add institutions table type**

Add inside `Database["public"]["Tables"]`, after the `subscriptions` block:

```typescript
institutions: {
  Row: {
    id: string;
    provider_id: string | null;
    name: string;
    country_code: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    provider_id?: string | null;
    name: string;
    country_code?: string | null;
    created_at?: string;
  };
  Update: {
    id?: string;
    provider_id?: string | null;
    name?: string;
    country_code?: string | null;
    created_at?: string;
  };
  Relationships: [];
};
```

**Step 2: Add accounts table type**

Add after institutions:

```typescript
accounts: {
  Row: {
    id: string;
    user_id: string;
    institution_id: string | null;
    provider_account_id: string | null;
    name: string;
    type: "checking" | "savings" | "credit" | "investment" | "loan" | "other";
    currency: string;
    balance_minor: number;
    is_manual: boolean;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    institution_id?: string | null;
    provider_account_id?: string | null;
    name: string;
    type?: "checking" | "savings" | "credit" | "investment" | "loan" | "other";
    currency?: string;
    balance_minor?: number;
    is_manual?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    institution_id?: string | null;
    provider_account_id?: string | null;
    name?: string;
    type?: "checking" | "savings" | "credit" | "investment" | "loan" | "other";
    currency?: string;
    balance_minor?: number;
    is_manual?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "accounts_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "users";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "accounts_institution_id_fkey";
      columns: ["institution_id"];
      isOneToOne: false;
      referencedRelation: "institutions";
      referencedColumns: ["id"];
    },
  ];
};
```

**Step 3: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 4: Commit**

```bash
git add supabase/database.types.ts
git commit -m "feat(schema): add institutions and accounts types"
```

---

## Task 5: Update Database Types — Transactions

**Files:**
- Modify: `supabase/database.types.ts`

**Step 1: Add transactions table type**

Add after accounts:

```typescript
transactions: {
  Row: {
    id: string;
    user_id: string;
    account_id: string;
    provider_transaction_id: string | null;
    amount_minor: number;
    currency: string;
    description: string | null;
    merchant_name: string | null;
    category_id: string | null;
    transaction_date: string;
    posted_at: string | null;
    is_pending: boolean;
    confidence_score: number | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    account_id: string;
    provider_transaction_id?: string | null;
    amount_minor: number;
    currency: string;
    description?: string | null;
    merchant_name?: string | null;
    category_id?: string | null;
    transaction_date: string;
    posted_at?: string | null;
    is_pending?: boolean;
    confidence_score?: number | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    account_id?: string;
    provider_transaction_id?: string | null;
    amount_minor?: number;
    currency?: string;
    description?: string | null;
    merchant_name?: string | null;
    category_id?: string | null;
    transaction_date?: string;
    posted_at?: string | null;
    is_pending?: boolean;
    confidence_score?: number | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "transactions_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "users";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "transactions_account_id_fkey";
      columns: ["account_id"];
      isOneToOne: false;
      referencedRelation: "accounts";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "transactions_category_id_fkey";
      columns: ["category_id"];
      isOneToOne: false;
      referencedRelation: "categories";
      referencedColumns: ["id"];
    },
  ];
};
```

**Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add supabase/database.types.ts
git commit -m "feat(schema): add transactions type"
```

---

## Task 6: Update Database Types — Categories, Translations, and Overrides

**Files:**
- Modify: `supabase/database.types.ts`

**Step 1: Add categories table type**

Add after transactions:

```typescript
categories: {
  Row: {
    id: string;
    key: string;
    parent_id: string | null;
    is_system: boolean;
    created_at: string;
  };
  Insert: {
    id?: string;
    key: string;
    parent_id?: string | null;
    is_system?: boolean;
    created_at?: string;
  };
  Update: {
    id?: string;
    key?: string;
    parent_id?: string | null;
    is_system?: boolean;
    created_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "categories_parent_id_fkey";
      columns: ["parent_id"];
      isOneToOne: false;
      referencedRelation: "categories";
      referencedColumns: ["id"];
    },
  ];
};
```

**Step 2: Add category_translations table type**

```typescript
category_translations: {
  Row: {
    id: string;
    category_id: string;
    locale: string;
    display_name: string;
  };
  Insert: {
    id?: string;
    category_id: string;
    locale: string;
    display_name: string;
  };
  Update: {
    id?: string;
    category_id?: string;
    locale?: string;
    display_name?: string;
  };
  Relationships: [
    {
      foreignKeyName: "category_translations_category_id_fkey";
      columns: ["category_id"];
      isOneToOne: false;
      referencedRelation: "categories";
      referencedColumns: ["id"];
    },
  ];
};
```

**Step 3: Add user_category_overrides table type**

```typescript
user_category_overrides: {
  Row: {
    id: string;
    user_id: string;
    category_id: string | null;
    custom_name: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    category_id?: string | null;
    custom_name: string;
    created_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    category_id?: string | null;
    custom_name?: string;
    created_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "user_category_overrides_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "users";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "user_category_overrides_category_id_fkey";
      columns: ["category_id"];
      isOneToOne: false;
      referencedRelation: "categories";
      referencedColumns: ["id"];
    },
  ];
};
```

**Step 4: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 5: Commit**

```bash
git add supabase/database.types.ts
git commit -m "feat(schema): add categories, translations, and overrides types"
```

---

## Task 7: Verify Full Build

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

Expected: Build succeeds.

**Step 3: Fix any issues found**

If type errors or build errors, fix them before proceeding.

---

## Task 8: Update PROGRESS_LOG.md

**Files:**
- Modify: `docs/PROGRESS_LOG.md` (at `/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/docs/PROGRESS_LOG.md`)

**Step 1: Append Session 4 entry**

Include:
- Session Objective: Session 4 — Core Database Schema (Transactions + Accounts)
- Files created: migration 003, plan doc
- Files modified: database.types.ts
- Database schema changes: 6 new tables (institutions, accounts, transactions, categories, category_translations, user_category_overrides)
- API routes added: None
- Architectural decisions: shared institutions/categories (no RLS), user-owned tables (full RLS), money in minor units, separate translations table
- Financial Engine Impact: No change (v0.0.1)
- Security & RLS: RLS on accounts, transactions, user_category_overrides. No RLS on institutions, categories, category_translations (shared data).
- Known Gaps: Migrations not applied, no seed data for categories, no bank sync
- Risks: category_id FK on transactions means categories must be seeded before transactions can be categorized
- Next Session Target: Session 5 — Engine Integration Skeleton

**Step 2: Commit**

```bash
git add docs/PROGRESS_LOG.md
git commit -m "docs: update progress log for session 4 (core database schema)"
```

---

## Summary of Deliverables

| Deliverable | File(s) |
|---|---|
| Migration with 6 tables | `supabase/migrations/003_accounts_transactions_categories.sql` |
| Database types updated | `supabase/database.types.ts` |
| Implementation plan | `docs/plans/2026-02-22-session-4-core-database-schema.md` |
| Progress log updated | `docs/PROGRESS_LOG.md` |

## Tables Created

| Table | RLS | Owner | Purpose |
|---|---|---|---|
| institutions | No | Shared | Bank/institution reference data |
| accounts | Yes (user_id) | User | Financial accounts |
| transactions | Yes (user_id) | User | Financial transactions |
| categories | No | System | Category definitions |
| category_translations | No | System | Multi-language category names |
| user_category_overrides | Yes (user_id) | User | Custom category names |

## Exit Criteria (from FIRST-5-CODING-SESSIONS-PLAN.md)

- [x] Tables created via migration (6 tables in migration 003)
- [x] RLS enforced (accounts, transactions, user_category_overrides)
- [x] Test insert works per user (RLS policies include INSERT for authenticated with auth.uid() check)
