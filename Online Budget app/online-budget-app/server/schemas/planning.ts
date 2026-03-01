import { z } from "zod";

const currencyCode = z.string().length(3);

// ── Future Purchases ──────────────────────────────────────────────────

export const createFuturePurchaseSchema = z.object({
  name: z.string().min(1).max(255),
  target_amount_minor: z.number().int(),
  current_savings_minor: z.number().int().optional().default(0),
  monthly_savings_minor: z.number().int().optional().default(0),
  target_date: z.string().date().nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  currency: currencyCode,
});

export const updateFuturePurchaseSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    target_amount_minor: z.number().int().optional(),
    current_savings_minor: z.number().int().optional(),
    monthly_savings_minor: z.number().int().optional(),
    target_date: z.string().date().nullable().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    currency: currencyCode.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateFuturePurchaseInput = z.infer<typeof createFuturePurchaseSchema>;
export type UpdateFuturePurchaseInput = z.infer<typeof updateFuturePurchaseSchema>;

// ── Retirement Plans ──────────────────────────────────────────────────

export const createRetirementPlanSchema = z.object({
  current_age: z.number().int().min(1).max(120),
  retirement_age: z.number().int().min(1).max(120).optional().default(65),
  current_savings_minor: z.number().int().optional().default(0),
  monthly_contribution_minor: z.number().int().optional().default(0),
  expected_return_percent: z.number().min(0).max(100).optional().default(7.0),
  currency: currencyCode,
  notes: z.string().max(1000).nullable().optional(),
});

export const updateRetirementPlanSchema = z
  .object({
    current_age: z.number().int().min(1).max(120).optional(),
    retirement_age: z.number().int().min(1).max(120).optional(),
    current_savings_minor: z.number().int().optional(),
    monthly_contribution_minor: z.number().int().optional(),
    expected_return_percent: z.number().min(0).max(100).optional(),
    currency: currencyCode.optional(),
    notes: z.string().max(1000).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateRetirementPlanInput = z.infer<typeof createRetirementPlanSchema>;
export type UpdateRetirementPlanInput = z.infer<typeof updateRetirementPlanSchema>;

// ── Paycheck Plans ────────────────────────────────────────────────────

const allocationSchema = z.object({
  label: z.string().min(1).max(255),
  amount_minor: z.number().int(),
});

export const createPaycheckPlanSchema = z.object({
  schedule_type: z.enum(["weekly", "biweekly", "semimonthly", "monthly"]),
  pay_amount_minor: z.number().int(),
  next_pay_date: z.string().date(),
  currency: currencyCode,
  allocations: z.array(allocationSchema).optional().default([]),
});

export const updatePaycheckPlanSchema = z
  .object({
    schedule_type: z.enum(["weekly", "biweekly", "semimonthly", "monthly"]).optional(),
    pay_amount_minor: z.number().int().optional(),
    next_pay_date: z.string().date().optional(),
    currency: currencyCode.optional(),
    allocations: z.array(allocationSchema).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreatePaycheckPlanInput = z.infer<typeof createPaycheckPlanSchema>;
export type UpdatePaycheckPlanInput = z.infer<typeof updatePaycheckPlanSchema>;
