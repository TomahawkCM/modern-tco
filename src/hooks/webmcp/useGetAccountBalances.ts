/**
 * WebMCP Tool: get_account_balances
 * Returns current balances for one or all accounts.
 */

import { useCallback } from "react";
import { useWebMCP } from "@mcp-b/react-webmcp";
import type { Transaction, Account } from "@/types/budget";
import { sanitizeAccount } from "./sanitize";
import { GetAccountBalancesInput } from "./schemas";
import { calculateCurrentBalance } from "@/lib/utils/balanceCalculations";
import { roundToCents } from "@/lib/money";

export function useGetAccountBalances(
  accounts: Account[],
  transactions: Transaction[],
  privacyMode: boolean
): BudgetToolHandler {
  const handler = useCallback(
    async (input: Record<string, unknown>) => {
      if (privacyMode) {
        return { error: "Privacy mode is active. Financial data is hidden." };
      }

      const args = GetAccountBalancesInput.parse(input);

      const targetAccounts = args.accountId
        ? accounts.filter((a) => a.id === args.accountId)
        : accounts;

      if (args.accountId && targetAccounts.length === 0) {
        return { error: `Account '${args.accountId}' not found.` };
      }

      const results = targetAccounts.map((acct) => {
        const acctTxs = transactions.filter((tx) => tx.accountId === acct.id);
        const currentBalance = calculateCurrentBalance(acct.balance, acctTxs);

        return {
          ...sanitizeAccount(acct),
          balance: roundToCents(currentBalance),
          openingBalance: roundToCents(acct.balance),
          transactionCount: acctTxs.length,
        };
      });

      return {
        accounts: results.slice(0, 100),
        totalBalance: roundToCents(results.reduce((sum, a) => sum + a.balance, 0)),
      };
    },
    [accounts, transactions, privacyMode]
  );

  useWebMCP({
    name: "get_account_balances",
    description:
      "Get current balances for one or all accounts, including opening balance and transaction count.",
    inputSchema: {
      accountId: GetAccountBalancesInput.shape.accountId,
    },
    handler,
    annotations: { readOnlyHint: true },
  });

  return handler;
}
