import { z } from "zod";

const currencyCode = z.string().length(3);

// ── Event Budgets ────────────────────────────────────────────────────

export const createEventBudgetSchema = z.object({
  name: z.string().min(1).max(255),
  total_budget_minor: z.number().int(),
  start_date: z.string().date().nullable().optional(),
  end_date: z.string().date().nullable().optional(),
  currency: currencyCode,
});

export const updateEventBudgetSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    total_budget_minor: z.number().int().optional(),
    start_date: z.string().date().nullable().optional(),
    end_date: z.string().date().nullable().optional(),
    currency: currencyCode.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateEventBudgetInput = z.infer<typeof createEventBudgetSchema>;
export type UpdateEventBudgetInput = z.infer<typeof updateEventBudgetSchema>;

// ── Event Budget Items ───────────────────────────────────────────────

export const createEventBudgetItemSchema = z.object({
  event_budget_id: z.string().uuid(),
  category_name: z.string().min(1).max(255),
  budget_minor: z.number().int(),
  spent_minor: z.number().int().optional().default(0),
  notes: z.string().max(1000).nullable().optional(),
});

export const updateEventBudgetItemSchema = z
  .object({
    category_name: z.string().min(1).max(255).optional(),
    budget_minor: z.number().int().optional(),
    spent_minor: z.number().int().optional(),
    notes: z.string().max(1000).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateEventBudgetItemInput = z.infer<typeof createEventBudgetItemSchema>;
export type UpdateEventBudgetItemInput = z.infer<typeof updateEventBudgetItemSchema>;
