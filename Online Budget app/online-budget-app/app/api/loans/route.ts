import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLoanSchema } from "@/server/schemas/loan";
import { listLoans, createLoan } from "@/server/loans";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const loans = await listLoans(supabase, user.id);
    return NextResponse.json(loans);
  } catch {
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 });
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

  const parsed = createLoanSchema.safeParse(body);
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
    const loan = await createLoan(supabase, user.id, parsed.data);
    return NextResponse.json(loan, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create loan" }, { status: 500 });
  }
}
