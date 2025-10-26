-- =====================================================
-- CONTENT POPULATION TABLES (HYBRID MODEL)
-- Flashcard Library & Content Management Integration
--
-- ARCHITECTURE NOTES:
-- - flashcard_library: Shared curated flashcard content (500+ cards)
-- - flashcard_library_progress: User progress on library cards
-- - Existing 'flashcards' table: User-created personal flashcards (unchanged)
-- - Mock exams: Handled by existing exam_sessions + TypeScript templates
-- =====================================================

-- =====================================================
-- TABLE: flashcard_library
-- Purpose: Curated flashcard content library (shared across all users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.flashcard_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  hint TEXT, -- Optional hint for difficult cards

  -- Classification
  domain TEXT NOT NULL CHECK (domain IN ('asking_questions', 'refining_targeting', 'taking_action', 'navigation', 'reporting', 'troubleshooting')),
  category TEXT CHECK (category IN ('terminology', 'syntax', 'best_practices', 'troubleshooting', 'exam_focused')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  study_guide_ref TEXT,
  source TEXT, -- 'ai_generated', 'manual', 'imported', 'expert_curated'

  -- Global Stats (aggregated across all users)
  total_reviews INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  average_ease_factor DECIMAL(3,2) DEFAULT 2.50,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flashcard_library_domain ON public.flashcard_library(domain);
CREATE INDEX idx_flashcard_library_difficulty ON public.flashcard_library(difficulty);
CREATE INDEX idx_flashcard_library_category ON public.flashcard_library(category);
CREATE INDEX idx_flashcard_library_tags ON public.flashcard_library USING GIN(tags);

-- Enable RLS
ALTER TABLE public.flashcard_library ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can read library flashcards
CREATE POLICY "Flashcard library is readable by all authenticated users"
  ON public.flashcard_library FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- TABLE: flashcard_library_progress
-- Purpose: Track user progress on library flashcards with SuperMemo2 algorithm
-- =====================================================
CREATE TABLE IF NOT EXISTS public.flashcard_library_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  flashcard_library_id UUID NOT NULL REFERENCES public.flashcard_library(id) ON DELETE CASCADE,

  -- SuperMemo2 Algorithm Fields
  ease_factor DECIMAL(3,2) NOT NULL DEFAULT 2.50 CHECK (ease_factor >= 1.30),
  interval_days INTEGER NOT NULL DEFAULT 1 CHECK (interval_days >= 0),
  repetition_number INTEGER NOT NULL DEFAULT 0 CHECK (repetition_number >= 0),

  -- Scheduling
  next_review_date DATE NOT NULL,
  last_reviewed_at TIMESTAMPTZ,

  -- Performance Tracking
  review_count INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0, -- Current correct streak
  longest_streak INTEGER NOT NULL DEFAULT 0,

  -- Quality Ratings History (0-5 scale)
  recent_ratings INTEGER[] DEFAULT '{}', -- Last 10 ratings

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, flashcard_library_id)
);

CREATE INDEX idx_flashcard_library_progress_user ON public.flashcard_library_progress(user_id);
CREATE INDEX idx_flashcard_library_progress_next_review ON public.flashcard_library_progress(user_id, next_review_date);
CREATE INDEX idx_flashcard_library_progress_flashcard ON public.flashcard_library_progress(flashcard_library_id);

-- Enable RLS
ALTER TABLE public.flashcard_library_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own library flashcard progress
CREATE POLICY "Users can manage their own library flashcard progress"
  ON public.flashcard_library_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABLE: content_import_logs
-- Purpose: Track content imports for auditing and rollback
-- =====================================================
CREATE TABLE IF NOT EXISTS public.content_import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Import Info
  content_type TEXT NOT NULL CHECK (content_type IN ('questions', 'videos', 'flashcards', 'labs', 'mock_exams')),
  import_method TEXT NOT NULL CHECK (import_method IN ('ai_generated', 'manual_upload', 'legacy_import', 'bulk_api')),

  -- Source
  source_file TEXT,
  source_description TEXT,

  -- Stats
  total_items INTEGER NOT NULL DEFAULT 0,
  successful_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,

  -- Data
  imported_ids TEXT[] DEFAULT '{}',
  error_log JSONB,

  -- Metadata
  imported_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_import_type ON public.content_import_logs(content_type);
CREATE INDEX idx_content_import_created ON public.content_import_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.content_import_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins only (for now, allow all authenticated users to read)
CREATE POLICY "Content import logs are readable by authenticated users"
  ON public.content_import_logs FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- FUNCTIONS: Flashcard Library SuperMemo2 Algorithm
-- =====================================================

-- Function to calculate next review date and ease factor for library flashcards
CREATE OR REPLACE FUNCTION public.update_flashcard_library_progress(
  p_user_id UUID,
  p_flashcard_library_id UUID,
  p_quality_rating INTEGER -- 0-5 scale (0=complete blackout, 5=perfect recall)
)
RETURNS TABLE (
  next_review_date DATE,
  new_interval_days INTEGER,
  new_ease_factor DECIMAL(3,2)
)
LANGUAGE plpgsql AS $$
DECLARE
  v_current_progress RECORD;
  v_new_ease_factor DECIMAL(3,2);
  v_new_interval INTEGER;
  v_next_review DATE;
BEGIN
  -- Get current progress or create new record
  SELECT * INTO v_current_progress
  FROM public.flashcard_library_progress
  WHERE user_id = p_user_id AND flashcard_library_id = p_flashcard_library_id;

  IF NOT FOUND THEN
    -- First review
    INSERT INTO public.flashcard_library_progress (
      user_id,
      flashcard_library_id,
      ease_factor,
      interval_days,
      repetition_number,
      next_review_date,
      last_reviewed_at,
      review_count,
      correct_count,
      streak,
      recent_ratings
    ) VALUES (
      p_user_id,
      p_flashcard_library_id,
      2.50,
      CASE WHEN p_quality_rating >= 3 THEN 1 ELSE 0 END,
      CASE WHEN p_quality_rating >= 3 THEN 1 ELSE 0 END,
      CURRENT_DATE + CASE WHEN p_quality_rating >= 3 THEN 1 ELSE 0 END,
      NOW(),
      1,
      CASE WHEN p_quality_rating >= 3 THEN 1 ELSE 0 END,
      CASE WHEN p_quality_rating >= 3 THEN 1 ELSE 0 END,
      ARRAY[p_quality_rating]
    )
    RETURNING
      flashcard_library_progress.next_review_date,
      flashcard_library_progress.interval_days,
      flashcard_library_progress.ease_factor
    INTO next_review_date, new_interval_days, new_ease_factor;

    RETURN NEXT;
    RETURN;
  END IF;

  -- SuperMemo2 Algorithm
  -- Quality rating: 0-5 (3+ is pass)

  IF p_quality_rating >= 3 THEN
    -- Correct answer
    v_new_ease_factor := v_current_progress.ease_factor + (0.1 - (5 - p_quality_rating) * (0.08 + (5 - p_quality_rating) * 0.02));
    v_new_ease_factor := GREATEST(v_new_ease_factor, 1.30); -- Minimum ease factor

    IF v_current_progress.repetition_number = 0 THEN
      v_new_interval := 1;
    ELSIF v_current_progress.repetition_number = 1 THEN
      v_new_interval := 6;
    ELSE
      v_new_interval := CEILING(v_current_progress.interval_days * v_new_ease_factor);
    END IF;

    v_next_review := CURRENT_DATE + v_new_interval;

    -- Update progress
    UPDATE public.flashcard_library_progress
    SET
      ease_factor = v_new_ease_factor,
      interval_days = v_new_interval,
      repetition_number = v_current_progress.repetition_number + 1,
      next_review_date = v_next_review,
      last_reviewed_at = NOW(),
      review_count = v_current_progress.review_count + 1,
      correct_count = v_current_progress.correct_count + 1,
      streak = v_current_progress.streak + 1,
      longest_streak = GREATEST(v_current_progress.longest_streak, v_current_progress.streak + 1),
      recent_ratings = (v_current_progress.recent_ratings || p_quality_rating)[1:10], -- Keep last 10
      updated_at = NOW()
    WHERE user_id = p_user_id AND flashcard_library_id = p_flashcard_library_id;

  ELSE
    -- Incorrect answer - reset interval
    v_new_ease_factor := GREATEST(v_current_progress.ease_factor - 0.20, 1.30);
    v_new_interval := 1; -- Start over
    v_next_review := CURRENT_DATE + 1;

    UPDATE public.flashcard_library_progress
    SET
      ease_factor = v_new_ease_factor,
      interval_days = v_new_interval,
      repetition_number = 0, -- Reset
      next_review_date = v_next_review,
      last_reviewed_at = NOW(),
      review_count = v_current_progress.review_count + 1,
      streak = 0, -- Reset streak
      recent_ratings = (v_current_progress.recent_ratings || p_quality_rating)[1:10],
      updated_at = NOW()
    WHERE user_id = p_user_id AND flashcard_library_id = p_flashcard_library_id;
  END IF;

  -- Return updated values
  RETURN QUERY
  SELECT
    flp.next_review_date,
    flp.interval_days,
    flp.ease_factor
  FROM public.flashcard_library_progress flp
  WHERE flp.user_id = p_user_id AND flp.flashcard_library_id = p_flashcard_library_id;
END;
$$;

-- Function to get library flashcards due for review
CREATE OR REPLACE FUNCTION public.get_library_flashcards_due_for_review(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  flashcard_library_id UUID,
  front TEXT,
  back TEXT,
  hint TEXT,
  domain TEXT,
  difficulty TEXT,
  next_review_date DATE,
  streak INTEGER
)
LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT
    fl.id,
    fl.front,
    fl.back,
    fl.hint,
    fl.domain,
    fl.difficulty,
    flp.next_review_date,
    flp.streak
  FROM public.flashcard_library fl
  LEFT JOIN public.flashcard_library_progress flp ON
    flp.flashcard_library_id = fl.id AND flp.user_id = p_user_id
  WHERE flp.next_review_date <= CURRENT_DATE OR flp.next_review_date IS NULL
  ORDER BY
    CASE WHEN flp.next_review_date IS NULL THEN 0 ELSE 1 END, -- New cards first
    flp.next_review_date ASC,
    fl.difficulty ASC -- Easier cards first
  LIMIT p_limit;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_flashcard_library_updated_at
  BEFORE UPDATE ON public.flashcard_library
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flashcard_library_progress_updated_at
  BEFORE UPDATE ON public.flashcard_library_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.flashcard_library IS 'Curated flashcard library content shared across all users (500+ cards). Separate from user-created flashcards table.';
COMMENT ON TABLE public.flashcard_library_progress IS 'Tracks individual user progress on library flashcards with SuperMemo2 scheduling';
COMMENT ON TABLE public.content_import_logs IS 'Audit log for all content imports (questions, videos, flashcards, labs)';

COMMENT ON FUNCTION public.update_flashcard_library_progress IS 'Updates library flashcard progress using SuperMemo2 algorithm based on quality rating (0-5)';
COMMENT ON FUNCTION public.get_library_flashcards_due_for_review IS 'Returns library flashcards due for review, prioritizing overdue and new cards';

-- =====================================================
-- INTEGRATION NOTES
-- =====================================================
--
-- HYBRID FLASHCARD MODEL:
-- 1. flashcard_library (this migration) - 500+ curated cards shared across users
-- 2. flashcards (existing table) - User-created personal flashcards
-- 3. Unified review queue combines both sources for seamless study experience
--
-- MOCK EXAM HANDLING:
-- - Mock exams NOT stored in database (removed redundant tables)
-- - Exam templates defined in TypeScript: src/data/mock-exam-configs.ts
-- - Exam attempts tracked in existing exam_sessions table
-- - Dynamic question selection based on template criteria
--
-- MIGRATION SAFETY:
-- - No conflicts with existing flashcards table
-- - Additive only - preserves all existing data
-- - RLS policies ensure data isolation
-- =====================================================
