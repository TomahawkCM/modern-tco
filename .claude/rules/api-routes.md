---
paths:
  - "src/app/api/**"
---

# API Route Rules

- Next.js App Router conventions: export named functions `GET`, `POST`, `PUT`, `DELETE`, `PATCH`
- Validate all input with Zod schemas before processing
- Return consistent error format: `NextResponse.json({ error: string }, { status: number })`
- Return success format: `NextResponse.json({ data: T }, { status: 200 })`
- Use `NextRequest` and `NextResponse` from `next/server`
- Handle errors with try/catch — never let unhandled errors leak to client
- Rate-sensitive endpoints (AI, external APIs) should include appropriate error handling for quota/timeout
- Supabase operations should use the server-side client from `@supabase/ssr`
