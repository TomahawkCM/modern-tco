"use client";

/**
 * Hook for accessing budgets filtered by profile visibility
 * Integrates profile context with budget visibility filtering
 */

import { useState, useEffect, useCallback } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import {
  getVisibleBudgets,
  getPrivateBudgets,
  getSharedBudgets,
  canAccessBudget,
  makeBudgetPrivate,
  makeBudgetShared,
} from "@/lib/profile-db";
import { db } from "@/lib/budget-db";
import type { Budget } from "@/types/budget";
import { isFeatureEnabled } from "@/config/features";

interface UseVisibleBudgetsResult {
  /** All budgets visible to the current profile */
  budgets: Budget[];
  /** Private budgets owned by current profile */
  privateBudgets: Budget[];
  /** Shared budgets (visible to all) */
  sharedBudgets: Budget[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Refresh budgets */
  refresh: () => Promise<void>;
  /** Check if current profile can access a specific budget */
  canAccess: (budgetId: string) => Promise<boolean>;
  /** Make a budget private (owned by current profile) */
  makePrivate: (budgetId: string) => Promise<void>;
  /** Make a budget shared (visible to all) */
  makeShared: (budgetId: string) => Promise<void>;
}

export function useVisibleBudgets(): UseVisibleBudgetsResult {
  const { currentProfile, isLocked } = useProfile();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [privateBudgets, setPrivateBudgets] = useState<Budget[]>([]);
  const [sharedBudgets, setSharedBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBudgets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isFeatureEnabled("privatePublicBudgets") || !currentProfile) {
        // Feature disabled or no profile - return all budgets
        const allBudgets = await db.budgets.toArray();
        setBudgets(allBudgets);
        setPrivateBudgets([]);
        setSharedBudgets(allBudgets);
        return;
      }

      // Profile is locked - don't load budgets
      if (isLocked) {
        setBudgets([]);
        setPrivateBudgets([]);
        setSharedBudgets([]);
        return;
      }

      // Load filtered budgets
      const [visible, personal, shared] = await Promise.all([
        getVisibleBudgets(currentProfile.id),
        getPrivateBudgets(currentProfile.id),
        getSharedBudgets(),
      ]);

      setBudgets(visible);
      setPrivateBudgets(personal);
      setSharedBudgets(shared);
    } catch (err) {
      console.error("[useVisibleBudgets] Error loading budgets:", err);
      setError(err instanceof Error ? err.message : "Failed to load budgets");
    } finally {
      setIsLoading(false);
    }
  }, [currentProfile, isLocked]);

  // Load budgets when profile changes or unlocks
  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const canAccess = useCallback(
    async (budgetId: string): Promise<boolean> => {
      if (!currentProfile || !isFeatureEnabled("privatePublicBudgets")) {
        return true;
      }
      return canAccessBudget(currentProfile.id, budgetId);
    },
    [currentProfile]
  );

  const makePrivate = useCallback(
    async (budgetId: string): Promise<void> => {
      if (!currentProfile) {
        throw new Error("No active profile");
      }
      await makeBudgetPrivate(budgetId, currentProfile.id);
      await loadBudgets();
    },
    [currentProfile, loadBudgets]
  );

  const makeShared = useCallback(
    async (budgetId: string): Promise<void> => {
      await makeBudgetShared(budgetId);
      await loadBudgets();
    },
    [loadBudgets]
  );

  return {
    budgets,
    privateBudgets,
    sharedBudgets,
    isLoading,
    error,
    refresh: loadBudgets,
    canAccess,
    makePrivate,
    makeShared,
  };
}

/**
 * Hook for checking if a specific budget is accessible
 */
export function useBudgetAccess(budgetId: string | null): {
  canAccess: boolean;
  isOwner: boolean;
  isLoading: boolean;
} {
  const { currentProfile } = useProfile();
  const [canAccess, setCanAccess] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      if (!budgetId || !currentProfile) {
        setCanAccess(true);
        setIsOwner(false);
        setIsLoading(false);
        return;
      }

      if (!isFeatureEnabled("privatePublicBudgets")) {
        setCanAccess(true);
        setIsOwner(false);
        setIsLoading(false);
        return;
      }

      try {
        const budget = await db.budgets.get(budgetId);
        if (!budget) {
          setCanAccess(false);
          setIsOwner(false);
        } else {
          const accessible = await canAccessBudget(currentProfile.id, budgetId);
          setCanAccess(accessible);
          setIsOwner(budget.ownerId === currentProfile.id);
        }
      } catch {
        setCanAccess(false);
        setIsOwner(false);
      } finally {
        setIsLoading(false);
      }
    }

    setIsLoading(true);
    checkAccess();
  }, [budgetId, currentProfile]);

  return { canAccess, isOwner, isLoading };
}
