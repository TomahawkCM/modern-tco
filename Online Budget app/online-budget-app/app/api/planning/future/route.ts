import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createFuturePurchaseSchema } from "@/server/schemas/planning";
import { listFuturePurchases, createFuturePurchase } from "@/server/planning";

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
    const purchases = await listFuturePurchases(supabase, user.id);
    return NextResponse.json(purchases);
  } catch {
    return NextResponse.json({ error: "Failed to fetch future purchases" }, { status: 500 });
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

  const parsed = createFuturePurchaseSchema.safeParse(body);
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
    const purchase = await createFuturePurchase(supabase, user.id, parsed.data);
    return NextResponse.json(purchase, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create future purchase" }, { status: 500 });
  }
}
