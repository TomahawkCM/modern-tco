import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createEventBudgetItemSchema } from "@/server/schemas/events";
import { listEventBudgetItems, createEventBudgetItem } from "@/server/events";

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
    const items = await listEventBudgetItems(supabase, user.id, id);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch event budget items" }, { status: 500 });
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

  // Override event_budget_id from the URL param
  const parsed = createEventBudgetItemSchema.safeParse({
    ...(body as Record<string, unknown>),
    event_budget_id: id,
  });
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
    const item = await createEventBudgetItem(supabase, user.id, parsed.data);
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create event budget item" }, { status: 500 });
  }
}
