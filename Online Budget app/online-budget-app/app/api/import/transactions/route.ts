import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bulkCreateTransactionsSchema } from "@/server/schemas/import";
import { bulkCreateTransactions } from "@/server/import";

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

  const parsed = bulkCreateTransactionsSchema.safeParse(body);
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
    const transactions = await bulkCreateTransactions(supabase, user.id, parsed.data.transactions);
    return NextResponse.json({ transactions, count: transactions.length }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to import transactions" }, { status: 500 });
  }
}
