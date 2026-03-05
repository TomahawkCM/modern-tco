import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAuthEvent } from "@/server/audit-log";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const provider = data.user.app_metadata?.provider ?? "oauth";
      await logAuthEvent("login_success", data.user.id, request, {
        provider,
      });
      return NextResponse.redirect(origin);
    }

    if (error) {
      await logAuthEvent("login_failure", null, request, {
        error: error.message,
        provider: "oauth",
      });
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
