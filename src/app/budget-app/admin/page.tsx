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
import { useEffect, useState } from "react";
import { getAdminUsers } from "./actions";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  created_at: string | null;
  last_login: string | null;
  status: {
    isActive: boolean;
    isTrial: boolean;
    daysRemaining: number;
    isExpired: boolean;
    status: string | null;
  };
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
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
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
        Your session needs to be refreshed. Please sign out and sign back in to establish a new session.
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
  return (
    <AdminGuard loginUrl="/budget-app/auth/login">
      <AdminDashboardContent />
    </AdminGuard>
  );
}

function AdminDashboardContent() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers();
      setUsers(data as any); // Type assertion for simplicity
      setFilteredUsers(data as any);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
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
            {error.includes("Unauthorized") && (
              <SessionRefreshHelper />
            )}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
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
