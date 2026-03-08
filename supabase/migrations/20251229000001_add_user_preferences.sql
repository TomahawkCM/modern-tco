-- Migration: Add user_preferences table for Budget App
-- Task 11: Persistence Upgrade - Supabase Sync + Migrations
-- Created: 2025-12-29

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Locale preferences (language, region, currency, week start)
  locale_config JSONB DEFAULT '{}'::jsonb,

  -- Widget dashboard configuration
  widget_config JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure one preference row per user
  CONSTRAINT user_preferences_user_id_unique UNIQUE(user_id)
);

-- Add index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id
  ON public.user_preferences(user_id);

-- Add index on updated_at for sync operations
CREATE INDEX IF NOT EXISTS idx_user_preferences_updated_at
  ON public.user_preferences(updated_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
  ON public.user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function on update
DROP TRIGGER IF EXISTS trigger_update_user_preferences_updated_at
  ON public.user_preferences;

CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_preferences_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.user_preferences IS 'Budget App user preferences: locale settings and widget dashboard configuration. Syncs with localStorage (localStorage-first strategy).';
COMMENT ON COLUMN public.user_preferences.locale_config IS 'JSONB: { locale, region, currency, weekStart, timezone, updatedAt }';
COMMENT ON COLUMN public.user_preferences.widget_config IS 'JSONB: { widgets: [...], updatedAt, version }';
