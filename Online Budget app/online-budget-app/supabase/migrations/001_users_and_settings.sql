-- Migration: 001_users_and_settings
-- Creates users and user_settings tables with RLS policies
-- Per V1-DATABASE-SCHEMA-DESIGN.md

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

  -- Auto-provision 14-day trial subscription
  INSERT INTO public.subscriptions (user_id, status, tier, trial_end)
  VALUES (NEW.id, 'trialing', 'premium', now() + interval '14 days');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
