import { z } from "zod";

const currencyCode = z.string().length(3);

export const createUserSubscriptionSchema = z.object({
  merchant_name: z.string().min(1).max(255),
  amount_minor: z.number().int(),
  currency: currencyCode,
  frequency: z.enum(["weekly", "biweekly", "monthly", "quarterly", "annual"]),
  category_id: z.string().uuid().optional(),
  next_billing_date: z.string().date().optional(),
  is_active: z.boolean().optional().default(true),
  notes: z.string().max(1000).nullable().optional(),
});

export const updateUserSubscriptionSchema = z
  .object({
    merchant_name: z.string().min(1).max(255).optional(),
    amount_minor: z.number().int().optional(),
    currency: currencyCode.optional(),
    frequency: z.enum(["weekly", "biweekly", "monthly", "quarterly", "annual"]).optional(),
    category_id: z.string().uuid().nullable().optional(),
    next_billing_date: z.string().date().nullable().optional(),
    is_active: z.boolean().optional(),
    notes: z.string().max(1000).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateUserSubscriptionInput = z.infer<typeof createUserSubscriptionSchema>;
export type UpdateUserSubscriptionInput = z.infer<typeof updateUserSubscriptionSchema>;
