"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/integrations/stripe";
import { logAuthEvent } from "@/server/audit-log";

// ── Types ───────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  activeTrials: number;
  activeSubscriptions: number;
  mrr: number; // Monthly recurring revenue in cents
  signupTrend: { date: string; count: number }[];
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  subscription_status: string | null;
  trial_end: string | null;
  stripe_customer_id: string | null;
}

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  user_email?: string;
}

// ── Guards ──────────────────────────────────────────────────────────

async function assertAdmin(userId: string): Promise<void> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("users").select("role").eq("id", userId).single();

  if (!data || (data.role !== "admin" && data.role !== "owner")) {
    throw new Error("Forbidden: admin access required");
  }
}

// ── Dashboard Stats ─────────────────────────────────────────────────

export async function getAdminStats(userId: string): Promise<AdminStats> {
  await assertAdmin(userId);
  const supabase = createAdminClient();

  // User count
  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  // Subscription stats
  const { data: subs } = await supabase.from("subscriptions").select("status, trial_end");

  const activeTrials =
    subs?.filter(
      (s) => s.status === "trialing" && s.trial_end && new Date(s.trial_end) > new Date()
    ).length ?? 0;

  const activeSubscriptions = subs?.filter((s) => s.status === "active").length ?? 0;

  // MRR from Stripe
  let mrr = 0;
  try {
    const stripe = getStripe();
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
    });
    mrr = subscriptions.data.reduce((sum, sub) => {
      const item = sub.items.data[0];
      if (item?.price?.unit_amount && item.price.recurring?.interval === "month") {
        return sum + item.price.unit_amount;
      }
      // Convert yearly to monthly
      if (item?.price?.unit_amount && item.price.recurring?.interval === "year") {
        return sum + Math.round(item.price.unit_amount / 12);
      }
      return sum;
    }, 0);
  } catch {
    // Stripe unavailable — MRR stays 0
  }

  // Signup trend (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentUsers } = await supabase
    .from("users")
    .select("created_at")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  const trendMap = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    trendMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const u of recentUsers ?? []) {
    const day = u.created_at.slice(0, 10);
    trendMap.set(day, (trendMap.get(day) ?? 0) + 1);
  }

  const signupTrend = Array.from(trendMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  return {
    totalUsers: totalUsers ?? 0,
    activeTrials,
    activeSubscriptions,
    mrr,
    signupTrend,
  };
}

// ── User Management ─────────────────────────────────────────────────

export async function listUsers(
  userId: string,
  options: {
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {}
): Promise<{ users: AdminUser[]; total: number }> {
  await assertAdmin(userId);
  const supabase = createAdminClient();

  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 20;
  const sortBy = options.sortBy ?? "created_at";
  const sortOrder = options.sortOrder ?? "desc";
  const offset = (page - 1) * pageSize;

  let query = supabase.from("users").select("id, email, role, created_at", { count: "exact" });

  if (options.search) {
    query = query.ilike("email", `%${options.search}%`);
  }

  const { data: users, count } = await query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(offset, offset + pageSize - 1);

  if (!users) return { users: [], total: 0 };

  // Fetch subscriptions for these users
  const userIds = users.map((u) => u.id);
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("user_id, status, trial_end, stripe_customer_id")
    .in("user_id", userIds);

  const subMap = new Map(subs?.map((s) => [s.user_id, s]) ?? []);

  const enriched: AdminUser[] = users.map((u) => {
    const sub = subMap.get(u.id);
    return {
      ...u,
      subscription_status: sub?.status ?? null,
      trial_end: sub?.trial_end ?? null,
      stripe_customer_id: sub?.stripe_customer_id ?? null,
    };
  });

  return { users: enriched, total: count ?? 0 };
}

export async function suspendUser(
  adminUserId: string,
  targetUserId: string,
  request: Request
): Promise<void> {
  await assertAdmin(adminUserId);
  const supabase = createAdminClient();

  // Disable the user in Supabase Auth
  await supabase.auth.admin.updateUserById(targetUserId, {
    ban_duration: "876000h", // ~100 years
  });

  // Update subscription status
  await supabase.from("subscriptions").update({ status: "canceled" }).eq("user_id", targetUserId);

  await logAuthEvent("admin_action", adminUserId, request, {
    target_user_id: targetUserId,
    action_type: "suspend_user",
  });
}

export async function unsuspendUser(
  adminUserId: string,
  targetUserId: string,
  request: Request
): Promise<void> {
  await assertAdmin(adminUserId);
  const supabase = createAdminClient();

  await supabase.auth.admin.updateUserById(targetUserId, {
    ban_duration: "none",
  });

  await logAuthEvent("admin_action", adminUserId, request, {
    target_user_id: targetUserId,
    action_type: "unsuspend_user",
  });
}

export async function extendTrial(
  adminUserId: string,
  targetUserId: string,
  days: number,
  request: Request
): Promise<void> {
  await assertAdmin(adminUserId);
  const supabase = createAdminClient();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("trial_end")
    .eq("user_id", targetUserId)
    .single();

  const currentEnd = sub?.trial_end ? new Date(sub.trial_end) : new Date();
  const newEnd = new Date(currentEnd);
  newEnd.setDate(newEnd.getDate() + days);

  await supabase
    .from("subscriptions")
    .update({
      trial_end: newEnd.toISOString(),
      status: "trialing",
    })
    .eq("user_id", targetUserId);

  await logAuthEvent("admin_action", adminUserId, request, {
    target_user_id: targetUserId,
    action_type: "extend_trial",
    days: days.toString(),
  });
}

export async function changeUserRole(
  adminUserId: string,
  targetUserId: string,
  newRole: string,
  request: Request
): Promise<void> {
  await assertAdmin(adminUserId);

  if (!["owner", "admin", "member", "viewer"].includes(newRole)) {
    throw new Error(`Invalid role: ${newRole}`);
  }

  const supabase = createAdminClient();

  await supabase.from("users").update({ role: newRole }).eq("id", targetUserId);

  await logAuthEvent("admin_action", adminUserId, request, {
    target_user_id: targetUserId,
    action_type: "change_role",
    new_role: newRole,
  });
}

// ── Audit Log ───────────────────────────────────────────────────────

export async function getAuditLog(
  userId: string,
  options: {
    page?: number;
    pageSize?: number;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}
): Promise<{ entries: AuditLogEntry[]; total: number }> {
  await assertAdmin(userId);
  const supabase = createAdminClient();

  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("audit_log")
    .select("id, user_id, action, ip_address, user_agent, metadata, created_at", {
      count: "exact",
    });

  if (options.action) {
    query = query.eq("action", options.action);
  }
  if (options.dateFrom) {
    query = query.gte("created_at", options.dateFrom);
  }
  if (options.dateTo) {
    query = query.lte("created_at", options.dateTo);
  }

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (!data) return { entries: [], total: 0 };

  // Enrich with user emails
  const userIds = [...new Set(data.map((e) => e.user_id).filter(Boolean))] as string[];
  const { data: users } =
    userIds.length > 0
      ? await supabase.from("users").select("id, email").in("id", userIds)
      : { data: [] };

  const emailMap = new Map(users?.map((u) => [u.id, u.email]) ?? []);

  const entries: AuditLogEntry[] = data.map((e) => ({
    id: e.id,
    user_id: e.user_id,
    action: e.action,
    ip_address: e.ip_address,
    user_agent: e.user_agent,
    metadata: (e.metadata ?? {}) as Record<string, unknown>,
    created_at: e.created_at,
    user_email: e.user_id ? (emailMap.get(e.user_id) ?? undefined) : undefined,
  }));

  return { entries, total: count ?? 0 };
}
