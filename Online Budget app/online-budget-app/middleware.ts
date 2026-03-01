import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * CORS: Explicit whitelist of allowed origins for API routes
 */
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
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
 * Apply security headers to a response
 */
function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin") || "";

  // CORS for API routes
  if (pathname.startsWith("/api/")) {
    // Preflight request (OPTIONS)
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : "",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Regular API request
    const response = NextResponse.next();

    if (ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With"
      );
    }

    applySecurityHeaders(response);
    return response;
  }

  // Refresh Supabase auth session for all other routes
  const response = await updateSupabaseSession(req);
  applySecurityHeaders(response);
  return response;
}

export const config = {
  matcher: ["/((?!_next|static|.*\\..*).*)"],
};
