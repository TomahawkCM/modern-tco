# Supabase Setup (Local Dev)

This app uses Supabase for persistence. Configure credentials via environment variables and do NOT commit secrets to the repository.

## Required Environment Variables

Create `modern-tco/.env.local` with the following keys (replace placeholders with your values):

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-api-key

# Server-only (for scripts/seeding — never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional (CLI/automation)
SUPABASE_ACCESS_TOKEN=your-supabase-pat
SUPABASE_DB_URL=postgresql://postgres:<password>@<host>:5432/postgres
```

Security notes
- Never commit `.env.local` or any keys to source control.
- If a secret is exposed, rotate it immediately in the Supabase dashboard.

## Notes Schema

Two migrations define and extend the notes feature:

- `supabase/migrations/20250921120000_add_notes_table.sql`
- `supabase/migrations/20250921121000_notes_add_section_refs.sql`

If CLI application of SQL is blocked by networking, paste both files into the Supabase SQL editor and run in order. The table is `public.notes` with RLS to restrict rows to the owning `user_id`.

## App Usage

- The app reads `NEXT_PUBLIC_SUPABASE_*` for client and `SUPABASE_SERVICE_ROLE_KEY` for server admin.
- Notes page `/notes` will sync when signed in. Offline/signed-out stays local.

Security: Keep credentials out of the repo. Use `.env.local` for local development and rotate keys before production.
