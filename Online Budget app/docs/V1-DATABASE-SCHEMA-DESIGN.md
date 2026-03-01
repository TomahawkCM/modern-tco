# Online Budget App — V1 Database Schema Design (Supabase/Postgres)

Status: Planning
Last Updated: 2026-02-22
Database: Supabase (PostgreSQL)
Scope: V1 (Strict)
Requirements:

- Multi-language support
- Multi-currency support
- Bank sync
- AI features (grounded + safe)
- Clean, not over-engineered

---

# 1. Design Principles

1. Deterministic financial data (no AI-generated numbers stored as truth).
2. Multi-currency native storage (no silent conversion).
3. Locale handled at user level (not per transaction).
4. AI outputs are derived artifacts, never source of truth.
5. Avoid premature abstraction.
6. Use Postgres constraints aggressively (integrity > clever code).

---

# 2. Core Entities Overview

Core tables:

- users
- user_settings
- accounts
- institutions
- transactions
- categories
- user_category_overrides
- budgets
- goals
- monthly_summaries
- ai_insights
- chat_sessions
- chat_messages

Support tables:

- merchant_mappings
- fx_rates (static only for V1)

---

# 3. Users & Localization

## users

Stores auth identity (linked to Supabase auth).

Fields:

- id (uuid, pk)
- email
- created_at
- updated_at

---

## user_settings

One-to-one with users.

Fields:

- user_id (uuid, pk, fk -> users)
- primary_currency (varchar(3)) -- ISO 4217
- locale (varchar) -- e.g., en-CA, fr-FR
- timezone (varchar)
- language (varchar) -- UI language override
- ai_enabled (boolean)
- created_at
- updated_at

Notes:

- Currency always stored as ISO code.
- Locale formatting handled in UI.

---

# 4. Institutions & Accounts

## institutions

- id (uuid, pk)
- provider_id (external bank provider id)
- name
- country_code (ISO-3166)
- created_at

---

## accounts

- id (uuid, pk)
- user_id (fk)
- institution_id (fk)
- provider_account_id (external id)
- name
- type (checking, savings, credit, etc.)
- currency (varchar(3)) -- ISO 4217
- balance_minor (bigint) -- integer minor units
- is_manual (boolean)
- created_at
- updated_at

Rules:

- balance stored in native currency.
- No conversion stored here.

---

# 5. Transactions (Multi-Currency Safe)

## transactions

- id (uuid, pk)
- user_id (fk)
- account_id (fk)
- provider_transaction_id
- amount_minor (bigint)
- currency (varchar(3)) -- native currency
- description
- merchant_name
- category_id (fk)
- transaction_date (date)
- posted_at (timestamp)
- is_pending (boolean)
- confidence_score (numeric) -- AI categorization
- created_at
- updated_at

Important:

- Always store amount in native currency.
- Never overwrite original imported values.

---

# 6. Categories (Multi-Language Compatible)

## categories

System-level category definitions.

- id (uuid, pk)
- key (varchar) -- e.g., "groceries"
- parent_id (nullable fk)
- is_system (boolean)
- created_at

---

## category_translations

Supports all languages.

- id (uuid, pk)
- category_id (fk)
- locale (varchar)
- display_name

UI selects translation based on user_settings.locale.

---

## user_category_overrides

Allows user renaming or custom categories.

- id (uuid, pk)
- user_id (fk)
- category_id (fk nullable)
- custom_name
- created_at

---

# 7. Budgets

## budgets

- id (uuid, pk)
- user_id (fk)
- category_id (fk)
- month (date) -- normalized to first of month
- amount_minor (bigint)
- currency (varchar(3))
- rollover_enabled (boolean)
- created_at

Note:
Budget currency must match user's primary currency in V1.

---

# 8. Goals

## goals

- id (uuid, pk)
- user_id (fk)
- name
- target_amount_minor (bigint)
- currency (varchar(3))
- target_date (date)
- created_at

Progress computed dynamically from balances.

---

# 9. AI Layer Tables

## monthly_summaries

Precomputed aggregates for AI + dashboard.

- id (uuid, pk)
- user_id (fk)
- month (date)
- total_income_minor (bigint)
- total_expense_minor (bigint)
- savings_rate (numeric)
- created_at

---

## ai_insights

Stores generated AI insights (not financial truth).

- id (uuid, pk)
- user_id (fk)
- month (date)
- insight_type (varchar)
- structured_data (jsonb)
- ai_text (text)
- created_at

---

## chat_sessions

- id (uuid, pk)
- user_id (fk)
- created_at

---

## chat_messages

- id (uuid, pk)
- session_id (fk)
- role (user|assistant|system)
- content (text)
- structured_context (jsonb)
- created_at

Note:
Structured_context stores financial facts injected into prompt.

---

# 10. Merchant Mapping (AI Optimization)

## merchant_mappings

- id (uuid, pk)
- merchant_name
- normalized_name
- category_id (fk)
- confidence_score
- updated_at

Used before LLM categorization.

---

# 11. FX Rates (Static V1)

## fx_rates

- id (uuid, pk)
- base_currency (varchar(3))
- target_currency (varchar(3))
- rate (numeric)
- source (varchar)
- updated_at

Used only for display conversion.
Never modifies stored transaction values.

---

# 12. Indexing Strategy

Critical indexes:

- transactions (user_id, transaction_date)
- transactions (account_id)
- budgets (user_id, month)
- monthly_summaries (user_id, month)
- chat_sessions (user_id)

---

# 13. Row-Level Security (Supabase)

Enable RLS on all user-owned tables.
Policy:

- user_id must match auth.uid()

No cross-user access allowed.

---

# 14. Multi-Language & Currency Compliance

- Currency always ISO 4217 code.
- Money stored in minor units (integer).
- Formatting handled client-side.
- Category translations stored separately.
- AI responses generated in user's language.

Matches offline philosophy.

---

# 15. What We Avoid

- Storing converted amounts permanently.
- Storing AI-calculated totals as truth.
- Multi-tenant shared financial tables.
- Complex permission matrices in V1.
- Over-normalizing prematurely.

---

# 16. Future-Safe But Not Overbuilt

Schema allows:

- Adding family accounts later
- Adding subscription tracking table
- Adding AI embeddings table

Without restructuring core tables.

---

# Final Summary

This schema:

- Supports global currencies
- Supports all languages
- Keeps financial truth deterministic
- Keeps AI layered, not foundational
- Avoids over-engineering
- Scales cleanly on Supabase

It aligns with:

- Offline philosophy (currency-safe, locale-aware)
- Online AI architecture
- Strict V1 scope discipline
