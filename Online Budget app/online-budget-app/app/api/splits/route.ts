import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createExpenseSplitSchema } from "@/server/schemas/splits";
import { listExpenseSplits, createExpenseSplit } from "@/server/splits";

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
    const splits = await listExpenseSplits(supabase, user.id);
    return NextResponse.json(splits);
  } catch {
    return NextResponse.json({ error: "Failed to fetch expense splits" }, { status: 500 });
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

  const parsed = createExpenseSplitSchema.safeParse(body);
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
    const split = await createExpenseSplit(supabase, user.id, parsed.data);
    return NextResponse.json(split, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create expense split" }, { status: 500 });
  }
}
