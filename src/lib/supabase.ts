import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { createClient as createBrowserClient } from "@/utils/supabase/client";

/**
 * SINGLETON PATTERN: Reuse the browser client from utils/supabase/client.ts
 * to avoid "Multiple GoTrueClient instances" warning.
 *
 * This module provides backward compatibility for code that imports from here.
 */

// For browser context, use the singleton browser client
// This prevents multiple GoTrueClient instances
const getBrowserClient = () => {
  if (typeof window !== 'undefined') {
    return createBrowserClient();
  }
  return null;
};

// Environment variable validation for server-side usage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a typed client with proper singleton handling
let supabaseClient: SupabaseClient<Database>;

// Check if we're in browser context first
const browserClient = getBrowserClient();

if (browserClient) {
  // Use the singleton browser client
  supabaseClient = browserClient as SupabaseClient<Database>;
} else if (supabaseUrl && supabaseAnonKey) {
  // Server-side: create a new client (safe since each request is isolated)
  supabaseClient = createSupabaseClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false, // No session persistence on server
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'X-Client-Info': 'modern-tco-lms',
        },
      },
    }
  );
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
  } as unknown as SupabaseClient<Database>;
}

export const supabase = supabaseClient;

// Server-side client for admin operations
// Only create if BOTH supabaseUrl and service role key are available
export const supabaseAdmin = (supabaseUrl && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? createSupabaseClient<Database>(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null;
