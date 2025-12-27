"use server";

// Server action v2 - SSR auth with cookies
import type { UserProfile } from "@/lib/profileService";
import { calculateSubscriptionStatus } from "@/lib/subscriptionService";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getAdminUsers() {
  console.log("[getAdminUsers] Starting request");
  try {
    // Create Supabase client directly in the server action for proper cookie access
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server Component context - ignore
            }
          },
        },
      }
    );

    // 1. Check current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      console.error("[getAdminUsers] Auth error:", authError);
      throw new Error("Unauthorized");
    }
    console.log("[getAdminUsers] User authenticated:", user.email);

    // 2. Verified Admin Email
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    if (!adminEmails.includes(user.email.toLowerCase())) {
      console.error("[getAdminUsers] Email not in admin list:", user.email);
      throw new Error("Access Denied");
    }
    console.log("[getAdminUsers] Admin authorized");

    // 3. Fetch all users using Service Role
    if (!supabaseAdmin) {
      console.error("[getAdminUsers] Service Role Key missing");
      throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");
    }

    const { data: users, error: dbError } = await supabaseAdmin
      .from("users")
      .select("id, email, name, created_at, last_login, trial_start, subscription_status")
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("[getAdminUsers] DB Error:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }
    console.log("[getAdminUsers] Fetched users:", users?.length);

    // 4. Process subscription status for each user
    // Cast users to unknown first since database types may not include new columns
    const typedUsers = users as unknown as UserProfile[];
    const processedUsers = (typedUsers || []).map((u) => {
      const subStatus = calculateSubscriptionStatus(u);
      return {
        ...u,
        status: subStatus,
      };
    });

    return processedUsers;
  } catch (err: any) {
    console.error("[getAdminUsers] Fail:", err);
    throw err; // Re-throw to be handled by the UI
  }
}
