import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import {
  aggregateIncomeExpense,
  aggregateByCategory,
  computeBudgetProgress,
  absMinor,
  sumMinor,
  formatMoney,
  minorAmount,
} from "@/engine";
import type {
  TransactionForCategoryAggregation,
  BudgetLimit,
  CategoryActualSpending,
} from "@/engine";
import { listAccounts } from "@/server/accounts";
import { listBudgets } from "@/server/budgets";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Layout handles redirect, but we need user for queries
  if (!user) return null;

  const subscription = await getSubscription();

  // Fetch user settings for currency + locale
  const { data: settings } = await supabase
    .from("user_settings")
    .select("primary_currency, locale")
    .eq("user_id", user.id)
    .single();

  const currency = settings?.primary_currency ?? "USD";
  const locale = settings?.locale ?? "en-US";

  // Fetch current month boundaries
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0]!;
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0]!;

  // Parallel data fetching — accounts, transactions, budgets, category keys
  const [accounts, txResult, budgetResult, categoryRows] = await Promise.all([
    listAccounts(supabase, user.id),
    supabase
      .from("transactions")
      .select("amount_minor, currency, category_id")
      .eq("user_id", user.id)
      .eq("currency", currency)
      .gte("transaction_date", monthStart)
      .lte("transaction_date", monthEnd),
    listBudgets(supabase, user.id, { period: "monthly" }),
    supabase.from("categories").select("id, key"),
  ]);

  const transactions = txResult.data ?? [];
  const budgets = budgetResult.budgets;
  const categories = categoryRows.data ?? [];

  // Build category ID → key lookup
  const categoryKeyMap = new Map<string, string>();
  for (const cat of categories) {
    categoryKeyMap.set(cat.id, cat.key);
  }

  // === ENGINE COMPUTATIONS (all math in engine) ===

  // 1. Income vs Expense summary
  const incomeExpenseInput = transactions.map((t) => ({
    amountMinor: t.amount_minor,
    currency: t.currency,
  }));
  const summary = aggregateIncomeExpense(incomeExpenseInput, currency);

  // 2. Category spending breakdown
  const categoryInput: TransactionForCategoryAggregation[] = transactions.map(
    (t) => ({
      amountMinor: t.amount_minor,
      currency: t.currency,
      categoryKey: t.category_id
        ? (categoryKeyMap.get(t.category_id) ?? null)
        : null,
    })
  );
  const categoryBreakdown = aggregateByCategory(categoryInput, currency);

  // 3. Account balances (sum via engine)
  const primaryAccounts = accounts.filter((a) => a.currency === currency);
  const accountAmounts = primaryAccounts.map((a) =>
    minorAmount(a.balance_minor, a.currency)
  );
  const totalBalance =
    accountAmounts.length > 0
      ? sumMinor(accountAmounts, currency)
      : minorAmount(0, currency);

  // 4. Budget progress
  const budgetLimits: BudgetLimit[] = budgets
    .filter((b) => b.currency === currency)
    .map((b) => ({
      categoryKey: categoryKeyMap.get(b.category_id) ?? b.category_id,
      limitMinor: b.amount_minor,
      currency: b.currency,
    }));

  const actualSpending: CategoryActualSpending[] =
    categoryBreakdown.categories
      .filter((c) => c.categoryKey !== null && c.total.amountMinor < 0)
      .map((c) => ({
        categoryKey: c.categoryKey!,
        spentMinor: absMinor(c.total).amountMinor,
      }));

  const budgetProgress = computeBudgetProgress(
    budgetLimits,
    actualSpending,
    currency
  );

  // 5. Savings rate (engine values only — division for display percentage)
  const incomeMinor = summary.totalIncome.amountMinor;
  const savingsRate =
    incomeMinor > 0
      ? ((incomeMinor + summary.totalExpense.amountMinor) / incomeMinor) * 100
      : 0;

  // === FORMATTING (display only) ===
  const fmt = (amt: { amountMinor: number; currency: string }) =>
    formatMoney(amt, locale);

  const monthName = now.toLocaleString(locale, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>

      {!subscription?.isActive && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Subscription required for full access
        </p>
      )}

      <p className="text-sm text-muted-foreground">{monthName}</p>

      {/* Account Balances */}
      <section>
        <h2 className="mb-3 text-lg font-medium">Accounts</h2>
        {primaryAccounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No accounts yet</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {primaryAccounts.map((account) => (
              <div key={account.id} className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">{account.name}</p>
                <p className="text-lg font-semibold">
                  {fmt(minorAmount(account.balance_minor, account.currency))}
                </p>
                <p className="text-xs text-muted-foreground">{account.type}</p>
              </div>
            ))}
          </div>
        )}
        {primaryAccounts.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            Net balance:{" "}
            <span className="font-medium">{fmt(totalBalance)}</span>
          </p>
        )}
      </section>

      {/* Income vs Expense */}
      <section>
        <h2 className="mb-3 text-lg font-medium">Income vs Expenses</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Income</p>
            <p className="text-xl font-semibold text-green-600">
              {fmt(summary.totalIncome)}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Expenses</p>
            <p className="text-xl font-semibold text-red-600">
              {fmt(absMinor(summary.totalExpense))}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Net</p>
            <p
              className={`text-xl font-semibold ${summary.net.amountMinor >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {fmt(summary.net)}
            </p>
          </div>
        </div>
        <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
          <span>{summary.transactionCount} transactions</span>
          <span>Savings rate: {savingsRate.toFixed(1)}%</span>
        </div>
      </section>

      {/* Category Spending Breakdown */}
      <section>
        <h2 className="mb-3 text-lg font-medium">Spending by Category</h2>
        {categoryBreakdown.categories.filter((c) => c.total.amountMinor < 0)
          .length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No expenses this month
          </p>
        ) : (
          <div className="space-y-2">
            {categoryBreakdown.categories
              .filter((c) => c.total.amountMinor < 0)
              .map((cat) => (
                <div
                  key={cat.categoryKey ?? "uncategorized"}
                  className="flex items-center justify-between rounded border px-4 py-2"
                >
                  <div>
                    <span className="text-sm font-medium">
                      {cat.categoryKey ?? "Uncategorized"}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {cat.transactionCount} txn
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-red-600">
                      {fmt(absMinor(cat.total))}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {cat.percentageOfTotal.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Budget Progress */}
      {budgetProgress.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-medium">Budget Progress</h2>
          <div className="space-y-3">
            {budgetProgress.map((bp) => (
              <div key={bp.categoryKey} className="rounded border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{bp.categoryKey}</span>
                  <span
                    className={`text-xs font-medium ${bp.isOverBudget ? "text-red-600" : "text-muted-foreground"}`}
                  >
                    {bp.isOverBudget
                      ? "Over budget"
                      : `${bp.percentUsed.toFixed(0)}%`}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-secondary">
                  <div
                    className={`h-2 rounded-full ${bp.isOverBudget ? "bg-red-500" : bp.percentUsed > 80 ? "bg-amber-500" : "bg-green-500"}`}
                    style={{ width: `${Math.min(bp.percentUsed, 100)}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>
                    {fmt(minorAmount(bp.spentMinor, currency))} spent
                  </span>
                  <span>
                    {fmt(minorAmount(bp.limitMinor, currency))} limit
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
