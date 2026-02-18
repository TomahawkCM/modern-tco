"use client";

/**
 * SimpleFIN Status Indicators
 *
 * Components for showing SimpleFIN connection and sync status:
 * - SimpleFINStatusBadge - Compact status indicator
 * - SimpleFINSyncProgress - Detailed sync progress
 * - SimpleFINAccountList - List of connected accounts
 */

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
  Building2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import type { ConnectionStatus, SyncProgress, LinkedAccount, SyncResult } from "@/lib/simplefin";

// =============================================================================
// STATUS BADGE
// =============================================================================

interface StatusConfigEntry {
  icon: React.ReactNode;
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  color: string;
}

function getStatusConfig(t: (key: string) => string): Record<ConnectionStatus, StatusConfigEntry> {
  return {
    disconnected: {
      icon: <WifiOff className="h-3 w-3" />,
      label: t("disconnected"),
      variant: "secondary",
      color: "text-muted-foreground",
    },
    connecting: {
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      label: t("connecting"),
      variant: "outline",
      color: "text-blue-500",
    },
    connected: {
      icon: <Wifi className="h-3 w-3" />,
      label: t("connected"),
      variant: "default",
      color: "text-green-500",
    },
    syncing: {
      icon: <RefreshCw className="h-3 w-3 animate-spin" />,
      label: t("syncing"),
      variant: "outline",
      color: "text-blue-500",
    },
    error: {
      icon: <AlertCircle className="h-3 w-3" />,
      label: t("error"),
      variant: "destructive",
      color: "text-red-500",
    },
    expired: {
      icon: <AlertTriangle className="h-3 w-3" />,
      label: t("expired"),
      variant: "destructive",
      color: "text-yellow-500",
    },
  };
}

interface SimpleFINStatusBadgeProps {
  status: ConnectionStatus;
  lastSync?: Date | null;
  onClick?: () => void;
}

export function SimpleFINStatusBadge({ status, lastSync, onClick }: SimpleFINStatusBadgeProps) {
  const t = useTranslations("simplefinStatus");
  const config = getStatusConfig(t)[status];

  const formatLastSync = (date: Date | null | undefined) => {
    if (!date) return t("neverSynced");
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return t("syncedJustNow");
    if (hours < 24) return t("syncedHoursAgo", { hours });
    if (days === 1) return t("syncedYesterday");
    return t("syncedDaysAgo", { days });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={config.variant}
            className={`cursor-pointer gap-1.5 ${config.color}`}
            onClick={onClick}
          >
            {config.icon}
            <span>{config.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{t("statusLabel", { status: config.label })}</p>
          {lastSync && <p className="text-xs text-muted-foreground">{formatLastSync(lastSync)}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// =============================================================================
// SYNC PROGRESS
// =============================================================================

interface SimpleFINSyncProgressProps {
  progress: SyncProgress | null;
  onCancel?: () => void;
}

export function SimpleFINSyncProgress({ progress, onCancel }: SimpleFINSyncProgressProps) {
  const t = useTranslations("simplefinStatus");

  if (!progress) return null;

  const isComplete = progress.stage === "complete";
  const isError = progress.stage === "error";

  const progressPercent =
    progress.totalAccounts > 0 ? (progress.accountIndex / progress.totalAccounts) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : isError ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : (
              <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            )}
            <span>
              {isComplete ? t("syncComplete") : isError ? t("syncFailed") : t("syncing")}
            </span>
          </div>
          {!isComplete && !isError && onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              {t("cancel")}
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{progress.message}</span>
            {progress.totalAccounts > 0 && (
              <span className="text-muted-foreground">
                {progress.accountIndex}/{progress.totalAccounts}
              </span>
            )}
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {progress.currentAccount && (
          <div className="text-sm text-muted-foreground">
            {t("processing", { account: progress.currentAccount })}
            {progress.transactionsProcessed > 0 && (
              <span> {t("transactionsCount", { count: progress.transactionsProcessed })}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// SYNC RESULT SUMMARY
// =============================================================================

interface SimpleFINSyncResultProps {
  result: SyncResult;
  onDismiss?: () => void;
}

export function SimpleFINSyncResult({ result, onDismiss }: SimpleFINSyncResultProps) {
  const t = useTranslations("simplefinStatus");

  return (
    <Card className={`w-full ${result.success ? "border-green-500/50" : "border-red-500/50"}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span>
              {result.success ? t("syncSuccessful") : t("syncCompletedWithErrors")}
            </span>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              {t("dismiss")}
            </Button>
          )}
        </CardTitle>
        <CardDescription>{result.syncedAt.toLocaleString()}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{result.totalTransactionsImported}</p>
            <p className="text-xs text-muted-foreground">{t("imported")}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-2xl font-bold text-muted-foreground">
              {result.totalTransactionsSkipped}
            </p>
            <p className="text-xs text-muted-foreground">{t("skippedDuplicates")}</p>
          </div>
        </div>

        {/* Account results */}
        <div className="space-y-2">
          {result.accounts.map((account) => (
            <div
              key={account.accountId}
              className="flex items-center justify-between rounded bg-muted/30 p-2 text-sm"
            >
              <div className="flex items-center gap-2">
                {account.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>{account.accountName}</span>
              </div>
              <span className="text-muted-foreground">+{account.transactionsImported}</span>
            </div>
          ))}
        </div>

        {/* Errors */}
        {result.errors.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-500">{t("errorsLabel")}</p>
            {result.errors.map((error, i) => (
              <p key={i} className="ps-2 text-xs text-red-500/80">
                • {error}
              </p>
            ))}
          </div>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-yellow-500">{t("warningsLabel")}</p>
            {result.warnings.map((warning, i) => (
              <p key={i} className="ps-2 text-xs text-yellow-500/80">
                • {warning}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// ACCOUNT LIST
// =============================================================================

interface SimpleFINAccountListProps {
  accounts: LinkedAccount[];
  onSync?: (accountId: string) => void;
  onUnlink?: (accountId: string) => void;
  onToggleImport?: (accountId: string, enabled: boolean) => void;
}

export function SimpleFINAccountList({
  accounts,
  onSync,
  onUnlink,
  onToggleImport,
}: SimpleFINAccountListProps) {
  const t = useTranslations("simplefinStatus");

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">{t("noBankAccounts")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {accounts.map((account) => (
        <Card key={account.simplefinAccountId}>
          <CardContent className="py-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{account.simplefinAccountName}</h4>
                <p className="text-sm text-muted-foreground">{account.institutionName}</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {account.currency}{" "}
                    {account.lastBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-muted-foreground">
                    {t("asOf", { date: account.lastBalanceDate.toLocaleDateString() })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {account.importEnabled ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {t("active")}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {t("paused")}
                  </Badge>
                )}
              </div>
            </div>

            {(onSync || onUnlink || onToggleImport) && (
              <div className="mt-4 flex gap-2 border-t pt-4">
                {onSync && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSync(account.simplefinAccountId)}
                  >
                    <RefreshCw className="me-1 h-3 w-3" />
                    {t("sync")}
                  </Button>
                )}
                {onToggleImport && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onToggleImport(account.simplefinAccountId, !account.importEnabled)
                    }
                  >
                    {account.importEnabled ? t("pause") : t("resume")}
                  </Button>
                )}
                {onUnlink && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onUnlink(account.simplefinAccountId)}
                  >
                    {t("unlink")}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// =============================================================================
// COMPACT SYNC INDICATOR
// =============================================================================

interface SimpleFINSyncIndicatorProps {
  isSyncing: boolean;
  lastSync?: Date | null;
  onSyncClick?: () => void;
}

export function SimpleFINSyncIndicator({
  isSyncing,
  lastSync,
  onSyncClick,
}: SimpleFINSyncIndicatorProps) {
  const t = useTranslations("simplefinStatus");
  const locale = useLocale();
  const [showTooltip, setShowTooltip] = useState(false);

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return t("justNow");
    if (minutes < 60) return t("minutesAgo", { minutes });
    if (hours < 24) return t("hoursAgo", { hours });

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const days = Math.floor(hours / 24);
    return rtf.format(-days, "day");
  };

  return (
    <TooltipProvider>
      <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={onSyncClick}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isSyncing ? t("syncing") : t("sync")}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {lastSync ? (
            <p>{t("lastSynced", { time: formatRelativeTime(lastSync) })}</p>
          ) : (
            <p>{t("neverSynced")}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default SimpleFINStatusBadge;
