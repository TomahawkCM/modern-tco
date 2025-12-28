/**
 * Sync Status Indicator (L-015)
 *
 * Visual indicator for LAN sync status.
 * Shows sync health, connection state, and last sync time.
 */

'use client';

import React from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  useLANSync,
  useSyncHealth,
  useSyncStats,
  useIsSyncing,
  type SyncHealth,
} from '@/contexts/LANSyncContext';

// ============================================================================
// Types
// ============================================================================

export interface SyncStatusIndicatorProps {
  /** Display variant */
  variant?: 'icon' | 'badge' | 'full';
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
    case 'healthy':
      return 'text-green-500';
    case 'warning':
      return 'text-yellow-500';
    case 'error':
      return 'text-red-500';
    case 'offline':
    default:
      return 'text-muted-foreground';
  }
}

function getHealthBadgeVariant(health: SyncHealth): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (health) {
    case 'healthy':
      return 'default';
    case 'warning':
      return 'secondary';
    case 'error':
      return 'destructive';
    case 'offline':
    default:
      return 'outline';
  }
}

function getHealthLabel(health: SyncHealth): string {
  switch (health) {
    case 'healthy':
      return 'Synced';
    case 'warning':
      return 'Partial Sync';
    case 'error':
      return 'Sync Error';
    case 'offline':
    default:
      return 'Offline';
  }
}

function formatLastSync(date: Date | null): string {
  if (!date) return 'Never';

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ============================================================================
// Component
// ============================================================================

export function SyncStatusIndicator({
  variant = 'icon',
  showLastSync = true,
  showPending = true,
  className,
  seniorsMode = false,
  onClick,
}: SyncStatusIndicatorProps) {
  const { state } = useLANSync();
  const health = useSyncHealth();
  const stats = useSyncStats();
  const isSyncing = useIsSyncing();

  const iconSize = seniorsMode ? 'h-6 w-6' : 'h-5 w-5';
  const textSize = seniorsMode ? 'text-base' : 'text-sm';

  // Icon variant
  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onClick}
              className={cn(
                'relative p-2 rounded-lg hover:bg-accent transition-colors',
                className
              )}
              aria-label={`Sync status: ${getHealthLabel(health)}`}
            >
              {isSyncing ? (
                <RefreshCw className={cn(iconSize, 'animate-spin text-primary')} />
              ) : state.isEnabled ? (
                <Wifi className={cn(iconSize, getHealthColor(health))} />
              ) : (
                <WifiOff className={cn(iconSize, 'text-muted-foreground')} />
              )}

              {/* Status dot */}
              {state.isEnabled && !isSyncing && (
                <span
                  className={cn(
                    'absolute top-1 right-1 h-2 w-2 rounded-full',
                    health === 'healthy' && 'bg-green-500',
                    health === 'warning' && 'bg-yellow-500',
                    health === 'error' && 'bg-red-500',
                    health === 'offline' && 'bg-gray-400'
                  )}
                />
              )}

              {/* Pending changes badge */}
              {showPending && stats.pendingChanges > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-xs bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                  {stats.pendingChanges > 99 ? '99+' : stats.pendingChanges}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{getHealthLabel(health)}</p>
              {state.isEnabled && (
                <>
                  <p className="text-xs text-muted-foreground">
                    {stats.connectedDevices}/{stats.totalDevices} devices connected
                  </p>
                  {showLastSync && stats.lastSyncAt && (
                    <p className="text-xs text-muted-foreground">
                      Last sync: {formatLastSync(stats.lastSyncAt)}
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
  if (variant === 'badge') {
    return (
      <Badge
        variant={getHealthBadgeVariant(health)}
        className={cn('gap-1.5 cursor-pointer', className)}
        onClick={onClick}
      >
        {isSyncing ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : health === 'healthy' ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : health === 'error' ? (
          <AlertCircle className="h-3 w-3" />
        ) : (
          <Wifi className="h-3 w-3" />
        )}
        <span>{getHealthLabel(health)}</span>
        {showPending && stats.pendingChanges > 0 && (
          <span className="ml-1 text-xs opacity-75">({stats.pendingChanges})</span>
        )}
      </Badge>
    );
  }

  // Full variant
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border bg-card',
        onClick && 'cursor-pointer hover:bg-accent/50 transition-colors',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Status icon */}
      <div className={cn('flex-shrink-0', getHealthColor(health))}>
        {isSyncing ? (
          <RefreshCw className={cn(iconSize, 'animate-spin')} />
        ) : state.isEnabled ? (
          health === 'healthy' ? (
            <CheckCircle2 className={iconSize} />
          ) : health === 'error' ? (
            <AlertCircle className={iconSize} />
          ) : (
            <Wifi className={iconSize} />
          )
        ) : (
          <WifiOff className={iconSize} />
        )}
      </div>

      {/* Status text */}
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium truncate', textSize)}>
          {isSyncing ? 'Syncing...' : getHealthLabel(health)}
        </p>
        {state.isEnabled && (
          <p className={cn('text-muted-foreground truncate', seniorsMode ? 'text-sm' : 'text-xs')}>
            {stats.connectedDevices}/{stats.totalDevices} devices
            {showLastSync && stats.lastSyncAt && (
              <> · {formatLastSync(stats.lastSyncAt)}</>
            )}
          </p>
        )}
      </div>

      {/* Pending changes */}
      {showPending && stats.pendingChanges > 0 && (
        <div className="flex-shrink-0 flex items-center gap-1 text-muted-foreground">
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
              'flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-accent transition-colors',
              className
            )}
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Wifi className={cn('h-4 w-4', getHealthColor(health))} />
            )}
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                health === 'healthy' && 'bg-green-500',
                health === 'warning' && 'bg-yellow-500',
                health === 'error' && 'bg-red-500',
                health === 'offline' && 'bg-gray-400'
              )}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <span>{getHealthLabel(health)}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default SyncStatusIndicator;
