import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimitAuth, createRateLimitResponse } from "@/lib/rate-limit";
import { deleteMerchantMapping } from "@/server/merchant-mappings";

const paramsSchema = z.object({ id: z.string().uuid() });

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const rl = await rateLimitAuth(_request);
  if (!rl.success) return createRateLimitResponse(rl);

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = paramsSchema.safeParse(await context.params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid id parameter" }, { status: 400 });
  }
  const { id } = parsed.data;

  try {
    await deleteMerchantMapping(supabase, user.id, id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete merchant mapping" }, { status: 500 });
  }
}
