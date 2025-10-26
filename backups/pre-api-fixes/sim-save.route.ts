import type { NextRequest } from "next/server";
import { runSimulator } from "@/lib/simulator-runner";
import {
  withErrorTracking,
  ApiError,
  apiSuccess,
  apiError,
  validateBody,
} from "@/lib/error-tracking";

type SavePayload = {
  name: string;
  question: string;
};

export const POST = withErrorTracking(
  async (request: NextRequest) => {
    // Check if simulator is enabled in production
    if (process.env.NODE_ENV === "production" && process.env["ENABLE_SIMULATOR"] !== "true") {
      throw new ApiError(
        "Simulator endpoints are disabled in production",
        501,
        "SIMULATOR_DISABLED"
      );
    }

    // Parse and validate request body
    let payload: unknown;
    try {
      payload = await request.json();
    } catch (error) {
      throw new ApiError("Invalid JSON body", 400, "INVALID_JSON");
    }

    // Validate required fields
    const validatedPayload = validateBody<SavePayload>(payload, {
      name: {
        required: true,
        type: "string",
        validate: (v) => v.length > 0 && v.length <= 100,
      },
      question: {
        required: true,
        type: "string",
        validate: (v) => v.length > 0 && v.length <= 1000,
      },
    });

    // Run the simulator
    try {
      const result = await runSimulator([
        "--json",
        "--save",
        validatedPayload.name,
        "-q",
        validatedPayload.question,
      ]);

      if (result?.ok === false) {
        throw new ApiError(result.error || "Simulator execution failed", 400, "SIMULATOR_ERROR");
      }

      return apiSuccess(result);
    } catch (error) {
      // Re-throw ApiErrors as-is
      if (error instanceof ApiError) {
        throw error;
      }

      // Wrap other errors
      throw new ApiError("Simulator invocation failed", 500, "SIMULATOR_INVOCATION_FAILED");
    }
  },
  { endpoint: "/api/sim-save" }
);
