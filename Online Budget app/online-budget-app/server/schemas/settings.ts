import { z } from "zod";

export const updateSettingsSchema = z
  .object({
    locale: z.string().min(2).max(10).optional(),
    language: z.string().min(2).max(10).optional(),
    primary_currency: z.string().length(3).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
