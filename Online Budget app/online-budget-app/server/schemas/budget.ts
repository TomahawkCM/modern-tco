import { z } from "zod";

export const createBudgetSchema = z.object({
  category_id: z.string().uuid(),
  amount_minor: z.number().int().positive(),
  currency: z.string().length(3).optional(),
});

export const updateBudgetSchema = z
  .object({
    amount_minor: z.number().int().positive().optional(),
    currency: z.string().length(3).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listBudgetsSchema = z.object({
  period: z.enum(["monthly"]).optional().default("monthly"),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type ListBudgetsInput = z.infer<typeof listBudgetsSchema>;
