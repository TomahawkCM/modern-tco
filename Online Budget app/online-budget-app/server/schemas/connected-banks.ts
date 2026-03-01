import { z } from "zod";

// ── Connected Banks ──────────────────────────────────────────────────

export const createConnectedBankSchema = z.object({
  provider: z.string().min(1).max(50),
  access_token_encrypted: z.string().min(1),
  institution_id: z.string().uuid().nullable().optional(),
  status: z.enum(["active", "inactive", "error"]).optional().default("active"),
});

export const updateConnectedBankSchema = z
  .object({
    institution_id: z.string().uuid().nullable().optional(),
    last_synced_at: z.string().nullable().optional(),
    sync_cursor: z.string().nullable().optional(),
    status: z.enum(["active", "inactive", "error"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateConnectedBankInput = z.infer<typeof createConnectedBankSchema>;
export type UpdateConnectedBankInput = z.infer<typeof updateConnectedBankSchema>;
