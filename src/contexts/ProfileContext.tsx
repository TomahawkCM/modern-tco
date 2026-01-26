'use client';

/**
 * Profile Context
 * Manages multi-profile state and authentication throughout the app
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import type { Profile } from '@/types/profile';
import {
  createProfile as dbCreateProfile,
  getProfile,
  getAllProfiles,
  updateProfile as dbUpdateProfile,
  deleteProfile as dbDeleteProfile,
  ensureProfileExists,
} from '@/lib/profile-db';
import {
  setupPIN,
  verifyPIN,
  isLockedOut,
  calculateLockoutUntil,
  getRemainingLockoutSeconds,
  shouldAutoLock,
  MAX_FAILED_ATTEMPTS,
  AUTO_LOCK_TIMEOUT_MS,
} from '@/lib/pin-auth';
import {
  logProfileLogin,
  logProfileLogout,
  logProfileSwitch,
  logPINChange,
} from '@/lib/activity-logger';
import { isFeatureEnabled } from '@/config/features';

// ========================
// Types
// ========================

interface ProfileState {
  /** All profiles in the system */
  profiles: Profile[];
  /** Currently active profile */
  currentProfile: Profile | null;
  /** Whether the current profile requires PIN unlock */
  isLocked: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Number of failed PIN attempts */
  failedAttempts: number;
  /** Timestamp when lockout ends */
  lockoutUntil: Date | null;
}

interface ProfileContextType extends ProfileState {
  /** Create a new profile */
  createProfile: (name: string, pin?: string, avatarColor?: string) => Promise<Profile>;
  /** Update an existing profile */
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>;
  /** Delete a profile */
  deleteProfile: (id: string) => Promise<void>;
  /** Switch to a different profile */
  switchProfile: (profileId: string) => Promise<boolean>;
  /** Unlock a PIN-protected profile */
  unlockProfile: (pin: string) => Promise<boolean>;
  /** Lock the current profile */
  lockProfile: () => void;
  /** Set or update PIN for a profile */
  setPIN: (profileId: string, pin: string) => Promise<boolean>;
  /** Remove PIN from a profile */
  removePIN: (profileId: string) => Promise<void>;
  /** Refresh profiles from database */
  refreshProfiles: () => Promise<void>;
  /** Check if a profile has a PIN set */
  hasPIN: (profileId: string) => boolean;
  /** Get remaining lockout time in seconds */
  getLockoutRemaining: () => number;
  /** Reset activity timer (call on user interaction) */
  resetActivityTimer: () => void;
}

// ========================
// Context
// ========================

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// ========================
// Provider
// ========================

interface ProfileProviderProps {
  children: React.ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  // State
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);

  // Auto-lock timer
  const lastActivityRef = useRef<Date>(new Date());
  const autoLockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Profile waiting for unlock after switch
  const pendingProfileRef = useRef<string | null>(null);

  // ========================
  // Initialization
  // ========================

  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);
        setError(null);

        // Ensure at least one profile exists
        const defaultProfile = await ensureProfileExists();

        // Load all profiles
        const allProfiles = await getAllProfiles();
        setProfiles(allProfiles);

        // Set current profile (in-memory only for security)
        // Don't persist which profile is selected
        if (defaultProfile) {
          setCurrentProfile(defaultProfile);
          // Lock if PIN is set
          if (defaultProfile.pinHash) {
            setIsLocked(true);
          }
        }
      } catch (err) {
        console.error('[ProfileContext] Initialization error:', err);
        setError('Failed to load profiles');
      } finally {
        setIsLoading(false);
      }
    }

    if (isFeatureEnabled('multiProfiles')) {
      initialize();
    } else {
      setIsLoading(false);
    }
  }, []);

  // ========================
  // Auto-Lock Timer
  // ========================

  const resetActivityTimer = useCallback(() => {
    lastActivityRef.current = new Date();
  }, []);

  useEffect(() => {
    if (!isFeatureEnabled('pinAuthentication') || !currentProfile?.pinHash) {
      return;
    }

    // Check for auto-lock every minute
    autoLockTimerRef.current = setInterval(() => {
      if (
        currentProfile?.pinHash &&
        !isLocked &&
        shouldAutoLock(lastActivityRef.current)
      ) {
        console.log('[ProfileContext] Auto-locking due to inactivity');
        setIsLocked(true);
        logProfileLogout(currentProfile.id, currentProfile.name);
      }
    }, 60000);

    return () => {
      if (autoLockTimerRef.current) {
        clearInterval(autoLockTimerRef.current);
      }
    };
  }, [currentProfile, isLocked]);

  // Reset activity on user interactions
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];

    const handleActivity = () => {
      resetActivityTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetActivityTimer]);

  // ========================
  // Actions
  // ========================

  const createProfile = useCallback(
    async (name: string, pin?: string, avatarColor?: string): Promise<Profile> => {
      try {
        let pinHash: string | null = null;
        let pinSalt: string | null = null;

        if (pin && isFeatureEnabled('pinAuthentication')) {
          const result = await setupPIN(pin);
          if (!result.success) {
            throw new Error(result.error);
          }
          pinHash = result.hash;
          pinSalt = result.salt;
        }

        const profileId = await dbCreateProfile({
          name,
          pinHash,
          pinSalt,
          avatarColor,
        });

        const newProfile = await getProfile(profileId);
        if (!newProfile) {
          throw new Error('Failed to create profile');
        }

        // Update profiles list
        const updatedProfiles = await getAllProfiles();
        setProfiles(updatedProfiles);

        return newProfile;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create profile';
        setError(message);
        throw err;
      }
    },
    []
  );

  const updateProfile = useCallback(
    async (id: string, updates: Partial<Profile>): Promise<void> => {
      try {
        await dbUpdateProfile(id, updates);

        // Refresh profiles
        const updatedProfiles = await getAllProfiles();
        setProfiles(updatedProfiles);

        // Update current profile if it was modified
        if (currentProfile?.id === id) {
          const updated = await getProfile(id);
          if (updated) {
            setCurrentProfile(updated);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update profile';
        setError(message);
        throw err;
      }
    },
    [currentProfile]
  );

  const deleteProfile = useCallback(
    async (id: string): Promise<void> => {
      try {
        await dbDeleteProfile(id);

        // Refresh profiles
        const updatedProfiles = await getAllProfiles();
        setProfiles(updatedProfiles);

        // If deleted current profile, switch to default
        if (currentProfile?.id === id && updatedProfiles.length > 0) {
          const defaultProfile = updatedProfiles.find((p) => p.isDefault) || updatedProfiles[0];
          setCurrentProfile(defaultProfile);
          setIsLocked(!!defaultProfile.pinHash);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete profile';
        setError(message);
        throw err;
      }
    },
    [currentProfile]
  );

  const switchProfile = useCallback(
    async (profileId: string): Promise<boolean> => {
      try {
        const profile = await getProfile(profileId);
        if (!profile) {
          setError('Profile not found');
          return false;
        }

        // Log the switch if we have a current profile
        if (currentProfile) {
          logProfileSwitch(
            currentProfile.id,
            currentProfile.name,
            profile.id,
            profile.name
          );
        }

        // If profile has PIN, require unlock
        if (profile.pinHash && isFeatureEnabled('pinAuthentication')) {
          pendingProfileRef.current = profileId;
          setIsLocked(true);
          setCurrentProfile(profile);
          return false; // Needs unlock
        }

        // No PIN, switch directly
        setCurrentProfile(profile);
        setIsLocked(false);
        setFailedAttempts(0);
        setLockoutUntil(null);
        pendingProfileRef.current = null;

        logProfileLogin(profile.id, profile.name);
        resetActivityTimer();

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to switch profile';
        setError(message);
        return false;
      }
    },
    [currentProfile, resetActivityTimer]
  );

  const unlockProfile = useCallback(
    async (pin: string): Promise<boolean> => {
      // Check lockout
      if (isLockedOut(lockoutUntil)) {
        setError(
          `Too many attempts. Try again in ${getRemainingLockoutSeconds(lockoutUntil)} seconds.`
        );
        return false;
      }

      const profile = currentProfile;
      if (!profile?.pinHash || !profile?.pinSalt) {
        setIsLocked(false);
        return true;
      }

      try {
        const isValid = await verifyPIN(pin, profile.pinSalt, profile.pinHash);

        if (isValid) {
          setIsLocked(false);
          setFailedAttempts(0);
          setLockoutUntil(null);
          setError(null);
          pendingProfileRef.current = null;

          logProfileLogin(profile.id, profile.name);
          resetActivityTimer();

          return true;
        } else {
          const newFailedAttempts = failedAttempts + 1;
          setFailedAttempts(newFailedAttempts);

          // Calculate lockout if needed
          const newLockoutUntil = calculateLockoutUntil(newFailedAttempts);
          setLockoutUntil(newLockoutUntil);

          if (newLockoutUntil) {
            setError(
              `Too many attempts. Try again in ${getRemainingLockoutSeconds(newLockoutUntil)} seconds.`
            );
          } else {
            setError(
              `Incorrect PIN. ${MAX_FAILED_ATTEMPTS - newFailedAttempts} attempts remaining.`
            );
          }

          return false;
        }
      } catch (err) {
        console.error('[ProfileContext] PIN verification error:', err);
        setError('Failed to verify PIN');
        return false;
      }
    },
    [currentProfile, failedAttempts, lockoutUntil, resetActivityTimer]
  );

  const lockProfile = useCallback(() => {
    if (currentProfile?.pinHash) {
      setIsLocked(true);
      logProfileLogout(currentProfile.id, currentProfile.name);
    }
  }, [currentProfile]);

  const setPIN = useCallback(
    async (profileId: string, pin: string): Promise<boolean> => {
      try {
        const result = await setupPIN(pin);
        if (!result.success) {
          setError(result.error);
          return false;
        }

        await dbUpdateProfile(profileId, {
          pinHash: result.hash,
          pinSalt: result.salt,
        });

        // Refresh profiles
        const updatedProfiles = await getAllProfiles();
        setProfiles(updatedProfiles);

        if (currentProfile?.id === profileId) {
          const updated = await getProfile(profileId);
          if (updated) {
            setCurrentProfile(updated);
          }
        }

        // Log PIN change
        const profile = await getProfile(profileId);
        if (profile) {
          logPINChange(profile.id, profile.name, true);
        }

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to set PIN';
        setError(message);
        return false;
      }
    },
    [currentProfile]
  );

  const removePIN = useCallback(
    async (profileId: string): Promise<void> => {
      try {
        await dbUpdateProfile(profileId, {
          pinHash: null,
          pinSalt: null,
        });

        // Refresh profiles
        const updatedProfiles = await getAllProfiles();
        setProfiles(updatedProfiles);

        if (currentProfile?.id === profileId) {
          const updated = await getProfile(profileId);
          if (updated) {
            setCurrentProfile(updated);
            setIsLocked(false);
          }
        }

        // Log PIN change
        const profile = await getProfile(profileId);
        if (profile) {
          logPINChange(profile.id, profile.name, false);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove PIN';
        setError(message);
        throw err;
      }
    },
    [currentProfile]
  );

  const refreshProfiles = useCallback(async (): Promise<void> => {
    try {
      const updatedProfiles = await getAllProfiles();
      setProfiles(updatedProfiles);

      if (currentProfile) {
        const updated = await getProfile(currentProfile.id);
        if (updated) {
          setCurrentProfile(updated);
        }
      }
    } catch (err) {
      console.error('[ProfileContext] Error refreshing profiles:', err);
    }
  }, [currentProfile]);

  const hasPIN = useCallback(
    (profileId: string): boolean => {
      const profile = profiles.find((p) => p.id === profileId);
      return !!profile?.pinHash;
    },
    [profiles]
  );

  const getLockoutRemaining = useCallback((): number => {
    return getRemainingLockoutSeconds(lockoutUntil);
  }, [lockoutUntil]);

  // ========================
  // Context Value
  // ========================

  const value: ProfileContextType = {
    profiles,
    currentProfile,
    isLocked,
    isLoading,
    error,
    failedAttempts,
    lockoutUntil,
    createProfile,
    updateProfile,
    deleteProfile,
    switchProfile,
    unlockProfile,
    lockProfile,
    setPIN,
    removePIN,
    refreshProfiles,
    hasPIN,
    getLockoutRemaining,
    resetActivityTimer,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

// ========================
// Hook
// ========================

export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

// ========================
// Optional Hook (for conditional usage)
// ========================

export function useProfileOptional(): ProfileContextType | null {
  return useContext(ProfileContext) ?? null;
}
