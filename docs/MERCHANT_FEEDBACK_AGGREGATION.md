# Merchant Feedback Aggregation Strategy

## Overview

The merchant feedback aggregation system continuously improves merchant classification accuracy by learning from user feedback. Users can accept or correct AI-suggested categories, and the system aggregates this feedback to automatically update merchant classifications over time.

## Architecture

```
User Feedback → merchant_feedback table → Background Aggregation Job → merchants table updates
                         ↓
                 Counter Updates (real-time)
                         ↓
              classification_count, user_agreement_count, user_correction_count
```

## Real-Time Updates (Immediate)

When feedback is submitted via `/api/merchants/feedback`:

1. **Feedback Event Storage**: Insert into `merchant_feedback` table
2. **Counter Updates**: Call `increment_merchant_counters()` to update:
   - `classification_count` (always +1)
   - `user_agreement_count` (+1 if accepted_suggestion = true)
   - `user_correction_count` (+1 if accepted_suggestion = false)
3. **User Response**: Return success immediately

**Why Real-Time?**

- Feedback events are relatively rare (not thousands per minute)
- Counter updates are simple atomic operations
- Users get immediate confirmation their feedback was recorded

## Background Aggregation (Daily/Weekly)

The aggregation job runs as a background process (cron job or scheduled task) to analyze feedback patterns and update merchant classifications.

### Aggregation Schedule

**Recommended**: Daily at 2:00 AM UTC (low traffic period)

**Alternative**: Weekly on Sundays for lower-volume systems

### Aggregation Logic

#### Step 1: Identify Merchants Needing Review

```sql
-- Find merchants with sufficient feedback for analysis
SELECT
  id,
  merchant_token,
  default_category,
  default_subcategory,
  confidence,
  classification_count,
  user_agreement_count,
  user_correction_count
FROM merchants
WHERE
  classification_count >= 5  -- Minimum feedback threshold
  AND updated_at < NOW() - INTERVAL '1 day'  -- Avoid thrashing
ORDER BY classification_count DESC;
```

#### Step 2: Calculate Agreement Rate

For each merchant:

```sql
-- Calculate agreement percentage
SELECT
  merchant_id,
  COUNT(*) as total_feedback,
  SUM(CASE WHEN accepted_suggestion THEN 1 ELSE 0 END) as agreements,
  SUM(CASE WHEN NOT accepted_suggestion THEN 1 ELSE 0 END) as corrections,
  ROUND(
    (SUM(CASE WHEN accepted_suggestion THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100,
    2
  ) as agreement_percentage
FROM merchant_feedback
WHERE merchant_id = $1
GROUP BY merchant_id;
```

**Confidence Thresholds:**

- **High Confidence** (≥80% agreement): Auto-update category
- **Medium Confidence** (60-79% agreement): Keep current, flag for review
- **Low Confidence** (<60% agreement): Flag for manual review

#### Step 3: Determine New Category (Majority Voting)

When agreement_percentage < 80% (conflicting feedback):

```sql
-- Find most common user-chosen category
SELECT
  chosen_category,
  chosen_subcategory,
  COUNT(*) as vote_count,
  ROUND((COUNT(*)::numeric / total_feedback.count) * 100, 2) as percentage
FROM merchant_feedback
CROSS JOIN (
  SELECT COUNT(*) as count
  FROM merchant_feedback
  WHERE merchant_id = $1
) as total_feedback
WHERE merchant_id = $1
GROUP BY chosen_category, chosen_subcategory
ORDER BY vote_count DESC
LIMIT 1;
```

**Majority Voting Rules:**

- If winner has ≥60% of votes → Update to winner category
- If winner has <60% of votes → Flag for manual review (no auto-update)

#### Step 4: Update Merchant Record

```sql
-- Update merchant with new classification
UPDATE merchants
SET
  default_category = $new_category,
  default_subcategory = $new_subcategory,
  confidence = $new_confidence,
  source = CASE
    WHEN source = 'openai' AND $has_corrections THEN 'mixed'
    WHEN source = 'user' THEN 'user'
    ELSE source
  END,
  explanation = $new_explanation,
  updated_at = NOW()
WHERE id = $merchant_id
  AND (
    default_category != $new_category
    OR default_subcategory IS DISTINCT FROM $new_subcategory
    OR confidence != $new_confidence
  );
```

**Confidence Calculation:**

```typescript
function calculateConfidence(agreementCount: number, correctionCount: number): number {
  const total = agreementCount + correctionCount;
  if (total === 0) return 0.5; // Default for new merchants

  const agreementRate = agreementCount / total;

  // Adjust for sample size (more feedback = higher confidence)
  const sampleSizeAdjustment = Math.min(total / 20, 1.0); // Cap at 20 feedback events

  return Math.round(agreementRate * sampleSizeAdjustment * 1000) / 1000;
}
```

## Implementation Guide

### Option 1: Node.js Cron Script (Recommended)

Create `/scripts/aggregate-merchant-feedback.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import cron from "node-cron";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function aggregateMerchantFeedback() {
  console.log("[Aggregation] Starting merchant feedback aggregation...");

  // Step 1: Find merchants needing review
  const { data: merchants, error } = await supabase
    .from("merchants")
    .select(
      "id, merchant_token, default_category, classification_count, user_agreement_count, user_correction_count"
    )
    .gte("classification_count", 5)
    .lt("updated_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error("[Aggregation] Error fetching merchants:", error);
    return;
  }

  console.log(`[Aggregation] Found ${merchants.length} merchants to review`);

  // Step 2: Process each merchant
  for (const merchant of merchants) {
    await processMerchantFeedback(merchant);
  }

  console.log("[Aggregation] Completed!");
}

async function processMerchantFeedback(merchant: any) {
  // Get feedback for this merchant
  const { data: feedback, error } = await supabase
    .from("merchant_feedback")
    .select("chosen_category, chosen_subcategory, accepted_suggestion")
    .eq("merchant_id", merchant.id);

  if (error || !feedback || feedback.length === 0) {
    return;
  }

  // Calculate agreement rate
  const total = feedback.length;
  const agreements = feedback.filter((f) => f.accepted_suggestion).length;
  const agreementRate = agreements / total;

  // Auto-update if high confidence
  if (agreementRate >= 0.8) {
    console.log(
      `[Aggregation] High confidence (${(agreementRate * 100).toFixed(1)}%) for ${merchant.merchant_token} - keeping current category`
    );
    return; // Current category is good
  }

  // Find majority category
  const categoryCounts: { [key: string]: number } = {};
  feedback.forEach((f) => {
    const key = `${f.chosen_category}|${f.chosen_subcategory || ""}`;
    categoryCounts[key] = (categoryCounts[key] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a);

  const [winnerKey, winnerCount] = sortedCategories[0];
  const [winnerCategory, winnerSubcategory] = winnerKey.split("|");
  const winnerPercentage = winnerCount / total;

  // Update if majority (≥60%)
  if (winnerPercentage >= 0.6) {
    const newConfidence = calculateConfidence(
      merchant.user_agreement_count,
      merchant.user_correction_count
    );

    await supabase
      .from("merchants")
      .update({
        default_category: winnerCategory,
        default_subcategory: winnerSubcategory || null,
        confidence: newConfidence,
        source: "mixed",
        explanation: `Updated via user feedback aggregation (${(winnerPercentage * 100).toFixed(1)}% consensus)`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", merchant.id);

    console.log(
      `[Aggregation] Updated ${merchant.merchant_token}: ${merchant.default_category} → ${winnerCategory} (${(winnerPercentage * 100).toFixed(1)}% consensus)`
    );
  } else {
    console.log(
      `[Aggregation] Low consensus for ${merchant.merchant_token} (${(winnerPercentage * 100).toFixed(1)}%) - flagging for manual review`
    );
  }
}

function calculateConfidence(agreementCount: number, correctionCount: number): number {
  const total = agreementCount + correctionCount;
  if (total === 0) return 0.5;

  const agreementRate = agreementCount / total;
  const sampleSizeAdjustment = Math.min(total / 20, 1.0);

  return Math.round(agreementRate * sampleSizeAdjustment * 1000) / 1000;
}

// Schedule: Daily at 2:00 AM UTC
cron.schedule("0 2 * * *", aggregateMerchantFeedback);

console.log("[Aggregation] Cron job scheduled: Daily at 2:00 AM UTC");
```

**Package Installation:**

```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

**Run Script:**

```bash
# Development
npm run aggregate-feedback

# Production (add to package.json scripts)
"scripts": {
  "aggregate-feedback": "tsx scripts/aggregate-merchant-feedback.ts"
}
```

### Option 2: Vercel Cron Jobs

For serverless deployment on Vercel:

**Create `/app/api/cron/aggregate-feedback/route.ts`:**

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Verify cron secret (security)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Run aggregation logic (same as above)
  await aggregateMerchantFeedback();

  return NextResponse.json({ success: true, message: "Aggregation completed" });
}
```

**Add to `vercel.json`:**

```json
{
  "crons": [
    {
      "path": "/api/cron/aggregate-feedback",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Option 3: Supabase Edge Functions

For Supabase-native deployment:

```sql
-- Create Edge Function trigger (manual invocation or scheduled)
-- File: supabase/functions/aggregate-feedback/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Run aggregation logic
  await aggregateMerchantFeedback(supabase);

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

## Monitoring & Analytics

### Key Metrics to Track

1. **Aggregation Run Success Rate**
   - Track successful vs. failed aggregation jobs
   - Alert on failures

2. **Merchant Update Volume**
   - How many merchants updated per run?
   - Trend over time (should decrease as classifications stabilize)

3. **Agreement Rate Distribution**
   - How many merchants have high vs. low agreement?
   - Identify problematic merchants needing manual review

4. **Confidence Score Trends**
   - Average confidence score across all merchants
   - Track improvements over time

### Logging Best Practices

```typescript
// Log aggregation runs
await supabase.from("aggregation_logs").insert({
  started_at: new Date(),
  merchants_reviewed: merchants.length,
  merchants_updated: updatedCount,
  merchants_flagged: flaggedCount,
  status: "completed",
  duration_ms: Date.now() - startTime,
});
```

## Manual Review Process

For merchants flagged with low consensus:

1. **Admin Dashboard Query:**

```sql
-- Find merchants needing manual review
SELECT
  m.merchant_token,
  m.canonical_name,
  m.default_category,
  m.confidence,
  m.classification_count,
  m.user_agreement_count,
  m.user_correction_count,
  ROUND((m.user_agreement_count::numeric / NULLIF(m.classification_count, 0)) * 100, 2) as agreement_percentage
FROM merchants m
WHERE
  m.classification_count >= 5
  AND (m.user_agreement_count::numeric / NULLIF(m.classification_count, 0)) < 0.6
ORDER BY m.classification_count DESC;
```

2. **Review Feedback:**

```sql
-- View all feedback for a specific merchant
SELECT
  chosen_category,
  chosen_subcategory,
  accepted_suggestion,
  country,
  created_at
FROM merchant_feedback
WHERE merchant_id = $merchant_id
ORDER BY created_at DESC;
```

3. **Manual Update:**

```sql
-- Admin override
UPDATE merchants
SET
  default_category = 'Correct Category',
  default_subcategory = 'Correct Subcategory',
  confidence = 0.95,
  source = 'user',
  explanation = 'Manually reviewed and corrected by admin',
  updated_at = NOW()
WHERE id = $merchant_id;
```

## Future Enhancements

1. **Weighted Feedback**: Give more weight to recent feedback (time decay)
2. **User Trust Scores**: Power users with higher accuracy get higher vote weight
3. **Country-Specific Categories**: Different default categories per country
4. **Anomaly Detection**: Flag sudden changes in merchant behavior (e.g., subscription → one-time)
5. **A/B Testing**: Test different confidence thresholds and measure impact on accuracy

## Summary

The feedback aggregation system:

✅ **Real-Time**: Stores feedback immediately, updates counters
✅ **Conservative**: Requires ≥5 feedback events + 80% agreement before auto-updating
✅ **Conflict Resolution**: Majority voting with 60% threshold
✅ **Privacy-Preserving**: Hashed user keys, aggregate statistics only
✅ **Auditable**: Full feedback history retained for review
✅ **Flexible**: Supports multiple deployment options (Node.js, Vercel, Supabase)

**Key Takeaway**: The system learns gradually and conservatively, ensuring high-quality merchant classifications while respecting user privacy.
