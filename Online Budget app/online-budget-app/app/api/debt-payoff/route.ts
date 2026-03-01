import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createDebtScenarioSchema } from "@/server/schemas/debt-payoff";
import { getDebtPayoffData, createDebtScenario } from "@/server/debt-payoff";

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
    const data = await getDebtPayoffData(supabase, user.id);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch debt payoff data" }, { status: 500 });
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

  const parsed = createDebtScenarioSchema.safeParse(body);
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
    const scenario = await createDebtScenario(supabase, user.id, parsed.data);
    return NextResponse.json(scenario, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create debt scenario" }, { status: 500 });
  }
}
