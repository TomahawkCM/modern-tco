import { z } from "zod";

export const budgetMethodologySchema = z.enum([
  "envelope",
  "zero_based",
  "fifty_thirty_twenty",
  "pay_yourself_first",
]);

export const updateSettingsSchema = z
  .object({
    locale: z.string().min(2).max(10).optional(),
    language: z.string().min(2).max(10).optional(),
    primary_currency: z.string().length(3).optional(),
    budget_methodology: budgetMethodologySchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
