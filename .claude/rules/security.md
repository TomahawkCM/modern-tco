---
paths:
  - "src/app/api/**"
  - "src/lib/encryption/**"
  - "src/lib/**"
---

# Security Rules

- All PII and financial data must be encrypted at rest via `encrypted-db-wrapper.ts`
- Never log sensitive data (passwords, tokens, financial amounts)
- API routes: validate authentication before processing any request
- Environment variables: never hardcode secrets, use `.env.local`
- Supabase: always use RLS policies, never bypass with service role key in client code
- CORS: API routes should validate origin for sensitive endpoints
- Input validation: use Zod schemas at all API boundaries
- Never expose stack traces or internal error details to the client
