/**
 * Activity Logger Service
 * Tracks user actions for audit trail and activity history
 */

import { db } from "./budget-db";
import type { ActivityLogEntry, ActivityLogFilter } from "@/types/profile";

// Maximum number of log entries to keep (auto-prune older entries)
const MAX_LOG_ENTRIES = 500;

/**
 * Generate a unique activity log ID
 */
function generateLogId(): string {
  return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log an activity
 * @param params Activity log parameters
 * @returns The created log entry ID
 */
export async function logActivity(params: {
  profileId: string;
  profileName: string;
  action: ActivityLogEntry["action"];
  entityType: ActivityLogEntry["entityType"];
  entityId?: string | null;
  entityName?: string;
  details?: Record<string, unknown>;
}): Promise<string> {
  try {
    const entry: ActivityLogEntry = {
      id: generateLogId(),
      profileId: params.profileId,
      profileName: params.profileName,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      entityName: params.entityName,
      details: params.details,
      timestamp: new Date(),
    };

    await db.activityLog.add(entry);

    // Auto-prune if we exceed max entries
    await pruneActivityLogIfNeeded();

    return entry.id;
  } catch (error) {
    console.error("[ActivityLogger] Error logging activity:", error);
    // Don't throw - activity logging should not break the app
    return "";
  }
}

/**
 * Get activity log entries with optional filtering
 * @param options Filter options
 * @returns Array of activity log entries
 */
export async function getActivityLog(options?: ActivityLogFilter): Promise<ActivityLogEntry[]> {
  try {
    const collection = db.activityLog.orderBy("timestamp").reverse();

    // Apply filters
    const entries = await collection.toArray();

    let filtered = entries;

    if (options?.profileId) {
      filtered = filtered.filter((e) => e.profileId === options.profileId);
    }

    if (options?.action) {
      filtered = filtered.filter((e) => e.action === options.action);
    }

    if (options?.entityType) {
      filtered = filtered.filter((e) => e.entityType === options.entityType);
    }

    if (options?.startDate) {
      filtered = filtered.filter((e) => e.timestamp >= options.startDate!);
    }

    if (options?.endDate) {
      filtered = filtered.filter((e) => e.timestamp <= options.endDate!);
    }

    // Apply offset
    if (options?.offset) {
      filtered = filtered.slice(options.offset);
    }

    // Apply limit
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  } catch (error) {
    console.error("[ActivityLogger] Error getting activity log:", error);
    return [];
  }
}

/**
 * Get recent activity for a profile
 * @param profileId Profile ID (optional - all profiles if not specified)
 * @param limit Number of entries to return
 * @returns Array of recent activity entries
 */
export async function getRecentActivity(
  profileId?: string,
  limit: number = 20
): Promise<ActivityLogEntry[]> {
  return getActivityLog({
    profileId,
    limit,
  });
}

/**
 * Get activity log count
 * @param profileId Optional profile ID to filter by
 * @returns Number of log entries
 */
export async function getActivityLogCount(profileId?: string): Promise<number> {
  try {
    if (profileId) {
      return await db.activityLog.where("profileId").equals(profileId).count();
    }
    return await db.activityLog.count();
  } catch (error) {
    console.error("[ActivityLogger] Error getting log count:", error);
    return 0;
  }
}

/**
 * Prune activity log to stay within MAX_LOG_ENTRIES
 * Removes oldest entries first
 * @returns Number of entries pruned
 */
export async function pruneActivityLog(): Promise<number> {
  try {
    const count = await db.activityLog.count();

    if (count <= MAX_LOG_ENTRIES) {
      return 0;
    }

    const toDelete = count - MAX_LOG_ENTRIES;

    // Get oldest entries to delete
    const oldestEntries = await db.activityLog.orderBy("timestamp").limit(toDelete).toArray();

    const idsToDelete = oldestEntries.map((e) => e.id);
    await db.activityLog.bulkDelete(idsToDelete);

    console.log("[ActivityLogger] Pruned", toDelete, "old entries");
    return toDelete;
  } catch (error) {
    console.error("[ActivityLogger] Error pruning log:", error);
    return 0;
  }
}

/**
 * Internal: Prune only if needed (called after each log)
 */
async function pruneActivityLogIfNeeded(): Promise<void> {
  try {
    const count = await db.activityLog.count();
    // Only prune if we're significantly over (100 extra entries)
    if (count > MAX_LOG_ENTRIES + 100) {
      await pruneActivityLog();
    }
  } catch {
    // Silently ignore pruning errors
  }
}

/**
 * Clear all activity log entries
 * Use with caution - this deletes all history
 */
export async function clearActivityLog(): Promise<void> {
  try {
    await db.activityLog.clear();
    console.log("[ActivityLogger] Activity log cleared");
  } catch (error) {
    console.error("[ActivityLogger] Error clearing log:", error);
    throw error;
  }
}

/**
 * Delete activity log entries for a specific profile
 * Called when a profile is deleted
 * @param profileId Profile ID
 * @returns Number of entries deleted
 */
export async function deleteProfileActivityLog(profileId: string): Promise<number> {
  try {
    const entries = await db.activityLog.where("profileId").equals(profileId).toArray();

    const ids = entries.map((e) => e.id);
    await db.activityLog.bulkDelete(ids);

    console.log("[ActivityLogger] Deleted", ids.length, "entries for profile:", profileId);
    return ids.length;
  } catch (error) {
    console.error("[ActivityLogger] Error deleting profile log:", error);
    return 0;
  }
}

// ========================
// Convenience Logging Functions
// ========================

/**
 * Log a profile login
 */
export async function logProfileLogin(profileId: string, profileName: string): Promise<void> {
  await logActivity({
    profileId,
    profileName,
    action: "login",
    entityType: "profile",
    entityId: profileId,
    entityName: profileName,
  });
}

/**
 * Log a profile logout
 */
export async function logProfileLogout(profileId: string, profileName: string): Promise<void> {
  await logActivity({
    profileId,
    profileName,
    action: "logout",
    entityType: "profile",
    entityId: profileId,
    entityName: profileName,
  });
}

/**
 * Log a profile switch
 */
export async function logProfileSwitch(
  fromProfileId: string,
  fromProfileName: string,
  toProfileId: string,
  toProfileName: string
): Promise<void> {
  await logActivity({
    profileId: fromProfileId,
    profileName: fromProfileName,
    action: "profile_switch",
    entityType: "profile",
    entityId: toProfileId,
    entityName: toProfileName,
    details: {
      switchedTo: toProfileId,
      switchedToName: toProfileName,
    },
  });
}

/**
 * Log a transaction action
 */
export async function logTransactionAction(
  profileId: string,
  profileName: string,
  action: "create" | "update" | "delete",
  transactionId: string,
  transactionDescription?: string,
  amount?: number
): Promise<void> {
  await logActivity({
    profileId,
    profileName,
    action,
    entityType: "transaction",
    entityId: transactionId,
    entityName: transactionDescription,
    details: amount !== undefined ? { amount } : undefined,
  });
}

/**
 * Log a budget action
 */
export async function logBudgetAction(
  profileId: string,
  profileName: string,
  action: "create" | "update" | "delete",
  budgetId: string,
  categoryName?: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logActivity({
    profileId,
    profileName,
    action,
    entityType: "budget",
    entityId: budgetId,
    entityName: categoryName,
    details,
  });
}

/**
 * Log an account action
 */
export async function logAccountAction(
  profileId: string,
  profileName: string,
  action: "create" | "update" | "delete",
  accountId: string,
  accountName?: string
): Promise<void> {
  await logActivity({
    profileId,
    profileName,
    action,
    entityType: "account",
    entityId: accountId,
    entityName: accountName,
  });
}

/**
 * Log a category action
 */
export async function logCategoryAction(
  profileId: string,
  profileName: string,
  action: "create" | "update" | "delete",
  categoryId: string,
  categoryName?: string
): Promise<void> {
  await logActivity({
    profileId,
    profileName,
    action,
    entityType: "category",
    entityId: categoryId,
    entityName: categoryName,
  });
}

/**
 * Log an export action
 */
export async function logExport(
  profileId: string,
  profileName: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logActivity({
    profileId,
    profileName,
    action: "export",
    entityType: "system",
    details,
  });
}

/**
 * Log an import action
 */
export async function logImport(
  profileId: string,
  profileName: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logActivity({
    profileId,
    profileName,
    action: "import",
    entityType: "system",
    details,
  });
}

/**
 * Log a PIN change
 */
export async function logPINChange(
  profileId: string,
  profileName: string,
  wasSet: boolean
): Promise<void> {
  await logActivity({
    profileId,
    profileName,
    action: "pin_change",
    entityType: "profile",
    entityId: profileId,
    entityName: profileName,
    details: {
      action: wasSet ? "PIN set" : "PIN removed",
    },
  });
}

// ========================
// Activity Summary
// ========================

/**
 * Get activity summary for a time period
 * @param startDate Start of period
 * @param endDate End of period
 * @returns Summary of activity counts by type
 */
export async function getActivitySummary(
  startDate: Date,
  endDate: Date
): Promise<{
  totalActions: number;
  byAction: Record<ActivityLogEntry["action"], number>;
  byEntityType: Record<ActivityLogEntry["entityType"], number>;
  byProfile: Record<string, number>;
}> {
  try {
    const entries = await getActivityLog({ startDate, endDate });

    const byAction: Record<string, number> = {};
    const byEntityType: Record<string, number> = {};
    const byProfile: Record<string, number> = {};

    for (const entry of entries) {
      byAction[entry.action] = (byAction[entry.action] || 0) + 1;
      byEntityType[entry.entityType] = (byEntityType[entry.entityType] || 0) + 1;
      byProfile[entry.profileId] = (byProfile[entry.profileId] || 0) + 1;
    }

    return {
      totalActions: entries.length,
      byAction: byAction as Record<ActivityLogEntry["action"], number>,
      byEntityType: byEntityType as Record<ActivityLogEntry["entityType"], number>,
      byProfile,
    };
  } catch (error) {
    console.error("[ActivityLogger] Error getting summary:", error);
    return {
      totalActions: 0,
      byAction: {} as Record<ActivityLogEntry["action"], number>,
      byEntityType: {} as Record<ActivityLogEntry["entityType"], number>,
      byProfile: {},
    };
  }
}

/**
 * Format activity entry for display
 * @param entry Activity log entry
 * @returns Human-readable description
 */
export function formatActivityEntry(entry: ActivityLogEntry): string {
  const actionVerbs: Record<ActivityLogEntry["action"], string> = {
    create: "created",
    update: "updated",
    delete: "deleted",
    login: "logged in",
    logout: "logged out",
    export: "exported data",
    import: "imported data",
    pin_change: "changed PIN",
    profile_switch: "switched profile",
  };

  const entityLabels: Record<ActivityLogEntry["entityType"], string> = {
    profile: "profile",
    transaction: "transaction",
    budget: "budget",
    category: "category",
    account: "account",
    subscription: "subscription",
    loan: "loan",
    system: "system",
  };

  const verb = actionVerbs[entry.action] || entry.action;
  const entityLabel = entityLabels[entry.entityType] || entry.entityType;

  if (entry.action === "login" || entry.action === "logout") {
    return `${entry.profileName} ${verb}`;
  }

  if (entry.action === "profile_switch") {
    const toName = (entry.details?.switchedToName as string) || "another profile";
    return `${entry.profileName} switched to ${toName}`;
  }

  if (entry.entityName) {
    return `${entry.profileName} ${verb} ${entityLabel} "${entry.entityName}"`;
  }

  return `${entry.profileName} ${verb} a ${entityLabel}`;
}
