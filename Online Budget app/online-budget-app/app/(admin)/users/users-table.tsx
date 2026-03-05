"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BanIcon,
  ClockIcon,
  ShieldIcon,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { AdminUser } from "@/server/admin";

interface Props {
  users: AdminUser[];
  total: number;
  currentPage: number;
  pageSize: number;
  currentSearch: string;
  adminUserId: string;
}

function StatusBadge({ status, noSubLabel }: { status: string | null; noSubLabel: string }) {
  if (!status) return <Badge variant="outline">{noSubLabel}</Badge>;
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    trialing: "secondary",
    past_due: "destructive",
    canceled: "outline",
  };
  return <Badge variant={variants[status] ?? "outline"}>{status}</Badge>;
}

function RoleBadge({ role }: { role: string }) {
  if (role === "owner") return <Badge className="bg-amber-500">owner</Badge>;
  if (role === "admin") return <Badge className="bg-blue-500">admin</Badge>;
  return <Badge variant="outline">{role}</Badge>;
}

export function AdminUsersTable({
  users,
  total,
  currentPage,
  pageSize,
  currentSearch,
  adminUserId,
}: Props) {
  const router = useRouter();
  const t = useTranslations("admin.users");
  const locale = useLocale();
  const [search, setSearch] = useState(currentSearch);
  const [acting, setActing] = useState<string | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    router.push(`/admin/users?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.push(`/admin/users?${params.toString()}`);
  };

  const performAction = async (
    action: string,
    targetUserId: string,
    extra?: Record<string, string>
  ) => {
    setActing(targetUserId);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, targetUserId, ...extra }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">
          {t("search")}
        </Button>
      </form>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.email")}</TableHead>
              <TableHead>{t("columns.role")}</TableHead>
              <TableHead>{t("columns.status")}</TableHead>
              <TableHead>{t("columns.trialEnds")}</TableHead>
              <TableHead>{t("columns.joined")}</TableHead>
              <TableHead className="text-right">{t("columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {t("noUsers")}
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={u.role} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={u.subscription_status} noSubLabel={t("noSub")} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.trial_end ? new Date(u.trial_end).toLocaleDateString(locale) : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString(locale)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {u.id !== adminUserId && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={t("extendTrial")}
                            disabled={acting === u.id}
                            onClick={() => performAction("extend_trial", u.id, { days: "14" })}
                          >
                            <ClockIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={t("toggleSuspend")}
                            disabled={acting === u.id}
                            onClick={() =>
                              performAction(
                                u.subscription_status === "canceled" ? "unsuspend" : "suspend",
                                u.id
                              )
                            }
                          >
                            <BanIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={t("toggleAdmin")}
                            disabled={acting === u.id}
                            onClick={() =>
                              performAction("change_role", u.id, {
                                role: u.role === "admin" ? "member" : "admin",
                              })
                            }
                          >
                            <ShieldIcon className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t("totalCount", { count: total })}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {t("pageOf", { current: currentPage, total: totalPages || 1 })}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
