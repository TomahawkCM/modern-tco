import { createClient } from "@/lib/supabase/server";
import {
  aggregateByCategory,
  computeBudgetProgress,
  absMinor,
  formatMoney,
} from "@/engine";
import type {
  TransactionForCategoryAggregation,
  BudgetLimit,
  CategoryActualSpending,
} from "@/engine";
import { listBudgets } from "@/server/budgets";
import { BudgetList } from "@/components/budgets/budget-list";
import { CreateBudgetForm } from "@/components/budgets/create-budget-form";

export default async function BudgetsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: settings } = await supabase
    .from("user_settings")
    .select("primary_currency, locale")
    .eq("user_id", user.id)
    .single();

  const currency = settings?.primary_currency ?? "USD";
  const locale = settings?.locale ?? "en-US";

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0]!;
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0]!;
  const monthName = now.toLocaleString(locale, {
    month: "long",
    year: "numeric",
  });

  // Fetch transactions, expense categories, budgets in parallel
  const [txResult, categoryRows, budgetResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("amount_minor, currency, category_id")
      .eq("user_id", user.id)
      .eq("currency", currency)
      .gte("transaction_date", monthStart)
      .lte("transaction_date", monthEnd),
    supabase.from("categories").select("id, key, type").eq("type", "expense"),
    listBudgets(supabase, user.id, { period: "monthly" }),
  ]);

  const transactions = txResult.data ?? [];
  const categories = categoryRows.data ?? [];
  const budgets = budgetResult.budgets;

  // Build category ID -> key lookup
  const categoryKeyMap = new Map<string, string>();
  for (const cat of categories) {
    categoryKeyMap.set(cat.id, cat.key);
  }

  // Engine: category spending
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

  // Engine: budget progress
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

  const fmt = (amt: { amountMinor: number; currency: string }) =>
    formatMoney(amt, locale);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
        <span className="text-sm text-muted-foreground">{monthName}</span>
      </div>
      <BudgetList
        items={budgetProgress}
        currency={currency}
        formatAmount={fmt}
      />
      <CreateBudgetForm categories={categories} currency={currency} />
    </div>
  );
}
