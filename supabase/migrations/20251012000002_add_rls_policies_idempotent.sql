-- Enable Row Level Security on core tables (idempotent)
-- Created: 2025-10-12
-- Purpose: Add RLS policies to protect user data in core progress tracking tables
-- This migration is idempotent and will drop existing policies before creating new ones

-- Enable RLS on core tables (these commands are idempotent)
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.questions ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- DROP EXISTING POLICIES (if they exist)
-- ==============================================

-- Users table
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- User progress table
DROP POLICY IF EXISTS "user_progress_select_own" ON public.user_progress;
DROP POLICY IF EXISTS "user_progress_insert_own" ON public.user_progress;
DROP POLICY IF EXISTS "user_progress_update_own" ON public.user_progress;
DROP POLICY IF EXISTS "user_progress_delete_own" ON public.user_progress;

-- Exam sessions table
DROP POLICY IF EXISTS "exam_sessions_select_own" ON public.exam_sessions;
DROP POLICY IF EXISTS "exam_sessions_insert_own" ON public.exam_sessions;
DROP POLICY IF EXISTS "exam_sessions_update_own" ON public.exam_sessions;
DROP POLICY IF EXISTS "exam_sessions_delete_own" ON public.exam_sessions;

-- User statistics table
DROP POLICY IF EXISTS "user_statistics_select_own" ON public.user_statistics;
DROP POLICY IF EXISTS "user_statistics_insert_own" ON public.user_statistics;
DROP POLICY IF EXISTS "user_statistics_update_own" ON public.user_statistics;

-- Questions table
DROP POLICY IF EXISTS "questions_select_auth" ON public.questions;
DROP POLICY IF EXISTS "questions_update_creator" ON public.questions;
DROP POLICY IF EXISTS "questions_delete_creator" ON public.questions;

-- ==============================================
-- USERS TABLE POLICIES
-- ==============================================

-- Users can read their own profile
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- ==============================================
-- USER_PROGRESS TABLE POLICIES
-- ==============================================

-- Users can view their own progress
CREATE POLICY "user_progress_select_own" ON public.user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "user_progress_insert_own" ON public.user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "user_progress_update_own" ON public.user_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own progress (for reset scenarios)
CREATE POLICY "user_progress_delete_own" ON public.user_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================
-- EXAM_SESSIONS TABLE POLICIES
-- ==============================================

-- Users can view their own exam sessions
CREATE POLICY "exam_sessions_select_own" ON public.exam_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own exam sessions
CREATE POLICY "exam_sessions_insert_own" ON public.exam_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own exam sessions
CREATE POLICY "exam_sessions_update_own" ON public.exam_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own exam sessions (for reset scenarios)
CREATE POLICY "exam_sessions_delete_own" ON public.exam_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================
-- USER_STATISTICS TABLE POLICIES
-- ==============================================

-- Users can view their own statistics
CREATE POLICY "user_statistics_select_own" ON public.user_statistics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Statistics are automatically updated via triggers, 
-- but allow insert/update for manual corrections if needed
CREATE POLICY "user_statistics_insert_own" ON public.user_statistics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_statistics_update_own" ON public.user_statistics
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ==============================================
-- QUESTIONS TABLE POLICIES (Read-only for students)
-- ==============================================

-- All authenticated users can read questions
CREATE POLICY "questions_select_auth" ON public.questions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins or question creators can modify questions
CREATE POLICY "questions_update_creator" ON public.questions
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "questions_delete_creator" ON public.questions
  FOR DELETE
  USING (auth.uid() = created_by);

-- ==============================================
-- AUTO-INSERT NEW USERS
-- ==============================================

-- Create a trigger to automatically insert into public.users when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at, updated_at, last_login)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Idempotent: don't fail if user already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================
-- COMMENTS & DOCUMENTATION
-- ==============================================

COMMENT ON POLICY "users_select_own" ON public.users IS 
  'Users can only read their own profile data';

COMMENT ON POLICY "user_progress_select_own" ON public.user_progress IS 
  'Users can only view their own progress records';

COMMENT ON POLICY "exam_sessions_select_own" ON public.exam_sessions IS 
  'Users can only view their own exam sessions';

COMMENT ON POLICY "user_statistics_select_own" ON public.user_statistics IS 
  'Users can only view their own statistics';

COMMENT ON POLICY "questions_select_auth" ON public.questions IS 
  'All authenticated users can read questions for practice';
