import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLoanPaymentSchema } from "@/server/schemas/loan";
import { listLoanPayments, createLoanPayment } from "@/server/loans";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const payments = await listLoanPayments(supabase, user.id, id);
    return NextResponse.json(payments);
  } catch {
    return NextResponse.json({ error: "Failed to fetch loan payments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

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

  const parsed = createLoanPaymentSchema.safeParse({ ...(body as object), loan_id: id });
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
    const payment = await createLoanPayment(supabase, user.id, parsed.data);
    return NextResponse.json(payment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create loan payment" }, { status: 500 });
  }
}
