# Transaction CRUD Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement server-side Transaction CRUD functions with Zod validation and thin API routes.

**Architecture:** Server functions in `server/transactions.ts` handle all Supabase queries. Thin API routes in `app/api/transactions/` validate input with Zod schemas and delegate to server functions. No financial math in either layer — amounts are stored/retrieved as-is (integer minor units).

**Tech Stack:** Next.js 16 API routes, Supabase (via `@/lib/supabase/server`), Zod validation, Vitest for schema tests.

---

### Task 1: Zod Validation Schemas

**Files:**
- Create: `server/schemas/transaction.ts`
- Test: `server/schemas/transaction.test.ts`

**Step 1: Write failing tests for create schema**

```typescript
// server/schemas/transaction.test.ts
import { describe, it, expect } from "vitest";
import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsSchema,
} from "./transaction";

describe("createTransactionSchema", () => {
  const validInput = {
    account_id: "550e8400-e29b-41d4-a716-446655440000",
    amount_minor: -1500,
    currency: "USD",
    transaction_date: "2026-02-20",
  };

  it("accepts valid minimal input", () => {
    const result = createTransactionSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts valid full input", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      description: "Grocery shopping",
      merchant_name: "Whole Foods",
      category_id: "550e8400-e29b-41d4-a716-446655440001",
      is_pending: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-integer amount_minor", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      amount_minor: 15.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid currency length", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      currency: "US",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      transaction_date: "02/20/2026",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = createTransactionSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects invalid account_id format", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      account_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts zero amount (valid for adjustments)", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      amount_minor: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe("updateTransactionSchema", () => {
  it("accepts partial update (category only)", () => {
    const result = updateTransactionSchema.safeParse({
      category_id: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null category_id (uncategorize)", () => {
    const result = updateTransactionSchema.safeParse({
      category_id: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty object", () => {
    const result = updateTransactionSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-integer amount_minor", () => {
    const result = updateTransactionSchema.safeParse({
      amount_minor: 15.5,
    });
    expect(result.success).toBe(false);
  });
});

describe("listTransactionsSchema", () => {
  it("accepts empty query (uses defaults)", () => {
    const result = listTransactionsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
      expect(result.data.offset).toBe(0);
    }
  });

  it("accepts all filters", () => {
    const result = listTransactionsSchema.safeParse({
      account_id: "550e8400-e29b-41d4-a716-446655440000",
      category_id: "550e8400-e29b-41d4-a716-446655440001",
      from_date: "2026-01-01",
      to_date: "2026-02-28",
      is_pending: "true",
      limit: "25",
      offset: "10",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(25);
      expect(result.data.offset).toBe(10);
    }
  });

  it("rejects limit above 100", () => {
    const result = listTransactionsSchema.safeParse({ limit: "200" });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers to integers", () => {
    const result = listTransactionsSchema.safeParse({ limit: "10", offset: "5" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(10);
      expect(result.data.offset).toBe(5);
    }
  });
});
```

**Step 2: Run tests, verify they fail**

Run: `npx vitest run server/schemas/transaction.test.ts`
Expected: FAIL — module not found

**Step 3: Implement schemas**

```typescript
// server/schemas/transaction.ts
import { z } from "zod";

const currencyCode = z.string().length(3);

export const createTransactionSchema = z.object({
  account_id: z.string().uuid(),
  amount_minor: z.number().int(),
  currency: currencyCode,
  transaction_date: z.string().date(),
  description: z.string().max(500).optional(),
  merchant_name: z.string().max(255).optional(),
  category_id: z.string().uuid().optional(),
  is_pending: z.boolean().optional().default(false),
});

export const updateTransactionSchema = z
  .object({
    amount_minor: z.number().int().optional(),
    currency: currencyCode.optional(),
    transaction_date: z.string().date().optional(),
    description: z.string().max(500).nullable().optional(),
    merchant_name: z.string().max(255).nullable().optional(),
    category_id: z.string().uuid().nullable().optional(),
    is_pending: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const listTransactionsSchema = z.object({
  account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  from_date: z.string().date().optional(),
  to_date: z.string().date().optional(),
  is_pending: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ListTransactionsInput = z.infer<typeof listTransactionsSchema>;
```

**Step 4: Run tests, verify they pass**

Run: `npx vitest run server/schemas/transaction.test.ts`
Expected: All 16 tests PASS

---

### Task 2: Server CRUD Functions

**Files:**
- Create: `server/transactions.ts`

**Step 1: Implement CRUD functions**

```typescript
// server/transactions.ts
import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  ListTransactionsInput,
} from "./schemas/transaction";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

export async function createTransaction(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateTransactionInput
): Promise<TransactionRow> {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      account_id: input.account_id,
      amount_minor: input.amount_minor,
      currency: input.currency,
      transaction_date: input.transaction_date,
      description: input.description,
      merchant_name: input.merchant_name,
      category_id: input.category_id,
      is_pending: input.is_pending ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTransaction(
  supabase: SupabaseClient<Database>,
  userId: string,
  transactionId: string
): Promise<TransactionRow | null> {
  const { data, error } = await supabase
    .from("transactions")
    .select()
    .eq("id", transactionId)
    .eq("user_id", userId)
    .single();

  if (error && error.code === "PGRST116") return null; // not found
  if (error) throw error;
  return data;
}

export async function listTransactions(
  supabase: SupabaseClient<Database>,
  userId: string,
  filters: ListTransactionsInput
): Promise<{ transactions: TransactionRow[]; count: number }> {
  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.account_id) query = query.eq("account_id", filters.account_id);
  if (filters.category_id) query = query.eq("category_id", filters.category_id);
  if (filters.from_date) query = query.gte("transaction_date", filters.from_date);
  if (filters.to_date) query = query.lte("transaction_date", filters.to_date);
  if (filters.is_pending !== undefined) query = query.eq("is_pending", filters.is_pending === "true");

  query = query.range(filters.offset, filters.offset + filters.limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;
  return { transactions: data ?? [], count: count ?? 0 };
}

export async function updateTransaction(
  supabase: SupabaseClient<Database>,
  userId: string,
  transactionId: string,
  input: UpdateTransactionInput
): Promise<TransactionRow> {
  const { data, error } = await supabase
    .from("transactions")
    .update(input)
    .eq("id", transactionId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTransaction(
  supabase: SupabaseClient<Database>,
  userId: string,
  transactionId: string
): Promise<void> {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", userId);

  if (error) throw error;
}
```

---

### Task 3: API Routes

**Files:**
- Create: `app/api/transactions/route.ts` (GET list + POST create)
- Create: `app/api/transactions/[id]/route.ts` (GET single + PATCH update + DELETE)

**Step 1: Implement list + create route**

```typescript
// app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createTransactionSchema,
  listTransactionsSchema,
} from "@/server/schemas/transaction";
import {
  createTransaction,
  listTransactions,
} from "@/server/transactions";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = listTransactionsSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const result = await listTransactions(supabase, user.id, parsed.data);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const transaction = await createTransaction(supabase, user.id, parsed.data);
    return NextResponse.json(transaction, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
```

**Step 2: Implement single + update + delete route**

```typescript
// app/api/transactions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateTransactionSchema } from "@/server/schemas/transaction";
import {
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/server/transactions";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const transaction = await getTransaction(supabase, user.id, id);
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    return NextResponse.json(transaction);
  } catch {
    return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const transaction = await updateTransaction(supabase, user.id, id, parsed.data);
    return NextResponse.json(transaction);
  } catch {
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await deleteTransaction(supabase, user.id, id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
```

**Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: Exit 0, no errors

**Step 4: Run all tests**

Run: `npx vitest run`
Expected: All tests pass (schema tests + existing engine tests)

---

### Task 4: Verify and Update Progress Log

Run full verification:
- `npx tsc --noEmit` — exit 0
- `npx vitest run` — all tests pass
- Confirm no financial math outside engine/
- Update `docs/PROGRESS_LOG.md`
