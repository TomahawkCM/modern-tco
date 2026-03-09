/**
 * Sync Status Indicator (L-015)
 *
 * Visual indicator for LAN sync status.
 * Shows sync health, connection state, and last sync time.
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useLANSync,
  useSyncHealth,
  useSyncStats,
  useIsSyncing,
  type SyncHealth,
} from "@/contexts/LANSyncContext";

// ============================================================================
// Types
// ============================================================================

export interface SyncStatusIndicatorProps {
  /** Display variant */
  variant?: "icon" | "badge" | "full";
  /** Show last sync time */
  showLastSync?: boolean;
  /** Show pending changes count */
  showPending?: boolean;
  /** Additional class names */
  className?: string;
  /** Seniors mode for larger text */
  seniorsMode?: boolean;
  /** Click handler for expanding details */
  onClick?: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getHealthColor(health: SyncHealth): string {
  switch (health) {
    case "healthy":
      return "text-green-500";
    case "warning":
      return "text-yellow-500";
    case "error":
      return "text-red-500";
    case "offline":
    default:
      return "text-muted-foreground";
  }
}

function getHealthBadgeVariant(
  health: SyncHealth
): "default" | "secondary" | "destructive" | "outline" {
  switch (health) {
    case "healthy":
      return "default";
    case "warning":
      return "secondary";
    case "error":
      return "destructive";
    case "offline":
    default:
      return "outline";
  }
}

function getHealthLabel(health: SyncHealth, t: (key: string) => string): string {
  switch (health) {
    case "healthy":
      return t("synced");
    case "warning":
      return t("partialSync");
    case "error":
      return t("syncError");
    case "offline":
    default:
      return t("offline");
  }
}

function formatLastSync(
  date: Date | null,
  t: (key: string, values?: Record<string, string | number>) => string
): string {
  if (!date) return t("never");

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t("justNow");
  if (minutes < 60) return t("minutesAgo", { minutes });
  if (hours < 24) return t("hoursAgo", { hours });
  return t("daysAgo", { days });
}

// ============================================================================
// Component
// ============================================================================

export function SyncStatusIndicator({
  variant = "icon",
  showLastSync = true,
  showPending = true,
  className,
  seniorsMode = false,
  onClick,
}: SyncStatusIndicatorProps) {
  const tAria = useTranslations("aria");
  const t = useTranslations("syncStatus");
  const { state } = useLANSync();
  const health = useSyncHealth();
  const stats = useSyncStats();
  const isSyncing = useIsSyncing();

  const iconSize = seniorsMode ? "h-6 w-6" : "h-5 w-5";
  const textSize = seniorsMode ? "text-base" : "text-sm";

  // Icon variant
  if (variant === "icon") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onClick}
              className={cn("relative rounded-lg p-2 transition-colors hover:bg-accent", className)}
              aria-label={tAria("syncStatus", { status: getHealthLabel(health, t) })}
            >
              {isSyncing ? (
                <RefreshCw className={cn(iconSize, "animate-spin text-primary")} />
              ) : state.isEnabled ? (
                <Wifi className={cn(iconSize, getHealthColor(health))} />
              ) : (
                <WifiOff className={cn(iconSize, "text-muted-foreground")} />
              )}

              {/* Status dot */}
              {state.isEnabled && !isSyncing && (
                <span
                  className={cn(
                    "absolute end-1 top-1 h-2 w-2 rounded-full",
                    health === "healthy" && "bg-green-500",
                    health === "warning" && "bg-yellow-500",
                    health === "error" && "bg-red-500",
                    health === "offline" && "bg-gray-400"
                  )}
                />
              )}

              {/* Pending changes badge */}
              {showPending && stats.pendingChanges > 0 && (
                <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-xs text-primary-foreground">
                  {stats.pendingChanges > 99 ? "99+" : stats.pendingChanges}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{getHealthLabel(health, t)}</p>
              {state.isEnabled && (
                <>
                  <p className="text-xs text-muted-foreground">
                    {t("devicesConnected", {
                      connected: stats.connectedDevices,
                      total: stats.totalDevices,
                    })}
                  </p>
                  {showLastSync && stats.lastSyncAt && (
                    <p className="text-xs text-muted-foreground">
                      {t("lastSync", { time: formatLastSync(stats.lastSyncAt, t) })}
                    </p>
                  )}
                </>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Badge variant
  if (variant === "badge") {
    return (
      <Badge
        variant={getHealthBadgeVariant(health)}
        className={cn("cursor-pointer gap-1.5", className)}
        onClick={onClick}
      >
        {isSyncing ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : health === "healthy" ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : health === "error" ? (
          <AlertCircle className="h-3 w-3" />
        ) : (
          <Wifi className="h-3 w-3" />
        )}
        <span>{getHealthLabel(health, t)}</span>
        {showPending && stats.pendingChanges > 0 && (
          <span className="ms-1 text-xs opacity-75">({stats.pendingChanges})</span>
        )}
      </Badge>
    );
  }

  // Full variant
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-3",
        onClick && "cursor-pointer transition-colors hover:bg-accent/50",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Status icon */}
      <div className={cn("flex-shrink-0", getHealthColor(health))}>
        {isSyncing ? (
          <RefreshCw className={cn(iconSize, "animate-spin")} />
        ) : state.isEnabled ? (
          health === "healthy" ? (
            <CheckCircle2 className={iconSize} />
          ) : health === "error" ? (
            <AlertCircle className={iconSize} />
          ) : (
            <Wifi className={iconSize} />
          )
        ) : (
          <WifiOff className={iconSize} />
        )}
      </div>

      {/* Status text */}
      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-medium", textSize)}>
          {isSyncing ? t("syncing") : getHealthLabel(health, t)}
        </p>
        {state.isEnabled && (
          <p className={cn("truncate text-muted-foreground", seniorsMode ? "text-sm" : "text-xs")}>
            {t("devices", { connected: stats.connectedDevices, total: stats.totalDevices })}
            {showLastSync && stats.lastSyncAt && <> · {formatLastSync(stats.lastSyncAt, t)}</>}
          </p>
        )}
      </div>

      {/* Pending changes */}
      {showPending && stats.pendingChanges > 0 && (
        <div className="flex flex-shrink-0 items-center gap-1 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className={textSize}>{stats.pendingChanges}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Compact Indicator (for header/footer use)
// ============================================================================

export interface CompactSyncIndicatorProps {
  className?: string;
  onClick?: () => void;
}

export function CompactSyncIndicator({ className, onClick }: CompactSyncIndicatorProps) {
  const t = useTranslations("syncStatus");
  const { state } = useLANSync();
  const health = useSyncHealth();
  const isSyncing = useIsSyncing();

  if (!state.isEnabled) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-accent",
              className
            )}
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Wifi className={cn("h-4 w-4", getHealthColor(health))} />
            )}
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                health === "healthy" && "bg-green-500",
                health === "warning" && "bg-yellow-500",
                health === "error" && "bg-red-500",
                health === "offline" && "bg-gray-400"
              )}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <span>{getHealthLabel(health, t)}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default SyncStatusIndicator;
