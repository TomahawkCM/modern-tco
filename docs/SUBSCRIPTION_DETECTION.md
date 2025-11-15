# Subscription Detection System

## Overview

The Budget App includes an **AI-powered subscription detection system** that automatically identifies recurring payments by analyzing transaction patterns and merchant intelligence data.

## How It Works

### Detection Algorithm

The system analyzes transactions using a **multi-factor approach**:

#### 1. **Merchant Grouping**
```typescript
// Group transactions by normalized merchant token
// Example: "NETFLIX" → All Netflix transactions
const merchantGroups = groupByMerchant(transactions, 'bmo');
```

#### 2. **Pattern Analysis**
For each merchant group (minimum 2 transactions required):

**Recurrence Detection:**
- Calculate intervals between charges (days)
- Compute average interval and standard deviation
- Measure regularity score (0-1, higher = more regular)

**Amount Consistency:**
- Calculate average, min, max amounts
- Check variance (±10% tolerance)
- High variance reduces confidence

**Interval Classification:**
- **Weekly**: 5-9 days (avg 7 ±2)
- **Monthly**: 25-35 days (avg 30 ±5)
- **Annual**: 350-380 days (avg 365 ±15)
- **Irregular**: Other patterns

#### 3. **Confidence Scoring**

```typescript
confidence = regularityScore + occurrenceBoost - variancePenalty

// Where:
// - regularityScore: 0-1 (from interval consistency)
// - occurrenceBoost: min(count/5, 1) * 0.2 (caps at 5 occurrences)
// - variancePenalty: amountVariance * 0.3

// Threshold: confidence >= 0.6 to be considered a subscription
```

#### 4. **AI Enrichment**

After pattern detection, subscriptions are enriched with merchant catalog data:

```typescript
// Call /api/merchants/resolve for each detected subscription
const enriched = await enrichSubscriptionsWithMerchantData(detected);

// Enhancements:
// - canonical_name: "Netflix" (instead of raw description)
// - category/subcategory: "Entertainment" / "Streaming Services"
// - is_subscription: true (from OpenAI classification)
// - confidence boost: +0.15 if merchant catalog confirms subscription
```

## Subscription Data Structure

```typescript
interface SubscriptionPattern {
  id: string;
  merchant_token: string;        // "NETFLIX"
  merchant_name: string;          // "Netflix"
  category: string;               // "Entertainment"
  subcategory: string | null;     // "Streaming Services"

  // Financial
  average_amount: number;         // $15.99
  min_amount: number;             // $15.99
  max_amount: number;             // $15.99
  currency: string;               // "CAD"

  // Recurrence
  interval_type: 'weekly' | 'monthly' | 'annual' | 'irregular';
  interval_days: number;          // 30
  confidence: number;             // 0.95 (95% confident)

  // History
  occurrence_count: number;       // 6 charges
  first_charge: Date;             // 2024-06-15
  last_charge: Date;              // 2024-11-15
  next_expected_charge?: Date;    // 2024-12-15

  // Metadata
  is_active: boolean;             // true
  is_subscription_merchant: boolean; // true (from AI)
  transaction_ids: string[];

  // Analytics
  total_spent: number;            // $95.94
  annual_cost_estimate: number;   // $191.88
}
```

## User Interface

### Subscriptions Page (`/budget-app/subscriptions`)

**Stats Dashboard:**
- Active subscription count
- Monthly cost estimate
- Annual projection
- Upcoming charges (next 7 days)

**Subscription Cards:**
- Merchant name and category
- Amount and billing frequency
- Next charge date
- Confidence indicator
- Total spent and annual cost
- Quick actions (view transactions)

**Filtering:**
- Active subscriptions (default)
- All subscriptions (includes inactive)

### Visual Indicators

**Confidence Levels:**
- 🟢 **High** (≥90%): 5/5 dots filled
- 🟡 **Medium** (70-89%): 3-4/5 dots filled
- 🟠 **Low** (<70%): 1-2/5 dots filled + warning

**Status Badges:**
- ✅ **AI Verified**: Merchant catalog confirms subscription
- **Inactive**: No charge in 2x interval period

## Examples

### Example 1: Netflix (High Confidence)

**Transactions:**
```
2024-06-15: [OP] ONLINE PURCHASE 15JUN2024NETFLIX → -$15.99
2024-07-15: [OP] ONLINE PURCHASE 15JUL2024NETFLIX → -$15.99
2024-08-15: [OP] ONLINE PURCHASE 15AUG2024NETFLIX → -$15.99
2024-09-15: [OP] ONLINE PURCHASE 15SEP2024NETFLIX → -$15.99
2024-10-15: [OP] ONLINE PURCHASE 15OCT2024NETFLIX → -$15.99
2024-11-15: [OP] ONLINE PURCHASE 15NOV2024NETFLIX → -$15.99
```

**Detection:**
- Intervals: [30, 31, 31, 30, 31] days
- Average: 30.6 days
- Regularity: 0.98 (very consistent)
- Amount variance: 0.0 (identical)
- **Confidence: 0.95 → High**

**AI Enrichment:**
- Merchant: "Netflix"
- Category: "Entertainment" / "Streaming Services"
- is_subscription: true
- **Final Confidence: 1.0 (boosted +0.15)**

### Example 2: SkipTheDishes (Medium Confidence)

**Transactions:**
```
2024-06-05: [OP] ONLINE PURCHASE 5JUN2024SKIPTHEDISHES → -$32.45
2024-07-12: [OP] ONLINE PURCHASE 12JUL2024SKIPTHEDISHES → -$28.99
2024-08-20: [OP] ONLINE PURCHASE 20AUG2024SKIPTHEDISHES → -$35.50
```

**Detection:**
- Intervals: [37, 39] days
- Average: 38 days
- Regularity: 0.85 (fairly consistent)
- Amount variance: 0.22 (±10% tolerance exceeded)
- **Confidence: 0.68 → Medium (below 0.9 threshold)**

**Result:** Detected as subscription but NOT auto-classified as high confidence due to amount variance and irregular cadence.

### Example 3: Pembridge Insurance (Annual)

**Transactions:**
```
2023-11-15: [PR] PEMBRIDGE INS #123 AB → -$1,245.00
2024-11-15: [PR] PEMBRIDGE INS #123 AB → -$1,245.00
```

**Detection:**
- Intervals: [365] days
- Average: 365 days
- Regularity: 1.0 (perfect)
- Amount variance: 0.0 (identical)
- **Confidence: 0.88 → Medium**

**Note:** Only 2 occurrences, so occurrence boost is limited. Would improve with more data.

## Privacy & Security

✅ **Only merchant tokens analyzed** (no raw transaction data exposed)
✅ **Aggregate statistics only** (amounts, intervals, counts)
✅ **Local processing** (pattern detection runs client-side)
✅ **Optional AI enrichment** (calls /api/merchants/resolve only when needed)

## Performance Optimizations

### 1. **Client-Side Detection**
Pattern analysis runs in browser using last 12 months of transactions:
```typescript
const twelveMonthsAgo = new Date();
twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
```

### 2. **Cached Merchant Data**
Merchant catalog lookups are cached in database:
- First lookup: API call to OpenAI
- Subsequent lookups: Database cache hit

### 3. **Debounced Enrichment**
AI enrichment only called once per detected subscription, not per transaction.

## API Integration

### Merchant Resolution
```
GET /api/merchants/resolve?token=NETFLIX
```

**Response:**
```json
{
  "success": true,
  "merchant_token": "NETFLIX",
  "canonical_name": "Netflix",
  "category": "Entertainment",
  "subcategory": "Streaming Services",
  "is_subscription": true,
  "confidence": 0.98,
  "source": "openai"
}
```

## Future Enhancements

1. **Cancellation Detection**: Alert when subscription becomes inactive
2. **Price Change Detection**: Notify when amount increases significantly
3. **Subscription Recommendations**: Suggest cheaper alternatives
4. **Budget Integration**: Auto-allocate subscriptions to budget categories
5. **Subscription Sharing**: Detect shared subscriptions (same merchant, different amounts)
6. **Trial Period Detection**: Identify free trials converting to paid

## Troubleshooting

### "No subscriptions detected"

**Causes:**
- Not enough transaction history (need ≥12 months)
- Irregular payment patterns (confidence < 0.6)
- Missing merchant tokens (generic descriptions)

**Solutions:**
- Import more historical transactions
- Review transactions manually to confirm patterns
- Check that merchant tokens are extractable

### "Low confidence subscription"

**Causes:**
- High amount variance (±10% exceeded)
- Irregular intervals (not weekly/monthly/annual)
- Few occurrences (<3 charges)

**Solutions:**
- Wait for more data points
- Manually verify if pattern is legitimate
- Adjust confidence threshold in code if needed

### "Inactive subscription still showing"

**Cause:** Last charge within 2x interval period

**Example:**
- Monthly subscription ($30 every 30 days)
- Last charge: 45 days ago
- Still considered "active" until 60 days

**Solution:** Filter by "Active" tab to hide inactive subscriptions

## Technical Details

### Detection Algorithm

```typescript
// Pseudocode
function detectSubscriptions(transactions) {
  groups = groupByMerchant(transactions);

  subscriptions = [];
  for (merchant, txs) in groups {
    if (txs.length < 2) continue;

    recurrence = analyzeRecurrence(txs);
    if (recurrence.regularityScore < 0.5) continue;

    amounts = extractAmounts(txs);
    amountVariance = calculateVariance(amounts);

    confidence = calculateConfidence(
      recurrence.regularityScore,
      txs.length,
      amountVariance
    );

    if (confidence >= 0.6) {
      subscriptions.push(createSubscription(merchant, txs, confidence));
    }
  }

  return subscriptions;
}
```

### Confidence Formula

```
confidence = baseScore + boosts - penalties

Where:
- baseScore = regularityScore (0-1 from interval consistency)
- boosts = min(occurrenceCount / 5, 1) * 0.2
- penalties = amountVariance * 0.3

Threshold: >= 0.6 to be considered a subscription
```

## Summary

The Subscription Detection System provides:

🤖 **AI-Powered Detection**: Combines pattern analysis + merchant intelligence
📊 **Confidence Scoring**: Transparent scoring (high/medium/low)
📅 **Next Charge Prediction**: Estimates upcoming charges
💰 **Cost Analytics**: Monthly and annual cost estimates
🔒 **Privacy-Preserving**: Only merchant tokens and aggregate stats
⚡ **Fast Performance**: Client-side detection with cached AI data

**Result**: Automatic subscription tracking without manual entry!
