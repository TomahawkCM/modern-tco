import { addDays, differenceInDays } from "date-fns";
import { UserProfile } from "./profileService";

export const TRIAL_DURATION_DAYS = 7;
export const APP_PRICE = 19.99;

export interface SubscriptionStatus {
  isActive: boolean;
  isTrial: boolean;
  daysRemaining: number;
  isExpired: boolean;
  status: "trial" | "active" | "expired" | "cancelled" | null;
}

export function calculateSubscriptionStatus(user: UserProfile | null): SubscriptionStatus {
  if (!user) {
    return {
      isActive: false,
      isTrial: false,
      daysRemaining: 0,
      isExpired: false,
      status: null,
    };
  }

  const status = user.subscription_status || "trial";

  if (status === "active") {
    return {
      isActive: true,
      isTrial: false,
      daysRemaining: 30, // Show generic positive number for active
      isExpired: false,
      status: "active",
    };
  }

  if (status === "trial") {
    const trialStart = user.trial_start
      ? new Date(user.trial_start)
      : new Date(user.created_at || Date.now());
    const trialEnd = addDays(trialStart, TRIAL_DURATION_DAYS);
    const now = new Date();
    const daysRemaining = differenceInDays(trialEnd, now);

    if (daysRemaining < 0) {
      return {
        isActive: false,
        isTrial: false,
        daysRemaining: 0,
        isExpired: true,
        status: "expired",
      };
    }

    return {
      isActive: true,
      isTrial: true,
      daysRemaining: Math.max(0, daysRemaining),
      isExpired: false,
      status: "trial",
    };
  }

  return {
    isActive: false,
    isTrial: false,
    daysRemaining: 0,
    isExpired: true,
    status: status,
  };
}
