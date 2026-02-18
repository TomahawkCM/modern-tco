import { withErrorTracking, apiSuccess } from "@/lib/error-tracking";
import { HealthCheckResponseSchema, createValidatedResponse } from "@/lib/api/schemas";

export const GET = withErrorTracking(
  async () => {
    // Could add more health checks here (database, external services, etc.)
    const healthData = {
      status: "healthy" as const,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.TCO_APP_VERSION ?? "1.0.0",
    };

    // Return validated response
    return createValidatedResponse(HealthCheckResponseSchema, healthData);
  },
  { endpoint: "/api/health" }
);
