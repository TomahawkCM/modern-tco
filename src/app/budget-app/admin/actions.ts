"use server";

// Server action v2 - SSR auth with cookies
import type { UserProfile } from "@/lib/profileService";
import { calculateSubscriptionStatus } from "@/lib/subscriptionService";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

async function requireAdmin() {
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
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Component context - ignore
          }
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    console.error("[admin] Auth error:", authError);
    throw new Error("Unauthorized");
  }

  if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    console.error("[admin] Email not in admin list:", user.email);
    throw new Error("Access Denied");
  }

  return { user, supabase };
}

async function logAdminAction(action: string, targetUserId?: string, metadata: Record<string, any> = {}) {
  if (!supabaseAdmin) return;
  try {
    await supabaseAdmin.from("audit_log").insert({
      actor_id: metadata.actorId ?? null,
      action,
      target_user_id: targetUserId ?? null,
      metadata,
    });
  } catch (err) {
    console.warn("[admin] Failed to log audit action", err);
  }
}

function applyAuditFilters(request: any, query?: string, startDate?: string, endDate?: string) {
  let filtered = request;
  if (query) {
    filtered = filtered.or(`action.ilike.%${query}%,metadata.ilike.%${query}%`);
  }
  if (startDate) {
    filtered = filtered.gte("created_at", new Date(startDate).toISOString());
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.lte("created_at", end.toISOString());
  }
  return filtered;
}

export async function getAdminUsers() {
  console.log("[getAdminUsers] Starting request");
  try {
    const { user } = await requireAdmin();

    if (!supabaseAdmin) {
      console.error("[getAdminUsers] Service Role Key missing");
      throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");
    }

    const { data: users, error: dbError } = await supabaseAdmin
      .from("users")
      .select(
        "id, email, name, created_at, last_login, trial_start, subscription_status, is_suspended, role"
      )
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("[getAdminUsers] DB Error:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    const typedUsers = users as unknown as UserProfile[];
    const processedUsers = (typedUsers || []).map((u) => {
      const subStatus = calculateSubscriptionStatus(u);
      return {
        ...u,
        status: subStatus,
      };
    });

    await logAdminAction("admin.users.view", undefined, { actorId: user.id });

    return processedUsers;
  } catch (err: any) {
    console.error("[getAdminUsers] Fail:", err);
    throw err; // Re-throw to be handled by the UI
  }
}

export async function getAuditLog(
  limit = 50,
  query = "",
  startDate?: string,
  endDate?: string
) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  let request = supabaseAdmin
    .from("audit_log")
    .select("id, actor_id, action, target_user_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  request = applyAuditFilters(request, query, startDate, endDate);

  const { data: logs, error } = await request;

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  await logAdminAction("admin.audit.view", undefined, {
    actorId: user.id,
    limit,
    query,
    startDate,
    endDate,
  });

  const userIds = Array.from(
    new Set([...(logs ?? []).map((l) => l.actor_id), ...(logs ?? []).map((l) => l.target_user_id)])
  ).filter(Boolean) as string[];

  if (userIds.length === 0) return logs ?? [];

  const { data: userRows } = await supabaseAdmin
    .from("users")
    .select("id, email, name")
    .in("id", userIds);

  const userMap = new Map((userRows ?? []).map((u) => [u.id, u]));

  return (logs ?? []).map((log) => ({
    ...log,
    actor: log.actor_id ? userMap.get(log.actor_id) : null,
    target: log.target_user_id ? userMap.get(log.target_user_id) : null,
  }));
}

export async function exportAuditLog(
  query = "",
  startDate?: string,
  endDate?: string,
  format: "csv" | "json" = "csv"
) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  let request = supabaseAdmin
    .from("audit_log")
    .select("id, actor_id, action, target_user_id, metadata, created_at")
    .order("created_at", { ascending: false });

  request = applyAuditFilters(request, query, startDate, endDate);

  const { data: logs, error } = await request;
  if (error) throw new Error(`Database error: ${error.message}`);

  await logAdminAction("admin.audit.export", undefined, {
    actorId: user.id,
    query,
    startDate,
    endDate,
    format,
    count: logs?.length ?? 0,
  });

  if (format === "json") {
    return JSON.stringify(logs ?? [], null, 2);
  }

  const csvHeader = "id,created_at,action,actor_id,target_user_id,metadata\n";
  const rows = (logs ?? []).map((log) => {
    const meta = JSON.stringify(log.metadata ?? {}).replace(/"/g, '""');
    return `${log.id},${log.created_at},${log.action},${log.actor_id ?? ""},${log.target_user_id ?? ""},"${meta}"`;
  });

  return csvHeader + rows.join("\n");
}

export async function getFamilyGroups() {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  const { data: groups, error } = await supabaseAdmin
    .from("family_groups")
    .select("id, name, owner_id, invite_code, created_at");

  if (error) throw new Error(`Database error: ${error.message}`);

  const { data: memberCounts } = await supabaseAdmin
    .from("family_members")
    .select("family_id", { count: "exact", head: false });

  const counts = new Map<string, number>();
  (memberCounts ?? []).forEach((row: any) => {
    counts.set(row.family_id, (counts.get(row.family_id) ?? 0) + 1);
  });

  await logAdminAction("admin.family.view", undefined, { actorId: user.id });

  return (groups ?? []).map((g) => ({
    ...g,
    memberCount: counts.get(g.id) ?? 0,
  }));
}

export async function createFamilyGroup(name: string, ownerId: string) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  const { data: group, error } = await supabaseAdmin
    .from("family_groups")
    .insert({ name, owner_id: ownerId })
    .select("id, name, owner_id, invite_code, created_at")
    .single();

  if (error) throw new Error(`Database error: ${error.message}`);

  await supabaseAdmin
    .from("family_members")
    .insert({ family_id: group.id, user_id: ownerId, role: "owner", can_see_all_accounts: true });

  await logAdminAction("admin.family.create", ownerId, { actorId: user.id, familyId: group.id, name });

  return group;
}

export async function renameFamilyGroup(familyId: string, name: string) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  const { error } = await supabaseAdmin.from("family_groups").update({ name }).eq("id", familyId);
  if (error) throw new Error(`Database error: ${error.message}`);

  await logAdminAction("admin.family.rename", undefined, { actorId: user.id, familyId, name });

  return { ok: true };
}

export async function deleteFamilyGroup(familyId: string) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  const { error } = await supabaseAdmin.from("family_groups").delete().eq("id", familyId);
  if (error) throw new Error(`Database error: ${error.message}`);

  await logAdminAction("admin.family.delete", undefined, { actorId: user.id, familyId });

  return { ok: true };
}

export async function getFamilyMembers(familyId: string) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  const { data: members, error } = await supabaseAdmin
    .from("family_members")
    .select("id, family_id, user_id, role, permissions, can_see_all_accounts, spending_limit, created_at")
    .eq("family_id", familyId);

  if (error) throw new Error(`Database error: ${error.message}`);

  const userIds = Array.from(new Set((members ?? []).map((m) => m.user_id))).filter(Boolean) as string[];
  const { data: userRows } = userIds.length
    ? await supabaseAdmin.from("users").select("id, email, name").in("id", userIds)
    : { data: [] };

  const userMap = new Map((userRows ?? []).map((u) => [u.id, u]));

  await logAdminAction("admin.family.members.view", undefined, { actorId: user.id, familyId });

  return (members ?? []).map((m) => ({
    ...m,
    user: userMap.get(m.user_id) ?? null,
  }));
}

export async function updateFamilyMemberRole(memberId: string, role: string) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  const { error } = await supabaseAdmin
    .from("family_members")
    .update({ role })
    .eq("id", memberId);

  if (error) throw new Error(`Database error: ${error.message}`);

  await logAdminAction("admin.family.member.role.update", undefined, { actorId: user.id, memberId, role });

  return { ok: true };
}

export async function removeFamilyMember(memberId: string) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  const { error } = await supabaseAdmin.from("family_members").delete().eq("id", memberId);
  if (error) throw new Error(`Database error: ${error.message}`);

  await logAdminAction("admin.family.member.remove", undefined, { actorId: user.id, memberId });

  return { ok: true };
}

export async function updateUserRole(userId: string, role: string) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  const { error } = await supabaseAdmin.from("users").update({ role }).eq("id", userId);
  if (error) throw new Error(`Database error: ${error.message}`);

  await logAdminAction("admin.user.role.update", userId, { actorId: user.id, role });

  return { ok: true };
}

export async function suspendUser(userId: string) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  const { error } = await supabaseAdmin.from("users").update({ is_suspended: true }).eq("id", userId);
  if (error) throw new Error(`Database error: ${error.message}`);

  await logAdminAction("admin.user.suspend", userId, { actorId: user.id });

  return { ok: true };
}

export async function reactivateUser(userId: string) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  const { error } = await supabaseAdmin.from("users").update({ is_suspended: false }).eq("id", userId);
  if (error) throw new Error(`Database error: ${error.message}`);

  await logAdminAction("admin.user.reactivate", userId, { actorId: user.id });

  return { ok: true };
}

export async function extendUserTrial(userId: string, days: number) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  const { data: current, error: currentErr } = await supabaseAdmin
    .from("users")
    .select("trial_start")
    .eq("id", userId)
    .single();

  if (currentErr) throw new Error(`Database error: ${currentErr.message}`);

  const trialStart = current?.trial_start ? new Date(current.trial_start) : new Date();
  const newTrialStart = new Date(trialStart.getTime() - days * 24 * 60 * 60 * 1000);

  const { error } = await supabaseAdmin
    .from("users")
    .update({ trial_start: newTrialStart.toISOString() })
    .eq("id", userId);

  if (error) throw new Error(`Database error: ${error.message}`);

  await logAdminAction("admin.user.trial.extend", userId, { actorId: user.id, days });

  return { ok: true };
}

export async function forceLogoutUser(userId: string) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  // @ts-ignore - admin API typing may vary by supabase-js version
  const { error } = await supabaseAdmin.auth.admin.signOut(userId);
  if (error) throw new Error(`Auth error: ${error.message}`);

  await logAdminAction("admin.user.force_logout", userId, { actorId: user.id });

  return { ok: true };
}

export async function bulkUpdateUserRole(userIds: string[], role: string) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  if (userIds.length === 0) return { ok: true };

  const { error } = await supabaseAdmin.from("users").update({ role }).in("id", userIds);
  if (error) throw new Error(`Database error: ${error.message}`);

  await logAdminAction("admin.user.role.bulk", undefined, { actorId: user.id, role, count: userIds.length });

  return { ok: true };
}

export async function bulkSuspendUsers(userIds: string[]) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  if (userIds.length === 0) return { ok: true };

  const { error } = await supabaseAdmin.from("users").update({ is_suspended: true }).in("id", userIds);
  if (error) throw new Error(`Database error: ${error.message}`);

  await logAdminAction("admin.user.suspend.bulk", undefined, { actorId: user.id, count: userIds.length });

  return { ok: true };
}

export async function bulkReactivateUsers(userIds: string[]) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  if (userIds.length === 0) return { ok: true };

  const { error } = await supabaseAdmin.from("users").update({ is_suspended: false }).in("id", userIds);
  if (error) throw new Error(`Database error: ${error.message}`);

  await logAdminAction("admin.user.reactivate.bulk", undefined, { actorId: user.id, count: userIds.length });

  return { ok: true };
}

export async function bulkExtendTrial(userIds: string[], days: number) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  if (userIds.length === 0) return { ok: true };

  const { data: rows, error: fetchErr } = await supabaseAdmin
    .from("users")
    .select("id, trial_start")
    .in("id", userIds);

  if (fetchErr) throw new Error(`Database error: ${fetchErr.message}`);

  const updates = (rows ?? []).map((row: any) => {
    const trialStart = row.trial_start ? new Date(row.trial_start) : new Date();
    const newTrialStart = new Date(trialStart.getTime() - days * 24 * 60 * 60 * 1000);
    return { id: row.id, trial_start: newTrialStart.toISOString() };
  });

  if (updates.length > 0) {
    const { error } = await supabaseAdmin.from("users").upsert(updates, { onConflict: "id" });
    if (error) throw new Error(`Database error: ${error.message}`);
  }

  await logAdminAction("admin.user.trial.bulk", undefined, { actorId: user.id, days, count: userIds.length });

  return { ok: true };
}

export async function bulkForceLogout(userIds: string[]) {
  const { user } = await requireAdmin();
  if (!supabaseAdmin) throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing");

  for (const id of userIds) {
    // @ts-ignore
    const { error } = await supabaseAdmin.auth.admin.signOut(id);
    if (error) throw new Error(`Auth error: ${error.message}`);
  }

  await logAdminAction("admin.user.force_logout.bulk", undefined, { actorId: user.id, count: userIds.length });

  return { ok: true };
}
