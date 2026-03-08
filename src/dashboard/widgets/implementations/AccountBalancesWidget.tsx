import { EmptyState } from "@/components/budget/states/EmptyState";
import { GlassCard } from "@/components/budget/ui/GlassCard";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { db } from "@/lib/budget-db";
import type { Account } from "@/types/budget";
import { useLiveQuery } from "dexie-react-hooks";
import { CreditCard, Landmark, TrendingUp, Wallet } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo } from "react";
import type { WidgetConfig } from "../types";

// Fallback if routing not set up exactly this way, usually just next/link
import NextLink from "next/link";

interface AccountBalancesWidgetProps {
  config: WidgetConfig;
}

interface AccountWithCurrentBalance extends Account {
  currentBalance: number;
}

export function AccountBalancesWidget({ config }: AccountBalancesWidgetProps) {
  const t = useTranslations("dashboard.widgets.accountBalances");
  const format = useFormatter();
  const currency = useDefaultCurrency();

  // Fetch accounts from Dexie
  const accounts = useLiveQuery(() => db.accounts.toArray()) || [];

  // Fetch all transactions to calculate current balances
  const transactions =
    useLiveQuery(async () => {
      const allTxs = await db.transactions.toArray();
      return allTxs.filter((tx) => !tx.isSplit);
    }) || [];

  // Calculate current balance for each account
  // Current Balance = Starting Balance (account.balance) + Net Transactions
  const accountsWithCurrentBalance = useMemo<AccountWithCurrentBalance[]>(() => {
    // Get all account IDs
    const accountIds = new Set(accounts.map((a) => a.id));

    // Find transactions that don't belong to any existing account
    const unassignedTransactions = transactions.filter((tx) => !accountIds.has(tx.accountId));
    const unassignedTotal = unassignedTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // If there's only one account and there are unassigned transactions,
    // add them to that account (common case: user imports, then creates account)
    const shouldAddUnassignedToFirst = accounts.length === 1 && unassignedTransactions.length > 0;

    return accounts.map((account, index) => {
      // Sum all transactions for this account
      const accountTransactions = transactions.filter((tx) => tx.accountId === account.id);
      let transactionTotal = accountTransactions.reduce((sum, tx) => sum + tx.amount, 0);

      // Add unassigned transactions to the first (or only) account
      if (shouldAddUnassignedToFirst && index === 0) {
        transactionTotal += unassignedTotal;
      }

      // Current balance = starting balance + transaction total
      const currentBalance = account.balance + transactionTotal;

      return {
        ...account,
        currentBalance,
      };
    });
  }, [accounts, transactions]);

  // If there are transactions but no accounts, create a virtual "default" account
  // This handles the case where user imported transactions without creating an account
  const displayAccounts = useMemo<AccountWithCurrentBalance[]>(() => {
    if (accountsWithCurrentBalance.length > 0) {
      return accountsWithCurrentBalance;
    }

    // No accounts but have transactions - show transaction totals
    if (transactions.length > 0) {
      const transactionTotal = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      return [
        {
          id: "virtual-default",
          name: "All Transactions",
          type: "checking" as const,
          institution: "Imported",
          balance: 0,
          currentBalance: transactionTotal,
          currency,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }

    return [];
  }, [accountsWithCurrentBalance, transactions, currency]);

  // Calculate net worth from current balances
  const netWorth = displayAccounts.reduce((sum, a) => sum + a.currentBalance, 0);

  const getIcon = (type: Account["type"]) => {
    switch (type) {
      case "checking":
        return Landmark;
      case "savings":
        return Wallet;
      case "credit":
        return CreditCard;
      default:
        return Wallet;
    }
  };

  return (
    <div className={`md:col-span-2 ${config.size === "large" ? "lg:col-span-4" : ""}`}>
      <GlassCard className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-teal-500/20 p-2">
              <Wallet className="h-5 w-5 text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">{t("title")}</h3>
          </div>
          <NextLink
            href="/budget-app/accounts"
            className="text-xs text-slate-400 transition-colors hover:text-white"
          >
            {t("viewAll")}
          </NextLink>
        </div>

        <div className="mb-6">
          <p className="mb-1 text-sm text-slate-400">{t("netWorth")}</p>
          <div className="text-2xl font-bold text-white">
            {format.number(netWorth, { style: "currency", currency })}
          </div>
        </div>

        <div className="custom-scrollbar max-h-[200px] space-y-3 overflow-y-auto pr-2">
          {displayAccounts.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title={t("noAccounts")}
              description={t("addAccount")}
              actionLabel={t("addAccount")}
              onAction={() => (window.location.href = "/budget-app/accounts")}
              className="min-h-[200px] border-none bg-transparent p-0"
            />
          ) : (
            displayAccounts.map((account) => {
              const Icon = getIcon(account.type);
              return (
                <div
                  key={account.id}
                  className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-slate-800 p-1.5 text-slate-400 transition-colors group-hover:text-teal-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{account.name}</p>
                      <p className="text-xs capitalize text-slate-500">{account.institution}</p>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-semibold ${account.currentBalance < 0 ? "text-red-400" : "text-emerald-400"}`}
                  >
                    {format.number(account.currentBalance, {
                      style: "currency",
                      currency: account.currency || currency,
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {accounts.length === 0 && (
          <div className="mt-auto pt-4">
            <NextLink
              href="/budget-app/accounts"
              className="flex w-full items-center justify-center rounded-lg border border-teal-500/20 bg-teal-600/20 py-2 text-sm font-medium text-teal-300 transition-colors hover:bg-teal-600/30"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              {t("addAccount")}
            </NextLink>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
