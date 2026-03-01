import { z } from "zod";

const currencyCode = z.string().length(3);

export const createPropertySchema = z.object({
  address: z.string().min(1).max(500),
  purchase_price_minor: z.number().int().optional(),
  current_value_minor: z.number().int().optional(),
  mortgage_balance_minor: z.number().int().optional().default(0),
  monthly_expenses_minor: z.number().int().optional().default(0),
  purchase_date: z.string().date().optional(),
  currency: currencyCode,
  notes: z.string().max(1000).nullable().optional(),
});

export const updatePropertySchema = z
  .object({
    address: z.string().min(1).max(500).optional(),
    purchase_price_minor: z.number().int().nullable().optional(),
    current_value_minor: z.number().int().nullable().optional(),
    mortgage_balance_minor: z.number().int().optional(),
    monthly_expenses_minor: z.number().int().optional(),
    purchase_date: z.string().date().nullable().optional(),
    currency: currencyCode.optional(),
    notes: z.string().max(1000).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
