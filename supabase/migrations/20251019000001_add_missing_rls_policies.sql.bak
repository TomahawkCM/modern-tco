-- Migration: Add RLS policies for unprotected user-specific tables
-- Date: 2025-10-19
-- Security Fix: Addresses Finding #3 from security scan
-- Tables: flashcards, flashcard_reviews, question_reviews, notes, team_seats,
--         video_progress, lab_certificates, learning_paths, performance_insights

-- ============================================================================
-- 1. FLASHCARDS TABLE
-- ============================================================================

-- Enable RLS on flashcards table
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Users can only select their own flashcards
CREATE POLICY "flashcards_select_own" ON flashcards
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert flashcards for themselves
CREATE POLICY "flashcards_insert_own" ON flashcards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own flashcards
CREATE POLICY "flashcards_update_own" ON flashcards
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own flashcards
CREATE POLICY "flashcards_delete_own" ON flashcards
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. FLASHCARD_REVIEWS TABLE
-- ============================================================================

-- Enable RLS on flashcard_reviews table
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;

-- Users can only select their own flashcard reviews
CREATE POLICY "flashcard_reviews_select_own" ON flashcard_reviews
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own flashcard reviews
CREATE POLICY "flashcard_reviews_insert_own" ON flashcard_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own flashcard reviews
CREATE POLICY "flashcard_reviews_update_own" ON flashcard_reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3. QUESTION_REVIEWS TABLE
-- ============================================================================

-- Enable RLS on question_reviews table
ALTER TABLE question_reviews ENABLE ROW LEVEL SECURITY;

-- Users can only select their own question reviews
CREATE POLICY "question_reviews_select_own" ON question_reviews
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own question reviews
CREATE POLICY "question_reviews_insert_own" ON question_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own question reviews
CREATE POLICY "question_reviews_update_own" ON question_reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 4. NOTES TABLE
-- ============================================================================

-- Enable RLS on notes table
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Users can only select their own notes
CREATE POLICY "notes_select_own" ON notes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own notes
CREATE POLICY "notes_insert_own" ON notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own notes
CREATE POLICY "notes_update_own" ON notes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own notes
CREATE POLICY "notes_delete_own" ON notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. TEAM_SEATS TABLE
-- ============================================================================

-- Enable RLS on team_seats table
ALTER TABLE team_seats ENABLE ROW LEVEL SECURITY;

-- Users can only select team seats for their own team
-- (Assuming team_seats has a team_id or similar column)
-- Note: Adjust this policy based on actual schema
CREATE POLICY "team_seats_select_team" ON team_seats
  FOR SELECT
  USING (
    -- Allow if user is owner of the team
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_seats.team_id
      AND teams.owner_id = auth.uid()
    )
    OR
    -- Allow if user is a member of the team
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_seats.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Only team owners can insert team seats
CREATE POLICY "team_seats_insert_owner" ON team_seats
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_seats.team_id
      AND teams.owner_id = auth.uid()
    )
  );

-- Only team owners can update team seats
CREATE POLICY "team_seats_update_owner" ON team_seats
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_seats.team_id
      AND teams.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_seats.team_id
      AND teams.owner_id = auth.uid()
    )
  );

-- Only team owners can delete team seats
CREATE POLICY "team_seats_delete_owner" ON team_seats
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_seats.team_id
      AND teams.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. VIDEO_PROGRESS TABLE
-- ============================================================================

-- Enable RLS on video_progress table
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

-- Users can only select their own video progress
CREATE POLICY "video_progress_select_own" ON video_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own video progress
CREATE POLICY "video_progress_insert_own" ON video_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own video progress
CREATE POLICY "video_progress_update_own" ON video_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 7. LAB_CERTIFICATES TABLE
-- ============================================================================

-- Enable RLS on lab_certificates table
ALTER TABLE lab_certificates ENABLE ROW LEVEL SECURITY;

-- Users can only select their own lab certificates
CREATE POLICY "lab_certificates_select_own" ON lab_certificates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own lab certificates
CREATE POLICY "lab_certificates_insert_own" ON lab_certificates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own lab certificates
CREATE POLICY "lab_certificates_update_own" ON lab_certificates
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 8. LEARNING_PATHS TABLE
-- ============================================================================

-- Enable RLS on learning_paths table
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

-- Users can only select their own learning paths
CREATE POLICY "learning_paths_select_own" ON learning_paths
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own learning paths
CREATE POLICY "learning_paths_insert_own" ON learning_paths
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own learning paths
CREATE POLICY "learning_paths_update_own" ON learning_paths
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own learning paths
CREATE POLICY "learning_paths_delete_own" ON learning_paths
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 9. PERFORMANCE_INSIGHTS TABLE
-- ============================================================================

-- Enable RLS on performance_insights table
ALTER TABLE performance_insights ENABLE ROW LEVEL SECURITY;

-- Users can only select their own performance insights
CREATE POLICY "performance_insights_select_own" ON performance_insights
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own performance insights
CREATE POLICY "performance_insights_insert_own" ON performance_insights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own performance insights
CREATE POLICY "performance_insights_update_own" ON performance_insights
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these queries after migration to verify RLS is enabled:

-- Check which tables have RLS enabled
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN (
--   'flashcards', 'flashcard_reviews', 'question_reviews', 'notes',
--   'team_seats', 'video_progress', 'lab_certificates',
--   'learning_paths', 'performance_insights'
-- );

-- Check all policies for these tables
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- AND tablename IN (
--   'flashcards', 'flashcard_reviews', 'question_reviews', 'notes',
--   'team_seats', 'video_progress', 'lab_certificates',
--   'learning_paths', 'performance_insights'
-- )
-- ORDER BY tablename, policyname;

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- To rollback this migration, run:
-- DROP POLICY IF EXISTS "flashcards_select_own" ON flashcards;
-- DROP POLICY IF EXISTS "flashcards_insert_own" ON flashcards;
-- DROP POLICY IF EXISTS "flashcards_update_own" ON flashcards;
-- DROP POLICY IF EXISTS "flashcards_delete_own" ON flashcards;
-- ALTER TABLE flashcards DISABLE ROW LEVEL SECURITY;
--
-- (Repeat for all other tables...)
