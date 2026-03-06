# Online Budget App — V1 AI Architecture

Status: Planning
Last Updated: 2026-02-21
Scope: Safe, Scalable, Not Over-Engineered
Hosting: Vercel (Serverless)

---

# 1. AI Philosophy for V1

AI in V1 is not autonomous financial planning.
It is:

> An intelligence layer that explains, categorizes, summarizes, and answers financial questions safely.

AI must:

- Improve clarity
- Reduce friction
- Be transparent
- Be grounded in real data
- Avoid regulated financial advice
- Remain cost-controlled and scalable

No experimental AI features ship in V1.

---

# 2. AI Capability Layers (V1 Only)

AI is divided into 4 bounded services.

1. Transaction Categorization
2. Insight Generation
3. Conversational Finance Assistant
4. Lightweight Affordability Modeling

Each service is isolated and independently scalable.

---

# 3. High-Level Architecture

Client (Next.js)
↓
Vercel API Layer
↓
AI Orchestration Layer
↓
LLM Provider + Internal Logic
↓
Postgres (grounded data)

No microservices.
No distributed event bus.
Single orchestration layer.

---

# 4. Core AI Services

---

## 4.1 Transaction Categorization Service

Purpose:
Auto-categorize bank transactions.

Flow:

1. Bank sync imports transaction
2. Transaction normalized
3. Categorization service checks:
   - User custom mapping (highest priority)
   - Known merchant mapping table
   - Lightweight ML classifier
   - LLM fallback (rare)

Output:

- Category
- Confidence score

Learning Loop:

- User corrections stored
- Merchant-category mapping updated
- Optional periodic model fine-tuning

Design Rules:

- LLM not required for every transaction
- Use deterministic logic first
- Keep inference cost low

---

## 4.2 Insight Generation Service

Purpose:
Generate plain-language financial summaries.

Input:

- Monthly transaction aggregates
- Budget data
- Income vs expense trends
- Subscription detection results

Process:

1. Deterministic data analysis layer computes metrics
2. Structured JSON summary created
3. LLM converts structured summary into human explanation

Important:
LLM never calculates totals.
All math done in deterministic code.

Example:
System computes:

- Dining spend up 18%
- Savings rate 9%
- 3 new subscriptions

LLM transforms into:
"You spent 18% more on dining this month compared to your 3-month average."

Safety:

- Prompt templates locked
- No open-ended financial advice generation

---

## 4.3 Conversational Finance Assistant

Purpose:
Answer user questions about their own financial data.

Architecture:
Retrieval-Augmented Generation (RAG)

Steps:

1. User asks question
2. System parses intent
3. Deterministic query engine retrieves relevant financial data
4. Structured data injected into LLM prompt
5. LLM produces explanation

Rules:

- LLM never queries database directly
- LLM receives only precomputed structured JSON
- Guardrails prevent investment/tax/legal advice

Example:
User: "How much did I spend on food last month?"
System computes total first.
LLM explains result.

---

## 4.4 Affordability Engine (Lightweight)

Purpose:
Answer: "Can I afford X?"

Process:

1. Parse user input (amount, recurring or one-time)
2. Deterministic projection using:
   - Average income
   - Recurring expenses
   - Budget surplus
3. LLM explains outcome

No deep simulation.
No long-term forecasting.

---

# 5. Safety Architecture

---

## 5.1 Advice Guardrails

LLM prompt must explicitly forbid:

- Investment recommendations
- Tax advice
- Legal advice
- Insurance advice

If user asks restricted questions:
Return safe response with disclaimer.

---

## 5.2 Hallucination Control

- LLM receives only structured facts
- No open-ended financial reasoning
- No speculative forecasting
- All numbers precomputed

---

## 5.3 Logging & Auditability

Store:

- User question
- Structured data sent to LLM
- LLM output

This allows:

- Debugging
- Safety auditing
- Quality improvement

---

# 6. Scalability Model

---

## 6.1 Cost Control Strategy

- Categorization uses rules first, LLM fallback rarely
- Insights generated monthly, not continuously
- Chat uses context trimming
- No long conversation memory in V1

---

## 6.2 Serverless Deployment

- Vercel API routes
- Stateless functions
- Short execution windows
- Background sync jobs scheduled

---

## 6.3 Future Scaling Path

If usage grows:

- Separate AI orchestration into dedicated service
- Add caching layer for repeated queries
- Introduce vector database if RAG grows

Not required for V1.

---

# 7. Data Privacy & Security

- All financial data stored encrypted at rest
- AI receives only minimal necessary fields
- No third-party data retention beyond provider requirements
- User can disable AI features
- Transparent AI usage policy

---

# 8. Multi-Language Strategy

LLM handles:

- Natural language generation
- Multilingual responses

System layer handles:

- Numeric calculations
- Currency formatting
- Locale-specific data

No language-specific AI models required in V1.

---

# 9. Performance Targets

- Categorization: < 300ms average
- Insight generation: < 3 seconds
- Chat response: < 5 seconds
- Monthly insight generation runs async

---

# 10. What We Explicitly Avoid in V1

- Autonomous financial agents
- Continuous AI monitoring loop
- Real-time prediction engine
- Investment advisory engine
- Complex memory graph
- Multi-model orchestration
- Custom model training infrastructure

Keep it simple.

---

# 11. V1 AI Summary

AI in V1 is:

- Grounded
- Deterministic-backed
- Cost-aware
- Guardrailed
- Human-friendly
- Not over-engineered

It enhances clarity.
It does not replace financial judgment.

This is competitive without being reckless.
