import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkDuplicatesSchema } from "@/server/schemas/import";
import { checkDuplicateFitids } from "@/server/import";

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

  const parsed = checkDuplicatesSchema.safeParse(body);
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
    const duplicates = await checkDuplicateFitids(supabase, user.id, parsed.data.fitids);
    return NextResponse.json({
      duplicates: Array.from(duplicates),
      count: duplicates.size,
    });
  } catch {
    return NextResponse.json({ error: "Failed to check duplicates" }, { status: 500 });
  }
}
