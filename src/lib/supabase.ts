import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Environment variable validation - NO FALLBACK VALUES for security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate required environment variables
// Be strict in production, permissive in dev/test to avoid import-time crashes in tests.
const isProd = process.env.NODE_ENV === "production";
if (isProd) {
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required. Check your .env.local file.");
  }
  if (!supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Check your .env.local file.");
  }
}

// Debug logging removed for production compliance

// Create a typed client. Call-sites may cast to `any` where strict types are too narrow.
export const supabase = createClient<Database>(
  (supabaseUrl || "") as string,
  (supabaseAnonKey || "") as string
) as unknown as SupabaseClient<Database>;

// Server-side client for admin operations
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? ((createClient<Database>(
      (supabaseUrl || "") as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    ) as unknown) as SupabaseClient<Database>)
  : null;
