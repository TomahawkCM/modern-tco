import { z } from "zod";

const currencyCode = z.string().length(3);

const bulkTransactionItem = z.object({
  account_id: z.string().uuid(),
  amount_minor: z.number().int(),
  currency: currencyCode,
  transaction_date: z.string().date(),
  description: z.string().max(500).optional(),
  merchant_name: z.string().max(255).optional(),
  category_id: z.string().uuid().optional(),
  fitid: z.string().max(255).optional(),
});

export const bulkCreateTransactionsSchema = z.object({
  transactions: z.array(bulkTransactionItem).min(1).max(1000),
});

export const checkDuplicatesSchema = z.object({
  fitids: z.array(z.string().max(255)).min(1).max(5000),
});

export const recordImportSchema = z.object({
  filename: z.string().min(1).max(500),
  bank_slug: z.string().max(100).optional(),
  row_count: z.number().int().min(0),
  imported_count: z.number().int().min(0),
  skipped_count: z.number().int().min(0).optional().default(0),
});

export type BulkTransactionItem = z.infer<typeof bulkTransactionItem>;
export type BulkCreateTransactionsInput = z.infer<typeof bulkCreateTransactionsSchema>;
export type CheckDuplicatesInput = z.infer<typeof checkDuplicatesSchema>;
export type RecordImportInput = z.infer<typeof recordImportSchema>;
