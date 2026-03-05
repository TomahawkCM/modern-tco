/**
 * Auth event audit logging.
 *
 * Logs authentication events (login, signup, password reset, etc.) to the
 * audit_log table using the service role client (bypasses RLS).
 *
 * Usage:
 *   import { logAuthEvent } from '@/server/audit-log';
 *   await logAuthEvent('login_success', userId, request);
 */

import { createAdminClient } from "@/lib/supabase/admin";

export type AuditAction =
  | "login_success"
  | "login_failure"
  | "signup"
  | "logout"
  | "password_reset_request"
  | "password_reset_complete"
  | "email_verification_resend"
  | "email_verified"
  | "session_revoked_all"
  | "admin_action"
  | "oauth_login"
  | "passkey_registered"
  | "passkey_deleted";

interface AuditMetadata {
  error?: string;
  provider?: string;
  target_user_id?: string;
  email?: string;
  [key: string]: string | number | boolean | null | undefined;
}

function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function getUserAgent(request: Request): string {
  return request.headers.get("user-agent") ?? "unknown";
}

/**
 * Log an auth event to the audit_log table.
 *
 * Uses the admin client (service role) to bypass RLS —
 * audit logs are write-only from the server, read via admin or user's own.
 */
export async function logAuthEvent(
  action: AuditAction,
  userId: string | null,
  request: Request,
  metadata?: AuditMetadata
): Promise<void> {
  try {
    const supabase = createAdminClient();

    await supabase.from("audit_log").insert({
      user_id: userId,
      action,
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request),
      metadata: (metadata ?? {}) as Record<string, string | number | boolean | null>,
    });
  } catch {
    // Audit logging should never break auth flow — log and continue
    console.error(`[audit-log] Failed to log ${action} for user ${userId}`);
  }
}
