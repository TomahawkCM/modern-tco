"use client";

import { AdminGuard } from "@/components/auth/AdminGuard";
import { GlassCard } from "@/components/budget/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isBudgetOffline } from "@/config/app-target";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, LogOut, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import {
  bulkExtendTrial,
  bulkForceLogout,
  bulkReactivateUsers,
  bulkSuspendUsers,
  bulkUpdateUserRole,
  createFamilyGroup,
  deleteFamilyGroup,
  exportAuditLog,
  exportUsersCSV,
  extendUserTrial,
  forceLogoutUser,
  getAuditLogPage,
  getAdminUsersPage,
  getCurrentAdminRole,
  getFamilyGroups,
  getFamilyMembers,
  reactivateUser,
  removeFamilyMember,
  renameFamilyGroup,
  suspendUser,
  updateFamilyMemberRole,
  updateUserRole,
} from "./actions";

// Admin dashboard is not available in offline mode
const isOfflineMode = isBudgetOffline;

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  created_at: string | null;
  last_login: string | null;
  role?: string | null;
  is_suspended?: boolean | null;
  status: {
    isActive: boolean;
    isTrial: boolean;
    daysRemaining: number;
    isExpired: boolean;
    status: string | null;
  };
}

interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  target_user_id: string | null;
  action: string;
  metadata: Record<string, any> | null;
  created_at: string;
  actor?: { id: string; email: string; name: string | null } | null;
  target?: { id: string; email: string; name: string | null } | null;
}

interface FamilyGroup {
  id: string;
  name: string;
  owner_id: string;
  invite_code: string | null;
  created_at: string;
  memberCount: number;
}

interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: string;
  permissions: any[];
  can_see_all_accounts: boolean;
  spending_limit: number | null;
  created_at: string;
  user?: { id: string; email: string; name: string | null } | null;
}

/**
 * Helper component to clear session and force re-authentication
 * Required when migrating from localStorage to cookie-based auth
 */
function SessionRefreshHelper() {
  const t = useTranslations("admin");
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleClearAndSignIn = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-") || key.includes("supabase")) {
          localStorage.removeItem(key);
        }
      });
      window.location.href = "/budget-app/auth/login";
    } catch (err) {
      console.error("Sign out failed:", err);
      setIsSigningOut(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <p className="text-sm text-slate-400">{t("sessionRefreshMessage")}</p>
      <Button
        variant="outline"
        size="sm"
        className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
        onClick={handleClearAndSignIn}
        disabled={isSigningOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {isSigningOut ? t("signingOut") : t("signOutRefresh")}
      </Button>
    </div>
  );
}

export default function AdminDashboardPage() {
  if (isOfflineMode) {
    notFound();
  }

  return (
    <AdminGuard loginUrl="/budget-app/auth/login">
      <AdminDashboardContent />
    </AdminGuard>
  );
}

function AdminDashboardContent() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditQuery, setAuditQuery] = useState("");
  const [auditStartDate, setAuditStartDate] = useState("");
  const [auditEndDate, setAuditEndDate] = useState("");
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("");
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupOwnerId, setNewGroupOwnerId] = useState("");
  const [bulkRole, setBulkRole] = useState("member");
  const [bulkTrialDays, setBulkTrialDays] = useState(7);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userSortField, setUserSortField] = useState<"created_at" | "email" | "last_login">(
    "created_at"
  );
  const [userSortDir, setUserSortDir] = useState<"asc" | "desc">("desc");
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [adminRole, setAdminRole] = useState<"owner" | "admin" | "member" | "viewer" | "child">(
    "admin"
  );

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersResp, auditResp, groupData, role] = await Promise.all([
        getAdminUsersPage(userPage, 25, userSortField, userSortDir, searchQuery),
        getAuditLogPage(auditPage, 50, auditQuery, auditStartDate, auditEndDate),
        getFamilyGroups(),
        getCurrentAdminRole(),
      ]);
      setUsers(usersResp.users as any);
      setFilteredUsers(usersResp.users as any);
      setUserTotal(usersResp.total);
      setAuditLogs(auditResp.logs as any);
      setAuditTotal(auditResp.total);
      setFamilyGroups(groupData as any);
      setAdminRole(role as any);
    } catch (err: any) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    userPage,
    userSortField,
    userSortDir,
    searchQuery,
    auditPage,
    auditQuery,
    auditStartDate,
    auditEndDate,
  ]);

  useEffect(() => {
    if (!selectedFamilyId) {
      setFamilyMembers([]);
      return;
    }
    getFamilyMembers(selectedFamilyId)
      .then((members) => setFamilyMembers(members as any))
      .catch((err) => setError(err.message || "Failed to load family members"));
  }, [selectedFamilyId]);

  const totalUsers = userTotal;
  const activeTrials = users.filter((u) => u.status.isTrial && !u.status.isExpired).length;
  const paidUsers = users.filter((u) => u.status.status === "active").length;
  const expiredUsers = users.filter((u) => u.status.isExpired).length;

  const totalUserPages = Math.max(1, Math.ceil(userTotal / 25));
  const totalAuditPages = Math.max(1, Math.ceil(auditTotal / 50));

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-slate-400">{t("subtitle")}</p>
          </div>
          <Button
            onClick={loadData}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("refresh")}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium text-slate-400">{t("totalUsers")}</h3>
            <div className="mt-2 text-3xl font-bold">{totalUsers}</div>
          </GlassCard>
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium text-slate-400">{t("activeTrials")}</h3>
            <div className="mt-2 text-3xl font-bold text-teal-400">{activeTrials}</div>
          </GlassCard>
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium text-slate-400">{t("paidPlans")}</h3>
            <div className="mt-2 text-3xl font-bold text-blue-400">{paidUsers}</div>
          </GlassCard>
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium text-slate-400">{t("expired")}</h3>
            <div className="mt-2 text-3xl font-bold text-rose-400">{expiredUsers}</div>
          </GlassCard>
        </div>

        {/* Search */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder={t("searchUsers")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setUserPage(1);
              }}
              className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus:border-teal-500"
            />
          </div>
          <Button
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
            onClick={async () => {
              const csv = await exportUsersCSV(searchQuery, userSortField, userSortDir);
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            {t("exportUsersCsv")}
          </Button>
        </div>

        {/* Bulk Actions */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="mb-2 text-sm text-slate-400">
            {t("bulkActionsFor", { count: selectedUserIds.size })}
            {adminRole !== "owner" && (
              <span className="ml-2 text-xs text-amber-300">{t("ownerRoleRequired")}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={bulkRole}
              onChange={(e) => setBulkRole(e.target.value)}
              className="rounded border border-white/10 bg-slate-900 px-2 py-1 text-sm text-white"
              disabled={adminRole !== "owner"}
            >
              <option value="owner">owner</option>
              <option value="admin">admin</option>
              <option value="member">member</option>
              <option value="viewer">viewer</option>
              <option value="child">child</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-slate-300 hover:bg-white/10"
              onClick={async () => {
                const ok = confirm(
                  t("applyRoleConfirm", { role: bulkRole, count: selectedUserIds.size })
                );
                if (!ok) return;
                await bulkUpdateUserRole(Array.from(selectedUserIds), bulkRole);
                const refreshed = await getAdminUsersPage(
                  userPage,
                  25,
                  userSortField,
                  userSortDir,
                  searchQuery
                );
                setUsers(refreshed.users as any);
                setFilteredUsers(refreshed.users as any);
              }}
              disabled={selectedUserIds.size === 0 || adminRole !== "owner"}
            >
              {t("applyRole")}
            </Button>
            <Input
              type="number"
              value={bulkTrialDays}
              onChange={(e) => setBulkTrialDays(Number(e.target.value))}
              className="w-28 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
              disabled={adminRole !== "owner"}
            />
            <Button
              variant="outline"
              size="sm"
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              onClick={async () => {
                const ok = confirm(
                  t("extendTrialConfirm", { days: bulkTrialDays, count: selectedUserIds.size })
                );
                if (!ok) return;
                await bulkExtendTrial(Array.from(selectedUserIds), bulkTrialDays);
                const refreshed = await getAdminUsersPage(
                  userPage,
                  25,
                  userSortField,
                  userSortDir,
                  searchQuery
                );
                setUsers(refreshed.users as any);
                setFilteredUsers(refreshed.users as any);
              }}
              disabled={selectedUserIds.size === 0 || adminRole !== "owner"}
            >
              {t("extendTrial")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
              onClick={async () => {
                const ok = confirm(t("suspendConfirm", { count: selectedUserIds.size }));
                if (!ok) return;
                await bulkSuspendUsers(Array.from(selectedUserIds));
                const refreshed = await getAdminUsersPage(
                  userPage,
                  25,
                  userSortField,
                  userSortDir,
                  searchQuery
                );
                setUsers(refreshed.users as any);
                setFilteredUsers(refreshed.users as any);
              }}
              disabled={selectedUserIds.size === 0 || adminRole !== "owner"}
            >
              {t("suspend")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
              onClick={async () => {
                const ok = confirm(t("reactivateConfirm", { count: selectedUserIds.size }));
                if (!ok) return;
                await bulkReactivateUsers(Array.from(selectedUserIds));
                const refreshed = await getAdminUsersPage(
                  userPage,
                  25,
                  userSortField,
                  userSortDir,
                  searchQuery
                );
                setUsers(refreshed.users as any);
                setFilteredUsers(refreshed.users as any);
              }}
              disabled={selectedUserIds.size === 0 || adminRole !== "owner"}
            >
              {t("reactivate")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-slate-300 hover:bg-white/10"
              onClick={async () => {
                const ok = confirm(t("forceLogoutConfirm", { count: selectedUserIds.size }));
                if (!ok) return;
                await bulkForceLogout(Array.from(selectedUserIds));
              }}
              disabled={selectedUserIds.size === 0 || adminRole !== "owner"}
            >
              {t("forceLogout")}
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-rose-400">
            <ShieldAlert className="mb-2 h-5 w-5" />
            {error}
            {error.includes("SUPABASE_SERVICE_ROLE_KEY") && (
              <p className="mt-2 text-sm text-slate-400">{t("envCheckMessage")}</p>
            )}
            {error.includes("Unauthorized") && <SessionRefreshHelper />}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-white/5">
                <TableHead className="text-slate-300">
                  <input
                    type="checkbox"
                    aria-label={t("selectAllUsers")}
                    checked={
                      filteredUsers.length > 0 &&
                      filteredUsers.every((u) => selectedUserIds.has(u.id))
                    }
                    onChange={(e) => {
                      const next = new Set(selectedUserIds);
                      if (e.target.checked) {
                        filteredUsers.forEach((u) => next.add(u.id));
                      } else {
                        filteredUsers.forEach((u) => next.delete(u.id));
                      }
                      setSelectedUserIds(next);
                    }}
                  />
                </TableHead>
                <TableHead className="text-slate-300">
                  <button
                    className="underline"
                    onClick={() => {
                      setUserSortField("email");
                      setUserSortDir(userSortDir === "asc" ? "desc" : "asc");
                    }}
                  >
                    {t("userColumn")}
                  </button>
                </TableHead>
                <TableHead className="text-slate-300">
                  <button
                    className="underline"
                    onClick={() => {
                      setUserSortField("created_at");
                      setUserSortDir(userSortDir === "asc" ? "desc" : "asc");
                    }}
                  >
                    {t("joinedColumn")}
                  </button>
                </TableHead>
                <TableHead className="text-slate-300">{t("statusColumn")}</TableHead>
                <TableHead className="text-slate-300">{t("trialStatusColumn")}</TableHead>
                <TableHead className="text-slate-300">
                  <button
                    className="underline"
                    onClick={() => {
                      setUserSortField("last_login");
                      setUserSortDir(userSortDir === "asc" ? "desc" : "asc");
                    }}
                  >
                    {t("lastLoginColumn")}
                  </button>
                </TableHead>
                <TableHead className="text-slate-300">{t("actionsColumn")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                    {t("noUsersFound")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-white/5 hover:bg-white/5">
                    <TableCell>
                      <input
                        type="checkbox"
                        aria-label={`Select ${user.email}`}
                        checked={selectedUserIds.has(user.id)}
                        onChange={(e) => {
                          const next = new Set(selectedUserIds);
                          if (e.target.checked) {
                            next.add(user.id);
                          } else {
                            next.delete(user.id);
                          }
                          setSelectedUserIds(next);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{user.name || t("unknown")}</div>
                        <div className="text-sm text-slate-400">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString(locale) : "-"}
                    </TableCell>
                    <TableCell>
                      {user.status.status === "active" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                          {t("paid")}
                        </span>
                      ) : user.status.status === "expired" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-medium text-rose-400">
                          {t("expired")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/20 px-2.5 py-0.5 text-xs font-medium text-teal-400">
                          {t("trial")}
                        </span>
                      )}
                      {user.is_suspended && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-medium text-rose-400">
                          {t("suspended")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.status.isTrial && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span
                            className={
                              user.status.daysRemaining < 3 ? "text-amber-400" : "text-slate-300"
                            }
                          >
                            {t("daysLeft", { days: user.status.daysRemaining })}
                          </span>
                        </div>
                      )}
                      {!user.status.isTrial && user.status.isExpired && (
                        <span className="text-slate-500">{t("trialEnded")}</span>
                      )}
                      {user.status.status === "active" && (
                        <span className="text-blue-400">{t("lifetimeAccess")}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString(locale)
                        : t("never")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={user.role ?? "member"}
                          onChange={async (e) => {
                            const nextRole = e.target.value;
                            const ok = confirm(
                              t("changeRoleConfirm", { email: user.email, role: nextRole })
                            );
                            if (!ok) return;
                            await updateUserRole(user.id, nextRole);
                            const refreshed = await getAdminUsersPage(
                              userPage,
                              25,
                              userSortField,
                              userSortDir,
                              searchQuery
                            );
                            setUsers(refreshed.users as any);
                            setFilteredUsers(refreshed.users as any);
                          }}
                          className="rounded border border-white/10 bg-slate-900 px-2 py-1 text-xs text-white"
                          disabled={adminRole !== "owner"}
                        >
                          <option value="owner">owner</option>
                          <option value="admin">admin</option>
                          <option value="member">member</option>
                          <option value="viewer">viewer</option>
                          <option value="child">child</option>
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                          onClick={async () => {
                            const ok = confirm(t("extendTrialSingle", { email: user.email }));
                            if (!ok) return;
                            await extendUserTrial(user.id, 7);
                            const refreshed = await getAdminUsersPage(
                              userPage,
                              25,
                              userSortField,
                              userSortDir,
                              searchQuery
                            );
                            setUsers(refreshed.users as any);
                            setFilteredUsers(refreshed.users as any);
                          }}
                          disabled={adminRole !== "owner"}
                        >
                          {t("plus7dTrial")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/10 text-slate-300 hover:bg-white/10"
                          onClick={async () => {
                            const ok = confirm(t("forceLogoutSingle", { email: user.email }));
                            if (!ok) return;
                            await forceLogoutUser(user.id);
                          }}
                          disabled={adminRole !== "owner"}
                        >
                          {t("forceLogout")}
                        </Button>
                        {user.is_suspended ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                            onClick={async () => {
                              const ok = confirm(t("reactivateSingle", { email: user.email }));
                              if (!ok) return;
                              await reactivateUser(user.id);
                              const refreshed = await getAdminUsersPage(
                                userPage,
                                25,
                                userSortField,
                                userSortDir,
                                searchQuery
                              );
                              setUsers(refreshed.users as any);
                              setFilteredUsers(refreshed.users as any);
                            }}
                            disabled={adminRole !== "owner"}
                          >
                            {t("reactivate")}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                            onClick={async () => {
                              const ok = confirm(t("suspendSingle", { email: user.email }));
                              if (!ok) return;
                              await suspendUser(user.id);
                              const refreshed = await getAdminUsersPage(
                                userPage,
                                25,
                                userSortField,
                                userSortDir,
                                searchQuery
                              );
                              setUsers(refreshed.users as any);
                              setFilteredUsers(refreshed.users as any);
                            }}
                            disabled={adminRole !== "owner"}
                          >
                            {t("suspend")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {t("pageOf", { page: userPage, total: totalUserPages })}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-white hover:bg-white/5"
              onClick={() => setUserPage((p) => Math.max(1, p - 1))}
              disabled={userPage <= 1}
            >
              {t("prev")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-white hover:bg-white/5"
              onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
              disabled={userPage >= totalUserPages}
            >
              {t("next")}
            </Button>
          </div>
        </div>

        {/* Family Groups */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{t("familyGroups")}</h2>
              <p className="text-sm text-slate-400">{t("manageGroupMembership")}</p>
            </div>
            <div className="text-sm text-slate-400">
              {t("groupCount", { count: familyGroups.length })}
              {adminRole !== "owner" && (
                <span className="ml-2 text-xs text-amber-300">{t("ownerRoleRequiredToEdit")}</span>
              )}
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input
              placeholder={t("newGroupName")}
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
              disabled={adminRole !== "owner"}
            />
            <Input
              placeholder={t("ownerUserId")}
              value={newGroupOwnerId}
              onChange={(e) => setNewGroupOwnerId(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
              disabled={adminRole !== "owner"}
            />
            <Button
              onClick={async () => {
                if (!newGroupName || !newGroupOwnerId) return;
                await createFamilyGroup(newGroupName, newGroupOwnerId);
                setNewGroupName("");
                setNewGroupOwnerId("");
                const refreshed = await getFamilyGroups();
                setFamilyGroups(refreshed as any);
              }}
              className="bg-teal-600 text-white hover:bg-teal-700"
              disabled={adminRole !== "owner"}
            >
              {t("createGroup")}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-white/5">
                    <TableHead className="text-slate-300">{t("groupColumn")}</TableHead>
                    <TableHead className="text-slate-300">{t("ownerColumn")}</TableHead>
                    <TableHead className="text-slate-300">{t("membersColumn")}</TableHead>
                    <TableHead className="text-slate-300">{t("actionsColumn")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {familyGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-20 text-center text-slate-500">
                        {t("noFamilyGroups")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    familyGroups.map((group) => (
                      <TableRow
                        key={group.id}
                        className="border-white/5 hover:bg-white/5"
                        onClick={() => setSelectedFamilyId(group.id)}
                      >
                        <TableCell className="text-white">
                          <div className="font-medium">{group.name}</div>
                          <div className="text-xs text-slate-500">{group.invite_code || ""}</div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {group.owner_id.slice(0, 8)}…
                        </TableCell>
                        <TableCell className="text-slate-300">{group.memberCount}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/10 text-slate-300 hover:bg-white/10"
                              onClick={async () => {
                                const nextName = prompt(t("renameGroup"), group.name);
                                if (!nextName) return;
                                await renameFamilyGroup(group.id, nextName);
                                const refreshed = await getFamilyGroups();
                                setFamilyGroups(refreshed as any);
                              }}
                              disabled={adminRole !== "owner"}
                            >
                              {t("rename")}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                              onClick={async () => {
                                const ok = confirm(t("deleteGroupConfirm", { name: group.name }));
                                if (!ok) return;
                                await deleteFamilyGroup(group.id);
                                if (selectedFamilyId === group.id) {
                                  setSelectedFamilyId("");
                                  setFamilyMembers([]);
                                }
                                const refreshed = await getFamilyGroups();
                                setFamilyGroups(refreshed as any);
                              }}
                              disabled={adminRole !== "owner"}
                            >
                              {t("delete")}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-3 text-sm text-slate-400">
                {selectedFamilyId
                  ? t("membersFor", { id: selectedFamilyId.slice(0, 8) })
                  : t("selectGroupToView")}
              </div>
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-white/5">
                    <TableHead className="text-slate-300">{t("memberColumn")}</TableHead>
                    <TableHead className="text-slate-300">{t("roleColumn")}</TableHead>
                    <TableHead className="text-slate-300">{t("actionsColumn")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {familyMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-20 text-center text-slate-500">
                        {selectedFamilyId ? t("noMembers") : t("noGroupSelected")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    familyMembers.map((member) => (
                      <TableRow key={member.id} className="border-white/5 hover:bg-white/5">
                        <TableCell>
                          <div className="text-white">
                            {member.user?.name || member.user?.email || member.user_id}
                          </div>
                          <div className="text-xs text-slate-500">{member.user?.email}</div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <select
                            value={member.role}
                            onChange={async (e) => {
                              const nextRole = e.target.value;
                              const ok = confirm(
                                t("changeMemberRole", {
                                  email: member.user?.email ?? member.user_id,
                                  role: nextRole,
                                })
                              );
                              if (!ok) return;
                              await updateFamilyMemberRole(member.id, nextRole);
                              const updated = await getFamilyMembers(member.family_id);
                              setFamilyMembers(updated as any);
                            }}
                            className="rounded border border-white/10 bg-slate-900 px-2 py-1 text-sm text-white"
                            disabled={adminRole !== "owner"}
                          >
                            <option value="owner">owner</option>
                            <option value="admin">admin</option>
                            <option value="member">member</option>
                            <option value="viewer">viewer</option>
                            <option value="child">child</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                            onClick={async () => {
                              const ok = confirm(
                                t("removeMember", { email: member.user?.email ?? member.user_id })
                              );
                              if (!ok) return;
                              await removeFamilyMember(member.id);
                              const updated = await getFamilyMembers(member.family_id);
                              setFamilyMembers(updated as any);
                            }}
                            disabled={adminRole !== "owner"}
                          >
                            {t("remove")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Audit Log */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{t("auditLog")}</h2>
              <p className="text-sm text-slate-400">{t("recentAdminActions")}</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span>{t("entries", { count: auditLogs.length })}</span>
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-white hover:bg-white/5"
                onClick={async () => {
                  const csv = await exportAuditLog(auditQuery, auditStartDate, auditEndDate, "csv");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                {t("exportCsv")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-white hover:bg-white/5"
                onClick={async () => {
                  const json = await exportAuditLog(
                    auditQuery,
                    auditStartDate,
                    auditEndDate,
                    "json"
                  );
                  const blob = new Blob([json], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `audit-log-${new Date().toISOString().slice(0, 10)}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                {t("exportJson")}
              </Button>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-3">
            <Input
              placeholder={t("filterByAction")}
              value={auditQuery}
              onChange={(e) => {
                setAuditQuery(e.target.value);
                setAuditPage(1);
              }}
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            />
            <Input
              type="date"
              value={auditStartDate}
              onChange={(e) => {
                setAuditStartDate(e.target.value);
                setAuditPage(1);
              }}
              className="w-44 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            />
            <Input
              type="date"
              value={auditEndDate}
              onChange={(e) => {
                setAuditEndDate(e.target.value);
                setAuditPage(1);
              }}
              className="w-44 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            />
            <Button
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
              onClick={async () => {
                const logs = await getAuditLogPage(1, 50, auditQuery, auditStartDate, auditEndDate);
                setAuditLogs(logs.logs as any);
                setAuditPage(1);
                setAuditTotal(logs.total);
              }}
            >
              {t("filter")}
            </Button>
          </div>
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-white/5">
                <TableHead className="text-slate-300">{t("whenColumn")}</TableHead>
                <TableHead className="text-slate-300">{t("actorColumn")}</TableHead>
                <TableHead className="text-slate-300">{t("actionColumn")}</TableHead>
                <TableHead className="text-slate-300">{t("targetColumn")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center text-slate-500">
                    {t("noAuditEntries")}
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.map((log) => (
                  <TableRow key={log.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="text-slate-300">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {log.actor?.email || log.actor_id || "-"}
                    </TableCell>
                    <TableCell className="text-white">{log.action}</TableCell>
                    <TableCell className="text-slate-300">
                      {log.target?.email || log.target_user_id || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              {t("pageOf", { page: auditPage, total: totalAuditPages })}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-white hover:bg-white/5"
                onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                disabled={auditPage <= 1}
              >
                {t("prev")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-white hover:bg-white/5"
                onClick={() => setAuditPage((p) => Math.min(totalAuditPages, p + 1))}
                disabled={auditPage >= totalAuditPages}
              >
                {t("next")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
