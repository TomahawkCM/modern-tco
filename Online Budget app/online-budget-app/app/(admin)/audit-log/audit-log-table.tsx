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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeftIcon, ChevronRightIcon, FilterIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { AuditLogEntry } from "@/server/admin";

function ActionBadge({ action }: { action: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    login_success: "default",
    login_failure: "destructive",
    signup: "secondary",
    admin_action: "outline",
  };
  return <Badge variant={variants[action] ?? "outline"}>{action}</Badge>;
}

interface Props {
  entries: AuditLogEntry[];
  total: number;
  currentPage: number;
  pageSize: number;
  currentAction: string;
  currentFrom: string;
  currentTo: string;
}

export function AuditLogTable({
  entries,
  total,
  currentPage,
  pageSize,
  currentAction,
  currentFrom,
  currentTo,
}: Props) {
  const router = useRouter();
  const t = useTranslations("admin.auditLog");
  const locale = useLocale();
  const [action, setAction] = useState(currentAction);
  const [from, setFrom] = useState(currentFrom);
  const [to, setTo] = useState(currentTo);

  const totalPages = Math.ceil(total / pageSize);

  const ACTION_OPTIONS = [
    { value: "", label: t("filters.allActions") },
    { value: "login_success", label: t("actions.loginSuccess") },
    { value: "login_failure", label: t("actions.loginFailure") },
    { value: "signup", label: t("actions.signup") },
    { value: "logout", label: t("actions.logout") },
    { value: "password_reset_request", label: t("actions.passwordResetRequest") },
    { value: "password_reset_complete", label: t("actions.passwordResetComplete") },
    { value: "email_verification_resend", label: t("actions.emailVerificationResend") },
    { value: "email_verified", label: t("actions.emailVerified") },
    { value: "session_revoked_all", label: t("actions.sessionRevokedAll") },
    { value: "admin_action", label: t("actions.adminAction") },
  ];

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (action) params.set("action", action);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`/admin/audit-log?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.push(`/admin/audit-log?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t("filters.action")}</label>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("filters.allActions")} />
            </SelectTrigger>
            <SelectContent>
              {ACTION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value || "__all__"}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t("filters.from")}</label>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-[160px]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t("filters.to")}</label>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-[160px]"
          />
        </div>
        <Button variant="outline" onClick={applyFilters}>
          <FilterIcon className="mr-2 h-4 w-4" />
          {t("filters.filter")}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.time")}</TableHead>
              <TableHead>{t("columns.action")}</TableHead>
              <TableHead>{t("columns.user")}</TableHead>
              <TableHead>{t("columns.ipAddress")}</TableHead>
              <TableHead>{t("columns.details")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {t("noEntries")}
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(entry.created_at).toLocaleString(locale)}
                  </TableCell>
                  <TableCell>
                    <ActionBadge action={entry.action} />
                  </TableCell>
                  <TableCell className="text-sm">
                    {entry.user_email ?? entry.user_id ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {entry.ip_address ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                    {Object.keys(entry.metadata).length > 0 ? JSON.stringify(entry.metadata) : "—"}
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
