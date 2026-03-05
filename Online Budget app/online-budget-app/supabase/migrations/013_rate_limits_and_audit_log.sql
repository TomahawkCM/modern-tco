-- Migration: 013_rate_limits_and_audit_log
-- Creates rate_limits table (persistent, TTL-based) and audit_log table for auth events

-- ── Rate Limits ─────────────────────────────────────────────────────
-- Persistent rate limiting (replaces in-memory Map)
-- Key format: "rate-limit:{endpoint}:{ip}" e.g. "rate-limit:login:1.2.3.4"

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  window_ms INTEGER NOT NULL DEFAULT 60000
);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_window
  ON public.rate_limits (window_start);

-- Cleanup expired rate limit entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.rate_limits
  WHERE window_start + make_interval(secs := window_ms / 1000.0) < now();
$$;

-- No RLS on rate_limits — accessed via service role only
-- (rate limiting happens server-side before auth check)

-- ── Audit Log ───────────────────────────────────────────────────────
-- Records auth events: login, signup, password reset, logout, etc.

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at DESC);

-- Enable RLS (admins can read all, users can read their own)
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select_own" ON public.audit_log
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Insert policy: only service role can insert (server-side only)
-- No INSERT policy for authenticated role — use service role key

-- ── Add role column to users table ──────────────────────────────────
-- RBAC: owner, admin, member, viewer

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'role'
  ) THEN
    ALTER TABLE public.users
      ADD COLUMN role TEXT NOT NULL DEFAULT 'member'
      CHECK (role IN ('owner', 'admin', 'member', 'viewer'));
  END IF;
END $$;
