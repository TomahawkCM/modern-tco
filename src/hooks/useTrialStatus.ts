"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/lib/profileService";
import {
  calculateSubscriptionStatus,
  TRIAL_DURATION_DAYS,
  type SubscriptionStatus,
} from "@/lib/subscriptionService";
import { useEffect, useState } from "react";

// Local user ID used in offline mode - skip Supabase queries for these
const LOCAL_USER_PREFIX = "local-user";

export interface TrialStatusResult {
  /** Whether data is still loading */
  loading: boolean;
  /** Whether the trial/subscription is active (user can write) */
  isActive: boolean;
  /** Whether user is on trial (vs paid subscription) */
  isTrial: boolean;
  /** Days remaining in trial/subscription */
  daysRemaining: number;
  /** Whether trial has expired (read-only mode) */
  isExpired: boolean;
  /** Raw subscription status */
  status: SubscriptionStatus["status"];
  /** Whether app should be in read-only mode */
  isReadOnly: boolean;
  /** Refetch the trial status */
  refetch: () => Promise<void>;
}

/**
 * Hook to get the current user's trial/subscription status
 * Used for soft-blocking expired trials (read-only mode)
 */
export function useTrialStatus(): TrialStatusResult {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    isTrial: false,
    daysRemaining: 0,
    isExpired: false,
    status: null,
  });

  const fetchStatus = async () => {
    if (!user) {
      setSubscriptionStatus({
        isActive: false,
        isTrial: false,
        daysRemaining: 0,
        isExpired: false,
        status: null,
      });
      setLoading(false);
      return;
    }

    // For local/offline users, treat as active (no subscription system)
    if (user.id.startsWith(LOCAL_USER_PREFIX)) {
      setSubscriptionStatus({
        isActive: true,
        isTrial: false,
        daysRemaining: 999,
        isExpired: false,
        status: "active",
      });
      setLoading(false);
      return;
    }

    try {
      const profile = await getUserProfile(user.id);

      // If profile is null (e.g., RLS blocked query), use trial defaults
      if (!profile) {
        setSubscriptionStatus({
          isActive: true,
          isTrial: true,
          daysRemaining: TRIAL_DURATION_DAYS,
          isExpired: false,
          status: "trial",
        });
        setLoading(false);
        return;
      }

      const status = calculateSubscriptionStatus(profile);
      setSubscriptionStatus(status);
    } catch (error) {
      // Silently default to trial mode on error to avoid console noise
      // This handles cases where user exists but session isn't established
      setSubscriptionStatus({
        isActive: true,
        isTrial: true,
        daysRemaining: TRIAL_DURATION_DAYS,
        isExpired: false,
        status: "trial",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [user?.id]);

  // Read-only mode: expired trial and not active subscription
  const isReadOnly = subscriptionStatus.isExpired && !subscriptionStatus.isActive;

  return {
    loading,
    isActive: subscriptionStatus.isActive,
    isTrial: subscriptionStatus.isTrial,
    daysRemaining: subscriptionStatus.daysRemaining,
    isExpired: subscriptionStatus.isExpired,
    status: subscriptionStatus.status,
    isReadOnly,
    refetch: fetchStatus,
  };
}
