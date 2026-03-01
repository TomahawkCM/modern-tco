import { z } from "zod";

const currencyCode = z.string().length(3);

export const createLoanSchema = z.object({
  name: z.string().min(1).max(255),
  loan_type: z.enum(["mortgage", "auto", "personal", "student", "other"]),
  original_balance_minor: z.number().int(),
  current_balance_minor: z.number().int(),
  interest_rate: z.number().min(0).max(100),
  minimum_payment_minor: z.number().int().optional().default(0),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  status: z.enum(["active", "paid_off", "refinanced", "defaulted"]).optional().default("active"),
  currency: currencyCode,
});

export const updateLoanSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    loan_type: z.enum(["mortgage", "auto", "personal", "student", "other"]).optional(),
    original_balance_minor: z.number().int().optional(),
    current_balance_minor: z.number().int().optional(),
    interest_rate: z.number().min(0).max(100).optional(),
    minimum_payment_minor: z.number().int().optional(),
    start_date: z.string().date().nullable().optional(),
    end_date: z.string().date().nullable().optional(),
    status: z.enum(["active", "paid_off", "refinanced", "defaulted"]).optional(),
    currency: currencyCode.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const createLoanPaymentSchema = z.object({
  loan_id: z.string().uuid(),
  amount_minor: z.number().int(),
  payment_date: z.string().date(),
  principal_minor: z.number().int().optional(),
  interest_minor: z.number().int().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;
export type CreateLoanPaymentInput = z.infer<typeof createLoanPaymentSchema>;
