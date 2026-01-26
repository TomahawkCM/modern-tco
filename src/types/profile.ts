/**
 * Profile Types for Multi-User Support
 * Used for managing multiple family member profiles within the app
 */

/**
 * A user profile within the household budget app
 * Each profile can have its own private budgets and PIN protection
 */
export interface Profile {
  id: string;
  name: string;

  /** SHA-256 hash of the PIN (null if no PIN set) */
  pinHash: string | null;

  /** Random salt used for PIN hashing */
  pinSalt: string | null;

  createdAt: Date;
  updatedAt: Date;

  /** Whether this is the default profile (first profile created) */
  isDefault: boolean;

  /** Avatar color for visual identification */
  avatarColor?: string;

  /** Optional avatar image (stored as base64) */
  avatarImage?: string;

  /** Display order in profile selector */
  order?: number;
}

/**
 * Activity log entry for tracking changes
 * Records who made what changes and when
 */
export interface ActivityLogEntry {
  id: string;

  /** Profile ID of the user who performed the action */
  profileId: string;

  /** Profile name at time of action (for historical reference) */
  profileName: string;

  /** Type of action performed */
  action:
    | 'create'
    | 'update'
    | 'delete'
    | 'login'
    | 'logout'
    | 'export'
    | 'import'
    | 'pin_change'
    | 'profile_switch';

  /** Type of entity affected */
  entityType:
    | 'profile'
    | 'transaction'
    | 'budget'
    | 'category'
    | 'account'
    | 'subscription'
    | 'loan'
    | 'system';

  /** ID of the affected entity (null for system actions) */
  entityId: string | null;

  /** Name/description of the affected entity */
  entityName?: string;

  /** Additional details about the action */
  details?: Record<string, unknown>;

  /** When the action occurred */
  timestamp: Date;
}

/**
 * Budget visibility options
 */
export type BudgetVisibility = 'shared' | 'private';

/**
 * Profile creation input (without system-generated fields)
 */
export type ProfileCreateInput = Omit<
  Profile,
  'id' | 'createdAt' | 'updatedAt' | 'isDefault'
>;

/**
 * Profile update input (partial profile without read-only fields)
 */
export type ProfileUpdateInput = Partial<
  Omit<Profile, 'id' | 'createdAt' | 'isDefault'>
>;

/**
 * PIN validation result
 */
export interface PINValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Profile session state (in-memory only, not persisted)
 */
export interface ProfileSession {
  /** Currently active profile */
  currentProfile: Profile | null;

  /** Whether the current profile is locked (needs PIN entry) */
  isLocked: boolean;

  /** Timestamp of last activity (for auto-lock) */
  lastActivity: Date;

  /** Number of failed PIN attempts */
  failedAttempts: number;

  /** Timestamp when PIN entry is allowed again (after lockout) */
  lockoutUntil: Date | null;
}

/**
 * Activity log filter options
 */
export interface ActivityLogFilter {
  /** Filter by profile ID */
  profileId?: string;

  /** Filter by action type */
  action?: ActivityLogEntry['action'];

  /** Filter by entity type */
  entityType?: ActivityLogEntry['entityType'];

  /** Start date for date range filter */
  startDate?: Date;

  /** End date for date range filter */
  endDate?: Date;

  /** Maximum number of entries to return */
  limit?: number;

  /** Number of entries to skip (for pagination) */
  offset?: number;
}

/**
 * Profile statistics
 */
export interface ProfileStats {
  profileId: string;
  transactionCount: number;
  budgetCount: number;
  privateBudgetCount: number;
  sharedBudgetCount: number;
  lastActivityDate: Date | null;
}

/**
 * Default avatar colors for new profiles
 */
export const DEFAULT_AVATAR_COLORS = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#84cc16', // Lime
] as const;

/**
 * Get a random default avatar color
 */
export function getRandomAvatarColor(): string {
  return DEFAULT_AVATAR_COLORS[
    Math.floor(Math.random() * DEFAULT_AVATAR_COLORS.length)
  ];
}

/**
 * Get initials from a profile name (max 2 characters)
 */
export function getProfileInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
