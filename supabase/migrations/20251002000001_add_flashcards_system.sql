-- Flashcard System for Active Recall & Spaced Repetition
-- Implements SM-2 algorithm with multi-format flashcard support
-- Part of Phase 1.1: Active Recall Integration

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Flashcard types enum
CREATE TYPE flashcard_type AS ENUM ('basic', 'cloze', 'concept', 'diagram', 'code');
CREATE TYPE flashcard_source AS ENUM ('manual', 'auto_generated', 'quiz_failure', 'video_concept');

-- Main flashcards table
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Content
    front_text TEXT NOT NULL,
    back_text TEXT NOT NULL,
    card_type flashcard_type NOT NULL DEFAULT 'basic',

    -- Source tracking
    source flashcard_source NOT NULL DEFAULT 'manual',
    module_id UUID NULL REFERENCES public.study_modules(id) ON DELETE SET NULL,
    section_id UUID NULL REFERENCES public.study_sections(id) ON DELETE SET NULL,
    question_id UUID NULL REFERENCES public.questions(id) ON DELETE SET NULL,

    -- Additional content
    hint TEXT,
    explanation TEXT,
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',

    -- SRS (Spaced Repetition System) state
    -- Using SM-2 algorithm: due, interval (days), ease factor, reps, lapses
    srs_due TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    srs_interval INTEGER NOT NULL DEFAULT 0,  -- days
    srs_ease DECIMAL(3,2) NOT NULL DEFAULT 2.5,
    srs_reps INTEGER NOT NULL DEFAULT 0,
    srs_lapses INTEGER NOT NULL DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_reviewed_at TIMESTAMPTZ,

    -- Performance tracking
    total_reviews INTEGER NOT NULL DEFAULT 0,
    correct_reviews INTEGER NOT NULL DEFAULT 0,
    average_recall_time_seconds INTEGER
);

-- Flashcard review history for analytics
CREATE TABLE IF NOT EXISTS public.flashcard_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Review details
    rating TEXT NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- SRS state at time of review (for analytics)
    srs_interval_before INTEGER,
    srs_interval_after INTEGER,
    srs_ease_before DECIMAL(3,2),
    srs_ease_after DECIMAL(3,2)
);

-- Flashcard decks for organization
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Deck details
    name TEXT NOT NULL,
    description TEXT,
    domain TEXT, -- TCO domain if applicable

    -- Settings
    daily_new_cards_limit INTEGER NOT NULL DEFAULT 20,
    daily_review_limit INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, name)
);

-- Many-to-many: flashcards can belong to multiple decks
CREATE TABLE IF NOT EXISTS public.flashcard_deck_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
    flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(deck_id, flashcard_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON public.flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_module_id ON public.flashcards(module_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_srs_due ON public.flashcards(srs_due);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_due ON public.flashcards(user_id, srs_due);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_flashcard ON public.flashcard_reviews(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_user ON public.flashcard_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user ON public.flashcard_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_deck_cards_deck ON public.flashcard_deck_cards(deck_id);

-- Updated_at trigger
DROP TRIGGER IF EXISTS flashcards_updated_at ON public.flashcards;
CREATE TRIGGER flashcards_updated_at
    BEFORE UPDATE ON public.flashcards
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS flashcard_decks_updated_at ON public.flashcard_decks;
CREATE TRIGGER flashcard_decks_updated_at
    BEFORE UPDATE ON public.flashcard_decks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_deck_cards ENABLE ROW LEVEL SECURITY;

-- Flashcards policies
DO $$ BEGIN
    BEGIN
        CREATE POLICY "flashcards_select_own" ON public.flashcards
            FOR SELECT TO authenticated USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        CREATE POLICY "flashcards_insert_own" ON public.flashcards
            FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        CREATE POLICY "flashcards_update_own" ON public.flashcards
            FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        CREATE POLICY "flashcards_delete_own" ON public.flashcards
            FOR DELETE TO authenticated USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Review history policies
DO $$ BEGIN
    BEGIN
        CREATE POLICY "flashcard_reviews_select_own" ON public.flashcard_reviews
            FOR SELECT TO authenticated USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        CREATE POLICY "flashcard_reviews_insert_own" ON public.flashcard_reviews
            FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Deck policies
DO $$ BEGIN
    BEGIN
        CREATE POLICY "flashcard_decks_select_own" ON public.flashcard_decks
            FOR SELECT TO authenticated USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        CREATE POLICY "flashcard_decks_insert_own" ON public.flashcard_decks
            FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        CREATE POLICY "flashcard_decks_update_own" ON public.flashcard_decks
            FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        CREATE POLICY "flashcard_decks_delete_own" ON public.flashcard_decks
            FOR DELETE TO authenticated USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Deck cards policies (access controlled via deck ownership)
DO $$ BEGIN
    BEGIN
        CREATE POLICY "flashcard_deck_cards_select_via_deck" ON public.flashcard_deck_cards
            FOR SELECT TO authenticated USING (
                EXISTS (
                    SELECT 1 FROM public.flashcard_decks d
                    WHERE d.id = deck_id AND d.user_id = auth.uid()
                )
            );
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        CREATE POLICY "flashcard_deck_cards_insert_via_deck" ON public.flashcard_deck_cards
            FOR INSERT TO authenticated WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.flashcard_decks d
                    WHERE d.id = deck_id AND d.user_id = auth.uid()
                )
            );
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        CREATE POLICY "flashcard_deck_cards_delete_via_deck" ON public.flashcard_deck_cards
            FOR DELETE TO authenticated USING (
                EXISTS (
                    SELECT 1 FROM public.flashcard_decks d
                    WHERE d.id = deck_id AND d.user_id = auth.uid()
                )
            );
    EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Grant permissions
GRANT ALL ON public.flashcards TO authenticated;
GRANT ALL ON public.flashcard_reviews TO authenticated;
GRANT ALL ON public.flashcard_decks TO authenticated;
GRANT ALL ON public.flashcard_deck_cards TO authenticated;

-- Service role access
GRANT ALL ON public.flashcards TO service_role;
GRANT ALL ON public.flashcard_reviews TO service_role;
GRANT ALL ON public.flashcard_decks TO service_role;
GRANT ALL ON public.flashcard_deck_cards TO service_role;

-- Utility functions

-- Get due flashcards for a user
CREATE OR REPLACE FUNCTION public.get_due_flashcards(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    front_text TEXT,
    back_text TEXT,
    card_type flashcard_type,
    hint TEXT,
    srs_due TIMESTAMPTZ,
    srs_interval INTEGER,
    srs_ease DECIMAL(3,2),
    total_reviews INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        f.front_text,
        f.back_text,
        f.card_type,
        f.hint,
        f.srs_due,
        f.srs_interval,
        f.srs_ease,
        f.total_reviews
    FROM public.flashcards f
    WHERE f.user_id = p_user_id
      AND f.srs_due <= NOW()
    ORDER BY f.srs_due ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-generate flashcards from learning objectives
CREATE OR REPLACE FUNCTION public.auto_generate_flashcards_for_module(p_user_id UUID, p_module_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_objective TEXT;
    v_objectives JSONB;
BEGIN
    -- Get learning objectives from module
    SELECT learning_objectives INTO v_objectives
    FROM public.study_modules
    WHERE id = p_module_id;

    -- Generate flashcard for each objective
    FOR v_objective IN SELECT jsonb_array_elements_text(v_objectives)
    LOOP
        INSERT INTO public.flashcards (
            user_id,
            front_text,
            back_text,
            card_type,
            source,
            module_id
        ) VALUES (
            p_user_id,
            'Explain: ' || v_objective,
            'Review module content for details on: ' || v_objective,
            'concept',
            'auto_generated',
            p_module_id
        );
        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE public.flashcards IS 'Active recall flashcards with SM-2 spaced repetition scheduling';
COMMENT ON TABLE public.flashcard_reviews IS 'Historical record of all flashcard reviews for analytics';
COMMENT ON TABLE public.flashcard_decks IS 'Organizational decks for grouping flashcards';
COMMENT ON TABLE public.flashcard_deck_cards IS 'Many-to-many relationship between decks and flashcards';
