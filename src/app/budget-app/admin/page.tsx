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
import { useAuth } from "@/contexts/AuthContext";
import { Clock, LogOut, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getAdminUsers,
  getAuditLog,
  createFamilyGroup,
  deleteFamilyGroup,
  extendUserTrial,
  forceLogoutUser,
  getAuditLog,
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
const isOfflineMode = process.env.NEXT_PUBLIC_OFFLINE_MODE === "true";

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
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleClearAndSignIn = async () => {
    setIsSigningOut(true);
    try {
      // Sign out to clear session
      await signOut();
      // Clear any remaining localStorage auth data
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-") || key.includes("supabase")) {
          localStorage.removeItem(key);
        }
      });
      // Redirect to login
      window.location.href = "/budget-app/auth/login";
    } catch (err) {
      console.error("Sign out failed:", err);
      setIsSigningOut(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <p className="text-sm text-slate-400">
        Your session needs to be refreshed. Please sign out and sign back in to establish a new
        session.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
        onClick={handleClearAndSignIn}
        disabled={isSigningOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {isSigningOut ? "Signing out..." : "Sign Out & Refresh Session"}
      </Button>
    </div>
  );
}

export default function AdminDashboardPage() {
  // Admin dashboard is cloud-only, not available in offline mode
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
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditQuery, setAuditQuery] = useState("");
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("");
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupOwnerId, setNewGroupOwnerId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, auditData, groupData] = await Promise.all([
        getAdminUsers(),
        getAuditLog(50, ""),
        getFamilyGroups(),
      ]);
      setUsers(usersData as any);
      setFilteredUsers(usersData as any);
      setAuditLogs(auditData as any);
      setFamilyGroups(groupData as any);
    } catch (err: any) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    const filtered = users.filter(
      (u) =>
        u.email?.toLowerCase().includes(lower) ||
        u.name?.toLowerCase().includes(lower) ||
        u.id.toLowerCase().includes(lower)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  useEffect(() => {
    if (!selectedFamilyId) {
      setFamilyMembers([]);
      return;
    }
    getFamilyMembers(selectedFamilyId)
      .then((members) => setFamilyMembers(members as any))
      .catch((err) => setError(err.message || "Failed to load family members"));
  }, [selectedFamilyId]);

  // Stats
  const totalUsers = users.length;
  const activeTrials = users.filter((u) => u.status.isTrial && !u.status.isExpired).length;
  const paidUsers = users.filter((u) => u.status.status === "active").length;
  const expiredUsers = users.filter((u) => u.status.isExpired).length;

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-400">Manage users and subscriptions</p>
          </div>
          <Button
            onClick={loadData}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium text-slate-400">Total Users</h3>
            <div className="mt-2 text-3xl font-bold">{totalUsers}</div>
          </GlassCard>
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium text-slate-400">Active Trials</h3>
            <div className="mt-2 text-3xl font-bold text-teal-400">{activeTrials}</div>
          </GlassCard>
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium text-slate-400">Paid Plans</h3>
            <div className="mt-2 text-3xl font-bold text-blue-400">{paidUsers}</div>
          </GlassCard>
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium text-slate-400">Expired</h3>
            <div className="mt-2 text-3xl font-bold text-rose-400">{expiredUsers}</div>
          </GlassCard>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-rose-400">
            <ShieldAlert className="mb-2 h-5 w-5" />
            {error}
            {error.includes("SUPABASE_SERVICE_ROLE_KEY") && (
              <p className="mt-2 text-sm text-slate-400">
                Check your .env.local file to ensure the service role key is set.
              </p>
            )}
            {error.includes("Unauthorized") && <SessionRefreshHelper />}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-white/5">
                <TableHead className="text-slate-300">User</TableHead>
                <TableHead className="text-slate-300">Joined</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Trial Status</TableHead>
                <TableHead className="text-slate-300">Last Login</TableHead>
                <TableHead className="text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-white/5 hover:bg-white/5">
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{user.name || "Unknown"}</div>
                        <div className="text-sm text-slate-400">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      {user.status.status === "active" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                          Paid
                        </span>
                      ) : user.status.status === "expired" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-medium text-rose-400">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/20 px-2.5 py-0.5 text-xs font-medium text-teal-400">
                          Trial
                        </span>
                      )}
                      {user.is_suspended && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-medium text-rose-400">
                          Suspended
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
                            {user.status.daysRemaining} days left
                          </span>
                        </div>
                      )}
                      {!user.status.isTrial && user.status.isExpired && (
                        <span className="text-slate-500">Trial ended</span>
                      )}
                      {user.status.status === "active" && (
                        <span className="text-blue-400">Lifetime Access</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={user.role ?? "member"}
                          onChange={async (e) => {
                            await updateUserRole(user.id, e.target.value);
                            const refreshed = await getAdminUsers();
                            setUsers(refreshed as any);
                            setFilteredUsers(refreshed as any);
                          }}
                          className="rounded border border-white/10 bg-slate-900 px-2 py-1 text-xs text-white"
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
                            await extendUserTrial(user.id, 7);
                            const refreshed = await getAdminUsers();
                            setUsers(refreshed as any);
                            setFilteredUsers(refreshed as any);
                          }}
                        >
                          +7d Trial
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/10 text-slate-300 hover:bg-white/10"
                          onClick={async () => {
                            await forceLogoutUser(user.id);
                          }}
                        >
                          Force Logout
                        </Button>
                        {user.is_suspended ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                            onClick={async () => {
                              await reactivateUser(user.id);
                              const refreshed = await getAdminUsers();
                              setUsers(refreshed as any);
                              setFilteredUsers(refreshed as any);
                            }}
                          >
                            Reactivate
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                            onClick={async () => {
                              await suspendUser(user.id);
                              const refreshed = await getAdminUsers();
                              setUsers(refreshed as any);
                              setFilteredUsers(refreshed as any);
                            }}
                          >
                            Suspend
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

        {/* Family Groups */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Family Groups</h2>
              <p className="text-sm text-slate-400">Manage group membership and roles</p>
            </div>
            <div className="text-sm text-slate-400">{familyGroups.length} groups</div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input
              placeholder="New group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            />
            <Input
              placeholder="Owner user id"
              value={newGroupOwnerId}
              onChange={(e) => setNewGroupOwnerId(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
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
            >
              Create Group
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-white/5">
                    <TableHead className="text-slate-300">Group</TableHead>
                    <TableHead className="text-slate-300">Owner</TableHead>
                    <TableHead className="text-slate-300">Members</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {familyGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-20 text-center text-slate-500">
                        No family groups found.
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
                                const nextName = prompt("Rename group", group.name);
                                if (!nextName) return;
                                await renameFamilyGroup(group.id, nextName);
                                const refreshed = await getFamilyGroups();
                                setFamilyGroups(refreshed as any);
                              }}
                            >
                              Rename
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                              onClick={async () => {
                                const ok = confirm("Delete this group?");
                                if (!ok) return;
                                await deleteFamilyGroup(group.id);
                                if (selectedFamilyId === group.id) {
                                  setSelectedFamilyId("");
                                  setFamilyMembers([]);
                                }
                                const refreshed = await getFamilyGroups();
                                setFamilyGroups(refreshed as any);
                              }}
                            >
                              Delete
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
                  ? `Members for ${selectedFamilyId.slice(0, 8)}…`
                  : "Select a group to view members"}
              </div>
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-white/5">
                    <TableHead className="text-slate-300">Member</TableHead>
                    <TableHead className="text-slate-300">Role</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {familyMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-20 text-center text-slate-500">
                        {selectedFamilyId ? "No members found." : "No group selected."}
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
                              await updateFamilyMemberRole(member.id, e.target.value);
                              const updated = await getFamilyMembers(member.family_id);
                              setFamilyMembers(updated as any);
                            }}
                            className="rounded border border-white/10 bg-slate-900 px-2 py-1 text-sm text-white"
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
                              await removeFamilyMember(member.id);
                              const updated = await getFamilyMembers(member.family_id);
                              setFamilyMembers(updated as any);
                            }}
                          >
                            Remove
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
              <h2 className="text-xl font-semibold">Audit Log</h2>
              <p className="text-sm text-slate-400">Recent admin actions</p>
            </div>
            <div className="text-sm text-slate-400">{auditLogs.length} entries</div>
          </div>
          <div className="mb-4 flex gap-3">
            <Input
              placeholder="Filter by action or metadata"
              value={auditQuery}
              onChange={(e) => setAuditQuery(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            />
            <Button
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
              onClick={async () => {
                const logs = await getAuditLog(50, auditQuery);
                setAuditLogs(logs as any);
              }}
            >
              Filter
            </Button>
          </div>
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-white/5">
                <TableHead className="text-slate-300">When</TableHead>
                <TableHead className="text-slate-300">Actor</TableHead>
                <TableHead className="text-slate-300">Action</TableHead>
                <TableHead className="text-slate-300">Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center text-slate-500">
                    No audit entries yet.
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
        </div>
      </div>
    </div>
  );
}
