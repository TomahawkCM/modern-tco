/**
 * Weekly Insights Analytics (Friday Review Feature)
 * Task F-010: Core analytics module for the Friday Money Review
 *
 * Provides weekly spending summaries, budget variance analysis,
 * and actionable insights for the Friday Review experience.
 */

import type {
  Transaction,
  Budget,
  Category,
  FuturePurchase,
  Subscription,
  CategorySpending,
} from '@/types/budget';

// ===================================
// Types
// ===================================

export interface WeeklySpendingSummary {
  weekStart: Date;
  weekEnd: Date;
  totalSpent: number;
  totalIncome: number;
  netFlow: number;
  transactionCount: number;
  daysTracked: number;
  vsLastWeek: {
    amount: number;
    percentage: number;
    direction: 'up' | 'down' | 'stable';
  };
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }>;
}

export interface BudgetVariance {
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentUsed: number;
  status: 'on-track' | 'warning' | 'over';
  daysRemaining: number;
  projectedTotal: number;
  projectedStatus: 'on-track' | 'warning' | 'over';
}

export interface WeeklyInsight {
  id: string;
  type:
    | 'spending-change'
    | 'budget-warning'
    | 'budget-over'
    | 'goal-progress'
    | 'subscription-due'
    | 'savings-win'
    | 'streak';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  amount?: number;
  percentChange?: number;
  actionLabel?: string;
  actionHref?: string;
  icon?: string;
  category?: string;
}

export interface GoalProgressSummary {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  addedThisWeek: number;
  percentComplete: number;
  projectedDate: Date | null;
  pace: 'ahead' | 'on-track' | 'behind';
  monthlyNeeded: number;
}

export interface WeeklyReviewData {
  userName: string;
  weekStart: Date;
  weekEnd: Date;
  spending: WeeklySpendingSummary;
  budgets: BudgetVariance[];
  insights: WeeklyInsight[];
  goals: GoalProgressSummary[];
  upcomingBills: UpcomingBill[];
  streak: number;
}

export interface UpcomingBill {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  type: 'subscription' | 'bill' | 'recurring';
  canCancel: boolean;
  lastUsed?: Date;
  icon: string;
}

// ===================================
// Helper Functions
// ===================================

function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday

  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function getPreviousWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  const current = getWeekRange(date);
  const start = new Date(current.start);
  start.setDate(start.getDate() - 7);
  const end = new Date(current.end);
  end.setDate(end.getDate() - 7);
  return { start, end };
}

function isInDateRange(date: Date, start: Date, end: Date): boolean {
  const d = new Date(date);
  return d >= start && d <= end;
}

function countUniqueDays(transactions: Transaction[]): number {
  const days = new Set<string>();
  transactions.forEach((tx) => {
    const dateStr = new Date(tx.date).toISOString().split('T')[0];
    days.add(dateStr);
  });
  return days.size;
}

// ===================================
// Main Analytics Functions
// ===================================

/**
 * Get weekly spending summary with comparison to last week
 */
export function getWeeklySpendingSummary(
  transactions: Transaction[],
  categories: Category[],
  weekDate: Date = new Date()
): WeeklySpendingSummary {
  const { start, end } = getWeekRange(weekDate);
  const { start: prevStart, end: prevEnd } = getPreviousWeekRange(weekDate);

  // Filter transactions for current week
  const weekTxs = transactions.filter((tx) =>
    isInDateRange(new Date(tx.date), start, end)
  );

  // Filter transactions for previous week
  const prevWeekTxs = transactions.filter((tx) =>
    isInDateRange(new Date(tx.date), prevStart, prevEnd)
  );

  // Calculate totals
  const expenses = weekTxs.filter((tx) => tx.amount < 0);
  const income = weekTxs.filter((tx) => tx.amount > 0);

  const totalSpent = Math.abs(expenses.reduce((sum, tx) => sum + tx.amount, 0));
  const totalIncome = income.reduce((sum, tx) => sum + tx.amount, 0);

  // Previous week totals
  const prevExpenses = prevWeekTxs.filter((tx) => tx.amount < 0);
  const prevTotalSpent = Math.abs(
    prevExpenses.reduce((sum, tx) => sum + tx.amount, 0)
  );

  // Calculate variance
  const vsAmount = prevTotalSpent - totalSpent; // Positive = saved money
  const vsPercentage =
    prevTotalSpent > 0 ? ((vsAmount / prevTotalSpent) * 100) : 0;
  const direction: 'up' | 'down' | 'stable' =
    vsPercentage > 5 ? 'down' : vsPercentage < -5 ? 'up' : 'stable';

  // Group by category
  const categoryTotals = new Map<string, { amount: number; count: number }>();

  expenses.forEach((tx) => {
    const cat = tx.category || 'Uncategorized';
    const current = categoryTotals.get(cat) || { amount: 0, count: 0 };
    categoryTotals.set(cat, {
      amount: current.amount + Math.abs(tx.amount),
      count: current.count + 1,
    });
  });

  // Sort by amount and get top 5
  const topCategories = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 5)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0,
      transactionCount: data.count,
    }));

  return {
    weekStart: start,
    weekEnd: end,
    totalSpent,
    totalIncome,
    netFlow: totalIncome - totalSpent,
    transactionCount: weekTxs.length,
    daysTracked: countUniqueDays(weekTxs),
    vsLastWeek: {
      amount: vsAmount,
      percentage: Math.abs(vsPercentage),
      direction,
    },
    topCategories,
  };
}

/**
 * Get budget variance for each budget
 */
export function getBudgetVariance(
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[]
): BudgetVariance[] {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const currentDay = now.getDate();
  const daysRemaining = daysInMonth - currentDay;

  // Get month's transactions
  const monthTxs = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= monthStart && txDate <= monthEnd && tx.amount < 0;
  });

  // Calculate spending by category
  const categorySpending = new Map<string, number>();
  monthTxs.forEach((tx) => {
    const catId = tx.category || '';
    const current = categorySpending.get(catId) || 0;
    categorySpending.set(catId, current + Math.abs(tx.amount));
  });

  // Calculate variance for each budget
  return budgets
    .filter((budget) => {
      // Only include active monthly budgets
      const budgetStart = new Date(budget.startDate);
      const budgetEnd = budget.endDate ? new Date(budget.endDate) : null;
      return (
        budget.period === 'monthly' &&
        budgetStart <= now &&
        (!budgetEnd || budgetEnd >= now)
      );
    })
    .map((budget) => {
      const category = categories.find((c) => c.id === budget.categoryId);
      const spent = categorySpending.get(budget.categoryId) || 0;
      const remaining = budget.amount - spent;
      const percentUsed = (spent / budget.amount) * 100;

      // Determine current status
      let status: 'on-track' | 'warning' | 'over' = 'on-track';
      if (percentUsed >= 100) {
        status = 'over';
      } else if (percentUsed >= 85) {
        status = 'warning';
      }

      // Project end of month spending
      const dailyRate = currentDay > 0 ? spent / currentDay : 0;
      const projectedTotal = spent + dailyRate * daysRemaining;
      const projectedPercent = (projectedTotal / budget.amount) * 100;

      let projectedStatus: 'on-track' | 'warning' | 'over' = 'on-track';
      if (projectedPercent >= 100) {
        projectedStatus = 'over';
      } else if (projectedPercent >= 90) {
        projectedStatus = 'warning';
      }

      return {
        categoryId: budget.categoryId,
        categoryName: category?.name || 'Unknown',
        budgetAmount: budget.amount,
        spentAmount: spent,
        remainingAmount: remaining,
        percentUsed,
        status,
        daysRemaining,
        projectedTotal,
        projectedStatus,
      };
    })
    .sort((a, b) => b.percentUsed - a.percentUsed);
}

/**
 * Get top 3 most important insights for the week
 */
export function getTopInsights(
  spending: WeeklySpendingSummary,
  budgets: BudgetVariance[],
  goals: GoalProgressSummary[],
  subscriptions: Subscription[]
): WeeklyInsight[] {
  const insights: WeeklyInsight[] = [];

  // 1. Spending change insights
  if (spending.vsLastWeek.direction === 'down' && spending.vsLastWeek.percentage > 10) {
    insights.push({
      id: 'spending-saved',
      type: 'savings-win',
      priority: 'high',
      title: 'Great savings!',
      message: `You spent ${spending.vsLastWeek.percentage.toFixed(0)}% less than last week.`,
      amount: spending.vsLastWeek.amount,
      percentChange: spending.vsLastWeek.percentage,
      icon: '💰',
    });
  } else if (
    spending.vsLastWeek.direction === 'up' &&
    spending.vsLastWeek.percentage > 20
  ) {
    insights.push({
      id: 'spending-increased',
      type: 'spending-change',
      priority: 'medium',
      title: 'Spending increased',
      message: `You spent ${spending.vsLastWeek.percentage.toFixed(0)}% more than last week.`,
      amount: Math.abs(spending.vsLastWeek.amount),
      percentChange: spending.vsLastWeek.percentage,
      icon: '📊',
    });
  }

  // 2. Budget warnings/overages
  const overBudgets = budgets.filter((b) => b.status === 'over');
  const warningBudgets = budgets.filter((b) => b.status === 'warning');

  overBudgets.slice(0, 2).forEach((budget) => {
    insights.push({
      id: `budget-over-${budget.categoryId}`,
      type: 'budget-over',
      priority: 'high',
      title: `${budget.categoryName} over budget`,
      message: `$${Math.abs(budget.remainingAmount).toFixed(0)} over your $${budget.budgetAmount} budget.`,
      amount: Math.abs(budget.remainingAmount),
      category: budget.categoryName,
      actionLabel: 'Adjust Budget',
      actionHref: '/budget-app/budgets',
      icon: '⚠️',
    });
  });

  warningBudgets.slice(0, 1).forEach((budget) => {
    insights.push({
      id: `budget-warning-${budget.categoryId}`,
      type: 'budget-warning',
      priority: 'medium',
      title: `${budget.categoryName} almost at limit`,
      message: `${budget.percentUsed.toFixed(0)}% used with ${budget.daysRemaining} days left.`,
      percentChange: budget.percentUsed,
      category: budget.categoryName,
      icon: '⚡',
    });
  });

  // 3. Goal milestones
  goals.forEach((goal) => {
    // Check for milestone hits (25%, 50%, 75%)
    const milestones = [25, 50, 75];
    milestones.forEach((milestone) => {
      const prevPercent =
        ((goal.currentAmount - goal.addedThisWeek) / goal.targetAmount) * 100;
      if (prevPercent < milestone && goal.percentComplete >= milestone) {
        insights.push({
          id: `goal-milestone-${goal.id}-${milestone}`,
          type: 'goal-progress',
          priority: 'high',
          title: `${milestone}% milestone reached!`,
          message: `You're ${milestone}% of the way to your ${goal.name} goal.`,
          percentChange: goal.percentComplete,
          icon: goal.icon || '🎯',
        });
      }
    });

    // Significant weekly progress
    if (goal.addedThisWeek > 0 && !milestones.some((m) => goal.percentComplete >= m && goal.percentComplete - (goal.addedThisWeek / goal.targetAmount * 100) < m)) {
      const weeklyPercent = (goal.addedThisWeek / goal.targetAmount) * 100;
      if (weeklyPercent >= 5) {
        insights.push({
          id: `goal-progress-${goal.id}`,
          type: 'goal-progress',
          priority: 'medium',
          title: `${goal.name} progress`,
          message: `+$${goal.addedThisWeek.toFixed(0)} this week (${goal.percentComplete.toFixed(0)}% complete)`,
          amount: goal.addedThisWeek,
          percentChange: goal.percentComplete,
          icon: goal.icon || '📈',
        });
      }
    }
  });

  // 4. Upcoming subscription renewals
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingSubs = subscriptions.filter((sub) => {
    const nextBilling = new Date(sub.nextBillingDate);
    return sub.status === 'active' && nextBilling >= now && nextBilling <= nextWeek;
  });

  if (upcomingSubs.length > 0) {
    const total = upcomingSubs.reduce((sum, sub) => sum + sub.amount, 0);
    insights.push({
      id: 'subscriptions-due',
      type: 'subscription-due',
      priority: 'medium',
      title: 'Subscriptions renewing',
      message: `${upcomingSubs.length} subscription${upcomingSubs.length > 1 ? 's' : ''} ($${total.toFixed(0)}) renewing next week.`,
      amount: total,
      actionLabel: 'Review',
      actionHref: '/budget-app/subscriptions',
      icon: '🔄',
    });
  }

  // Sort by priority and return top 3
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return insights
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 3);
}

/**
 * Get progress for each savings goal
 */
export function getGoalProgress(
  goals: FuturePurchase[],
  transactions: Transaction[]
): GoalProgressSummary[] {
  const { start: weekStart, end: weekEnd } = getWeekRange();

  return goals
    .filter((goal) => !goal.isCompleted)
    .map((goal) => {
      // Calculate added this week (transfers to savings)
      const goalTxs = transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        // Look for transactions tagged with goal name or notes mentioning goal
        return (
          isInDateRange(txDate, weekStart, weekEnd) &&
          (tx.tags?.includes(goal.name) ||
            tx.notes?.toLowerCase().includes(goal.name.toLowerCase()) ||
            tx.category === 'Savings')
        );
      });

      const addedThisWeek = goalTxs.reduce(
        (sum, tx) => sum + Math.abs(tx.amount),
        0
      );

      // Calculate progress
      const percentComplete = (goal.currentSavings / goal.targetAmount) * 100;

      // Calculate projected completion date
      const monthlyRate = goal.monthlyContribution;
      const remaining = goal.targetAmount - goal.currentSavings;
      const monthsToGo = monthlyRate > 0 ? remaining / monthlyRate : Infinity;

      let projectedDate: Date | null = null;
      if (monthsToGo !== Infinity && monthsToGo > 0) {
        projectedDate = new Date();
        projectedDate.setMonth(projectedDate.getMonth() + Math.ceil(monthsToGo));
      }

      // Determine pace
      const targetDate = new Date(goal.targetDate);
      const now = new Date();
      const monthsRemaining =
        (targetDate.getFullYear() - now.getFullYear()) * 12 +
        (targetDate.getMonth() - now.getMonth());
      const neededMonthly =
        monthsRemaining > 0 ? remaining / monthsRemaining : remaining;

      let pace: 'ahead' | 'on-track' | 'behind' = 'on-track';
      if (monthlyRate >= neededMonthly * 1.1) {
        pace = 'ahead';
      } else if (monthlyRate < neededMonthly * 0.9) {
        pace = 'behind';
      }

      // Assign icon based on goal name/category
      let icon = '🎯';
      const lowerName = goal.name.toLowerCase();
      if (lowerName.includes('vacation') || lowerName.includes('travel')) {
        icon = '🏖️';
      } else if (lowerName.includes('car') || lowerName.includes('vehicle')) {
        icon = '🚗';
      } else if (lowerName.includes('house') || lowerName.includes('home')) {
        icon = '🏠';
      } else if (lowerName.includes('wedding')) {
        icon = '💒';
      } else if (lowerName.includes('emergency')) {
        icon = '🛡️';
      } else if (lowerName.includes('education') || lowerName.includes('college')) {
        icon = '🎓';
      }

      return {
        id: goal.id,
        name: goal.name,
        icon,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentSavings,
        addedThisWeek,
        percentComplete,
        projectedDate,
        pace,
        monthlyNeeded: neededMonthly,
      };
    })
    .sort((a, b) => b.percentComplete - a.percentComplete);
}

/**
 * Get upcoming bills and subscriptions for next week
 */
export function getUpcomingBills(
  subscriptions: Subscription[],
  recurringTransactions: Transaction[]
): UpcomingBill[] {
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const bills: UpcomingBill[] = [];

  // Add subscriptions
  subscriptions
    .filter((sub) => {
      const nextBilling = new Date(sub.nextBillingDate);
      return sub.status === 'active' && nextBilling >= now && nextBilling <= nextWeek;
    })
    .forEach((sub) => {
      bills.push({
        id: sub.id,
        name: sub.name,
        amount: sub.amount,
        dueDate: new Date(sub.nextBillingDate),
        type: 'subscription',
        canCancel: sub.autoRenew,
        icon: getSubscriptionIcon(sub.name),
      });
    });

  // Add recurring transactions
  recurringTransactions
    .filter((tx) => {
      if (!tx.isRecurring || !tx.recurringPattern) return false;
      // Simplified: check if due this week based on pattern
      const txDate = new Date(tx.date);
      return txDate >= now && txDate <= nextWeek;
    })
    .forEach((tx) => {
      bills.push({
        id: tx.id,
        name: tx.description,
        amount: Math.abs(tx.amount),
        dueDate: new Date(tx.date),
        type: 'recurring',
        canCancel: false,
        icon: '📅',
      });
    });

  return bills.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

function getSubscriptionIcon(name: string): string {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('netflix') || lowerName.includes('hulu') || lowerName.includes('disney')) {
    return '📺';
  }
  if (lowerName.includes('spotify') || lowerName.includes('apple music')) {
    return '🎵';
  }
  if (lowerName.includes('gym') || lowerName.includes('fitness')) {
    return '💪';
  }
  if (lowerName.includes('insurance')) {
    return '🛡️';
  }
  if (lowerName.includes('phone') || lowerName.includes('mobile')) {
    return '📱';
  }
  if (lowerName.includes('internet') || lowerName.includes('wifi')) {
    return '🌐';
  }
  if (lowerName.includes('electric') || lowerName.includes('utility')) {
    return '⚡';
  }
  if (lowerName.includes('amazon')) {
    return '📦';
  }

  return '🔄';
}

/**
 * Calculate weekly streak
 */
export function calculateWeeklyStreak(completedReviews: Date[]): number {
  if (completedReviews.length === 0) return 0;

  // Sort reviews by date descending
  const sorted = [...completedReviews]
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  let currentWeek = getWeekRange();

  for (const review of sorted) {
    const reviewWeek = getWeekRange(review);

    // Check if review is in the expected week
    if (
      reviewWeek.start.getTime() === currentWeek.start.getTime() ||
      (currentWeek.start.getTime() - reviewWeek.start.getTime()) / (7 * 24 * 60 * 60 * 1000) === 1
    ) {
      streak++;
      // Move to previous week
      const prevWeek = new Date(currentWeek.start);
      prevWeek.setDate(prevWeek.getDate() - 7);
      currentWeek = getWeekRange(prevWeek);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get complete weekly review data
 */
export function getWeeklyReviewData(
  userName: string,
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  goals: FuturePurchase[],
  subscriptions: Subscription[],
  completedReviews: Date[]
): WeeklyReviewData {
  const spending = getWeeklySpendingSummary(transactions, categories);
  const budgetVariance = getBudgetVariance(transactions, budgets, categories);
  const goalProgress = getGoalProgress(goals, transactions);
  const upcomingBills = getUpcomingBills(subscriptions, transactions.filter(tx => tx.isRecurring));
  const insights = getTopInsights(spending, budgetVariance, goalProgress, subscriptions);
  const streak = calculateWeeklyStreak(completedReviews);

  return {
    userName,
    weekStart: spending.weekStart,
    weekEnd: spending.weekEnd,
    spending,
    budgets: budgetVariance,
    insights,
    goals: goalProgress,
    upcomingBills,
    streak,
  };
}
