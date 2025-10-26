-- Migration: Add reference columns to questions table
-- Adds optional columns for tracking content sources

-- Add study_guide_ref column for linking to study materials
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS study_guide_ref TEXT;

-- Add official_ref column for linking to official Tanium documentation
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS official_ref TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.questions.study_guide_ref IS 'Reference to study guide section or module (e.g., "Module 1: Asking Questions")';
COMMENT ON COLUMN public.questions.official_ref IS 'Reference to official Tanium documentation URL or page';
