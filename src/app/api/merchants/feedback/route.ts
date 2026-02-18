/**
 * Merchant Feedback API
 *
 * POST /api/merchants/feedback
 *
 * Accepts user feedback on merchant classifications to improve accuracy over time.
 * Stores feedback events and updates merchant statistics for learning.
 *
 * Request Body:
 * {
 *   merchant_token: string;           // Normalized merchant token (e.g., "NETFLIX")
 *   chosen_category: string;          // Category user selected
 *   chosen_subcategory?: string;      // Subcategory user selected (optional)
 *   previous_category?: string;       // AI-suggested category (for corrections)
 *   previous_subcategory?: string;    // AI-suggested subcategory (for corrections)
 *   accepted_suggestion: boolean;     // true if user accepted AI suggestion
 *   user_or_tenant_key?: string;      // Hashed user/tenant ID (optional, for privacy)
 *   country?: string;                 // ISO country code (e.g., "CA", "US")
 * }
 *
 * Response:
 * {
 *   success: true;
 *   message: string;
 *   feedback_id: string;
 * }
 *
 * Flow:
 * 1. Validate input
 * 2. Look up merchant by token (or create placeholder)
 * 3. Insert feedback record into merchant_feedback table
 * 4. Update merchant counters (classification_count, user_agreement_count, user_correction_count)
 * 5. Return success
 *
 * Privacy: Uses hashed user keys, never stores raw PII
 */

import { type NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

// ============================================================================
// Types
// ============================================================================

interface FeedbackRequest {
  merchant_token: string;
  chosen_category: string;
  chosen_subcategory?: string | null;
  previous_category?: string | null;
  previous_subcategory?: string | null;
  accepted_suggestion: boolean;
  user_or_tenant_key?: string | null;
  country?: string | null;
}

interface MerchantRecord {
  id: string;
  merchant_token: string;
  canonical_name: string;
  default_category: string;
  default_subcategory: string | null;
}

// ============================================================================
// Database Operations
// ============================================================================

/**
 * Look up merchant by token, return null if not found
 */
async function getMerchantByToken(
  supabase: SupabaseClient<any>,
  merchantToken: string
): Promise<MerchantRecord | null> {
  const { data, error } = await supabase
    .from("merchants")
    .select("id, merchant_token, canonical_name, default_category, default_subcategory")
    .eq("merchant_token", merchantToken)
    .single();

  if (error || !data) {
    return null;
  }

  return data as MerchantRecord;
}

/**
 * Create placeholder merchant record for feedback
 * (Used when user provides feedback for merchant not yet in catalog)
 */
async function createPlaceholderMerchant(
  supabase: SupabaseClient<any>,
  merchantToken: string,
  category: string,
  subcategory?: string | null
): Promise<MerchantRecord> {
  const placeholderData = {
    merchant_token: merchantToken,
    canonical_name: merchantToken, // Use token as name until OpenAI classifies
    default_category: category,
    default_subcategory: subcategory || null,
    business_type: "other",
    is_subscription: false,
    confidence: 0.5, // Medium confidence for user-provided data
    source: "user",
    explanation: "User-provided classification (placeholder until AI verification)",
    classification_count: 0,
    user_agreement_count: 0,
    user_correction_count: 0,
  };

  const { data, error } = await supabase
    .from("merchants")
    .insert(placeholderData as any)
    .select("id, merchant_token, canonical_name, default_category, default_subcategory")
    .single();

  if (error) {
    console.error("Error creating placeholder merchant:", error);
    throw new Error("Failed to create merchant record");
  }

  return data as MerchantRecord;
}

/**
 * Store feedback event in merchant_feedback table
 */
async function storeFeedback(
  supabase: SupabaseClient<any>,
  merchantId: string,
  feedback: FeedbackRequest
): Promise<string> {
  // Hash user key for privacy (if provided)
  let hashedUserKey = "anonymous";
  if (feedback.user_or_tenant_key) {
    hashedUserKey = crypto.createHash("sha256").update(feedback.user_or_tenant_key).digest("hex");
  }

  const feedbackData = {
    merchant_id: merchantId,
    user_or_tenant_key: hashedUserKey,
    chosen_category: feedback.chosen_category,
    chosen_subcategory: feedback.chosen_subcategory || null,
    previous_category: feedback.previous_category || null,
    previous_subcategory: feedback.previous_subcategory || null,
    accepted_suggestion: feedback.accepted_suggestion,
    country: feedback.country || null,
  };

  const { data, error } = await supabase
    .from("merchant_feedback")
    .insert(feedbackData as any)
    .select("id")
    .single();

  if (error) {
    console.error("Error storing feedback:", error);
    throw new Error("Failed to store feedback");
  }

  return data.id;
}

/**
 * Update merchant counters based on feedback
 */
async function updateMerchantCounters(
  supabase: SupabaseClient<any>,
  merchantId: string,
  acceptedSuggestion: boolean
): Promise<void> {
  // Call the increment_merchant_counters() database function
  const { error } = await supabase.rpc("increment_merchant_counters", {
    p_merchant_id: merchantId,
    p_increment_classification: true,
    p_increment_agreement: acceptedSuggestion,
    p_increment_correction: !acceptedSuggestion,
  } as any);

  if (error) {
    console.error("Error updating merchant counters:", error);
    throw new Error("Failed to update merchant statistics");
  }
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate feedback request body
 */
function validateFeedbackRequest(body: any): {
  valid: boolean;
  error?: string;
  data?: FeedbackRequest;
} {
  // Required fields
  if (!body.merchant_token || typeof body.merchant_token !== "string") {
    return { valid: false, error: "Missing or invalid merchant_token" };
  }

  if (typeof body.chosen_category !== "string") {
    return { valid: false, error: "Missing or invalid chosen_category" };
  }

  if (typeof body.accepted_suggestion !== "boolean") {
    return { valid: false, error: "Missing or invalid accepted_suggestion (must be boolean)" };
  }

  // Merchant token length validation
  if (body.merchant_token.length < 3) {
    return { valid: false, error: "merchant_token too short (minimum 3 characters)" };
  }

  // Category validation (check empty after type check)
  if (body.chosen_category.trim().length === 0) {
    return { valid: false, error: "chosen_category cannot be empty" };
  }

  // Country code validation (if provided)
  if (body.country && (typeof body.country !== "string" || body.country.length !== 2)) {
    return { valid: false, error: 'country must be a 2-letter ISO code (e.g., "CA", "US")' };
  }

  return {
    valid: true,
    data: {
      merchant_token: body.merchant_token.toUpperCase().trim(),
      chosen_category: body.chosen_category.trim(),
      chosen_subcategory: body.chosen_subcategory?.trim() || null,
      previous_category: body.previous_category?.trim() || null,
      previous_subcategory: body.previous_subcategory?.trim() || null,
      accepted_suggestion: body.accepted_suggestion,
      user_or_tenant_key: body.user_or_tenant_key || null,
      country: body.country?.toUpperCase() || null,
    },
  };
}

// ============================================================================
// API Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = validateFeedbackRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const feedback = validation.data!;

    // Initialize Supabase client (service role for write access)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Database configuration missing",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Look up merchant (or create placeholder)
    let merchant = await getMerchantByToken(supabase, feedback.merchant_token);

    if (!merchant) {
      // Create placeholder merchant with user-provided category
      merchant = await createPlaceholderMerchant(
        supabase,
        feedback.merchant_token,
        feedback.chosen_category,
        feedback.chosen_subcategory
      );
    }

    // Step 2: Store feedback event
    const feedbackId = await storeFeedback(supabase, merchant.id, feedback);

    // Step 3: Update merchant counters
    await updateMerchantCounters(supabase, merchant.id, feedback.accepted_suggestion);

    // Step 4: Return success
    return NextResponse.json({
      success: true,
      message: feedback.accepted_suggestion
        ? "Feedback recorded - AI suggestion accepted"
        : "Feedback recorded - user correction applied",
      feedback_id: feedbackId,
      merchant_id: merchant.id,
    });
  } catch (error) {
    console.error("Merchant feedback error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
