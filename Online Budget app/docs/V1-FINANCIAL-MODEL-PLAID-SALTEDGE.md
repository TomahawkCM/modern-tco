# Online Budget App — Financial Model (Plaid + Salt Edge Hybrid)

Status: Planning Model
Last Updated: 2026-02-22
Scope: V1 Revenue vs Bank + AI Costs
Assumption: Plaid (US/CA) + Salt Edge (Global Fallback)

---

# 1. Key Assumptions

## User Distribution (Example Scenario)

Total Active Users: 10,000

Regional Split (assumed):

- 50% US/Canada (Plaid)
- 30% EU (Salt Edge)
- 20% Rest of World (Salt Edge)

Average Bank Accounts Per User: 2

Total Connected Accounts:
10,000 × 2 = 20,000 accounts

---

# 2. Bank Provider Cost Estimates

## Plaid Pricing (Typical)

~$0.30 per connected account per month

US/Canada Users:
5,000 users × 2 accounts = 10,000 accounts

10,000 × $0.30 = $3,000/month

---

## Salt Edge Pricing (Estimated)

Pricing varies widely. Conservative estimate:
~$0.20–$0.25 per connected account per month (blended average)

Salt Edge Accounts:
5,000 users × 2 accounts = 10,000 accounts

10,000 × $0.25 = $2,500/month

---

## Total Bank Cost (10k users)

Plaid: $3,000
Salt Edge: $2,500

Total = $5,500/month

---

# 3. AI Cost Model (Conservative)

Assumptions:

- 60% of users active monthly = 6,000
- 2 AI chats per week per active user
- 8 chats/month per active user

6,000 × 8 = 48,000 chats/month

Estimated cost per chat (optimized prompt + mid-tier model):
~$0.01–$0.02

Use $0.015 blended:
48,000 × 0.015 = $720/month

Monthly summary generation:
10,000 summaries × $0.005 ≈ $50/month

Total AI Cost ≈ $770/month

---

# 4. Infrastructure Costs (Rough)

Supabase (managed Postgres + storage):
~$300–$600/month at 10k users

Vercel (Pro tier + usage):
~$200–$400/month

Misc (email, monitoring, logging):
~$200/month

Total Infra ≈ $1,000–$1,200/month

---

# 5. Total Monthly Operating Cost (10k Users)

Bank Providers: $5,500
AI: $770
Infra: $1,100 (midpoint)

Total ≈ $7,370/month

Round to: ~$7,500/month

---

# 6. Revenue Scenarios

Assume subscription price: $8/month (Premium)

Conversion Scenarios:

## 5% Conversion

10,000 users × 5% = 500 paying users

500 × $8 = $4,000/month

❌ Loss: ~$3,500/month

---

## 10% Conversion

1,000 paying users

1,000 × $8 = $8,000/month

✅ Slight Profit: ~$500/month

---

## 15% Conversion

1,500 paying users

1,500 × $8 = $12,000/month

✅ Strong Margin: ~$4,500/month

---

# 7. Break-Even Analysis

Monthly cost ≈ $7,500

Break-even users at $8/month:
$7,500 / $8 ≈ 938 paying users

Break-even conversion rate at 10k users:
~9.4%

---

# 8. Sensitivity: Higher Price ($10/month)

At $10/month:

Break-even:
$7,500 / $10 = 750 users

Break-even conversion rate:
7.5%

This significantly improves viability.

---

# 9. Scale Scenario (50k Users)

Assume same 2 accounts/user:
100,000 connected accounts

Bank Cost:
~$27,500/month (scaled proportionally)

AI Cost (scaled):
~$3,500/month

Infra:
~$3,000/month

Total ≈ $34,000/month

At 10% conversion (5,000 users × $8):
$40,000 revenue

✅ Profitable

---

# 10. Strategic Implications

1. Bank costs dominate expense structure.
2. AI cost is manageable if controlled.
3. 8$/month requires ~10% conversion.
4. 10$/month reduces break-even pressure.
5. Free tier must restrict bank connections and AI usage tightly.

---

# 11. Recommendations

✅ Price Premium at $9–$12/month
✅ Limit free tier to 2 bank accounts
✅ Limit free AI chats
✅ Monitor bank cost per active account
✅ Negotiate volume pricing early

---

# Final Conclusion

Plaid + Salt Edge hybrid is financially viable
IF:

- Conversion ≥ 8–10%
- AI usage controlled
- Bank account limits enforced

Below 7% conversion at $8/month → unsustainable.

Pricing strategy matters more than AI cost.
