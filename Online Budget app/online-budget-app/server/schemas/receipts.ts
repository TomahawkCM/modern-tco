import { z } from "zod";

// ── Receipts ─────────────────────────────────────────────────────────

export const createReceiptSchema = z.object({
  transaction_id: z.string().uuid().nullable().optional(),
  storage_path: z.string().min(1),
  extracted_data: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const updateReceiptSchema = z
  .object({
    transaction_id: z.string().uuid().nullable().optional(),
    extracted_data: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;
export type UpdateReceiptInput = z.infer<typeof updateReceiptSchema>;
