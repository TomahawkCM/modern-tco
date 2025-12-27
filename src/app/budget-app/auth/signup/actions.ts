"use server";

import { createUserProfile } from "@/lib/profileService";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server action to initialize user profile after signup
 * This creates the profile in the users table with trial information
 */
export async function initializeUserProfile(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Create Supabase client with cookie access
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

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[initializeUserProfile] Auth error:", authError);
      return { success: false, error: "Not authenticated" };
    }

    // Create user profile with trial initialization
    const result = await createUserProfile(user);

    if (!result.success) {
      console.error("[initializeUserProfile] Profile creation failed:", result.error);
      return { success: false, error: result.error };
    }

    console.log("[initializeUserProfile] Profile created for:", user.email);
    return { success: true };
  } catch (err: any) {
    console.error("[initializeUserProfile] Error:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}
