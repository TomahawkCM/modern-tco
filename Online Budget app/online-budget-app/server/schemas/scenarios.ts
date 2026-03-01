import { z } from "zod";

// ── Financial Scenarios ──────────────────────────────────────────────

export const createScenarioSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable().optional(),
  config: z.record(z.string(), z.unknown()).optional().default({}),
  results: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const updateScenarioSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).nullable().optional(),
    config: z.record(z.string(), z.unknown()).optional(),
    results: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateScenarioInput = z.infer<typeof createScenarioSchema>;
export type UpdateScenarioInput = z.infer<typeof updateScenarioSchema>;
