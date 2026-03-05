/**
 * Environment variable validation using Zod.
 *
 * Imported at app startup — crashes early with a clear error
 * if any required env var is missing or malformed.
 *
 * Usage:
 *   import { env } from '@/lib/env';
 *   const url = env.NEXT_PUBLIC_SUPABASE_URL;
 */

import { z } from "zod";

const serverSchema = z.object({
  // ── Supabase ──────────────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),

  // ── Stripe ────────────────────────────────────────────────
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_PRICE_PREMIUM_MONTHLY: z.string().optional(),

  // ── Plaid ─────────────────────────────────────────────────
  PLAID_CLIENT_ID: z.string().min(1, "PLAID_CLIENT_ID is required"),
  PLAID_SECRET: z.string().min(1, "PLAID_SECRET is required"),
  PLAID_ENV: z.enum(["sandbox", "development", "production"]).default("sandbox"),

  // ── Anthropic (AI Chat) ───────────────────────────────────
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),

  // ── Encryption ────────────────────────────────────────────
  ENCRYPTION_KEY: z
    .string()
    .length(64, "ENCRYPTION_KEY must be a 64-character hex string (32 bytes)")
    .regex(/^[0-9a-fA-F]+$/, "ENCRYPTION_KEY must be hexadecimal")
    .optional(),
  // Previous keys for rotation — comma-separated 64-char hex strings
  ENCRYPTION_KEY_PREVIOUS: z
    .string()
    .regex(
      /^([0-9a-fA-F]{64})(,[0-9a-fA-F]{64})*$/,
      "ENCRYPTION_KEY_PREVIOUS must be comma-separated 64-char hex strings"
    )
    .optional(),

  // ── Sentry ────────────────────────────────────────────────
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // ── Site ──────────────────────────────────────────────────
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

/**
 * In production, ENCRYPTION_KEY is mandatory.
 */
const productionRefinement = serverSchema.refine(
  (data) => {
    if (data.NODE_ENV === "production" && !data.ENCRYPTION_KEY) return false;
    return true;
  },
  { message: "ENCRYPTION_KEY is required in production", path: ["ENCRYPTION_KEY"] }
);

function validateEnv() {
  const result = productionRefinement.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error(
      `\n❌ Environment validation failed:\n${formatted}\n\n` +
        `Fix the above issues in your .env.local or Vercel environment variables.\n`
    );

    // In production, crash hard. In dev, warn but continue.
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing or invalid environment variables");
    }
  }

  return result.success ? result.data : (process.env as unknown as z.infer<typeof serverSchema>);
}

export const env = validateEnv();

export type Env = z.infer<typeof serverSchema>;
