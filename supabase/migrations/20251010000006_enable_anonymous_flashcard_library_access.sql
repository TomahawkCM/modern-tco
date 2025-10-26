-- =====================================================
-- Migration: Enable Anonymous Access to Flashcard Library
-- Date: October 11, 2025
-- Purpose: Allow anonymous users to browse AI-curated flashcard library
-- =====================================================

-- Add RLS policy for anonymous users to read flashcard library
-- This supports browse-only mode without authentication
-- Progress tracking remains authenticated-only via flashcard_library_progress table

CREATE POLICY "Flashcard library is publicly readable"
  ON public.flashcard_library FOR SELECT
  TO anon
  USING (true);

-- Note: This policy is PERMISSIVE and works alongside the existing
-- authenticated policy. Anonymous users can now browse flashcards,
-- while authenticated users retain their existing access patterns.
