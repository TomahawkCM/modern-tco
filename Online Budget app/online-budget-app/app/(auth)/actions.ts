"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimitLogin, rateLimitSignup } from "@/lib/rate-limit";
import { logAuthEvent } from "@/server/audit-log";

/**
 * Build a minimal Request-like object from server action headers
 * so rate limiting can extract the client IP.
 */
async function buildRequestFromHeaders(): Promise<Request> {
  const hdrs = await headers();
  return new Request("http://localhost", {
    headers: {
      "x-forwarded-for": hdrs.get("x-forwarded-for") ?? "",
      "x-real-ip": hdrs.get("x-real-ip") ?? "",
      "user-agent": hdrs.get("user-agent") ?? "",
    },
  });
}

export async function signUp(formData: FormData) {
  const req = await buildRequestFromHeaders();

  // Rate limit: 3 signups per minute per IP
  const rl = await rateLimitSignup(req);
  if (!rl.success) {
    redirect(
      `/signup?error=${encodeURIComponent("Too many signup attempts. Please try again later.")}`
    );
  }

  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    await logAuthEvent("signup", null, req, { error: error.message, email });
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  await logAuthEvent("signup", data.user?.id ?? null, req);

  // After signup, redirect to verify-email page
  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

export async function signIn(formData: FormData) {
  const req = await buildRequestFromHeaders();

  // Rate limit: 5 login attempts per minute per IP
  const rl = await rateLimitLogin(req);
  if (!rl.success) {
    redirect(
      `/login?error=${encodeURIComponent("Too many login attempts. Please try again later.")}`
    );
  }

  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    await logAuthEvent("login_failure", null, req, { error: error.message, email });
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Check email verification
  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    redirect(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  await logAuthEvent("login_success", data.user.id, req);

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const req = await buildRequestFromHeaders();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.auth.signOut();
  await logAuthEvent("logout", user?.id ?? null, req);

  revalidatePath("/", "layout");
  redirect("/login");
}

export async function signOutAllDevices() {
  const req = await buildRequestFromHeaders();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Use admin client to revoke all sessions for this user
  const admin = createAdminClient();
  await admin.auth.admin.signOut(user.id, "global");

  await logAuthEvent("session_revoked_all", user.id, req);

  revalidatePath("/", "layout");
  redirect("/login");
}

export async function resendVerificationEmail(formData: FormData) {
  const req = await buildRequestFromHeaders();
  const email = formData.get("email") as string;

  if (!email) {
    redirect("/verify-email?error=Email is required");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });

  if (error) {
    await logAuthEvent("email_verification_resend", null, req, {
      error: error.message,
      email,
    });
    redirect(
      `/verify-email?email=${encodeURIComponent(email)}&error=${encodeURIComponent(error.message)}`
    );
  }

  await logAuthEvent("email_verification_resend", null, req, { email });
  redirect(
    `/verify-email?email=${encodeURIComponent(email)}&message=${encodeURIComponent("Verification email sent!")}`
  );
}
