# Online Budget App — V1 Monetization Architecture (Revised Model)

Status: Planning (Revised)
Last Updated: 2026-02-22
Scope: Online = Premium Subscription Product
Database: Supabase (Postgres + RLS)
Payments: Stripe

---

# 1. Strategic Pivot Summary

Free users use the Offline App.

Online version is NOT a freemium bank-sync product.
Online is a:

> Premium automation + AI subscription product.

This removes structural bank-cost risk from free users.

---

# 2. Product Separation Model

## Offline App (Free or One-Time)

- Manual transaction import
- Advanced modeling tools
- Multi-currency support
- No bank sync
- No recurring infrastructure cost

## Online App (Subscription)

- Bank sync (Plaid + Salt Edge)
- AI categorization
- AI insights
- AI chat
- Automated updates
- Cross-device sync
- Notifications

Online = Automation + Intelligence.

---

# 3. Online Pricing Structure (V1)

## Free Tier (Online)

Not a functional free product.
Only:

- 7–14 day full trial
  OR
- Limited demo mode (no bank connection persistence)

No permanent free bank sync.

---

## Premium Tier

Recommended price range: $9–$12/month

Includes:

- Bank connections (within reasonable cap, e.g., 10 accounts)
- Unlimited AI chat (fair use)
- AI insights
- Budgeting
- Goals

No feature fragmentation.
Single premium tier.

---

# 4. Financial Structure Improvement

Old Risk Model:
Free users generate bank cost.

New Model:
Only paying users generate bank cost.

Bank costs now scale proportionally with revenue.

This dramatically improves sustainability.

---

# 5. Database Schema Adjustments

subscriptions table remains:

## subscriptions

- id (uuid)
- user_id
- stripe_customer_id
- stripe_subscription_id
- status (trialing, active, past_due, canceled)
- tier (premium)
- trial_end
- current_period_end
- created_at

There is no permanent "free" tier row for online functionality.
Users without active subscription:

- Cannot connect banks
- Cannot use AI features

---

# 6. Enforcement Strategy

Enforcement occurs at three layers:

1. Database (RLS)
2. API Layer
3. UI Layer

---

## 6.1 Bank Connection Enforcement

Before inserting account record:

Check:

- subscription.status in ('trialing','active')

If not:

- Block account creation
- Return "Upgrade Required"

---

## 6.2 AI Usage Enforcement

Before AI API call:

Check subscription status.

If inactive:

- Block call
- Return upgrade prompt

AI usage tracking still stored for cost monitoring,
but not needed for free-tier enforcement.

---

# 7. Trial Model

Trial recommended:
7–14 days full access.

Flow:

1. User signs up
2. Starts trial
3. Connects bank
4. Experiences AI + automation
5. Trial expiration → requires subscription

Trial treated as premium during active period.

---

# 8. Downgrade & Expiration Handling

If subscription expires:

- Bank sync disabled
- Accounts remain visible (read-only)
- AI disabled
- User prompted to renew

Do NOT delete financial data.
Preserve trust.

---

# 9. Revenue Model Implications

Example:
1,000 paying users × $10 = $10,000/month

Bank cost scales with paying users only.

Much healthier than freemium bank-sync model.

---

# 10. Upgrade Strategy

Upgrade prompts triggered:

- After first AI insight during trial
- When trial nearing expiration
- When attempting bank connection without subscription

Messaging focus:
"Keep your accounts connected and insights automatic."

Avoid aggressive gating.

---

# 11. Cost Alignment Strategy

Because only premium users generate bank cost:

Revenue per user (~$10)
Bank cost per user (~$0.50–$1.00 blended)
AI cost per user (~$0.20–$0.50)

Gross margin per user remains strong.

---

# 12. What We Avoid in V1

- Free bank connections
- Multi-tier pricing confusion
- Add-ons
- Usage-based billing
- Complex AI quotas

Keep it simple.

---

# Final Architecture Summary

Offline = Free Sovereign Tool
Online = Premium Automation Layer

Subscription required for:

- Bank sync
- AI
- Cross-device automation

This model:

- Protects margins
- Aligns cost with revenue
- Avoids freemium trap
- Supports global scale

It is financially disciplined and sustainable.
