import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createUserCategoryOverride } from "@/server/categories";
import { z } from "zod";

const createOverrideSchema = z.object({
  category_id: z.string().uuid(),
  custom_name: z.string().min(1).max(255),
});

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

  const parsed = createOverrideSchema.safeParse(body);
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
    const override = await createUserCategoryOverride(supabase, user.id, parsed.data);
    return NextResponse.json(override, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save category override" }, { status: 500 });
  }
}
