---
name: auth-hardening
description: Use when implementing 2FA/MFA, OAuth providers, passkeys (WebAuthn), session management, rate limiting auth endpoints, email verification, or auth audit logging.
---

# Auth Hardening

## Overview

Patterns for progressive authentication hardening in the Online Budget App. Covers rate limiting, email verification, OAuth, passkeys (WebAuthn), 2FA/TOTP, and session management.

## When to Use

- Adding rate limiting to auth endpoints
- Implementing email verification enforcement
- Adding OAuth/social login (Google, GitHub)
- Implementing passkey (WebAuthn/FIDO2) registration and login
- Building session management UI (active sessions, logout all)
- Adding auth event audit logging
- Implementing 2FA/TOTP

## Progressive Trust Model

```
Level 0: Email + password (baseline)
Level 1: + email verified + rate limited
Level 2: + OAuth option + session management
Level 3: + passkey option
Level 4: + 2FA/TOTP
```

Each level builds on the previous — never skip levels.

## Rate Limiting Pattern (Supabase-backed)

Use a `rate_limits` table instead of in-memory Map (persists across deployments):

```sql
CREATE TABLE public.rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  window_ms INTEGER NOT NULL
);

-- Cleanup function (call via pg_cron or on each check)
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void AS $$
  DELETE FROM rate_limits
  WHERE window_start + (window_ms || ' milliseconds')::interval < now();
$$ LANGUAGE sql;
```

### Auth Endpoint Limits
| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5 requests | 1 minute |
| Signup | 3 requests | 1 minute |
| Forgot password | 2 requests | 1 minute |
| Resend verification | 3 requests | 5 minutes |

## Email Verification Flow

1. User signs up → Supabase sends verification email automatically
2. User tries to login → check `email_confirmed_at` on auth.users
3. If null → redirect to `/verify-email` page with "resend" button
4. After verification → redirect to onboarding/dashboard

### Key: Supabase handles the email sending
Don't build custom email sending — use `supabase.auth.resend({ type: 'signup', email })`.

## Auth Audit Logging

```sql
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,  -- 'login_success', 'login_failure', 'signup', 'password_reset', 'logout'
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Log events server-side only — never from the client.

## Session Management

Supabase doesn't expose active sessions directly. Options:
1. Track sessions manually in a `user_sessions` table
2. Use `supabase.auth.signOut({ scope: 'global' })` for "logout all devices"
3. Show last login time from audit_log

## OAuth Implementation (Supabase)

1. Enable provider in Supabase Dashboard → Authentication → Providers
2. Add callback route: `app/(auth)/callback/route.ts`
3. Use `supabase.auth.signInWithOAuth({ provider: 'google' })`
4. Handle account linking (existing email → link OAuth identity)

## Passkey (WebAuthn) Pattern

Use `@simplewebauthn/server` + `@simplewebauthn/browser`:
1. Registration: generate challenge → user creates credential → verify & store public key
2. Authentication: generate challenge → user signs → verify signature
3. Store credentials in `user_credentials` table with device name

## Security Rules

- Never expose rate limit internals in error messages
- Use service role key for audit log writes (bypasses RLS)
- Always hash/mask IP addresses in logs after 90 days (GDPR)
- OAuth tokens are managed by Supabase — don't store them yourself
- Passkey private keys never leave the device — only store public keys
