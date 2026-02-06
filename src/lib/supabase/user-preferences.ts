/**
 * Supabase User Preferences Service
 *
 * Handles syncing locale and widget configuration to Supabase
 * Strategy: localStorage-first with Supabase backup
 *
 * Conflict Resolution:
 * - localStorage wins if modified in last 5 minutes
 * - Otherwise Supabase wins
 */

import { supabase } from '../supabase';
import type { LocalePreferences } from '../locale-storage';
import type { DashboardConfig } from '@/dashboard/widgets/types';

// Debounce timeout for sync operations (1 second)
const SYNC_DEBOUNCE_MS = 1000;

// Conflict resolution window (5 minutes)
const CONFLICT_WINDOW_MS = 5 * 60 * 1000;

// Debounce timers
let localeSyncTimer: NodeJS.Timeout | null = null;
let widgetSyncTimer: NodeJS.Timeout | null = null;

/**
 * User preferences row from Supabase
 */
interface UserPreferencesRow {
  id?: string;
  user_id: string;
  locale_config: LocalePreferences | null;
  widget_config: DashboardConfig | null;
  updated_at: string;
}

/**
 * Get current authenticated user ID
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Fetch user preferences from Supabase
 */
export async function fetchUserPreferences(): Promise<UserPreferencesRow | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('user_preferences' as any)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Not found is ok - user hasn't synced yet
      if (error.code === 'PGRST116') {
        return null;
      }
      // Gracefully handle missing table (migration not yet applied)
      if (error.code === 'PGRST204' || error.message?.includes('relation') || error.message?.includes('not found')) {
        console.debug('[User Preferences] Table not yet created - run: supabase db push');
        return null;
      }
      console.error('Error fetching user preferences:', error);
      return null;
    }

    return data as unknown as UserPreferencesRow;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
}

/**
 * Save locale preferences to Supabase (debounced)
 */
export function syncLocaleToSupabase(preferences: LocalePreferences): void {
  // Clear existing timer
  if (localeSyncTimer) {
    clearTimeout(localeSyncTimer);
  }

  // Set new debounced timer
  localeSyncTimer = setTimeout(async () => {
    const userId = await getCurrentUserId();
    if (!userId) return;

    try {
      // Upsert (insert or update)
      const { error } = await supabase
        .from('user_preferences' as any)
        .upsert(
          {
            user_id: userId,
            locale_config: preferences,
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) {
        // Gracefully handle expected errors
        const code = error.code || '';
        const message = error.message || '';

        // Missing table (migration not yet applied)
        if (code === 'PGRST204' || code === '42P01' || message.includes('relation') || message.includes('not found')) {
          console.debug('[User Preferences] Table not yet created - run: supabase db push');
          return;
        }

        // User not authenticated - silent fail (expected for anonymous users)
        if (code === 'PGRST301' || code === '401' || message.includes('JWT') || message.includes('auth')) {
          console.debug('[User Preferences] User not authenticated - sync skipped');
          return;
        }

        // RLS policy violation - user doesn't have permission
        if (code === '42501' || message.includes('policy')) {
          console.debug('[User Preferences] RLS policy - user cannot sync preferences');
          return;
        }

        // Empty error object - likely network/offline issue
        if (!code && !message) {
          console.debug('[User Preferences] Sync failed - likely offline or network issue');
          return;
        }

        // Log unexpected errors with details (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.warn('[User Preferences] Unexpected sync error:', {
            code,
            message,
            details: error.details || null,
            hint: error.hint || null,
          });
        }
      } else {
        console.debug('[User Preferences] Locale synced to Supabase');
      }
    } catch (error) {
      // Network errors, offline mode, etc. - silent in production
      if (process.env.NODE_ENV === 'development') {
        console.debug('[User Preferences] Sync failed:', error);
      }
    }
  }, SYNC_DEBOUNCE_MS);
}

/**
 * Save widget config to Supabase (debounced)
 */
export function syncWidgetConfigToSupabase(config: DashboardConfig): void {
  // Clear existing timer
  if (widgetSyncTimer) {
    clearTimeout(widgetSyncTimer);
  }

  // Set new debounced timer
  widgetSyncTimer = setTimeout(async () => {
    const userId = await getCurrentUserId();
    if (!userId) return;

    try {
      // Upsert (insert or update)
      const { error } = await supabase
        .from('user_preferences' as any)
        .upsert(
          {
            user_id: userId,
            widget_config: config,
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) {
        // Gracefully handle expected errors
        const code = error.code || '';
        const message = error.message || '';

        // Missing table, auth issues, or RLS - silent fail
        if (
          code === 'PGRST204' || code === '42P01' || code === 'PGRST301' ||
          code === '401' || code === '42501' ||
          message.includes('relation') || message.includes('not found') ||
          message.includes('JWT') || message.includes('auth') || message.includes('policy')
        ) {
          console.debug('[User Preferences] Widget sync skipped:', code || 'expected condition');
          return;
        }

        console.error('Error syncing widget config to Supabase:', {
          code,
          message,
          details: error.details || null,
        });
      } else {
        console.log('Widget config synced to Supabase');
      }
    } catch (error) {
      console.debug('[User Preferences] Widget sync failed:', error);
    }
  }, SYNC_DEBOUNCE_MS);
}

/**
 * Load locale preferences with conflict resolution
 * Returns Supabase data if it's newer than localStorage
 */
export async function loadLocaleFromSupabase(
  localPreferences: LocalePreferences
): Promise<LocalePreferences | null> {
  const supabasePrefs = await fetchUserPreferences();
  if (!supabasePrefs?.locale_config) {
    return null;
  }

  const supabaseLocale = supabasePrefs.locale_config;

  // Conflict resolution: localStorage wins if recently updated (last 5 minutes)
  const localUpdatedAt = localPreferences.updatedAt || 0;
  const supabaseUpdatedAt = new Date(supabasePrefs.updated_at).getTime();

  const localIsRecent = Date.now() - localUpdatedAt < CONFLICT_WINDOW_MS;

  if (localIsRecent) {
    console.log(
      'Locale conflict resolution: localStorage wins (recently updated)'
    );
    return null; // Keep localStorage
  }

  // Supabase is newer
  if (supabaseUpdatedAt > localUpdatedAt) {
    console.log('Locale conflict resolution: Supabase wins (newer data)');
    return supabaseLocale;
  }

  // localStorage is newer or same
  return null; // Keep localStorage
}

/**
 * Load widget config with conflict resolution
 * Returns Supabase data if it's newer than localStorage
 */
export async function loadWidgetConfigFromSupabase(
  localConfig: DashboardConfig | null
): Promise<DashboardConfig | null> {
  const supabasePrefs = await fetchUserPreferences();
  if (!supabasePrefs?.widget_config) {
    return null;
  }

  const supabaseConfig = supabasePrefs.widget_config;

  // No local config - use Supabase
  if (!localConfig) {
    console.log('No local widget config - using Supabase');
    return supabaseConfig;
  }

  // Conflict resolution: localStorage wins if recently updated (last 5 minutes)
  const localUpdatedAt = localConfig.updatedAt || 0;
  const supabaseUpdatedAt = new Date(supabasePrefs.updated_at).getTime();

  const localIsRecent = Date.now() - localUpdatedAt < CONFLICT_WINDOW_MS;

  if (localIsRecent) {
    console.log(
      'Widget config conflict resolution: localStorage wins (recently updated)'
    );
    return null; // Keep localStorage
  }

  // Supabase is newer
  if (supabaseUpdatedAt > localUpdatedAt) {
    console.log('Widget config conflict resolution: Supabase wins (newer data)');
    return supabaseConfig;
  }

  // localStorage is newer or same
  return null; // Keep localStorage
}

/**
 * Delete user preferences from Supabase
 */
export async function deleteUserPreferences(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  try {
    const { error } = await supabase
      .from('user_preferences' as any)
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting user preferences:', error);
    } else {
      console.log('User preferences deleted from Supabase');
    }
  } catch (error) {
    console.error('Error deleting user preferences:', error);
  }
}
