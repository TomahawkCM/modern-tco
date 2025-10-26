-- Migration: Add composite indexes for improved query performance
-- Created: 2025-10-15
-- Purpose: Optimize dashboard queries with multi-column indexes
-- Project: Modern TCO LMS Architecture Optimization

-- ============================================================================
-- COMPOSITE INDEX 1: user_progress (user_id, question_id)
-- ============================================================================
-- Optimizes queries that filter by both user and question
-- Common use case: Checking if user has answered a specific question
-- Example query: SELECT * FROM user_progress WHERE user_id = $1 AND question_id = $2

CREATE INDEX IF NOT EXISTS idx_user_progress_user_question
ON public.user_progress(user_id, question_id);

-- ============================================================================
-- COMPOSITE INDEX 2: questions (category, difficulty)
-- ============================================================================
-- Optimizes queries that filter by both category and difficulty
-- Common use case: Practice mode question selection by domain and difficulty
-- Example query: SELECT * FROM questions WHERE category = $1 AND difficulty = $2

CREATE INDEX IF NOT EXISTS idx_questions_category_difficulty
ON public.questions(category, difficulty);

-- ============================================================================
-- COMPOSITE INDEX 3: exam_sessions (user_id, completed_at) - PARTIAL INDEX
-- ============================================================================
-- Optimizes queries for completed exams by user
-- Partial index excludes NULL completed_at values (in-progress exams)
-- Common use case: User exam history, leaderboards, completion statistics
-- Example query: SELECT * FROM exam_sessions WHERE user_id = $1 AND completed_at IS NOT NULL

CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_completed
ON public.exam_sessions(user_id, completed_at)
WHERE completed_at IS NOT NULL;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify index usage with EXPLAIN ANALYZE:

-- Query 1: Test user_progress composite index
-- EXPLAIN ANALYZE SELECT * FROM user_progress
-- WHERE user_id = (SELECT id FROM users LIMIT 1)
-- AND question_id = (SELECT id FROM questions LIMIT 1);

-- Query 2: Test questions composite index
-- EXPLAIN ANALYZE SELECT * FROM questions
-- WHERE category = 'asking_questions' AND difficulty = 'intermediate';

-- Query 3: Test exam_sessions partial index
-- EXPLAIN ANALYZE SELECT * FROM exam_sessions
-- WHERE user_id = (SELECT id FROM users LIMIT 1)
-- AND completed_at IS NOT NULL
-- ORDER BY completed_at DESC;

-- ============================================================================
-- EXPECTED PERFORMANCE IMPROVEMENTS
-- ============================================================================
-- 1. user_progress queries: 50-80% faster for user+question lookups
-- 2. questions queries: 60-90% faster for category+difficulty filtering
-- 3. exam_sessions queries: 70-95% faster for completed exam history
-- 4. Reduced memory footprint for partial index (excludes in-progress exams)

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================
-- To rollback this migration, run:
-- DROP INDEX IF EXISTS public.idx_user_progress_user_question;
-- DROP INDEX IF EXISTS public.idx_questions_category_difficulty;
-- DROP INDEX IF EXISTS public.idx_exam_sessions_user_completed;
