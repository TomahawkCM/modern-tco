import { z } from "zod";

const currencyCode = z.string().length(3);

export const createInvestmentAccountSchema = z.object({
  name: z.string().min(1).max(255),
  account_type: z.enum(["brokerage", "rrsp", "tfsa", "401k", "ira", "roth_ira", "other"]),
  institution: z.string().max(255).nullable().optional(),
  currency: currencyCode,
});

export const updateInvestmentAccountSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    account_type: z
      .enum(["brokerage", "rrsp", "tfsa", "401k", "ira", "roth_ira", "other"])
      .optional(),
    institution: z.string().max(255).nullable().optional(),
    currency: currencyCode.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const createHoldingSchema = z.object({
  investment_account_id: z.string().uuid(),
  symbol: z.string().min(1).max(10),
  name: z.string().max(255).nullable().optional(),
  shares: z.number().positive(),
  purchase_price_minor: z.number().int(),
  purchase_date: z.string().date().optional(),
  currency: currencyCode,
});

export const updateHoldingSchema = z
  .object({
    symbol: z.string().min(1).max(10).optional(),
    name: z.string().max(255).nullable().optional(),
    shares: z.number().positive().optional(),
    purchase_price_minor: z.number().int().optional(),
    purchase_date: z.string().date().nullable().optional(),
    currency: currencyCode.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateInvestmentAccountInput = z.infer<typeof createInvestmentAccountSchema>;
export type UpdateInvestmentAccountInput = z.infer<typeof updateInvestmentAccountSchema>;
export type CreateHoldingInput = z.infer<typeof createHoldingSchema>;
export type UpdateHoldingInput = z.infer<typeof updateHoldingSchema>;
