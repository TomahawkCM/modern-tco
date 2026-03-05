import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { suspendUser, unsuspendUser, extendTrial, changeUserRole } from "@/server/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, targetUserId, ...extra } = body as {
    action: string;
    targetUserId: string;
    [key: string]: string;
  };

  if (!action || !targetUserId) {
    return NextResponse.json({ error: "Missing action or targetUserId" }, { status: 400 });
  }

  try {
    switch (action) {
      case "suspend":
        await suspendUser(user.id, targetUserId, request);
        break;
      case "unsuspend":
        await unsuspendUser(user.id, targetUserId, request);
        break;
      case "extend_trial": {
        const days = parseInt(extra.days ?? "14", 10);
        await extendTrial(user.id, targetUserId, days, request);
        break;
      }
      case "change_role":
        if (!extra.role) {
          return NextResponse.json({ error: "Missing role parameter" }, { status: 400 });
        }
        await changeUserRole(user.id, targetUserId, extra.role, request);
        break;
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
