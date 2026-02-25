# Session 2: Supabase Integration + Auth — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish secure Supabase connection with auth and RLS foundation for the Online Budget App.

**Architecture:** Cookie-based SSR auth using `@supabase/ssr` with `createBrowserClient` (singleton) and `createServerClient` (per-request). Middleware refreshes sessions on every request. RLS enforces user isolation at the database level. Server Actions handle auth operations.

**Tech Stack:** Next.js 16 App Router, @supabase/ssr, @supabase/supabase-js, Supabase PostgreSQL, TypeScript strict mode

**Exit Criteria:**
- User can sign up with email/password
- User session persists across page navigations
- RLS enabled on users table (user can only access own data)

---

## Task 1: Install Supabase Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install packages**

Run:
```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app"
npm install @supabase/supabase-js @supabase/ssr
```

Expected: packages added to dependencies in package.json

**Step 2: Verify install**

Run: `npm run check-types`
Expected: PASS (no type errors)

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat(auth): install Supabase SSR and JS client packages"
```

---

## Task 2: Create Environment Configuration

**Files:**
- Create: `.env.example`
- Create: `.env.local` (from template, with real or placeholder values)

**Step 1: Create .env.example**

```env
# Supabase — Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase — Server-only (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Step 2: Create .env.local with working values**

Copy from the existing project's `.env.local` at `/home/robne/projects/active/tanium-tco/modern-tco/.env.local` — use the same Supabase project URL and keys (they share the Supabase instance).

**Step 3: Verify .gitignore includes .env***

Read `.gitignore` — confirm `.env*` line exists (it does from create-next-app).

**Step 4: Commit**

```bash
git add .env.example
git commit -m "feat(auth): add environment variable template for Supabase"
```

---

## Task 3: Create Database Types

**Files:**
- Create: `supabase/database.types.ts`

**Step 1: Create initial type definitions**

Define TypeScript types matching V1-DATABASE-SCHEMA-DESIGN.md for the tables needed in Session 2: `users` and `user_settings`. Use the pattern from the existing project's `src/types/supabase.ts`.

```typescript
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          primary_currency: string;
          locale: string;
          timezone: string;
          language: string;
          ai_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          primary_currency?: string;
          locale?: string;
          timezone?: string;
          language?: string;
          ai_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          primary_currency?: string;
          locale?: string;
          timezone?: string;
          language?: string;
          ai_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Helper types for type-safe queries
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
```

**Step 2: Verify types compile**

Run: `npm run check-types`
Expected: PASS

**Step 3: Commit**

```bash
git add supabase/database.types.ts
git commit -m "feat(auth): add initial database type definitions for users and user_settings"
```

---

## Task 4: Create Supabase Browser Client

**Files:**
- Create: `lib/supabase/client.ts`

**Step 1: Create browser client with singleton pattern**

```typescript
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/supabase/database.types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return browserClient;
}
```

**Step 2: Verify types compile**

Run: `npm run check-types`
Expected: PASS

**Step 3: Commit**

```bash
git add lib/supabase/client.ts
git commit -m "feat(auth): add Supabase browser client with singleton pattern"
```

---

## Task 5: Create Supabase Server Client

**Files:**
- Create: `lib/supabase/server.ts`

**Step 1: Create server client factory**

Uses `await cookies()` (Next.js 16 async pattern). Includes try/catch in setAll for Server Component safety.

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/supabase/database.types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from Server Component — safe to ignore
            // when middleware handles session refresh
          }
        },
      },
    }
  );
}
```

**Step 2: Verify types compile**

Run: `npm run check-types`
Expected: PASS

**Step 3: Commit**

```bash
git add lib/supabase/server.ts
git commit -m "feat(auth): add Supabase server client with cookie-based sessions"
```

---

## Task 6: Create Middleware for Session Refresh

**Files:**
- Create: `middleware.ts` (project root)

**Step 1: Create middleware**

Refreshes Supabase auth session on every request. Must recreate the response to propagate cookie changes. Matcher excludes static files.

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — IMPORTANT: do not remove
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Step 2: Verify types compile**

Run: `npm run check-types`
Expected: PASS

**Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat(auth): add middleware for Supabase session refresh"
```

---

## Task 7: Create SQL Migration — Users + User Settings with RLS

**Files:**
- Create: `supabase/migrations/001_users_and_settings.sql`

**Step 1: Write migration**

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User settings (one-to-one with users)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  primary_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  locale VARCHAR(10) NOT NULL DEFAULT 'en-US',
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  ai_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for users
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- RLS policies for user_settings
CREATE POLICY "settings_select_own" ON public.user_settings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "settings_insert_own" ON public.user_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "settings_update_own" ON public.user_settings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create user row + settings on signup (via auth trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Step 2: Commit**

```bash
git add supabase/migrations/001_users_and_settings.sql
git commit -m "feat(auth): add users and user_settings migration with RLS policies"
```

Note: This migration is applied to Supabase via `supabase db push` or the dashboard SQL editor. Automated migration application is out of Session 2 scope.

---

## Task 8: Create Auth Server Actions

**Files:**
- Create: `app/(auth)/actions.ts`

**Step 1: Create server actions for signup, login, signout**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
```

**Step 2: Verify types compile**

Run: `npm run check-types`
Expected: PASS

**Step 3: Commit**

```bash
git add "app/(auth)/actions.ts"
git commit -m "feat(auth): add server actions for signup, login, and signout"
```

---

## Task 9: Create Sign-Up Page

**Files:**
- Create: `app/(auth)/signup/page.tsx`

**Step 1: Create signup page**

Minimal, functional form. No UI polish (Session 2 scope is auth infra, not design).

```tsx
import { signUp } from "../actions";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form className="flex w-full max-w-sm flex-col gap-4 p-4">
        <h1 className="text-2xl font-semibold">Create Account</h1>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded border px-3 py-2"
        />
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="rounded border px-3 py-2"
        />
        <button
          formAction={signUp}
          className="rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700"
        >
          Sign Up
        </button>
        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <a href="/login" className="underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}
```

**Step 2: Verify types compile**

Run: `npm run check-types`
Expected: PASS

**Step 3: Commit**

```bash
git add "app/(auth)/signup/page.tsx"
git commit -m "feat(auth): add sign-up page with email/password form"
```

---

## Task 10: Create Login Page

**Files:**
- Create: `app/(auth)/login/page.tsx`

**Step 1: Create login page**

```tsx
import { signIn } from "../actions";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form className="flex w-full max-w-sm flex-col gap-4 p-4">
        <h1 className="text-2xl font-semibold">Log In</h1>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded border px-3 py-2"
        />
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="rounded border px-3 py-2"
        />
        <button
          formAction={signIn}
          className="rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700"
        >
          Log In
        </button>
        <p className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="underline">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
```

**Step 2: Verify types compile**

Run: `npm run check-types`
Expected: PASS

**Step 3: Commit**

```bash
git add "app/(auth)/login/page.tsx"
git commit -m "feat(auth): add login page with email/password form"
```

---

## Task 11: Create Auth Callback Route

**Files:**
- Create: `app/(auth)/callback/route.ts`

**Step 1: Create email confirmation callback**

Handles the redirect from Supabase email confirmation links. Exchanges the code for a session.

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(origin);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
```

**Step 2: Verify types compile**

Run: `npm run check-types`
Expected: PASS

**Step 3: Commit**

```bash
git add "app/(auth)/callback/route.ts"
git commit -m "feat(auth): add auth callback route for email confirmation"
```

---

## Task 12: Update Home Page with Auth State

**Files:**
- Modify: `app/page.tsx`

**Step 1: Update home page to show auth state**

Display current user or link to login. Uses server component with Supabase server client.

```tsx
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./(auth)/actions";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Online Budget App
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          AI-powered, bank-connected global budgeting
        </p>
        {user ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-zinc-500">Signed in as {user.email}</p>
            <form>
              <button
                formAction={signOut}
                className="rounded border px-4 py-2 text-sm hover:bg-zinc-100"
              >
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex gap-4">
            <a
              href="/login"
              className="rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700"
            >
              Log In
            </a>
            <a
              href="/signup"
              className="rounded border px-4 py-2 hover:bg-zinc-100"
            >
              Sign Up
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: PASS — compiles with dynamic rendering (auth requires cookies)

**Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(auth): update home page with auth state display"
```

---

## Task 13: Final Verification + PROGRESS_LOG

**Step 1: Run all checks**

```bash
npm run check-types  # TypeScript strict
npm run lint         # ESLint
npm run build        # Production build
```

All must pass.

**Step 2: Verify folder structure compliance**

Confirm no new top-level folders added (only `lib/supabase/` subdirectory is new — within allowed `lib/` boundary). Confirm `middleware.ts` at project root is standard Next.js convention.

**Step 3: Update PROGRESS_LOG.md**

Append Session 2 entry with: files created, architectural decisions (cookie-based SSR auth, singleton browser client, auto-create user on signup trigger), RLS policies added, and next session target (Session 3: Stripe subscription foundation).

**Step 4: Final commit**

```bash
git add -A
git commit -m "docs: update PROGRESS_LOG with Session 2 completion"
```

---

## Architecture Notes for the Implementing Engineer

1. **Why cookie-based auth?** — SSR requires cookie storage (not localStorage) so server components and middleware can access sessions.

2. **Why singleton browser client?** — Prevents "Multiple GoTrueClient instances" warning. One client reused across all browser-side code.

3. **Why server client per-request?** — Each request has its own cookies. Server client MUST be created fresh per request to read the correct session.

4. **Why middleware?** — Supabase auth tokens expire. Middleware refreshes them on every request BEFORE the page renders, preventing stale sessions.

5. **Why `handle_new_user` trigger?** — When a user signs up via Supabase Auth, a row in `auth.users` is created automatically. The trigger creates matching rows in our `public.users` and `public.user_settings` tables. This avoids requiring the frontend to make a separate API call after signup.

6. **Why route group `(auth)`?** — The parentheses make it a Next.js route group — it organizes files without affecting the URL structure. `/signup`, `/login`, `/callback` are the actual URLs.

7. **RLS is non-negotiable.** — Every user-owned table MUST have RLS enabled with `auth.uid() = user_id` (or `= id` for users table). No exceptions.
