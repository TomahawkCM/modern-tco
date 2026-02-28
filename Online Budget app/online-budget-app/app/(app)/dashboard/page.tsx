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
import { AccountCards } from "@/components/dashboard/account-cards";
import { IncomeExpenseSummary } from "@/components/dashboard/income-expense-summary";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { BudgetProgressList } from "@/components/dashboard/budget-progress-list";
import { HealthScoreWidget } from "@/components/insights/health-score-widget";
import { InsightAlerts } from "@/components/dashboard/insight-alerts";
import { computeFinancialHealthScore } from "@/engine/insights/health-score";

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

  // 6. Financial health score
  const budgetAdherencePercent =
    budgetProgress.length > 0
      ? budgetProgress.reduce((sum, b) => {
          // Adherence = 100% if under budget, otherwise (limit/spent)*100
          const pct = b.percentUsed <= 100 ? 100 : (100 / b.percentUsed) * 100;
          return sum + pct;
        }, 0) / budgetProgress.length
      : 100;

  const healthScore = computeFinancialHealthScore({
    savingsRatePercent: savingsRate,
    budgetAdherencePercent,
    hasEmergencyFund: false, // No data source yet
    debtToIncomePercent: 0, // No debt tracking yet
  });

  // === FORMATTING (display only) ===
  const fmt = (amt: { amountMinor: number; currency: string }) =>
    formatMoney(amt, locale);

  const monthName = now.toLocaleString(locale, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <span className="text-sm text-muted-foreground">{monthName}</span>
      </div>

      {!subscription?.isActive && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Subscription required for full access
        </p>
      )}

      <section>
        <h2 className="mb-3 text-lg font-medium">Financial Health</h2>
        <HealthScoreWidget result={healthScore} />
      </section>

      <InsightAlerts />

      <section>
        <h2 className="mb-3 text-lg font-medium">Accounts</h2>
        <AccountCards
          accounts={primaryAccounts}
          totalBalance={totalBalance}
          formatAmount={fmt}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Income vs Expenses</h2>
        <IncomeExpenseSummary
          income={summary.totalIncome}
          expense={absMinor(summary.totalExpense)}
          net={summary.net}
          transactionCount={summary.transactionCount}
          savingsRate={savingsRate}
          formatAmount={fmt}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Spending by Category</h2>
        <CategoryBreakdown
          categories={categoryBreakdown.categories}
          formatAmount={fmt}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Budget Progress</h2>
        <BudgetProgressList
          items={budgetProgress}
          currency={currency}
          formatAmount={fmt}
        />
      </section>
    </div>
  );
}
