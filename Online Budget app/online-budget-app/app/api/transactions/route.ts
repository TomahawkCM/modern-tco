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
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = listTransactionsSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid query parameters",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const result = await listTransactions(supabase, user.id, parsed.data);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
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

  const parsed = createTransactionSchema.safeParse(body);
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
    const transaction = await createTransaction(
      supabase,
      user.id,
      parsed.data
    );
    return NextResponse.json(transaction, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
