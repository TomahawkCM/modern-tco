import { z } from "zod";

const accountType = z.enum(["checking", "savings", "credit", "investment", "loan", "other"]);

const currencyCode = z.string().length(3);

export const createAccountSchema = z.object({
  name: z.string().min(1).max(255),
  type: accountType,
  currency: currencyCode,
  balance_minor: z.number().int(),
  institution_id: z.string().uuid().optional(),
  is_manual: z.boolean().optional().default(true),
});

export const updateAccountSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    type: accountType.optional(),
    currency: currencyCode.optional(),
    balance_minor: z.number().int().optional(),
    institution_id: z.string().uuid().nullable().optional(),
    is_manual: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
