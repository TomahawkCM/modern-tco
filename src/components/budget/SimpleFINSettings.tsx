'use client';

/**
 * SimpleFIN Settings Component
 *
 * Settings panel for SimpleFIN integration configuration.
 * Includes connection status, sync options, and account management.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import type { SimpleFINSettings, ConnectionStatus, LinkedAccount } from '@/lib/simplefin';
import { SimpleFINStatusBadge, SimpleFINAccountList } from './SimpleFINStatus';

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
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const isConnected = connectionStatus === 'connected' || connectionStatus === 'syncing';

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Less than an hour ago';
    if (hours < 24) return `${hours} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              SimpleFIN Connection
            </div>
            <SimpleFINStatusBadge
              status={connectionStatus}
              lastSync={lastSyncAt}
            />
          </CardTitle>
          <CardDescription>
            Connect your bank accounts to automatically import transactions
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isConnected ? (
            <>
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Connected
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {linkedAccounts.length} account{linkedAccounts.length !== 1 ? 's' : ''} linked
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSyncNow}
                    disabled={isSyncing}
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Now
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Last synced: {formatLastSync(lastSyncAt)}
              </div>

              <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect SimpleFIN?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the connection to your bank accounts.
                      Your existing transactions will not be deleted, but new
                      transactions will no longer sync automatically.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDisconnect}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Disconnect
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 font-medium">Not Connected</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Connect your bank accounts to start importing transactions
              </p>
              <Button onClick={onConnect}>
                <Building2 className="w-4 h-4 mr-2" />
                Connect Bank Account
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
              <Settings className="w-5 h-5" />
              Sync Settings
            </CardTitle>
            <CardDescription>
              Configure how and when transactions are synced
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Auto-sync */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync" className="text-base">
                  Automatic Sync
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync transactions on a schedule
                </p>
              </div>
              <Switch
                id="auto-sync"
                checked={settings.autoSyncEnabled}
                onCheckedChange={(checked) =>
                  onSettingsChange({ autoSyncEnabled: checked })
                }
              />
            </div>

            {settings.autoSyncEnabled && (
              <>
                <Separator />

                {/* Sync frequency */}
                <div className="space-y-3">
                  <Label className="text-base">Sync Frequency</Label>
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
                      <SelectItem value="6">Every 6 hours</SelectItem>
                      <SelectItem value="12">Every 12 hours</SelectItem>
                      <SelectItem value="24">Once daily</SelectItem>
                      <SelectItem value="48">Every 2 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    SimpleFIN allows up to 24 requests per day. Daily sync is recommended.
                  </p>
                </div>
              </>
            )}

            <Separator />

            {/* Days to sync */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Transaction History</Label>
                <Badge variant="outline">{settings.defaultSyncDays} days</Badge>
              </div>
              <Slider
                value={[settings.defaultSyncDays]}
                onValueChange={([value]) =>
                  onSettingsChange({ defaultSyncDays: value })
                }
                min={7}
                max={60}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                How many days of transaction history to fetch (max 60 days per SimpleFIN)
              </p>
            </div>

            <Separator />

            {/* Include pending */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pending" className="text-base">
                  Import Pending Transactions
                </Label>
                <p className="text-sm text-muted-foreground">
                  Include transactions that haven&apos;t posted yet
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
                <Label htmlFor="categorize" className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Auto-Categorize
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically categorize imported transactions using AI
                </p>
              </div>
              <Switch
                id="categorize"
                checked={settings.autoCategorize}
                onCheckedChange={(checked) =>
                  onSettingsChange({ autoCategorize: checked })
                }
              />
            </div>

            <Separator />

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="text-base flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Sync Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show notification when sync completes
                </p>
              </div>
              <Switch
                id="notifications"
                checked={settings.showSyncNotifications}
                onCheckedChange={(checked) =>
                  onSettingsChange({ showSyncNotifications: checked })
                }
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
              <Clock className="w-5 h-5" />
              Connected Accounts
            </CardTitle>
            <CardDescription>
              Manage your linked bank accounts
            </CardDescription>
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
          <CardTitle className="text-base">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <a
            href="https://bridge.simplefin.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            SimpleFIN Bridge Dashboard
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://www.simplefin.org/protocol.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            SimpleFIN Protocol Documentation
            <ExternalLink className="w-3 h-3" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

export default SimpleFINSettingsPage;
