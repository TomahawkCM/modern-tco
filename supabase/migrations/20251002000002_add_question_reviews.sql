-- Question Review System for Spaced Repetition
-- Extends SM-2 algorithm to practice exam questions
-- Part of Phase 2: Unified Review Dashboard

-- Question Reviews table - tracks SRS state for each user/question pair
CREATE TABLE IF NOT EXISTS public.question_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,

    -- SRS (Spaced Repetition System) state - matches flashcards pattern
    -- Using SM-2 algorithm: due, interval (days), ease factor, reps, lapses
    srs_due TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    srs_interval INTEGER NOT NULL DEFAULT 0,  -- days
    srs_ease DECIMAL(3,2) NOT NULL DEFAULT 2.5,
    srs_reps INTEGER NOT NULL DEFAULT 0,
    srs_lapses INTEGER NOT NULL DEFAULT 0,

    -- Performance tracking
    total_attempts INTEGER NOT NULL DEFAULT 0,
    correct_attempts INTEGER NOT NULL DEFAULT 0,
    average_time_seconds INTEGER,

    -- Computed mastery level (0.0 to 1.0)
    mastery_level DECIMAL(3,2) GENERATED ALWAYS AS (
        CASE
            WHEN total_attempts > 0
            THEN LEAST(1.0, correct_attempts::DECIMAL / total_attempts::DECIMAL)
            ELSE 0
        END
    ) STORED,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_reviewed_at TIMESTAMPTZ,

    -- One review record per user per question
    UNIQUE(user_id, question_id)
);

-- Review attempt history for analytics
CREATE TABLE IF NOT EXISTS public.question_review_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES public.question_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,

    -- Attempt details
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    rating TEXT NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),

    -- SRS state at time of review (for analytics)
    srs_interval_before INTEGER,
    srs_interval_after INTEGER,
    srs_ease_before DECIMAL(3,2),
    srs_ease_after DECIMAL(3,2),

    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Review sessions for streak tracking
CREATE TABLE IF NOT EXISTS public.review_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Session details
    session_type TEXT NOT NULL CHECK (session_type IN ('flashcards', 'questions', 'mixed')),
    target_duration_minutes INTEGER, -- NULL for untimed
    actual_duration_seconds INTEGER,

    -- Content reviewed
    flashcards_reviewed INTEGER NOT NULL DEFAULT 0,
    questions_reviewed INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    total_count INTEGER NOT NULL DEFAULT 0,

    -- Computed accuracy
    accuracy DECIMAL(3,2) GENERATED ALWAYS AS (
        CASE
            WHEN total_count > 0
            THEN (correct_count::DECIMAL / total_count::DECIMAL)
            ELSE 0
        END
    ) STORED,

    -- Session timing
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    is_completed BOOLEAN NOT NULL DEFAULT false
);

-- Indexes for performance (composite index for common query pattern)
CREATE INDEX IF NOT EXISTS idx_question_reviews_user_id ON public.question_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_question_reviews_question_id ON public.question_reviews(question_id);
CREATE INDEX IF NOT EXISTS idx_question_reviews_srs_due ON public.question_reviews(srs_due);
CREATE INDEX IF NOT EXISTS idx_question_reviews_user_due ON public.question_reviews(user_id, srs_due);
CREATE INDEX IF NOT EXISTS idx_question_reviews_mastery ON public.question_reviews(user_id, mastery_level);

CREATE INDEX IF NOT EXISTS idx_review_attempts_review ON public.question_review_attempts(review_id);
CREATE INDEX IF NOT EXISTS idx_review_attempts_user ON public.question_review_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_review_attempts_date ON public.question_review_attempts(attempted_at);

CREATE INDEX IF NOT EXISTS idx_review_sessions_user ON public.review_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_review_sessions_started ON public.review_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_review_sessions_user_date ON public.review_sessions(user_id, started_at);

-- Updated_at triggers
DROP TRIGGER IF EXISTS question_reviews_updated_at ON public.question_reviews;
CREATE TRIGGER question_reviews_updated_at
    BEFORE UPDATE ON public.question_reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS review_sessions_updated_at ON public.review_sessions;
CREATE TRIGGER review_sessions_updated_at
    BEFORE UPDATE ON public.review_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security
ALTER TABLE public.question_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_review_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_sessions ENABLE ROW LEVEL SECURITY;

-- Question Reviews policies
DO $$ BEGIN
    BEGIN
        CREATE POLICY "question_reviews_select_own" ON public.question_reviews
            FOR SELECT TO authenticated USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        CREATE POLICY "question_reviews_insert_own" ON public.question_reviews
            FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        CREATE POLICY "question_reviews_update_own" ON public.question_reviews
            FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        CREATE POLICY "question_reviews_delete_own" ON public.question_reviews
            FOR DELETE TO authenticated USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Review Attempts policies
DO $$ BEGIN
    BEGIN
        CREATE POLICY "review_attempts_select_own" ON public.question_review_attempts
            FOR SELECT TO authenticated USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        CREATE POLICY "review_attempts_insert_own" ON public.question_review_attempts
            FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Review Sessions policies
DO $$ BEGIN
    BEGIN
        CREATE POLICY "review_sessions_select_own" ON public.review_sessions
            FOR SELECT TO authenticated USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        CREATE POLICY "review_sessions_insert_own" ON public.review_sessions
            FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        CREATE POLICY "review_sessions_update_own" ON public.review_sessions
            FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        CREATE POLICY "review_sessions_delete_own" ON public.review_sessions
            FOR DELETE TO authenticated USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Grant permissions
GRANT ALL ON public.question_reviews TO authenticated;
GRANT ALL ON public.question_review_attempts TO authenticated;
GRANT ALL ON public.review_sessions TO authenticated;

GRANT ALL ON public.question_reviews TO service_role;
GRANT ALL ON public.question_review_attempts TO service_role;
GRANT ALL ON public.review_sessions TO service_role;

-- Utility Functions

-- Get due questions for a user (optimized query)
CREATE OR REPLACE FUNCTION public.get_due_questions(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
    review_id UUID,
    question_id UUID,
    srs_due TIMESTAMPTZ,
    srs_interval INTEGER,
    srs_ease DECIMAL(3,2),
    mastery_level DECIMAL(3,2),
    total_attempts INTEGER,
    correct_attempts INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        qr.id as review_id,
        qr.question_id,
        qr.srs_due,
        qr.srs_interval,
        qr.srs_ease,
        qr.mastery_level,
        qr.total_attempts,
        qr.correct_attempts
    FROM public.question_reviews qr
    WHERE qr.user_id = p_user_id
      AND qr.srs_due <= NOW()
    ORDER BY qr.srs_due ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate current review streak
CREATE OR REPLACE FUNCTION public.calculate_review_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_streak INTEGER := 0;
    v_current_date DATE := CURRENT_DATE;
    v_check_date DATE;
    v_has_review BOOLEAN;
BEGIN
    -- Start from yesterday and count backwards
    v_check_date := v_current_date - INTERVAL '1 day';

    -- Check if user reviewed today
    SELECT EXISTS (
        SELECT 1 FROM public.review_sessions
        WHERE user_id = p_user_id
          AND DATE(started_at) = v_current_date
          AND is_completed = true
    ) INTO v_has_review;

    -- If reviewed today, include it in streak
    IF v_has_review THEN
        v_streak := 1;
    END IF;

    -- Count consecutive days backwards
    WHILE true LOOP
        SELECT EXISTS (
            SELECT 1 FROM public.review_sessions
            WHERE user_id = p_user_id
              AND DATE(started_at) = v_check_date
              AND is_completed = true
        ) INTO v_has_review;

        IF v_has_review THEN
            v_streak := v_streak + 1;
            v_check_date := v_check_date - INTERVAL '1 day';
        ELSE
            EXIT;
        END IF;
    END LOOP;

    RETURN v_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get unified review queue (flashcards + questions)
CREATE OR REPLACE FUNCTION public.get_unified_review_queue(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    item_type TEXT,
    item_id UUID,
    content_id TEXT,
    due_date TIMESTAMPTZ,
    interval_days INTEGER,
    ease_factor DECIMAL(3,2),
    mastery DECIMAL(3,2),
    priority_score DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH flashcard_items AS (
        SELECT
            'flashcard'::TEXT as item_type,
            f.id as item_id,
            f.id::TEXT as content_id,
            f.srs_due as due_date,
            f.srs_interval as interval_days,
            f.srs_ease as ease_factor,
            CASE
                WHEN f.total_reviews > 0
                THEN (f.correct_reviews::DECIMAL / f.total_reviews::DECIMAL)
                ELSE 0
            END as mastery,
            -- Priority: low mastery + overdue = high priority
            (1.0 - CASE
                WHEN f.total_reviews > 0
                THEN (f.correct_reviews::DECIMAL / f.total_reviews::DECIMAL)
                ELSE 0
            END) * GREATEST(1, EXTRACT(EPOCH FROM (NOW() - f.srs_due)) / 86400.0) as priority_score
        FROM public.flashcards f
        WHERE f.user_id = p_user_id
          AND f.srs_due <= NOW()
    ),
    question_items AS (
        SELECT
            'question'::TEXT as item_type,
            qr.id as item_id,
            qr.question_id as content_id,
            qr.srs_due as due_date,
            qr.srs_interval as interval_days,
            qr.srs_ease as ease_factor,
            qr.mastery_level as mastery,
            -- Priority: low mastery + overdue = high priority
            (1.0 - qr.mastery_level) * GREATEST(1, EXTRACT(EPOCH FROM (NOW() - qr.srs_due)) / 86400.0) as priority_score
        FROM public.question_reviews qr
        WHERE qr.user_id = p_user_id
          AND qr.srs_due <= NOW()
    )
    SELECT * FROM (
        SELECT * FROM flashcard_items
        UNION ALL
        SELECT * FROM question_items
    ) combined
    ORDER BY priority_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get review statistics for dashboard
CREATE OR REPLACE FUNCTION public.get_review_stats(p_user_id UUID)
RETURNS TABLE (
    flashcards_due INTEGER,
    questions_due INTEGER,
    total_due INTEGER,
    current_streak INTEGER,
    flashcards_total INTEGER,
    questions_total INTEGER,
    avg_flashcard_retention DECIMAL(3,2),
    avg_question_mastery DECIMAL(3,2),
    reviews_today INTEGER,
    reviews_this_week INTEGER
) AS $$
DECLARE
    v_flashcards_due INTEGER;
    v_questions_due INTEGER;
    v_flashcards_total INTEGER;
    v_questions_total INTEGER;
    v_avg_flashcard_retention DECIMAL(3,2);
    v_avg_question_mastery DECIMAL(3,2);
    v_reviews_today INTEGER;
    v_reviews_this_week INTEGER;
BEGIN
    -- Flashcards due
    SELECT COUNT(*) INTO v_flashcards_due
    FROM public.flashcards
    WHERE user_id = p_user_id AND srs_due <= NOW();

    -- Questions due
    SELECT COUNT(*) INTO v_questions_due
    FROM public.question_reviews
    WHERE user_id = p_user_id AND srs_due <= NOW();

    -- Total flashcards
    SELECT COUNT(*) INTO v_flashcards_total
    FROM public.flashcards
    WHERE user_id = p_user_id;

    -- Total questions
    SELECT COUNT(*) INTO v_questions_total
    FROM public.question_reviews
    WHERE user_id = p_user_id;

    -- Average flashcard retention
    SELECT COALESCE(AVG(
        CASE WHEN total_reviews > 0
        THEN correct_reviews::DECIMAL / total_reviews::DECIMAL
        ELSE 0 END
    ), 0) INTO v_avg_flashcard_retention
    FROM public.flashcards
    WHERE user_id = p_user_id;

    -- Average question mastery
    SELECT COALESCE(AVG(mastery_level), 0) INTO v_avg_question_mastery
    FROM public.question_reviews
    WHERE user_id = p_user_id;

    -- Reviews today
    SELECT COUNT(*) INTO v_reviews_today
    FROM public.review_sessions
    WHERE user_id = p_user_id
      AND DATE(started_at) = CURRENT_DATE
      AND is_completed = true;

    -- Reviews this week
    SELECT COUNT(*) INTO v_reviews_this_week
    FROM public.review_sessions
    WHERE user_id = p_user_id
      AND started_at >= DATE_TRUNC('week', CURRENT_DATE)
      AND is_completed = true;

    RETURN QUERY SELECT
        v_flashcards_due,
        v_questions_due,
        v_flashcards_due + v_questions_due,
        public.calculate_review_streak(p_user_id),
        v_flashcards_total,
        v_questions_total,
        v_avg_flashcard_retention,
        v_avg_question_mastery,
        v_reviews_today,
        v_reviews_this_week;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE public.question_reviews IS 'Spaced repetition state for practice exam questions using SM-2 algorithm';
COMMENT ON TABLE public.question_review_attempts IS 'Historical record of all question review attempts for analytics';
COMMENT ON TABLE public.review_sessions IS 'Review session tracking for streak calculation and engagement metrics';
COMMENT ON FUNCTION public.get_unified_review_queue IS 'Returns prioritized queue combining flashcards and questions';
COMMENT ON FUNCTION public.calculate_review_streak IS 'Calculates current consecutive day review streak';
COMMENT ON FUNCTION public.get_review_stats IS 'Comprehensive review statistics for dashboard display';
