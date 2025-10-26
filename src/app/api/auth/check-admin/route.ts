import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Server-side admin verification endpoint
 * Security: Admin emails are checked server-side only (not exposed to client)
 *
 * Usage:
 *   const response = await fetch('/api/auth/check-admin');
 *   const { isAdmin } = await response.json();
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Supabase session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    // Server-side admin email check (NOT exposed to client)
    // Uses non-public environment variable
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isAdmin = adminEmails.includes(user.email.toLowerCase());

    // Return admin status
    return NextResponse.json({ isAdmin }, { status: 200 });
  } catch (error) {
    console.error('[check-admin] Error:', error);
    // Fail closed: return false on error
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}
