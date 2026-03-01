import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateHoldingSchema } from "@/server/schemas/investment";
import { updateHolding, deleteHolding } from "@/server/investments";

type RouteContext = { params: Promise<{ id: string; holdingId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { holdingId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateHoldingSchema.safeParse(body);
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
    const holding = await updateHolding(supabase, user.id, holdingId, parsed.data);
    return NextResponse.json(holding);
  } catch {
    return NextResponse.json({ error: "Failed to update holding" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { holdingId } = await context.params;

  try {
    await deleteHolding(supabase, user.id, holdingId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete holding" }, { status: 500 });
  }
}
