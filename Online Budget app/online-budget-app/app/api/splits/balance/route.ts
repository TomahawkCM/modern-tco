import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBalanceSummary } from "@/server/splits";

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
    const summary = await getBalanceSummary(supabase, user.id);
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ error: "Failed to fetch balance summary" }, { status: 500 });
  }
}
