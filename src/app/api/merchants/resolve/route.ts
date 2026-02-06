/**
 * Merchant Resolution API
 *
 * GET /api/merchants/resolve?token=MERCHANT_TOKEN&country=CA
 *
 * Resolves a merchant token to classification metadata:
 * - category, subcategory
 * - is_subscription, business_type
 * - confidence, source, explanation
 *
 * Flow:
 * 1. Check merchants table for existing entry (cache hit)
 * 2. If not found, call OpenAI to classify merchant (cache miss)
 * 3. Store result in merchants table
 * 4. Return classification to client
 *
 * Privacy: Only sends merchant token + country to OpenAI, never raw PII
 */

import { type NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Types
interface MerchantClassification {
  merchant_token: string;
  canonical_name: string;
  default_category: string;
  default_subcategory: string | null;
  business_type: string;
  is_subscription: boolean;
  confidence: number;
  source: 'openai' | 'user' | 'rule' | 'mixed';
  explanation: string;
}

interface OpenAIMerchantResponse {
  canonical_name: string;
  business_type: string;
  category: string;
  subcategory?: string;
  is_subscription: boolean;
  confidence: number;
  reason: string;
}

// ============================================================================
// OpenAI Classification
// ============================================================================

/**
 * Call OpenAI to classify a merchant
 * Uses strict JSON schema for structured output
 * Privacy-safe: only sends merchant token + country context
 */
async function classifyMerchantWithOpenAI(
  merchantToken: string,
  country?: string
): Promise<OpenAIMerchantResponse> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const openai = new OpenAI({ apiKey: openaiKey });

  // Build context-aware prompt (minimal data, no PII)
  const contextHint = country ? ` (Country: ${country})` : '';
  const prompt = `Classify the merchant "${merchantToken}"${contextHint}.

Provide:
1. canonical_name: Official business name (e.g., "OpenAI", "Netflix", "Skip The Dishes")
2. business_type: saas, retail, restaurant, grocery, utility, insurance, subscription, entertainment, healthcare, transportation, or other
3. category: High-level category (e.g., "Food & Dining", "Entertainment", "AI & Developer Tools")
4. subcategory: Specific subcategory (e.g., "Subscriptions", "Streaming Services", "Delivery")
5. is_subscription: true if recurring subscription service
6. confidence: 0.0 to 1.0 (how confident you are in this classification)
7. reason: Brief explanation (1-2 sentences)

Return ONLY valid JSON matching this schema.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',  // Cost-effective model (can upgrade to gpt-4o-mini if needed)
      messages: [
        {
          role: 'system',
          content: 'You are a merchant classification expert. Classify businesses based on their name. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,  // Low temperature for consistent classification
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const classification = JSON.parse(content) as OpenAIMerchantResponse;

    // Validate required fields
    if (
      !classification.canonical_name ||
      !classification.category ||
      typeof classification.is_subscription !== 'boolean'
    ) {
      throw new Error('Invalid classification response from OpenAI');
    }

    return classification;
  } catch (error) {
    console.error('OpenAI classification error:', error);

    // Safe fallback classification
    return {
      canonical_name: merchantToken,
      business_type: 'other',
      category: 'Miscellaneous',
      subcategory: 'Other',
      is_subscription: false,
      confidence: 0.1,
      reason: 'Failed to classify merchant, using safe defaults',
    };
  }
}

// ============================================================================
// Database Operations
// ============================================================================

/**
 * Look up merchant in database by token
 */
async function getMerchantByToken(
  supabase: SupabaseClient<any>,
  merchantToken: string
): Promise<MerchantClassification | null> {
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('merchant_token', merchantToken)
    .single();

  if (error || !data) {
    return null;
  }

  // Update last_seen_at
  await supabase
    .from('merchants')
    .update({ last_seen_at: new Date().toISOString() } as any)
    .eq('merchant_token', merchantToken);

  return data as MerchantClassification;
}

/**
 * Store new merchant classification in database
 */
async function storeMerchantClassification(
  supabase: SupabaseClient<any>,
  merchantToken: string,
  classification: OpenAIMerchantResponse
): Promise<MerchantClassification> {
  const merchantData = {
    merchant_token: merchantToken,
    canonical_name: classification.canonical_name,
    default_category: classification.category,
    default_subcategory: classification.subcategory || null,
    business_type: classification.business_type,
    is_subscription: classification.is_subscription,
    confidence: classification.confidence,
    source: 'openai' as const,
    explanation: classification.reason,
    classification_count: 1,
    user_agreement_count: 0,
    user_correction_count: 0,
  };

  const { data, error } = await supabase
    .from('merchants')
    .insert(merchantData as any)
    .select()
    .single();

  if (error) {
    console.error('Error storing merchant:', error);
    throw new Error('Failed to store merchant classification');
  }

  return data as MerchantClassification;
}

// ============================================================================
// API Handler
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const country = searchParams.get('country');
    const mcc = searchParams.get('mcc');  // Optional Merchant Category Code

    // Validation
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: token',
        },
        { status: 400 }
      );
    }

    if (token.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid merchant token (too short)',
        },
        { status: 400 }
      );
    }

    // Initialize Supabase client (service role for write access)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database configuration missing',
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Check cache (database lookup)
    let merchant = await getMerchantByToken(supabase, token);

    // Step 2: Cache miss - classify with OpenAI
    if (!merchant) {
      const classification = await classifyMerchantWithOpenAI(token, country || undefined);
      merchant = await storeMerchantClassification(supabase, token, classification);
    }

    // Step 3: Return classification
    return NextResponse.json({
      success: true,
      merchant_token: merchant.merchant_token,
      canonical_name: merchant.canonical_name,
      category: merchant.default_category,
      subcategory: merchant.default_subcategory,
      business_type: merchant.business_type,
      is_subscription: merchant.is_subscription,
      confidence: merchant.confidence,
      source: merchant.source,
      explanation: merchant.explanation,
    });
  } catch (error) {
    console.error('Merchant resolution error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
