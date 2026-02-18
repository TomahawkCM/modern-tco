/**
 * LAN Sync Settings Component (L-020)
 *
 * Settings UI for LAN sync configuration and device management.
 * Lists paired devices, enables/disables sync, and shows sync status.
 */

"use client";

import React, { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Wifi,
  WifiOff,
  Plus,
  Trash2,
  RefreshCw,
  Smartphone,
  Monitor,
  Tablet,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Clock,
  Unplug,
  Link2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  useLANSync,
  useSyncStats,
  useDeviceSyncStatus,
  type DeviceSyncStatus,
} from "@/contexts/LANSyncContext";
import type { PairedDevice } from "@/lib/lan-sync";
import { PairingDialog } from "./lan-sync/PairingDialog";
import { SyncStatusIndicator } from "./lan-sync/SyncStatusIndicator";

// ============================================================================
// Types
// ============================================================================

export interface LANSyncSettingsProps {
  /** Additional class names */
  className?: string;
  /** Seniors mode for larger text */
  seniorsMode?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatLastSync(date: Date | null | undefined): string {
  if (!date) return "Never synced";

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

function getDeviceIcon(deviceName: string) {
  const name = deviceName.toLowerCase();
  if (
    name.includes("phone") ||
    name.includes("mobile") ||
    name.includes("iphone") ||
    name.includes("android")
  ) {
    return Smartphone;
  }
  if (name.includes("tablet") || name.includes("ipad")) {
    return Tablet;
  }
  return Monitor;
}

function getConnectionStatusColor(status: DeviceSyncStatus | null): string {
  if (!status) return "text-muted-foreground";

  switch (status.connectionState) {
    case "connected":
      return "text-green-500";
    case "syncing":
      return "text-blue-500";
    case "connecting":
      return "text-yellow-500";
    case "error":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}

// ============================================================================
// Device Card Component
// ============================================================================

interface DeviceCardProps {
  device: PairedDevice;
  status: DeviceSyncStatus | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onRemove: () => void;
  onSync: () => void;
  seniorsMode?: boolean;
}

function DeviceCard({
  device,
  status,
  onConnect,
  onDisconnect,
  onRemove,
  onSync,
  seniorsMode,
}: DeviceCardProps) {
  const t = useTranslations("lanSync");
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const DeviceIcon = getDeviceIcon(device.name);
  const isConnected = status?.isOnline ?? false;
  const isSyncing = status?.connectionState === "syncing";

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-4 rounded-lg border bg-card p-4",
          seniorsMode && "p-5"
        )}
      >
        {/* Device icon */}
        <div
          className={cn(
            "flex-shrink-0 rounded-full bg-muted p-2",
            getConnectionStatusColor(status)
          )}
        >
          <DeviceIcon className={seniorsMode ? "h-6 w-6" : "h-5 w-5"} />
        </div>

        {/* Device info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className={cn("truncate font-medium", seniorsMode && "text-lg")}>{device.name}</h4>
            {isConnected && (
              <Badge variant="outline" className="border-green-500 text-green-500">
                {t("device.connected")}
              </Badge>
            )}
          </div>
          <p className={cn("truncate text-muted-foreground", seniorsMode ? "text-sm" : "text-xs")}>
            {status?.lastSyncAt
              ? t("time.lastSync", { time: formatLastSync(status.lastSyncAt) })
              : formatLastSync(device.lastSyncAt)}
          </p>
          {device.lastKnownIp && (
            <p
              className={cn("truncate text-muted-foreground", seniorsMode ? "text-sm" : "text-xs")}
            >
              {device.lastKnownIp}:{device.lastKnownPort}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {isConnected ? (
            <Button
              variant="outline"
              size={seniorsMode ? "default" : "sm"}
              onClick={onSync}
              disabled={isSyncing}
            >
              <RefreshCw className={cn("me-2 h-4 w-4", isSyncing && "animate-spin")} />
              {isSyncing ? t("device.syncing") : t("device.sync")}
            </Button>
          ) : (
            <Button variant="outline" size={seniorsMode ? "default" : "sm"} onClick={onConnect}>
              <Link2 className="me-2 h-4 w-4" />
              {t("device.connect")}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isConnected && (
                <DropdownMenuItem onClick={onDisconnect}>
                  <Unplug className="me-2 h-4 w-4" />
                  {t("device.disconnect")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setShowRemoveDialog(true)}
                className="text-red-500 focus:text-red-500"
              >
                <Trash2 className="me-2 h-4 w-4" />
                {t("device.removeDevice")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Remove confirmation dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("removeDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("removeDialog.description", { deviceName: device.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("removeDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRemove();
                setShowRemoveDialog(false);
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              {t("removeDialog.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function LANSyncSettings({ className, seniorsMode = false }: LANSyncSettingsProps) {
  const t = useTranslations("lanSync");
  const {
    state,
    setEnabled,
    connectToDevice,
    disconnectFromDevice,
    removeDevice,
    syncWithDevice,
    syncAll,
    deviceManager,
  } = useLANSync();
  const stats = useSyncStats();

  const [showPairingDialog, setShowPairingDialog] = useState(false);

  // Handle device pairing success
  const handlePairingSuccess = useCallback((device: PairedDevice) => {
    setShowPairingDialog(false);
    // Device is already added via the pairing dialog
  }, []);

  // Handle sync all
  const handleSyncAll = useCallback(async () => {
    try {
      await syncAll();
    } catch (error) {
      console.error("Sync all failed:", error);
    }
  }, [syncAll]);

  const textSize = seniorsMode ? "text-lg" : "text-base";
  const descSize = seniorsMode ? "text-base" : "text-sm";

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with sync status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {state.isEnabled ? (
                <Wifi className={cn("text-primary", seniorsMode ? "h-7 w-7" : "h-6 w-6")} />
              ) : (
                <WifiOff
                  className={cn("text-muted-foreground", seniorsMode ? "h-7 w-7" : "h-6 w-6")}
                />
              )}
              <div>
                <CardTitle className={seniorsMode ? "text-2xl" : ""}>{t("title")}</CardTitle>
                <CardDescription className={descSize}>{t("description")}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="lan-sync-toggle" className={cn("cursor-pointer", textSize)}>
                {state.isEnabled ? t("enabled") : t("disabled")}
              </Label>
              <Switch id="lan-sync-toggle" checked={state.isEnabled} onCheckedChange={setEnabled} />
            </div>
          </div>
        </CardHeader>

        {state.isEnabled && (
          <CardContent>
            <div className="flex items-center justify-between">
              <SyncStatusIndicator variant="full" seniorsMode={seniorsMode} />
              <Button
                variant="outline"
                onClick={handleSyncAll}
                disabled={stats.connectedDevices === 0 || state.isSyncing}
              >
                <RefreshCw className={cn("me-2 h-4 w-4", state.isSyncing && "animate-spin")} />
                {t("syncAll")}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Paired devices */}
      {state.isEnabled && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={seniorsMode ? "text-xl" : ""}>
                  {t("pairedDevices.title")}
                </CardTitle>
                <CardDescription className={descSize}>
                  {state.pairedDevices.length === 0
                    ? t("pairedDevices.noDevices")
                    : t("pairedDevices.deviceCount", { count: state.pairedDevices.length })}
                </CardDescription>
              </div>
              <Button onClick={() => setShowPairingDialog(true)}>
                <Plus className="me-2 h-4 w-4" />
                {t("pairedDevices.addDevice")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {state.pairedDevices.length === 0 ? (
              <div className="py-8 text-center">
                <Smartphone className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className={cn("mb-2 font-medium", textSize)}>
                  {t("pairedDevices.emptyTitle")}
                </h3>
                <p className={cn("mb-4 text-muted-foreground", descSize)}>
                  {t("pairedDevices.emptyDescription")}
                </p>
                <Button onClick={() => setShowPairingDialog(true)}>
                  <Plus className="me-2 h-4 w-4" />
                  {t("pairedDevices.addFirstDevice")}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {state.pairedDevices.map((device) => (
                  <DeviceCardWrapper
                    key={device.id}
                    device={device}
                    onConnect={() => connectToDevice(device.id)}
                    onDisconnect={() => disconnectFromDevice(device.id)}
                    onRemove={() => removeDevice(device.id)}
                    onSync={() => syncWithDevice(device.id)}
                    seniorsMode={seniorsMode}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      {state.isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className={seniorsMode ? "text-xl" : ""}>{t("howItWorks.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                  1
                </div>
                <div>
                  <h4 className={cn("font-medium", textSize)}>{t("howItWorks.step1.title")}</h4>
                  <p className={cn("text-muted-foreground", descSize)}>
                    {t("howItWorks.step1.description")}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                  2
                </div>
                <div>
                  <h4 className={cn("font-medium", textSize)}>{t("howItWorks.step2.title")}</h4>
                  <p className={cn("text-muted-foreground", descSize)}>
                    {t("howItWorks.step2.description")}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                  3
                </div>
                <div>
                  <h4 className={cn("font-medium", textSize)}>{t("howItWorks.step3.title")}</h4>
                  <p className={cn("text-muted-foreground", descSize)}>
                    {t("howItWorks.step3.description")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pairing dialog */}
      {deviceManager && (
        <PairingDialog
          open={showPairingDialog}
          onOpenChange={setShowPairingDialog}
          onPairingSuccess={handlePairingSuccess}
          deviceManager={deviceManager}
          seniorsMode={seniorsMode}
        />
      )}
    </div>
  );
}

// ============================================================================
// Device Card Wrapper (hooks into context)
// ============================================================================

interface DeviceCardWrapperProps {
  device: PairedDevice;
  onConnect: () => void;
  onDisconnect: () => void;
  onRemove: () => void;
  onSync: () => void;
  seniorsMode?: boolean;
}

function DeviceCardWrapper({
  device,
  onConnect,
  onDisconnect,
  onRemove,
  onSync,
  seniorsMode,
}: DeviceCardWrapperProps) {
  const status = useDeviceSyncStatus(device.id);

  return (
    <DeviceCard
      device={device}
      status={status}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
      onRemove={onRemove}
      onSync={onSync}
      seniorsMode={seniorsMode}
    />
  );
}

export default LANSyncSettings;
