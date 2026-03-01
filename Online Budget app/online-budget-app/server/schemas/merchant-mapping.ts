import { z } from "zod";

export const createMerchantMappingSchema = z.object({
  merchant_token: z
    .string()
    .min(1)
    .max(255)
    .transform((v) => v.trim().toUpperCase()),
  display_name: z.string().min(1).max(255),
  category_id: z.string().uuid(),
});

export const listMerchantMappingsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type CreateMerchantMappingInput = z.infer<
  typeof createMerchantMappingSchema
>;
export type ListMerchantMappingsInput = z.infer<
  typeof listMerchantMappingsSchema
>;
