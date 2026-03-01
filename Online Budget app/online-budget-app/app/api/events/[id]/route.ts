import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateEventBudgetSchema } from "@/server/schemas/events";
import { getEventBudget, updateEventBudget, deleteEventBudget } from "@/server/events";

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
    const event = await getEventBudget(supabase, user.id, id);
    if (!event) {
      return NextResponse.json({ error: "Event budget not found" }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: "Failed to fetch event budget" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
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

  const parsed = updateEventBudgetSchema.safeParse(body);
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
    const event = await updateEventBudget(supabase, user.id, id, parsed.data);
    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: "Failed to update event budget" }, { status: 500 });
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

  const { id } = await context.params;

  try {
    await deleteEventBudget(supabase, user.id, id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete event budget" }, { status: 500 });
  }
}
