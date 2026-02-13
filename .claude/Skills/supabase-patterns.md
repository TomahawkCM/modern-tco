---
name: supabase-patterns
description: Use when implementing Supabase features — RLS policies, real-time subscriptions, edge functions, auth flows, or PostgREST API patterns.
---

# Supabase Patterns

## Overview

Standardized patterns for using Supabase in the budget app — Row Level Security (RLS) policies, real-time subscriptions, authentication flows, edge functions, and database migrations. Extends the existing `db-migration` skill with Supabase-specific implementation patterns.

## When to Use

- Creating new database tables with RLS policies
- Implementing real-time subscriptions
- Building authentication flows (email, OAuth, passkeys)
- Deploying Supabase Edge Functions
- Writing PostgREST queries
- Setting up database triggers and functions

## Core Principles

- **RLS on everything** — Every table must have Row Level Security enabled
- **User-scoped data** — Default RLS: users only see their own data
- **Family-aware RLS** — Shared data accessible to family group members
- **Edge functions for sensitive logic** — API keys, Plaid tokens, etc.
- **Migrations are versioned** — All schema changes through migration files

## Workflow

### Step 1: Create Table with RLS

```sql
-- Migration: create_transactions_table
CREATE TABLE public.encrypted_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  encrypted_data TEXT NOT NULL,        -- AES-256-GCM ciphertext
  iv TEXT NOT NULL,                    -- Base64 IV
  auth_tag TEXT NOT NULL,              -- Base64 auth tag
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  sync_version INTEGER DEFAULT 1
);

-- Enable RLS
ALTER TABLE public.encrypted_transactions ENABLE ROW LEVEL SECURITY;

-- User can only access their own records
CREATE POLICY "Users can view own transactions"
  ON public.encrypted_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.encrypted_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.encrypted_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.encrypted_transactions FOR DELETE
  USING (auth.uid() = user_id);
```

### Step 2: Family Sharing RLS

```sql
-- Family members can access shared records
CREATE POLICY "Family members can view shared records"
  ON public.encrypted_shared_budgets FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.family_members
      WHERE group_id = encrypted_shared_budgets.group_id
    )
  );

-- Only admins can modify shared records
CREATE POLICY "Family admins can modify shared records"
  ON public.encrypted_shared_budgets FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.family_members
      WHERE group_id = encrypted_shared_budgets.group_id
        AND role = 'admin'
    )
  );
```

### Step 3: Real-Time Subscriptions

```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function useRealtimeRecords(table: string) {
  const [records, setRecords] = useState<Record[]>([]);

  useEffect(() => {
    // Initial fetch
    supabase.from(table).select('*').then(({ data }) => {
      if (data) setRecords(data);
    });

    // Subscribe to changes
    const channel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              setRecords(prev => [...prev, payload.new as Record]);
              break;
            case 'UPDATE':
              setRecords(prev => prev.map(r =>
                r.id === payload.new.id ? payload.new as Record : r
              ));
              break;
            case 'DELETE':
              setRecords(prev => prev.filter(r => r.id !== payload.old.id));
              break;
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [table]);

  return records;
}
```

### Step 4: Authentication Patterns

```ts
// Email/password sign up
async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

// OAuth (Google, Apple, GitHub)
async function signInWithOAuth(provider: 'google' | 'apple' | 'github') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

// Session management
function useSession() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => subscription.unsubscribe();
  }, []);

  return session;
}
```

### Step 5: Edge Functions

```ts
// supabase/functions/plaid-sync/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Verify JWT
  const authHeader = req.headers.get('Authorization')!;
  const { data: { user }, error } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (error || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Edge function logic (e.g., Plaid sync with server-side API keys)
  const result = await syncPlaidTransactions(user.id);

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Step 6: Database Migration Workflow

```bash
# Create new migration
npx supabase migration new create_family_table

# Edit migration file
# supabase/migrations/TIMESTAMP_create_family_table.sql

# Apply locally
npx supabase db push

# Apply to production
npx supabase db push --linked
```

## Key Files

| File | Role |
|------|------|
| `src/app/api/` | API routes using Supabase client |
| `src/lib/` | Supabase client configuration |
| `supabase/migrations/` | Database migration files |
| `supabase/functions/` | Edge functions |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Table without RLS enabled | Always `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` |
| Using service role key client-side | Only use anon key client-side; service role is server-only |
| Not cleaning up real-time subscriptions | Always `removeChannel()` in cleanup |
| Forgetting `auth.uid()` in RLS policies | Every policy should reference `auth.uid()` |
| Direct SQL queries bypassing RLS | Use Supabase client which respects RLS |

## Validation Checklist

- [ ] RLS enabled on every new table
- [ ] RLS policies cover SELECT, INSERT, UPDATE, DELETE
- [ ] Family sharing RLS restricts to group members
- [ ] Real-time subscriptions cleaned up on unmount
- [ ] Auth flows handle all error states
- [ ] Edge functions verify JWT before processing
- [ ] Migrations versioned and tested locally first
- [ ] Service role key never exposed to client

## Related Skills

- `db-migration` — database migration workflow
- `e2e-encryption` — encrypted data in Supabase tables
- `family-sharing` — family-aware RLS policies
- `real-time-sync` — real-time data synchronization
