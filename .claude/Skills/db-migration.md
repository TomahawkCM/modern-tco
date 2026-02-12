---
name: db-migration
description: Use when making Supabase database schema changes (tables, columns, RLS policies, functions)
---

# Database Migration Workflow

Step-by-step process for Supabase schema changes in this project.

## Steps

### 1. Create migration SQL

Write the migration SQL. Include both the forward migration and a rollback comment:

```sql
-- Migration: descriptive_name
-- Description: What this migration does

-- Forward
ALTER TABLE budget_entries ADD COLUMN category_id UUID REFERENCES categories(id);

-- Rollback (manual, for reference)
-- ALTER TABLE budget_entries DROP COLUMN category_id;
```

### 2. Update RLS policies

If the migration changes table structure or adds new tables, review and update Row Level Security policies:

- New tables must have RLS enabled: `ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;`
- Add appropriate policies for SELECT, INSERT, UPDATE, DELETE
- Never allow unrestricted access — always scope to authenticated user
- Test that service role bypass is not used in client code

### 3. Update TypeScript types

Update the TypeScript types to match the new schema:

- Database types in the relevant type files
- Zod schemas if validation needs updating
- Any interfaces that map to the changed tables

### 4. Test with Supabase MCP

Use the `supabase` MCP server to verify:

- `mcp__supabase__sqlToRest` — confirm the new schema generates correct REST queries
- `mcp__supabase__postgrestRequest` — test CRUD operations against the updated schema

### 5. Verify locally

Before pushing:

- Run `npm run check-types` to ensure type safety
- Run `npm test` to catch any broken tests
- Test the affected UI flows manually
- Confirm RLS policies work by testing as different user roles

## Key files

| Purpose | Location |
|---------|----------|
| Supabase config | Project settings, env vars |
| Type definitions | `src/types/` |
| Database wrappers | `src/lib/encryption/encrypted-db-wrapper.ts` |
| API routes | `src/app/api/` |

## Reminders

- All PII/financial data must remain encrypted at rest
- Use `encrypted-db-wrapper.ts` for any new tables containing sensitive data
- `SUPABASE_ACCESS_TOKEN` env var must be set
- Never commit service role keys or connection strings
