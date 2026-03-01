import { z } from "zod";

export const reportQuerySchema = z.object({
  startDate: z.string().date(),
  endDate: z.string().date(),
});

export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
