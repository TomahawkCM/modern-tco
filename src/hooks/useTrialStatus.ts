"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/lib/profileService";
import {
  calculateSubscriptionStatus,
  TRIAL_DURATION_DAYS,
  type SubscriptionStatus,
} from "@/lib/subscriptionService";
import { useEffect, useState } from "react";

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

    try {
      const profile = await getUserProfile(user.id);
      const status = calculateSubscriptionStatus(profile);
      setSubscriptionStatus(status);
    } catch (error) {
      console.error("Error fetching trial status:", error);
      // Default to trial mode on error to avoid blocking users
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
