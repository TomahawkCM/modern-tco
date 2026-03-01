import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLatestNetWorth, listNetWorthSnapshots } from "@/server/net-worth";

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
    const [latest, history] = await Promise.all([
      getLatestNetWorth(supabase, user.id),
      listNetWorthSnapshots(supabase, user.id),
    ]);
    return NextResponse.json({ latest, history });
  } catch {
    return NextResponse.json({ error: "Failed to fetch net worth data" }, { status: 500 });
  }
}
