import { z } from "zod";

// ── Split Persons ────────────────────────────────────────────────────

export const createSplitPersonSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().nullable().optional(),
});

export const updateSplitPersonSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateSplitPersonInput = z.infer<typeof createSplitPersonSchema>;
export type UpdateSplitPersonInput = z.infer<typeof updateSplitPersonSchema>;

// ── Expense Splits ───────────────────────────────────────────────────

export const createExpenseSplitSchema = z.object({
  transaction_id: z.string().uuid().nullable().optional(),
  person_id: z.string().uuid(),
  amount_minor: z.number().int(),
  is_settled: z.boolean().optional().default(false),
});

export const updateExpenseSplitSchema = z
  .object({
    is_settled: z.boolean().optional(),
    amount_minor: z.number().int().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateExpenseSplitInput = z.infer<typeof createExpenseSplitSchema>;
export type UpdateExpenseSplitInput = z.infer<typeof updateExpenseSplitSchema>;
