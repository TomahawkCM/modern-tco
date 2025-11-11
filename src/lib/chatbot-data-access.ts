/**
 * Chatbot Data Access Service
 *
 * Provides privacy-controlled access to user's financial data for AI chatbot queries.
 * All methods respect user privacy settings and only return necessary data.
 *
 * Privacy Rules:
 * - Must check isChatbotEnabled() before any data access
 * - Must respect chatbotDataAccess level (read-only vs full-access)
 * - Only return aggregated/summarized data when possible
 * - Never expose raw account numbers or sensitive identifiers
 */

import { db } from './budget-db';
import type { Transaction, Budget, Account, Category, Loan } from '@/types/budget';
import {
  isChatbotEnabled,
  getChatbotDataAccess,
  type PrivacySettings
} from './budget-privacy-settings';

/**
 * Check if chatbot has permission to access data
 */
export function checkChatbotPermission(): { allowed: boolean; reason?: string } {
  if (!isChatbotEnabled()) {
    return {
      allowed: false,
      reason: 'Chatbot is disabled. Enable it in Settings → Privacy → Budget Chatbot'
    };
  }
  return { allowed: true };
}

/**
 * Check if chatbot has permission to perform actions (write operations)
 */
export function checkChatbotActionPermission(): { allowed: boolean; reason?: string } {
  const basePermission = checkChatbotPermission();
  if (!basePermission.allowed) {
    return basePermission;
  }

  const accessLevel = getChatbotDataAccess();
  if (accessLevel === 'read-only') {
    return {
      allowed: false,
      reason: 'Chatbot is in read-only mode. Change to "Full Access" in Settings to enable actions.',
    };
  }

  return { allowed: true };
}

/**
 * Get spending summary for a date range
 */
export async function getSpendingSummary(params: {
  startDate: Date;
  endDate: Date;
  category?: string;
}): Promise<{
  totalSpent: number;
  totalIncome: number;
  netCashFlow: number;
  transactionCount: number;
  categoryBreakdown: Array<{ category: string; amount: number; count: number }>;
}> {
  const permission = checkChatbotPermission();
  if (!permission.allowed) {
    throw new Error(permission.reason);
  }

  const { startDate, endDate, category } = params;

  // Get all transactions in date range
  let transactions = await db.transactions
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();

  // Filter by category if specified
  if (category) {
    transactions = transactions.filter(tx =>
      tx.category?.toLowerCase() === category.toLowerCase()
    );
  }

  // Calculate totals
  const expenses = transactions.filter(tx => tx.amount < 0);
  const income = transactions.filter(tx => tx.amount > 0);

  const totalSpent = Math.abs(expenses.reduce((sum, tx) => sum + tx.amount, 0));
  const totalIncome = income.reduce((sum, tx) => sum + tx.amount, 0);
  const netCashFlow = totalIncome - totalSpent;

  // Group by category
  const categoryMap = new Map<string, { amount: number; count: number }>();

  for (const tx of expenses) {
    const category = tx.category || 'Uncategorized';
    const existing = categoryMap.get(category) || { amount: 0, count: 0 };
    categoryMap.set(category, {
      amount: existing.amount + Math.abs(tx.amount),
      count: existing.count + 1,
    });
  }

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalSpent,
    totalIncome,
    netCashFlow,
    transactionCount: transactions.length,
    categoryBreakdown,
  };
}

/**
 * Get budget status (all budgets or specific category)
 */
export async function getBudgetStatus(params?: {
  category?: string;
  period?: 'monthly' | 'weekly' | 'yearly';
}): Promise<Array<{
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
  period: string;
}>> {
  const permission = checkChatbotPermission();
  if (!permission.allowed) {
    throw new Error(permission.reason);
  }

  let budgets = await db.budgets.toArray();

  // Filter by category if specified
  if (params?.category) {
    budgets = budgets.filter(b =>
      b.categoryId.toLowerCase() === params.category!.toLowerCase()
    );
  }

  // Filter by period if specified
  if (params?.period) {
    budgets = budgets.filter(b => b.period === params.period);
  }

  const now = new Date();
  const results = [];

  for (const budget of budgets) {
    // Calculate current period start/end dates
    const periodStart = new Date(budget.startDate);
    const periodEnd = new Date(periodStart);

    if (budget.period === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      // Must be 'annual'
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Get spending for this budget's category in current period
    const summary = await getSpendingSummary({
      startDate: periodStart,
      endDate: periodEnd,
      category: budget.categoryId,
    });

    const spent = summary.totalSpent;
    const limit = budget.amount;
    const remaining = limit - spent;
    const percentUsed = (spent / limit) * 100;
    const isOverBudget = spent > limit;

    results.push({
      category: budget.categoryId,
      limit,
      spent,
      remaining,
      percentUsed: Math.round(percentUsed),
      isOverBudget,
      period: budget.period,
    });
  }

  return results.sort((a, b) => b.percentUsed - a.percentUsed);
}

/**
 * Get account summaries (balances, transaction counts)
 */
export async function getAccountSummaries(): Promise<Array<{
  name: string;
  type: string;
  balance: number;
  transactionCount: number;
  lastTransaction?: Date;
}>> {
  const permission = checkChatbotPermission();
  if (!permission.allowed) {
    throw new Error(permission.reason);
  }

  const accounts = await db.accounts.toArray();
  const results = [];

  for (const account of accounts) {
    // Get all transactions for this account
    const transactions = await db.transactions
      .where('accountId')
      .equals(account.id)
      .toArray();

    // Calculate balance (sum of all transactions)
    const balance = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Get last transaction date
    const lastTransaction = transactions.length > 0
      ? new Date(Math.max(...transactions.map(tx => new Date(tx.date).getTime())))
      : undefined;

    results.push({
      name: account.name,
      type: account.type,
      balance,
      transactionCount: transactions.length,
      lastTransaction,
    });
  }

  return results;
}

/**
 * Get loan summaries (balances, payment schedules)
 */
export async function getLoanSummaries(): Promise<Array<{
  name: string;
  type: string;
  principal: number;
  interestRate: number;
  remainingBalance: number;
  monthlyPayment: number;
  nextPaymentDate: Date;
  totalPaid: number;
}>> {
  const permission = checkChatbotPermission();
  if (!permission.allowed) {
    throw new Error(permission.reason);
  }

  const loans = await db.loans.toArray();
  const results = [];

  for (const loan of loans) {
    // Get all payments for this loan
    const payments = await db.loanPayments
      .where('loanId')
      .equals(loan.id)
      .toArray();

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Use current balance from loan record
    const remainingBalance = loan.currentBalance;

    results.push({
      name: loan.name,
      type: loan.type,
      principal: loan.originalPrincipal,
      interestRate: loan.interestRate,
      remainingBalance,
      monthlyPayment: loan.monthlyPayment,
      nextPaymentDate: loan.nextPaymentDate,
      totalPaid,
    });
  }

  return results;
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<Array<{
  name: string;
  type: 'income' | 'expense';
  subcategories?: string[];
}>> {
  const permission = checkChatbotPermission();
  if (!permission.allowed) {
    throw new Error(permission.reason);
  }

  const categories = await db.categories.toArray();

  return categories.map(cat => ({
    name: cat.name,
    type: cat.type,
    subcategories: cat.subcategories,
  }));
}

/**
 * Search transactions by description or category
 */
export async function searchTransactions(params: {
  query: string;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<Array<{
  date: Date;
  description: string;
  category: string;
  amount: number;
  account: string;
}>> {
  const permission = checkChatbotPermission();
  if (!permission.allowed) {
    throw new Error(permission.reason);
  }

  const { query, limit = 50, startDate, endDate } = params;

  // Get all transactions (or within date range)
  let transactions: Transaction[];

  if (startDate && endDate) {
    transactions = await db.transactions
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  } else {
    transactions = await db.transactions.toArray();
  }

  // Filter by query (description or category)
  const queryLower = query.toLowerCase();
  const filtered = transactions.filter(tx =>
    tx.description.toLowerCase().includes(queryLower) ||
    tx.category?.toLowerCase().includes(queryLower)
  );

  // Get account names
  const accountMap = new Map<string, string>();
  const accounts = await db.accounts.toArray();
  for (const account of accounts) {
    accountMap.set(account.id, account.name);
  }

  // Sort by date (most recent first)
  const sorted = filtered.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Return limited results
  return sorted.slice(0, limit).map(tx => ({
    date: new Date(tx.date),
    description: tx.description,
    category: tx.category || 'Uncategorized',
    amount: tx.amount,
    account: accountMap.get(tx.accountId) || 'Unknown Account',
  }));
}

/**
 * Get financial summary (overview of all data)
 */
export async function getFinancialSummary(): Promise<{
  accounts: {
    totalBalance: number;
    accountCount: number;
  };
  budgets: {
    totalBudgeted: number;
    totalSpent: number;
    budgetsOverLimit: number;
  };
  loans: {
    totalPrincipal: number;
    totalRemaining: number;
    loanCount: number;
  };
  recentActivity: {
    transactionCount: number;
    lastTransaction?: Date;
  };
}> {
  const permission = checkChatbotPermission();
  if (!permission.allowed) {
    throw new Error(permission.reason);
  }

  // Get account data
  const accountSummaries = await getAccountSummaries();
  const totalBalance = accountSummaries.reduce((sum, acc) => sum + acc.balance, 0);

  // Get budget data
  const budgetStatuses = await getBudgetStatus();
  const totalBudgeted = budgetStatuses.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgetStatuses.reduce((sum, b) => sum + b.spent, 0);
  const budgetsOverLimit = budgetStatuses.filter(b => b.isOverBudget).length;

  // Get loan data
  const loanSummaries = await getLoanSummaries();
  const totalPrincipal = loanSummaries.reduce((sum, l) => sum + l.principal, 0);
  const totalRemaining = loanSummaries.reduce((sum, l) => sum + l.remainingBalance, 0);

  // Get recent activity
  const allTransactions = await db.transactions.toArray();
  const lastTransaction = allTransactions.length > 0
    ? new Date(Math.max(...allTransactions.map(tx => new Date(tx.date).getTime())))
    : undefined;

  return {
    accounts: {
      totalBalance,
      accountCount: accountSummaries.length,
    },
    budgets: {
      totalBudgeted,
      totalSpent,
      budgetsOverLimit,
    },
    loans: {
      totalPrincipal,
      totalRemaining,
      loanCount: loanSummaries.length,
    },
    recentActivity: {
      transactionCount: allTransactions.length,
      lastTransaction,
    },
  };
}

// ============================================================================
// ACTION FUNCTIONS (require full-access permission)
// ============================================================================

/**
 * Add a new transaction (requires full-access permission)
 */
export async function addTransaction(params: {
  accountId: string;
  date: Date;
  description: string;
  amount: number;
  category: string;
  subcategory?: string;
  notes?: string;
  merchant?: string;
  tags?: string[];
}): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
}> {
  // Check permission
  const permission = checkChatbotActionPermission();
  if (!permission.allowed) {
    return { success: false, error: permission.reason };
  }

  // Validate required fields
  if (!params.accountId) {
    return { success: false, error: 'Account ID is required' };
  }
  if (!params.date) {
    return { success: false, error: 'Date is required' };
  }
  if (!params.description || params.description.trim() === '') {
    return { success: false, error: 'Description is required' };
  }
  if (typeof params.amount !== 'number' || isNaN(params.amount)) {
    return { success: false, error: 'Valid amount is required' };
  }
  if (params.amount === 0) {
    return { success: false, error: 'Amount cannot be zero' };
  }
  if (!params.category || params.category.trim() === '') {
    return { success: false, error: 'Category is required' };
  }

  // Verify account exists
  const account = await db.accounts.get(params.accountId);
  if (!account) {
    return { success: false, error: `Account not found: ${params.accountId}` };
  }

  // Create transaction object
  const transaction: Transaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    accountId: params.accountId,
    date: params.date,
    description: params.description.trim(),
    amount: params.amount,
    category: params.category.trim(),
    subcategory: params.subcategory?.trim() || null,
    notes: params.notes?.trim() || '',
    merchant: params.merchant?.trim(),
    tags: params.tags || [],
    isRecurring: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Add to database
  try {
    await db.transactions.add(transaction);
    return {
      success: true,
      transactionId: transaction.id,
    };
  } catch (error: any) {
    console.error('[Chatbot] Failed to add transaction:', error);
    return {
      success: false,
      error: `Failed to add transaction: ${error.message}`,
    };
  }
}

/**
 * Create a new budget (requires full-access permission)
 */
export async function createBudget(params: {
  category: string;
  amount: number;
  period: 'monthly' | 'annual';
  startDate: Date;
  rollover?: boolean;
}): Promise<{
  success: boolean;
  budgetId?: string;
  error?: string;
}> {
  // Check permission
  const permission = checkChatbotActionPermission();
  if (!permission.allowed) {
    return { success: false, error: permission.reason };
  }

  // Validate required fields
  if (!params.category || params.category.trim() === '') {
    return { success: false, error: 'Category is required' };
  }
  if (typeof params.amount !== 'number' || isNaN(params.amount)) {
    return { success: false, error: 'Valid amount is required' };
  }
  if (params.amount <= 0) {
    return { success: false, error: 'Amount must be greater than zero' };
  }
  if (!params.period || !['monthly', 'annual'].includes(params.period)) {
    return { success: false, error: 'Period must be "monthly" or "annual"' };
  }
  if (!params.startDate) {
    return { success: false, error: 'Start date is required' };
  }

  // Check if budget already exists for this category and period
  const existingBudgets = await db.budgets.toArray();
  const duplicate = existingBudgets.find(
    b => b.categoryId === params.category && b.period === params.period
  );

  if (duplicate) {
    return {
      success: false,
      error: `A ${params.period} budget already exists for ${params.category}. Update it instead.`,
    };
  }

  // Create budget object
  const budget: Budget = {
    id: `budget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    categoryId: params.category, // Note: Using category name as ID for simplicity
    amount: params.amount,
    period: params.period,
    startDate: params.startDate,
    endDate: null,
    rollover: params.rollover || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Add to database
  try {
    await db.budgets.add(budget);
    return {
      success: true,
      budgetId: budget.id,
    };
  } catch (error: any) {
    console.error('[Chatbot] Failed to create budget:', error);
    return {
      success: false,
      error: `Failed to create budget: ${error.message}`,
    };
  }
}

/**
 * Update an existing transaction (requires full-access permission)
 */
export async function updateTransaction(params: {
  transactionId: string;
  description?: string;
  amount?: number;
  category?: string;
  subcategory?: string;
  notes?: string;
  date?: Date;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  // Check permission
  const permission = checkChatbotActionPermission();
  if (!permission.allowed) {
    return { success: false, error: permission.reason };
  }

  // Validate transaction ID
  if (!params.transactionId) {
    return { success: false, error: 'Transaction ID is required' };
  }

  // Get existing transaction
  const existing = await db.transactions.get(params.transactionId);
  if (!existing) {
    return { success: false, error: `Transaction not found: ${params.transactionId}` };
  }

  // Validate new values if provided
  if (params.amount !== undefined) {
    if (typeof params.amount !== 'number' || isNaN(params.amount)) {
      return { success: false, error: 'Invalid amount' };
    }
    if (params.amount === 0) {
      return { success: false, error: 'Amount cannot be zero' };
    }
  }

  // Build update object
  const updates: Partial<Transaction> = {
    updatedAt: new Date(),
  };

  if (params.description !== undefined) {
    updates.description = params.description.trim();
  }
  if (params.amount !== undefined) {
    updates.amount = params.amount;
  }
  if (params.category !== undefined) {
    updates.category = params.category.trim();
  }
  if (params.subcategory !== undefined) {
    updates.subcategory = params.subcategory.trim() || null;
  }
  if (params.notes !== undefined) {
    updates.notes = params.notes.trim();
  }
  if (params.date !== undefined) {
    updates.date = params.date;
  }

  // Update in database
  try {
    await db.transactions.update(params.transactionId, updates);
    return { success: true };
  } catch (error: any) {
    console.error('[Chatbot] Failed to update transaction:', error);
    return {
      success: false,
      error: `Failed to update transaction: ${error.message}`,
    };
  }
}

/**
 * Update an existing budget (requires full-access permission)
 */
export async function updateBudget(params: {
  budgetId: string;
  amount?: number;
  rollover?: boolean;
  endDate?: Date | null;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  // Check permission
  const permission = checkChatbotActionPermission();
  if (!permission.allowed) {
    return { success: false, error: permission.reason };
  }

  // Validate budget ID
  if (!params.budgetId) {
    return { success: false, error: 'Budget ID is required' };
  }

  // Get existing budget
  const existing = await db.budgets.get(params.budgetId);
  if (!existing) {
    return { success: false, error: `Budget not found: ${params.budgetId}` };
  }

  // Validate new values if provided
  if (params.amount !== undefined) {
    if (typeof params.amount !== 'number' || isNaN(params.amount)) {
      return { success: false, error: 'Invalid amount' };
    }
    if (params.amount <= 0) {
      return { success: false, error: 'Amount must be greater than zero' };
    }
  }

  // Build update object
  const updates: Partial<Budget> = {
    updatedAt: new Date(),
  };

  if (params.amount !== undefined) {
    updates.amount = params.amount;
  }
  if (params.rollover !== undefined) {
    updates.rollover = params.rollover;
  }
  if (params.endDate !== undefined) {
    updates.endDate = params.endDate;
  }

  // Update in database
  try {
    await db.budgets.update(params.budgetId, updates);
    return { success: true };
  } catch (error: any) {
    console.error('[Chatbot] Failed to update budget:', error);
    return {
      success: false,
      error: `Failed to update budget: ${error.message}`,
    };
  }
}
