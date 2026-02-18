"use client";

/**
 * SimpleFIN Settings Component
 *
 * Settings panel for SimpleFIN integration configuration.
 * Includes connection status, sync options, and account management.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  RefreshCw,
  Settings,
  Trash2,
  Clock,
  Bell,
  Zap,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import type { SimpleFINSettings, ConnectionStatus, LinkedAccount } from "@/lib/simplefin";
import { SimpleFINStatusBadge, SimpleFINAccountList } from "./SimpleFINStatus";

// =============================================================================
// TYPES
// =============================================================================

interface SimpleFINSettingsPageProps {
  settings: SimpleFINSettings;
  connectionStatus: ConnectionStatus;
  linkedAccounts: LinkedAccount[];
  lastSyncAt: Date | null;
  onSettingsChange: (settings: Partial<SimpleFINSettings>) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onSyncNow: () => void;
  onSyncAccount?: (accountId: string) => void;
  onUnlinkAccount?: (accountId: string) => void;
  onToggleAccountImport?: (accountId: string, enabled: boolean) => void;
  isSyncing?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SimpleFINSettingsPage({
  settings,
  connectionStatus,
  linkedAccounts,
  lastSyncAt,
  onSettingsChange,
  onConnect,
  onDisconnect,
  onSyncNow,
  onSyncAccount,
  onUnlinkAccount,
  onToggleAccountImport,
  isSyncing = false,
}: SimpleFINSettingsPageProps) {
  const t = useTranslations("simplefinSettings");
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const isConnected = connectionStatus === "connected" || connectionStatus === "syncing";

  const formatLastSync = (date: Date | null) => {
    if (!date) return t("sync.never");
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return t("sync.lessThanHour");
    if (hours < 24) return t("sync.hoursAgo", { hours });
    return t("sync.date", { date: date.toLocaleDateString() });
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("connection.title")}
            </div>
            <SimpleFINStatusBadge status={connectionStatus} lastSync={lastSyncAt} />
          </CardTitle>
          <CardDescription>{t("connection.description")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isConnected ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      {t("connection.connected")}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {t("connection.accountsLinked", { count: linkedAccounts.length })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={onSyncNow} disabled={isSyncing}>
                    {isSyncing ? (
                      <>
                        <RefreshCw className="me-2 h-4 w-4 animate-spin" />
                        {t("sync.syncing")}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="me-2 h-4 w-4" />
                        {t("sync.syncNow")}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {t("sync.lastSynced", { time: formatLastSync(lastSyncAt) })}
              </div>

              <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive">
                    <Trash2 className="me-2 h-4 w-4" />
                    {t("disconnect.button")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("disconnect.dialogTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("disconnect.dialogDescription")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("disconnect.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDisconnect}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t("disconnect.confirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <div className="py-6 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-medium">{t("connection.notConnected")}</h3>
              <p className="mb-4 mt-1 text-sm text-muted-foreground">
                {t("connection.notConnectedDesc")}
              </p>
              <Button onClick={onConnect}>
                <Building2 className="me-2 h-4 w-4" />
                {t("connection.connectButton")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Settings */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t("syncSettings.title")}
            </CardTitle>
            <CardDescription>{t("syncSettings.description")}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Auto-sync */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync" className="text-base">
                  {t("syncSettings.autoSync.label")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("syncSettings.autoSync.description")}
                </p>
              </div>
              <Switch
                id="auto-sync"
                checked={settings.autoSyncEnabled}
                onCheckedChange={(checked) => onSettingsChange({ autoSyncEnabled: checked })}
              />
            </div>

            {settings.autoSyncEnabled && (
              <>
                <Separator />

                {/* Sync frequency */}
                <div className="space-y-3">
                  <Label className="text-base">{t("syncSettings.frequency.label")}</Label>
                  <Select
                    value={settings.syncFrequencyHours.toString()}
                    onValueChange={(value) =>
                      onSettingsChange({ syncFrequencyHours: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">{t("syncSettings.frequency.every6Hours")}</SelectItem>
                      <SelectItem value="12">{t("syncSettings.frequency.every12Hours")}</SelectItem>
                      <SelectItem value="24">{t("syncSettings.frequency.onceDaily")}</SelectItem>
                      <SelectItem value="48">{t("syncSettings.frequency.every2Days")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t("syncSettings.frequency.hint")}
                  </p>
                </div>
              </>
            )}

            <Separator />

            {/* Days to sync */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">{t("syncSettings.transactionHistory.label")}</Label>
                <Badge variant="outline">
                  {t("syncSettings.transactionHistory.days", { count: settings.defaultSyncDays })}
                </Badge>
              </div>
              <Slider
                value={[settings.defaultSyncDays]}
                onValueChange={([value]) => onSettingsChange({ defaultSyncDays: value })}
                min={7}
                max={60}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                {t("syncSettings.transactionHistory.hint")}
              </p>
            </div>

            <Separator />

            {/* Include pending */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pending" className="text-base">
                  {t("syncSettings.pendingTransactions.label")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("syncSettings.pendingTransactions.description")}
                </p>
              </div>
              <Switch
                id="pending"
                checked={settings.importPendingTransactions}
                onCheckedChange={(checked) =>
                  onSettingsChange({ importPendingTransactions: checked })
                }
              />
            </div>

            <Separator />

            {/* Auto-categorize */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="categorize" className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  {t("syncSettings.autoCategorize.label")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("syncSettings.autoCategorize.description")}
                </p>
              </div>
              <Switch
                id="categorize"
                checked={settings.autoCategorize}
                onCheckedChange={(checked) => onSettingsChange({ autoCategorize: checked })}
              />
            </div>

            <Separator />

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4" />
                  {t("syncSettings.notifications.label")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("syncSettings.notifications.description")}
                </p>
              </div>
              <Switch
                id="notifications"
                checked={settings.showSyncNotifications}
                onCheckedChange={(checked) => onSettingsChange({ showSyncNotifications: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connected Accounts */}
      {isConnected && linkedAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t("connectedAccounts.title")}
            </CardTitle>
            <CardDescription>{t("connectedAccounts.description")}</CardDescription>
          </CardHeader>

          <CardContent>
            <SimpleFINAccountList
              accounts={linkedAccounts}
              onSync={onSyncAccount}
              onUnlink={onUnlinkAccount}
              onToggleImport={onToggleAccountImport}
            />
          </CardContent>
        </Card>
      )}

      {/* Help */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("help.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <a
            href="https://bridge.simplefin.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            {t("help.bridgeDashboard")}
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://www.simplefin.org/protocol.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            {t("help.protocolDocs")}
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

export default SimpleFINSettingsPage;
