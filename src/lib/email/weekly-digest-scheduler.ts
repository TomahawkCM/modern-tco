/**
 * Weekly Digest Scheduler
 *
 * Builds digest data from IndexedDB and triggers the weekly digest email.
 * Client-side only — called when the user opens the app.
 */

import { db } from "@/lib/budget-db";
import { format } from "date-fns";
import { sendWeeklyDigestEmail } from "./email-reminder-service";
import type { WeeklyDigestEmailProps } from "@/types/email";

const LAST_DIGEST_KEY = "budget-app-last-weekly-digest";

/**
 * Check if a weekly digest should be sent (7+ days since last one, or never sent)
 */
export function shouldSendWeeklyDigest(): boolean {
  if (typeof window === "undefined") return false;

  const last = localStorage.getItem(LAST_DIGEST_KEY);
  if (!last) return true;

  const lastSent = new Date(last);
  const now = new Date();
  const daysSinceLast = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceLast >= 7;
}

/**
 * Mark the weekly digest as sent
 */
export function markWeeklyDigestSent(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_DIGEST_KEY, new Date().toISOString());
}

/**
 * Build weekly digest data from IndexedDB
 */
export async function buildWeeklyDigestData(
  currency: string = "USD"
): Promise<Omit<WeeklyDigestEmailProps, "to" | "unsubscribeToken" | "baseUrl">> {
  const now = new Date();

  // Week range: Sunday to Saturday
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfPrevWeek = new Date(startOfWeek);
  startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);

  // Query transactions for current + previous week
  const twoWeeksTxs = await db.transactions.where("date").above(startOfPrevWeek).toArray();

  const thisWeekTxs = twoWeeksTxs.filter((tx) => {
    if (tx.isSplit) return false;
    return new Date(tx.date) >= startOfWeek;
  });

  const lastWeekTxs = twoWeeksTxs.filter((tx) => {
    if (tx.isSplit) return false;
    const d = new Date(tx.date);
    return d >= startOfPrevWeek && d < startOfWeek;
  });

  // Separate income and expenses for current week
  const totalIncome = thisWeekTxs
    .filter((tx) => tx.amount >= 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = thisWeekTxs
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const netSavings = totalIncome - totalExpenses;

  // Week-over-week change (expenses only)
  const lastWeekExpenses = lastWeekTxs
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const weekOverWeekChange =
    lastWeekExpenses > 0 ? ((totalExpenses - lastWeekExpenses) / lastWeekExpenses) * 100 : null;

  // Aggregate expenses by category
  const catSpendMap = new Map<string, number>();
  thisWeekTxs
    .filter((tx) => tx.amount < 0)
    .forEach((tx) => {
      const cat = tx.category ?? "Uncategorized";
      catSpendMap.set(cat, (catSpendMap.get(cat) ?? 0) + Math.abs(tx.amount));
    });

  // Get budgets and categories for budget limits
  const [budgets, categories] = await Promise.all([db.budgets.toArray(), db.categories.toArray()]);

  const categoryIdToName = new Map(categories.map((c) => [c.id, c.name]));
  const categoryNameToBudget = new Map<string, number>();
  budgets.forEach((b) => {
    const name = categoryIdToName.get(b.categoryId);
    if (name) {
      // Convert annual budgets to weekly equivalent
      const weeklyAmount = b.period === "annual" ? b.amount / 52 : b.amount / 4.33;
      categoryNameToBudget.set(name, weeklyAmount);
    }
  });

  // Build category spending with budget info
  const categorySpending = Array.from(catSpendMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([categoryName, spent]) => {
      const budgeted = categoryNameToBudget.get(categoryName) ?? 0;
      const percentUsed = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
      return { categoryName, spent, budgeted, percentUsed };
    });

  // At-risk categories (>=80% of budget)
  const atRiskCategories: WeeklyDigestEmailProps["atRiskCategories"] = [];
  for (const [categoryName, spent] of catSpendMap.entries()) {
    const budgeted = categoryNameToBudget.get(categoryName);
    if (!budgeted || budgeted <= 0) continue;
    const percentUsed = Math.round((spent / budgeted) * 100);
    if (percentUsed >= 80) {
      atRiskCategories.push({
        categoryName,
        spent,
        budgeted,
        percentUsed,
        status: percentUsed >= 100 ? "exceeded" : "warning",
      });
    }
  }
  atRiskCategories.sort((a, b) => b.percentUsed - a.percentUsed);

  // Upcoming bills (next 7 days)
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const subscriptions = await db.subscriptions.filter((s) => s.status === "active").toArray();

  const upcomingBills: WeeklyDigestEmailProps["upcomingBills"] = subscriptions
    .filter((s) => {
      const next = new Date(s.nextBillingDate);
      return next >= now && next <= sevenDaysFromNow;
    })
    .map((s) => {
      const next = new Date(s.nextBillingDate);
      const daysUntilDue = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        name: s.name,
        amount: s.amount,
        dueDate: format(next, "MMM d"),
        daysUntilDue,
      };
    })
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  // Format week label
  const weekLabel = `${format(startOfWeek, "MMM d")} – ${format(endOfWeek, "MMM d, yyyy")}`;

  const dashboardUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/budget-app/dashboard`
      : "/budget-app/dashboard";

  return {
    currency,
    weekLabel,
    categorySpending,
    totalIncome,
    totalExpenses,
    netSavings,
    weekOverWeekChange,
    atRiskCategories,
    upcomingBills,
    dashboardUrl,
  };
}

/**
 * Trigger the weekly digest email: build data, send, and mark as sent
 */
export async function triggerWeeklyDigest(
  currency: string = "USD"
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await buildWeeklyDigestData(currency);
    const result = await sendWeeklyDigestEmail(data);

    if (result.success) {
      markWeeklyDigestSent();
    }

    return result;
  } catch (error) {
    console.error("Failed to trigger weekly digest:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
