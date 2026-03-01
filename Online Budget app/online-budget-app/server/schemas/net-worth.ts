import { z } from "zod";

const currencyCode = z.string().length(3);

export const createNetWorthSnapshotSchema = z.object({
  snapshot_date: z.string().date(),
  total_assets_minor: z.number().int(),
  total_liabilities_minor: z.number().int(),
  net_worth_minor: z.number().int(),
  breakdown: z.record(z.string(), z.unknown()).nullable().optional(),
  currency: currencyCode,
});

export type CreateNetWorthSnapshotInput = z.infer<typeof createNetWorthSnapshotSchema>;
