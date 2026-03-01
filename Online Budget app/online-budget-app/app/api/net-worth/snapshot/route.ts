import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNetWorthSnapshotSchema } from "@/server/schemas/net-worth";
import { createNetWorthSnapshot } from "@/server/net-worth";

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

  const parsed = createNetWorthSnapshotSchema.safeParse(body);
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
    const snapshot = await createNetWorthSnapshot(supabase, user.id, parsed.data);
    return NextResponse.json(snapshot, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create net worth snapshot" }, { status: 500 });
  }
}
