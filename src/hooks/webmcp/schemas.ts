/**
 * Zod input schemas for all WebMCP tools.
 */

import { z } from "zod";

export const SearchTransactionsInput = z.object({
  query: z.string().optional().describe("Free-text search query"),
  category: z.string().optional().describe("Filter by category name"),
  startDate: z.string().optional().describe("Start date (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("End date (YYYY-MM-DD)"),
  minAmount: z.number().optional().describe("Minimum absolute amount"),
  maxAmount: z.number().optional().describe("Maximum absolute amount"),
  type: z.enum(["expense", "income"]).optional().describe("Transaction type"),
  accountId: z.string().optional().describe("Filter by account ID"),
  merchant: z.string().optional().describe("Filter by merchant name"),
  tags: z.array(z.string()).optional().describe("Filter by tags"),
  limit: z.number().int().min(1).max(100).default(25).describe("Max results (1-100, default 25)"),
  sortBy: z.enum(["relevance", "date", "amount"]).default("date").describe("Sort field"),
  sortDirection: z.enum(["asc", "desc"]).default("desc").describe("Sort direction"),
});
export type SearchTransactionsInput = z.infer<typeof SearchTransactionsInput>;

export const GetBudgetSummaryInput = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional()
    .describe("Month in YYYY-MM format (defaults to current month)"),
});
export type GetBudgetSummaryInput = z.infer<typeof GetBudgetSummaryInput>;

export const GetSpendingByCategoryInput = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional()
    .describe("Month in YYYY-MM format (defaults to current month)"),
  type: z.enum(["expense", "income"]).default("expense").describe("Transaction type to summarize"),
});
export type GetSpendingByCategoryInput = z.infer<typeof GetSpendingByCategoryInput>;

export const GetAccountBalancesInput = z.object({
  accountId: z.string().optional().describe("Specific account ID (omit for all accounts)"),
});
export type GetAccountBalancesInput = z.infer<typeof GetAccountBalancesInput>;

export const ListCategoriesInput = z.object({
  type: z.enum(["expense", "income", "all"]).default("all").describe("Filter by category type"),
  includeArchived: z.boolean().default(false).describe("Include archived categories"),
});
export type ListCategoriesInput = z.infer<typeof ListCategoriesInput>;

export const GetSubscriptionsInput = z.object({
  status: z
    .enum(["active", "paused", "cancelled", "trial", "all"])
    .default("active")
    .describe("Filter by subscription status"),
});
export type GetSubscriptionsInput = z.infer<typeof GetSubscriptionsInput>;

export const AddTransactionInput = z.object({
  accountId: z.string().describe("Account ID to add transaction to"),
  date: z.string().describe("Transaction date (YYYY-MM-DD)"),
  description: z.string().describe("Transaction description"),
  amount: z.number().describe("Amount (negative for expenses, positive for income)"),
  category: z.string().optional().describe("Category name"),
  subcategory: z.string().optional().describe("Subcategory name"),
  merchant: z.string().optional().describe("Merchant name"),
  notes: z.string().optional().describe("Additional notes"),
  tags: z.array(z.string()).optional().describe("Tags"),
});
export type AddTransactionInput = z.infer<typeof AddTransactionInput>;

export const CategorizeTransactionInput = z.object({
  transactionId: z.string().describe("Transaction ID to categorize"),
  category: z.string().describe("New category name"),
  subcategory: z.string().optional().describe("New subcategory name"),
});
export type CategorizeTransactionInput = z.infer<typeof CategorizeTransactionInput>;

export const SetBudgetLimitInput = z.object({
  categoryId: z.string().describe("Category ID to set budget for"),
  amount: z.number().positive().describe("Budget limit amount (must be positive)"),
  period: z.enum(["monthly", "annual"]).default("monthly").describe("Budget period"),
  rollover: z.boolean().default(false).describe("Carry unused budget to next period"),
});
export type SetBudgetLimitInput = z.infer<typeof SetBudgetLimitInput>;
