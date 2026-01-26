/**
 * Profile Database Operations
 * CRUD operations for user profiles and visibility filtering
 */

import { db } from './budget-db';
import type { Profile, ProfileCreateInput, ProfileUpdateInput } from '@/types/profile';
import type { Budget } from '@/types/budget';
import { getRandomAvatarColor } from '@/types/profile';

/**
 * Generate a unique profile ID
 */
function generateProfileId(): string {
  return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new profile
 * @param input Profile creation input (name, optional PIN hash/salt, avatar)
 * @returns The created profile ID
 */
export async function createProfile(
  input: Omit<ProfileCreateInput, 'pinHash' | 'pinSalt'> & {
    pinHash?: string | null;
    pinSalt?: string | null;
  }
): Promise<string> {
  try {
    const now = new Date();
    const existingProfiles = await db.profiles.count();

    const profile: Profile = {
      id: generateProfileId(),
      name: input.name,
      pinHash: input.pinHash ?? null,
      pinSalt: input.pinSalt ?? null,
      createdAt: now,
      updatedAt: now,
      isDefault: existingProfiles === 0, // First profile is default
      avatarColor: input.avatarColor ?? getRandomAvatarColor(),
      avatarImage: input.avatarImage,
      order: existingProfiles,
    };

    await db.profiles.add(profile);
    console.log('[ProfileDB] Created profile:', profile.id, profile.name);

    return profile.id;
  } catch (error) {
    console.error('[ProfileDB] Error creating profile:', error);
    throw error;
  }
}

/**
 * Get a profile by ID
 * @param id Profile ID
 * @returns The profile or undefined if not found
 */
export async function getProfile(id: string): Promise<Profile | undefined> {
  try {
    return await db.profiles.get(id);
  } catch (error) {
    console.error('[ProfileDB] Error getting profile:', error);
    return undefined;
  }
}

/**
 * Get all profiles
 * @returns Array of all profiles, sorted by order
 */
export async function getAllProfiles(): Promise<Profile[]> {
  try {
    const profiles = await db.profiles.toArray();
    return profiles.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (error) {
    console.error('[ProfileDB] Error getting all profiles:', error);
    return [];
  }
}

/**
 * Get the default profile
 * @returns The default profile or undefined
 */
export async function getDefaultProfile(): Promise<Profile | undefined> {
  try {
    return await db.profiles.where('isDefault').equals(1).first();
  } catch (error) {
    console.error('[ProfileDB] Error getting default profile:', error);
    return undefined;
  }
}

/**
 * Update a profile
 * @param id Profile ID
 * @param updates Partial profile updates
 */
export async function updateProfile(
  id: string,
  updates: ProfileUpdateInput
): Promise<void> {
  try {
    await db.profiles.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
    console.log('[ProfileDB] Updated profile:', id);
  } catch (error) {
    console.error('[ProfileDB] Error updating profile:', error);
    throw error;
  }
}

/**
 * Delete a profile
 * Note: Cannot delete the default profile if it's the only one
 * @param id Profile ID
 * @returns True if deleted, false if deletion was blocked
 */
export async function deleteProfile(id: string): Promise<boolean> {
  try {
    const profile = await db.profiles.get(id);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Check if this is the only profile
    const profileCount = await db.profiles.count();
    if (profileCount === 1) {
      throw new Error('Cannot delete the only profile');
    }

    // If deleting default profile, assign default to another profile
    if (profile.isDefault) {
      const otherProfile = await db.profiles
        .filter((p) => p.id !== id)
        .first();
      if (otherProfile) {
        await db.profiles.update(otherProfile.id, {
          isDefault: true,
          updatedAt: new Date(),
        });
      }
    }

    // Delete the profile
    await db.profiles.delete(id);

    // Update budgets owned by this profile to shared
    const ownedBudgets = await db.budgets
      .filter((b) => b.ownerId === id)
      .toArray();

    for (const budget of ownedBudgets) {
      await db.budgets.update(budget.id, {
        ownerId: null,
        visibility: 'shared',
        updatedAt: new Date(),
      });
    }

    console.log('[ProfileDB] Deleted profile:', id);
    return true;
  } catch (error) {
    console.error('[ProfileDB] Error deleting profile:', error);
    throw error;
  }
}

/**
 * Set a profile as the default
 * @param id Profile ID to set as default
 */
export async function setDefaultProfile(id: string): Promise<void> {
  try {
    // Remove default from current default profile
    const currentDefault = await getDefaultProfile();
    if (currentDefault && currentDefault.id !== id) {
      await db.profiles.update(currentDefault.id, {
        isDefault: false,
        updatedAt: new Date(),
      });
    }

    // Set new default
    await db.profiles.update(id, {
      isDefault: true,
      updatedAt: new Date(),
    });

    console.log('[ProfileDB] Set default profile:', id);
  } catch (error) {
    console.error('[ProfileDB] Error setting default profile:', error);
    throw error;
  }
}

/**
 * Check if a profile exists
 * @param id Profile ID
 * @returns True if profile exists
 */
export async function profileExists(id: string): Promise<boolean> {
  try {
    const profile = await db.profiles.get(id);
    return profile !== undefined;
  } catch {
    return false;
  }
}

/**
 * Get profile count
 * @returns Number of profiles
 */
export async function getProfileCount(): Promise<number> {
  try {
    return await db.profiles.count();
  } catch (error) {
    console.error('[ProfileDB] Error getting profile count:', error);
    return 0;
  }
}

// ========================
// Budget Visibility
// ========================

/**
 * Get budgets visible to a specific profile
 * Returns:
 * - All shared budgets (visibility = 'shared' or ownerId = null)
 * - Private budgets owned by this profile (visibility = 'private' && ownerId = profileId)
 *
 * @param profileId The profile ID to filter for
 * @returns Array of visible budgets
 */
export async function getVisibleBudgets(profileId: string): Promise<Budget[]> {
  try {
    const allBudgets = await db.budgets.toArray();

    return allBudgets.filter((budget) => {
      // Shared budgets are visible to all
      if (budget.visibility === 'shared' || budget.visibility === undefined) {
        return true;
      }

      // Budgets with no owner are shared by default
      if (budget.ownerId === null || budget.ownerId === undefined) {
        return true;
      }

      // Private budgets only visible to owner
      if (budget.visibility === 'private' && budget.ownerId === profileId) {
        return true;
      }

      return false;
    });
  } catch (error) {
    console.error('[ProfileDB] Error getting visible budgets:', error);
    return [];
  }
}

/**
 * Get private budgets owned by a profile
 * @param profileId The profile ID
 * @returns Array of private budgets
 */
export async function getPrivateBudgets(profileId: string): Promise<Budget[]> {
  try {
    return await db.budgets
      .filter(
        (budget) =>
          budget.visibility === 'private' && budget.ownerId === profileId
      )
      .toArray();
  } catch (error) {
    console.error('[ProfileDB] Error getting private budgets:', error);
    return [];
  }
}

/**
 * Get all shared budgets
 * @returns Array of shared budgets
 */
export async function getSharedBudgets(): Promise<Budget[]> {
  try {
    return await db.budgets
      .filter(
        (budget) =>
          budget.visibility === 'shared' ||
          budget.visibility === undefined ||
          budget.ownerId === null ||
          budget.ownerId === undefined
      )
      .toArray();
  } catch (error) {
    console.error('[ProfileDB] Error getting shared budgets:', error);
    return [];
  }
}

/**
 * Set budget ownership and visibility
 * @param budgetId Budget ID
 * @param ownerId Profile ID (null for shared)
 * @param visibility 'shared' or 'private'
 */
export async function setBudgetOwnership(
  budgetId: string,
  ownerId: string | null,
  visibility: 'shared' | 'private'
): Promise<void> {
  try {
    await db.budgets.update(budgetId, {
      ownerId,
      visibility,
      updatedAt: new Date(),
    });
    console.log('[ProfileDB] Updated budget ownership:', budgetId, {
      ownerId,
      visibility,
    });
  } catch (error) {
    console.error('[ProfileDB] Error setting budget ownership:', error);
    throw error;
  }
}

/**
 * Make a budget private (owned by a profile)
 * @param budgetId Budget ID
 * @param profileId Profile ID to own the budget
 */
export async function makeBudgetPrivate(
  budgetId: string,
  profileId: string
): Promise<void> {
  await setBudgetOwnership(budgetId, profileId, 'private');
}

/**
 * Make a budget shared (visible to all profiles)
 * @param budgetId Budget ID
 */
export async function makeBudgetShared(budgetId: string): Promise<void> {
  await setBudgetOwnership(budgetId, null, 'shared');
}

/**
 * Check if a profile can access a budget
 * @param profileId Profile ID
 * @param budgetId Budget ID
 * @returns True if profile can access the budget
 */
export async function canAccessBudget(
  profileId: string,
  budgetId: string
): Promise<boolean> {
  try {
    const budget = await db.budgets.get(budgetId);
    if (!budget) return false;

    // Shared budgets are accessible to all
    if (budget.visibility === 'shared' || !budget.visibility) return true;
    if (budget.ownerId === null || budget.ownerId === undefined) return true;

    // Private budgets only accessible to owner
    return budget.ownerId === profileId;
  } catch {
    return false;
  }
}

// ========================
// Profile Initialization
// ========================

/**
 * Ensure at least one profile exists
 * Creates a default profile if none exist
 * Call this on app startup
 */
export async function ensureProfileExists(): Promise<Profile> {
  try {
    const profiles = await getAllProfiles();

    if (profiles.length === 0) {
      console.log('[ProfileDB] No profiles found, creating default profile...');
      const profileId = await createProfile({
        name: 'Default',
        avatarColor: '#10b981', // Emerald
      });

      const profile = await getProfile(profileId);
      if (!profile) {
        throw new Error('Failed to create default profile');
      }

      return profile;
    }

    // Return the default profile, or first profile if no default
    const defaultProfile = profiles.find((p) => p.isDefault);
    return defaultProfile ?? profiles[0];
  } catch (error) {
    console.error('[ProfileDB] Error ensuring profile exists:', error);
    throw error;
  }
}

/**
 * Get profile statistics
 * @param profileId Profile ID
 * @returns Statistics about the profile's data
 */
export async function getProfileStats(profileId: string): Promise<{
  transactionCount: number;
  budgetCount: number;
  privateBudgetCount: number;
  sharedBudgetCount: number;
}> {
  try {
    const visibleBudgets = await getVisibleBudgets(profileId);
    const privateBudgets = visibleBudgets.filter(
      (b) => b.visibility === 'private' && b.ownerId === profileId
    );
    const sharedBudgets = visibleBudgets.filter(
      (b) => b.visibility !== 'private' || !b.ownerId
    );

    // For transactions, we count all (transactions aren't profile-specific yet)
    const transactionCount = await db.transactions.count();

    return {
      transactionCount,
      budgetCount: visibleBudgets.length,
      privateBudgetCount: privateBudgets.length,
      sharedBudgetCount: sharedBudgets.length,
    };
  } catch (error) {
    console.error('[ProfileDB] Error getting profile stats:', error);
    return {
      transactionCount: 0,
      budgetCount: 0,
      privateBudgetCount: 0,
      sharedBudgetCount: 0,
    };
  }
}
