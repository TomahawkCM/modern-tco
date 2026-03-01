import { z } from "zod";

const currencyCode = z.string().length(3);

export const createTransactionSchema = z.object({
  account_id: z.string().uuid(),
  amount_minor: z.number().int(),
  currency: currencyCode,
  transaction_date: z.string().date(),
  description: z.string().max(500).optional(),
  merchant_name: z.string().max(255).optional(),
  category_id: z.string().uuid().optional(),
  is_pending: z.boolean().optional().default(false),
});

export const updateTransactionSchema = z
  .object({
    amount_minor: z.number().int().optional(),
    currency: currencyCode.optional(),
    transaction_date: z.string().date().optional(),
    description: z.string().max(500).nullable().optional(),
    merchant_name: z.string().max(255).nullable().optional(),
    category_id: z.string().uuid().nullable().optional(),
    is_pending: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const listTransactionsSchema = z.object({
  account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  from_date: z.string().date().optional(),
  to_date: z.string().date().optional(),
  is_pending: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ListTransactionsInput = z.infer<typeof listTransactionsSchema>;
