import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy File (Next.js 16+)
 *
 * Renamed from middleware.ts as part of Next.js 16 migration.
 * In Next.js 16, this file is called "proxy.ts" to clarify network boundary.
 *
 * IMPORTANT: Runtime is Node.js (NOT edge). Edge runtime is no longer supported
 * for proxy files in Next.js 16. The runtime cannot be configured.
 *
 * Note: Function must be named "proxy" or exported as default in Next.js 16
 */

/**
 * Security: CORS Configuration
 * Explicit whitelist of allowed origins for API routes
 */
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  "https://modern-tco.vercel.app",
  "https://www.modern-tco.com",
  // Development origins
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
];

/**
 * Supabase middleware helper to refresh auth session
 */
async function updateSupabaseSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the auth session if expired
  await supabase.auth.getUser();

  return supabaseResponse;
}

/**
 * Proxy function: Route rewrites, Supabase auth, and security headers
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin") || "";

  // Root path rewrite to /welcome
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/welcome";
    return NextResponse.rewrite(url);
  }

  // Security: CORS headers for API routes
  if (pathname.startsWith("/api/")) {
    // Preflight request (OPTIONS)
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : "",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
          "Access-Control-Max-Age": "86400", // 24 hours
        },
      });
    }

    // Regular API request
    const response = NextResponse.next();

    // Only set CORS headers if origin is whitelisted
    if (ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With"
      );
    }

    // Security headers for all API responses
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    return response;
  }

  // Refresh Supabase auth session for all other routes
  return await updateSupabaseSession(req);
}

export const config = {
  matcher: ["/((?!_next|static|.*\\..*).*)"],
};
