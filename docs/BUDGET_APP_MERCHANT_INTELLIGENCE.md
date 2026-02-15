# Budget App - Merchant Intelligence Integration

## Overview

The Budget App now includes **AI-powered merchant categorization** using OpenAI to automatically categorize transactions based on merchant names. This system learns from user feedback to continuously improve accuracy over time.

## How It Works

### 1. **Automatic Categorization**

When you add a new transaction:

1. **Merchant Detection**: The system extracts the merchant name from your transaction description
   - Example: `[OP] ONLINE PURCHASE 1AUG2025NETFLIX ON` → Merchant: `NETFLIX`

2. **AI Classification**: Calls OpenAI to classify the merchant
   - Category: `Entertainment`
   - Subcategory: `Streaming Services`
   - Confidence: `0.96` (96% confident)
   - Business Type: `subscription`

3. **Auto-Apply or Suggest**:
   - **High Confidence (≥90%)**: Category auto-applied automatically
   - **Low Confidence (<90%)**: Presented as suggestion, you choose manually

### 2. **Learning from Your Feedback**

Every time you save a transaction, the system learns:

- **Accepted AI Suggestion**: Increases confidence in that categorization
- **Corrected AI Suggestion**: Records your correction for future improvements

After enough feedback (≥5 corrections with 80% agreement), the system updates its defaults.

### 3. **Privacy-Preserving**

- Only sends **merchant tokens** to OpenAI (e.g., "NETFLIX"), never full transaction data
- No account numbers, amounts, or personal information shared
- User feedback is hashed for privacy

## User Experience

### Adding a Transaction

1. Open "Add Transaction" modal
2. Enter description (e.g., `[OP] ONLINE PURCHASE 1AUG2025SKIPTHEDISHES MB`)
3. Watch for **"AI categorizing..."** badge near Category field
4. If AI is confident:
   - Category auto-fills (e.g., "Food & Dining" → "Delivery")
   - Confidence meter shows accuracy
5. Review and adjust if needed
6. Click "Add Transaction" - feedback sent automatically

### Visual Indicators

**AI Loading Badge:**

```
Category [🧠 AI categorizing...]
```

**Confidence Meter:**

```
✓ Auto-categorized as "Food & Dining"
Confidence: ████████░░ 85%
Source: OpenAI
[✓ Learn from this]
```

**Learning Confirmation:**

```
✓ Learned!
After 3 similar corrections, future transactions from
this merchant will auto-categorize.
```

## Supported Banks

Currently optimized for **BMO (Bank of Montreal)** transaction formats:

- `[OP] ONLINE PURCHASE DDMonYYYYMERCHANT LOCATION`
- `[PR] MERCHANT #123 LOCATION`

**Generic support** for other banks (uses best-effort parsing).

## Merchant Intelligence Features

### Auto-Categorization

- **Confidence-Based**: Only auto-applies when AI is ≥90% confident
- **Fallback**: Uses rule-based categorization if AI unavailable
- **Manual Override**: You can always change the category

### Feedback Loop

- **Immediate**: Feedback sent when you save transaction
- **Aggregated**: Daily background job analyzes feedback patterns
- **Conservative**: Requires ≥5 feedback events + 80% agreement before updating defaults

### Subscription Detection

Merchants marked as subscriptions (e.g., Netflix, Spotify) can be tracked in the upcoming Subscriptions view.

## Examples

### Example 1: High-Confidence Auto-Categorization

**Transaction**: `[OP] ONLINE PURCHASE 4NOV2025NETFLIX`

**AI Response**:

- Category: "Entertainment"
- Subcategory: "Streaming Services"
- Confidence: 98%
- **Result**: ✅ Auto-applied

### Example 2: Low-Confidence Suggestion

**Transaction**: `[PR] PEMBRIDGE INS #123 AB`

**AI Response**:

- Category: "Insurance"
- Subcategory: "Auto Insurance"
- Confidence: 72%
- **Result**: 💡 Suggested (user confirms manually)

### Example 3: User Correction

**Transaction**: `[OP] ONLINE PURCHASE 1AUG2025SKIPTHEDISHES MB`

**AI Suggested**: "Transportation"
**User Corrected**: "Food & Dining" → "Delivery"

**Result**: ✅ Feedback recorded, future SkipTheDishes transactions will be "Food & Dining"

## Technical Details

### API Endpoints

**Merchant Resolution:**

```
GET /api/merchants/resolve?token=NETFLIX&country=CA
```

**Feedback Submission:**

```
POST /api/merchants/feedback
{
  "merchant_token": "NETFLIX",
  "chosen_category": "Entertainment",
  "accepted_suggestion": true,
  "country": "CA"
}
```

### Confidence Thresholds

- **Auto-Apply**: ≥ 0.9 (90%)
- **Manual Review**: < 0.9
- **Feedback Required**: ≥ 5 events
- **Update Threshold**: 80% agreement

### Performance

- **Cache-First**: Merchant classifications cached in database
- **API Calls**: Only once per unique merchant token
- **Debounced**: 500ms delay after typing stops before categorization

## Future Enhancements

1. **Country-Specific Categorization**: Different defaults for CA vs US merchants
2. **Subscription Tracking**: Dedicated view for recurring merchants
3. **Multi-Bank Support**: Optimized parsers for TD, RBC, Scotia, etc.
4. **Weighted Feedback**: More recent feedback weighted higher
5. **Bulk Import**: AI categorization during CSV imports

## Troubleshooting

### "AI categorizing..." Never Completes

**Cause**: API timeout or network issue
**Solution**: Rule-based categorization kicks in automatically as fallback

### Category Not Auto-Applied

**Cause**: AI confidence < 90%
**Solution**: This is expected! Review the suggestion and accept/correct manually

### Wrong Category Suggested

**Cause**: Merchant misclassification (rare, but possible)
**Solution**: Correct it once - system learns from your feedback

## Privacy & Security

✅ **Only merchant tokens sent to OpenAI** (never raw transaction data)
✅ **User feedback hashed** (SHA-256) for privacy
✅ **No PII exposure** (amounts, account numbers, dates filtered out)
✅ **Local fallback** (rule-based categorization works offline)

## Support

For issues or questions:

- Check console logs (F12 → Console tab)
- Review `merchant_feedback` table for feedback history
- See `MERCHANT_FEEDBACK_AGGREGATION.md` for background job details

## Summary

The Merchant Intelligence integration provides:

🤖 **AI-Powered Categorization**: OpenAI classifies merchants automatically
📊 **Confidence-Based Auto-Apply**: High confidence = auto-applied, low confidence = suggested
🎓 **Continuous Learning**: Improves from your feedback over time
🔒 **Privacy-Preserving**: Only merchant tokens shared, never full transaction data
🛡️ **Fallback System**: Rule-based categorization when AI unavailable

**Result**: Faster transaction entry with smart, learning categorization!
