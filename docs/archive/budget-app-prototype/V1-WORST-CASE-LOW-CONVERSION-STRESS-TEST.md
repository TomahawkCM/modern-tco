# Online Budget App — Worst-Case Low-Conversion Stress Test

Status: Financial Risk Scenario
Last Updated: 2026-02-22
Scope: 10k Users, Plaid + Salt Edge Hybrid
Scenario: Low Premium Conversion (3%–5%)

---

# 1. Scenario Setup

Active Users: 10,000
Average Accounts/User: 2
Total Connected Accounts: 20,000

Estimated Monthly Costs:

- Bank Providers: ~$5,500
- AI: ~$770
- Infrastructure: ~$1,100

Total Monthly Cost ≈ $7,500

---

# 2. Worst-Case Conversion Scenarios

## Scenario A — 5% Conversion @ $8/month

500 Premium Users
Revenue: 500 × $8 = $4,000/month

Operating Cost: ~$7,500

Monthly Loss: ~$3,500
Annualized Loss: ~$42,000

---

## Scenario B — 3% Conversion @ $8/month

300 Premium Users
Revenue: 300 × $8 = $2,400/month

Operating Cost: ~$7,500

Monthly Loss: ~$5,100
Annualized Loss: ~$61,200

---

## Scenario C — 5% Conversion @ $10/month

500 × $10 = $5,000/month

Monthly Loss: ~$2,500
Annualized Loss: ~$30,000

---

# 3. Why Low Conversion Is Dangerous Here

Unlike most SaaS products:

Your costs scale with:

- Connected bank accounts
- Active users

Even free users generate:

- Bank provider cost
- Infrastructure load

This is not a zero-marginal-cost SaaS model.

Free users are not "free".

---

# 4. Risk Amplifiers

If low conversion coincides with:

- High AI usage by free users
- 3–4 bank connections per free user
- Aggressive sync frequency

Losses increase significantly.

Example:
If average accounts/user = 3 instead of 2
Total accounts = 30,000
Bank cost could exceed $8,000/month alone.

---

# 5. Survival Threshold Analysis

At 10k users, $7,500 monthly cost

To survive at 5% conversion:

You must reduce monthly cost below ~$4,000

This requires:

- Lower bank costs
- Lower AI usage
- Strict free-tier limits

---

# 6. Defensive Adjustments for Low Conversion Scenario

If conversion < 7% for 2–3 months:

1. Reduce free bank connection limit to 1
2. Lower free AI chat quota
3. Increase sync interval for free users
4. Raise Premium price to $10–$12
5. Introduce annual plan discount (improves cash flow)

---

# 7. Critical Insight

Bank provider cost is the dominant fixed variable.

If free users connect accounts but do not convert,
the product becomes structurally loss-making.

This is different from typical SaaS.

---

# 8. Break-Even Under Stress (Adjusted)

If free bank limit reduced to 1 account:

Estimated new bank cost:
~$4,000/month

Total cost ≈ $6,000/month

Break-even at $10/month:
600 paying users (6% conversion)

Much safer profile.

---

# 9. Strategic Conclusion

Worst-case low conversion (3–5%)
→ Business becomes unsustainable without fast intervention.

Therefore:

✅ Free tier must be tightly controlled.
✅ AI usage must be capped.
✅ Bank connections must be limited.
✅ Pricing should likely be $9–$12/month, not $8.
✅ Early conversion optimization is critical.

---

# Final Assessment

Low conversion is the single biggest financial risk in V1.

If conversion drops below ~7%,
the product must tighten limits or adjust pricing immediately.

This is manageable,
but only with strict monitoring and fast iteration.
