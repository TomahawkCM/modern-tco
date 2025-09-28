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

// Create a typed client with proper error handling
// If environment variables are missing, create a no-op client to prevent runtime errors
let supabaseClient: SupabaseClient<Database>;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    ) as unknown as SupabaseClient<Database>;
  } else {
    // Create a mock client that won't crash but logs warnings
    console.warn("Supabase environment variables not configured. Database features will be disabled.");
    supabaseClient = {
      auth: {
        signIn: async () => ({ data: null, error: new Error("Supabase not configured") }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: null, error: null }),
      },
      from: () => ({
        select: () => ({ data: [], error: new Error("Supabase not configured") }),
        insert: () => ({ data: null, error: new Error("Supabase not configured") }),
        update: () => ({ data: null, error: new Error("Supabase not configured") }),
        delete: () => ({ data: null, error: new Error("Supabase not configured") }),
      }),
    } as any;
  }
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
  // Provide fallback client
  supabaseClient = {
    auth: {
      signIn: async () => ({ data: null, error: new Error("Supabase initialization failed") }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: null, error: null }),
    },
    from: () => ({
      select: () => ({ data: [], error: new Error("Supabase initialization failed") }),
      insert: () => ({ data: null, error: new Error("Supabase initialization failed") }),
      update: () => ({ data: null, error: new Error("Supabase initialization failed") }),
      delete: () => ({ data: null, error: new Error("Supabase initialization failed") }),
    }),
  } as any;
}

export const supabase = supabaseClient;

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
