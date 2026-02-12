---
paths:
  - "src/**"
---

# Code Quality Rules

- TypeScript strict: no `any` without justification comment
- Check existing 18 contexts in `src/contexts/` before adding new ones
- No new dependencies without bundle size justification
- Database operations must use Supabase RLS policies
- API routes must validate authentication
- No placeholder content in production code
