/**
 * WebMCP Tool: get_subscriptions
 * Returns subscriptions filtered by status with monthly cost calculation.
 */

import { useCallback } from "react";
import { useWebMCP } from "@mcp-b/react-webmcp";
import type { Subscription } from "@/types/budget";
import { GetSubscriptionsInput } from "./schemas";
import { roundToCents } from "@/lib/money";

function toMonthlyCost(sub: Subscription): number {
  switch (sub.billingCycle) {
    case "weekly":
      return sub.amount * 4.33;
    case "bi-weekly":
      return sub.amount * 2.17;
    case "monthly":
      return sub.amount;
    case "quarterly":
      return sub.amount / 3;
    case "annual":
      return sub.amount / 12;
    default:
      return sub.amount;
  }
}

export function useGetSubscriptions(
  subscriptions: Subscription[],
  privacyMode: boolean
): BudgetToolHandler {
  const handler = useCallback(
    async (input: Record<string, unknown>) => {
      if (privacyMode) {
        return { error: "Privacy mode is active. Financial data is hidden." };
      }

      const args = GetSubscriptionsInput.parse(input);

      const filtered =
        args.status === "all"
          ? subscriptions
          : subscriptions.filter((s) => s.status === args.status);

      const result = filtered.slice(0, 100).map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        amount: s.amount,
        currency: s.currency,
        billingCycle: s.billingCycle,
        monthlyCost: roundToCents(toMonthlyCost(s)),
        status: s.status,
        nextBillingDate: new Date(s.nextBillingDate).toISOString(),
        category: s.category,
        autoRenew: s.autoRenew,
      }));

      const totalMonthlyCost = roundToCents(
        filtered
          .filter((s) => s.status === "active" || s.status === "trial")
          .reduce((sum, s) => sum + toMonthlyCost(s), 0)
      );

      return {
        subscriptions: result,
        count: result.length,
        totalMonthlyCost,
        totalAnnualCost: roundToCents(totalMonthlyCost * 12),
      };
    },
    [subscriptions, privacyMode]
  );

  useWebMCP({
    name: "get_subscriptions",
    description: "Get subscriptions filtered by status, with monthly and annual cost calculations.",
    inputSchema: {
      status: GetSubscriptionsInput.shape.status,
    },
    handler,
    annotations: { readOnlyHint: true },
  });

  return handler;
}
