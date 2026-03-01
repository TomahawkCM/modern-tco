import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reportQuerySchema } from "@/server/schemas/report";
import { getMonthlyTotals, getCategorySpendingOverTime } from "@/server/reports";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = reportQuerySchema.safeParse({
    startDate: searchParams.get("startDate"),
    endDate: searchParams.get("endDate"),
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
    const [monthlyTotals, categorySpending] = await Promise.all([
      getMonthlyTotals(supabase, user.id, parsed.data.startDate, parsed.data.endDate),
      getCategorySpendingOverTime(supabase, user.id, parsed.data.startDate, parsed.data.endDate),
    ]);

    return NextResponse.json({ monthlyTotals, categorySpending });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
