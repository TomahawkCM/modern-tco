import { z } from "zod";

export const createDebtScenarioSchema = z.object({
  name: z.string().min(1).max(255),
  strategy: z.enum(["avalanche", "snowball", "custom"]),
  extra_payment_minor: z.number().int().optional().default(0),
  config: z.record(z.string(), z.unknown()).optional().default({}),
});

export type CreateDebtScenarioInput = z.infer<typeof createDebtScenarioSchema>;
