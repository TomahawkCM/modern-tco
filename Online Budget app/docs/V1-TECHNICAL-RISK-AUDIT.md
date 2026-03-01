# Online Budget App — V1 Technical Risk Audit

Status: Planning
Last Updated: 2026-02-22
Scope: Bank Sync + Supabase + AI Cost Model

---

# Executive Summary

V1 architecture is viable but has three primary technical risk clusters:

1. Bank Sync Reliability & Edge Cases
2. Supabase Scaling & Data Integrity
3. AI Cost & Latency Control

None are blockers — but each requires discipline and guardrails.

---

# 1. Bank Sync Risk Audit

## 1.1 Token Expiry & Re-Auth Failures

Risk:

- Bank provider tokens expire
- Users silently stop syncing
- Trust erosion

Mitigation:

- Background health check per account
- "Action Required" banner when sync fails
- Soft notifications for re-auth
- Log last_successful_sync timestamp

---

## 1.2 Transaction Duplication

Risk:

- Providers resend overlapping data
- Duplicate transactions stored

Mitigation:

- Unique constraint on (provider_transaction_id, account_id)
- Hash fallback if provider ID missing
- Idempotent ingestion logic

---

## 1.3 Pending → Posted Transition

Risk:

- Pending transactions change amount or disappear
- User confusion

Mitigation:

- Separate is_pending flag
- Update in place when posted
- Keep audit timestamp

---

## 1.4 Multi-Currency Bank Accounts

Risk:

- Provider inconsistencies in currency labeling
- FX confusion in dashboard

Mitigation:

- Trust provider currency field
- Never auto-convert on ingestion
- Conversion only at display layer

---

## 1.5 Sync Frequency & Cost

Risk:

- Excessive polling
- API rate limits
- Cost overrun

Mitigation:

- Sync every 4–6 hours
- On-demand manual refresh allowed
- Webhook support if provider offers it

---

# 2. Supabase Risk Audit

## 2.1 Row-Level Security Misconfiguration

Risk:

- Cross-user data leakage

Mitigation:

- Enforce RLS on all user-owned tables
- Automated RLS policy tests
- No service role usage in client

---

## 2.2 Query Performance at Scale

Risk:

- Slow dashboard aggregation queries
- Large transaction tables degrade performance

Mitigation:

- Index (user_id, transaction_date)
- Precompute monthly_summaries
- Avoid heavy runtime aggregation

Projected Scale:

- 10k users × 2,000 transactions/year = manageable
- 100k users requires careful indexing

---

## 2.3 Background Jobs

Risk:

- Vercel serverless timeouts
- Monthly summary generation failures

Mitigation:

- Use Supabase scheduled functions or lightweight queue
- Keep monthly summary jobs small and idempotent

---

## 2.4 Storage Growth

Risk:

- Chat logs + transactions grow quickly

Mitigation:

- Archive chat sessions older than 90 days (optional)
- Keep AI logs minimal
- Monitor table growth quarterly

---

# 3. AI Cost & Latency Risk Audit

## 3.1 LLM Overuse

Risk:

- High per-user AI cost
- Unpredictable billing

Mitigation:

- Categorization uses rules first, LLM fallback rarely
- Insights generated monthly, not per login
- Chat limited to recent session context

---

## 3.2 Prompt Size Explosion

Risk:

- Injecting too many transactions into LLM context

Mitigation:

- Pre-aggregate data before sending
- Inject structured JSON summary only
- Never send raw transaction lists unless scoped

---

## 3.3 Latency

Risk:

- Slow AI responses (>5s)
- Perceived app slowness

Mitigation:

- Stream responses
- Show loading indicator
- Cache repeated queries ("How much did I spend on food?")

---

## 3.4 Hallucination & Advice Risk

Risk:

- AI gives investment/tax advice
- Regulatory exposure

Mitigation:

- Hard-coded system prompts forbidding advice
- Detect restricted topics
- Return safe fallback response

---

# 4. Cost Modeling (Rough Projection)

Assume:

- 10k active users
- 2 AI chats per week per user
- 1 monthly summary per user

Estimated AI Load:

- 80k chats/month
- 10k summaries/month

Mitigation Strategy:

- Optimize prompt size
- Prefer smaller LLM where sufficient
- Cache deterministic responses

Cost remains manageable if LLM usage is controlled.

---

# 5. Scalability Path (Without Over-Engineering)

At 10k users:

- Current architecture sufficient

At 50k–100k users:

- Add Redis cache layer
- Move AI orchestration to dedicated service
- Consider read replicas for heavy queries

No need for microservices in V1.

---

# 6. Highest-Risk Areas (Ranked)

1. AI cost runaway due to misuse
2. Bank sync inconsistency across regions
3. RLS misconfiguration
4. Query slowdown from poor indexing

All manageable with discipline.

---

# 7. Overall Risk Rating

Technical feasibility: ✅ High
Operational complexity: ⚠ Moderate
Cost volatility risk: ⚠ Moderate
Security risk (with RLS): ✅ Controlled

Conclusion:
V1 architecture is sound if guardrails are enforced and scope remains strict.
