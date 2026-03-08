import { type NextRequest, NextResponse } from "next/server";

/**
 * Route filtering middleware based on NEXT_PUBLIC_APP_TARGET.
 *
 * - "tco":            Block /budget-app/* routes, budget-only APIs
 * - "budget-offline": Block non-budget routes, TCO-only APIs. Root / → /budget-app/landing
 * - "budget-online":  Same as budget-offline
 */

type AppTarget = "tco" | "budget-offline" | "budget-online";

const appTarget = (process.env.NEXT_PUBLIC_APP_TARGET ?? "tco") as AppTarget;
const isTCO = appTarget === "tco";
const isBudgetApp = appTarget.startsWith("budget-");

// Budget-only API prefixes (return 404 on TCO)
const BUDGET_API_PREFIXES = ["/api/chat", "/api/bank", "/api/import", "/api/merchants"];

// TCO-only API prefixes (return 404 on budget)
const TCO_API_PREFIXES = ["/api/v1"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- API route filtering ---
  if (pathname.startsWith("/api/")) {
    if (isTCO) {
      // Block budget-only APIs on TCO
      if (BUDGET_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    } else {
      // Block TCO-only APIs on budget
      if (TCO_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }
    return NextResponse.next();
  }

  // --- Page route filtering ---
  if (isTCO) {
    // TCO: block /budget-app/* → redirect to /
    if (pathname.startsWith("/budget-app")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (isBudgetApp) {
    // Budget: root / → redirect to /budget-app/landing
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/budget-app/landing", request.url));
    }

    // Budget: allow /budget-app/* routes
    if (pathname.startsWith("/budget-app")) {
      return NextResponse.next();
    }

    // Budget: block all other page routes → redirect to /budget-app/landing
    return NextResponse.redirect(new URL("/budget-app/landing", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|screenshots/|fonts/|sw\\.js|manifest).*)",
  ],
};
