import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRetirementPlanSchema } from "@/server/schemas/planning";
import { listRetirementPlans, createRetirementPlan } from "@/server/planning";

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
    const plans = await listRetirementPlans(supabase, user.id);
    return NextResponse.json(plans);
  } catch {
    return NextResponse.json({ error: "Failed to fetch retirement plans" }, { status: 500 });
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

  const parsed = createRetirementPlanSchema.safeParse(body);
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
    const plan = await createRetirementPlan(supabase, user.id, parsed.data);
    return NextResponse.json(plan, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create retirement plan" }, { status: 500 });
  }
}
