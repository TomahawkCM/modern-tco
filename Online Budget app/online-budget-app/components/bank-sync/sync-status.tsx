"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCwIcon,
  Loader2Icon,
  CheckCircle2Icon,
  AlertCircleIcon,
  ClockIcon,
} from "lucide-react";

interface SyncStatusProps {
  /** The connected bank record ID. */
  connectedBankId: string;
  /** Provider name (e.g., "plaid"). */
  provider: string;
  /** Current status: "active" | "inactive" | "error". */
  status: string;
  /** ISO timestamp of last sync, or null if never synced. */
  lastSyncedAt: string | null;
  /** Called after a successful sync. */
  onSyncComplete?: (result: SyncResultSummary) => void;
}

interface SyncResultSummary {
  added: number;
  modified: number;
  removed: number;
}

export function SyncStatus({
  connectedBankId,
  provider,
  status,
  lastSyncedAt,
  onSyncComplete,
}: SyncStatusProps) {
  const t = useTranslations("bankSync");
  const locale = useLocale();

  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SyncResultSummary | null>(null);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setError(null);
    setLastResult(null);

    try {
      const response = await fetch("/api/plaid/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connected_bank_id: connectedBankId }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Sync failed");
      }

      const data = (await response.json()) as {
        added: number;
        modified: number;
        removed: number;
      };

      const result: SyncResultSummary = {
        added: data.added,
        modified: data.modified,
        removed: data.removed,
      };

      setLastResult(result);
      onSyncComplete?.(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sync transactions";
      setError(message);
    } finally {
      setSyncing(false);
    }
  }, [connectedBankId, onSyncComplete]);

  const statusVariant =
    status === "active" ? "default" : status === "error" ? "destructive" : "secondary";

  const statusLabel =
    status === "active"
      ? t("statusActive")
      : status === "error"
        ? t("statusError")
        : t("statusInactive");

  const formattedLastSync = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleString(locale)
    : t("neverSynced");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{t("syncStatus")}</CardTitle>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Provider */}
        <div className="text-xs text-muted-foreground">
          {t("provider")}: {provider}
        </div>

        {/* Last synced */}
        <div className="flex items-center gap-2 text-sm">
          <ClockIcon className="h-4 w-4 text-muted-foreground" />
          <span>
            {t("lastSynced")}: {formattedLastSync}
          </span>
        </div>

        {/* Sync result */}
        {lastResult && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2Icon className="h-4 w-4" />
            <span>
              {t("syncResult", {
                added: lastResult.added,
                modified: lastResult.modified,
                removed: lastResult.removed,
              })}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircleIcon className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sync button */}
        <Button
          onClick={handleSync}
          disabled={syncing || status !== "active"}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {syncing ? (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCwIcon className="mr-2 h-4 w-4" />
          )}
          {syncing ? t("syncing") : t("syncNow")}
        </Button>
      </CardContent>
    </Card>
  );
}
