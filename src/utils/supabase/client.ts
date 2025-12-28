import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

/**
 * Browser client for Supabase using SSR package
 * This client stores sessions in cookies (not localStorage)
 * so that server actions and middleware can access them.
 *
 * SINGLETON PATTERN: Reuse the same client instance to avoid
 * "Multiple GoTrueClient instances" warning.
 */
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return browserClient;
}
