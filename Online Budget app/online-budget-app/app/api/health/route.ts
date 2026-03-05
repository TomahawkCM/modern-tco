import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

interface ServiceStatus {
  status: "up" | "down";
  latency_ms?: number;
  error?: string;
}

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  services: Record<string, ServiceStatus>;
}

async function checkDatabase(): Promise<ServiceStatus> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return { status: "down", error: "Missing Supabase credentials" };
  }

  const start = performance.now();
  try {
    const supabase = createSupabaseClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Lightweight query to verify DB connectivity
    const { error } = await supabase.from("users").select("id").limit(1);
    const latency_ms = Math.round(performance.now() - start);

    if (error) {
      return { status: "down", latency_ms, error: error.message };
    }
    return { status: "up", latency_ms };
  } catch (e) {
    const latency_ms = Math.round(performance.now() - start);
    return { status: "down", latency_ms, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

function checkStripe(): ServiceStatus {
  return process.env.STRIPE_SECRET_KEY
    ? { status: "up" }
    : { status: "down", error: "STRIPE_SECRET_KEY not configured" };
}

function checkPlaid(): ServiceStatus {
  return process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET
    ? { status: "up" }
    : { status: "down", error: "Plaid credentials not configured" };
}

function checkAnthropic(): ServiceStatus {
  return process.env.ANTHROPIC_API_KEY
    ? { status: "up" }
    : { status: "down", error: "ANTHROPIC_API_KEY not configured" };
}

function checkEncryption(): ServiceStatus {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    return process.env.NODE_ENV === "production"
      ? { status: "down", error: "ENCRYPTION_KEY required in production" }
      : { status: "up" };
  }
  if (key.length !== 64 || !/^[0-9a-fA-F]+$/.test(key)) {
    return { status: "down", error: "ENCRYPTION_KEY must be 64 hex chars" };
  }
  return { status: "up" };
}

export async function GET() {
  const dbStatus = await checkDatabase();

  const services: Record<string, ServiceStatus> = {
    database: dbStatus,
    stripe: checkStripe(),
    plaid: checkPlaid(),
    anthropic: checkAnthropic(),
    encryption: checkEncryption(),
  };

  const downServices = Object.values(services).filter((s) => s.status === "down");
  let status: HealthResponse["status"];

  const dbService = services["database"];
  if (downServices.length === 0) {
    status = "healthy";
  } else if (dbService && dbService.status === "down") {
    // Database is critical — unhealthy
    status = "unhealthy";
  } else {
    // Non-critical service down — degraded
    status = "degraded";
  }

  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: "0.1.0",
    services,
  };

  return NextResponse.json(response, {
    status: status === "unhealthy" ? 503 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
