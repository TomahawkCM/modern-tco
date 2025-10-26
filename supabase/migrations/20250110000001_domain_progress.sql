-- P0-2: Database Schema Enhancement for 5-Domain Structure
-- Enhanced schema for TCO domain-specific progress tracking and analytics
-- Implements Spec Kit P0-2 requirements with 5-domain TAN-1000 alignment

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- TCO Domain-specific types
CREATE TYPE tco_domain AS ENUM (
    'Asking Questions',
    'Refining Questions & Targeting', 
    'Taking Action',
    'Navigation and Basic Module Functions',
    'Report Generation and Data Export'
);

-- Enhanced difficulty and status types
CREATE TYPE competency_level AS ENUM ('novice', 'developing', 'proficient', 'expert');
CREATE TYPE lab_status AS ENUM ('not_started', 'in_progress', 'completed', 'passed', 'failed', 'retry_needed');

-- Domain competency tracking table
CREATE TABLE IF NOT EXISTS public.user_domain_competency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    domain tco_domain NOT NULL,
    
    -- Core competency metrics
    competency_level competency_level NOT NULL DEFAULT 'novice',
    questions_attempted INTEGER NOT NULL DEFAULT 0,
    questions_correct INTEGER NOT NULL DEFAULT 0,
    accuracy_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN questions_attempted = 0 THEN 0.0
            ELSE ROUND((questions_correct::DECIMAL / questions_attempted::DECIMAL) * 100, 2)
        END
    ) STORED,
    
    -- Domain-specific progress
    study_time_minutes INTEGER NOT NULL DEFAULT 0,
    labs_completed INTEGER NOT NULL DEFAULT 0,
    mock_exams_taken INTEGER NOT NULL DEFAULT 0,
    avg_mock_score DECIMAL(5,2),
    
    -- Learning pathway tracking
    current_objective_index INTEGER NOT NULL DEFAULT 0,
    total_objectives INTEGER NOT NULL DEFAULT 0,
    objective_progress DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_objectives = 0 THEN 0.0
            ELSE ROUND((current_objective_index::DECIMAL / total_objectives::DECIMAL) * 100, 2)
        END
    ) STORED,
    
    -- Certification readiness
    certification_ready BOOLEAN NOT NULL DEFAULT FALSE,
    last_assessment_date TIMESTAMPTZ,
    next_recommended_action TEXT,
    
    -- Timestamp tracking
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one record per user per domain
    UNIQUE (user_id, domain)
);

-- Lab session tracking table
CREATE TABLE IF NOT EXISTS public.lab_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lab_id TEXT NOT NULL, -- LAB-AQ-001, LAB-RQ-001, etc.
    domain tco_domain NOT NULL,
    
    -- Session details
    session_name TEXT NOT NULL,
    estimated_duration_minutes INTEGER NOT NULL DEFAULT 0,
    actual_duration_minutes INTEGER NOT NULL DEFAULT 0,
    status lab_status NOT NULL DEFAULT 'not_started',
    
    -- Performance metrics
    checkpoints_total INTEGER NOT NULL DEFAULT 0,
    checkpoints_passed INTEGER NOT NULL DEFAULT 0,
    checkpoint_success_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN checkpoints_total = 0 THEN 0.0
            ELSE ROUND((checkpoints_passed::DECIMAL / checkpoints_total::DECIMAL) * 100, 2)
        END
    ) STORED,
    
    -- Console simulation data
    console_commands_executed INTEGER NOT NULL DEFAULT 0,
    console_errors_count INTEGER NOT NULL DEFAULT 0,
    validation_attempts INTEGER NOT NULL DEFAULT 0,
    
    -- Learning outcomes
    objectives_met JSONB NOT NULL DEFAULT '[]',
    skills_demonstrated JSONB NOT NULL DEFAULT '[]',
    feedback_notes TEXT,
    instructor_notes TEXT,
    
    -- Attempt tracking
    attempt_number INTEGER NOT NULL DEFAULT 1,
    is_best_attempt BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Timestamp tracking
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enhanced exam sessions for 105-minute TAN-1000 format
CREATE TABLE IF NOT EXISTS public.exam_sessions_enhanced (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Exam configuration
    exam_type TEXT NOT NULL DEFAULT 'mock_tan_1000', -- practice, mock_tan_1000, adaptive_practice
    total_duration_minutes INTEGER NOT NULL DEFAULT 105, -- Official TAN-1000 format
    questions_total INTEGER NOT NULL DEFAULT 200, -- Official question count
    
    -- Domain distribution (based on official weights)
    asking_questions_count INTEGER NOT NULL DEFAULT 44,    -- 22%
    refining_targeting_count INTEGER NOT NULL DEFAULT 46,  -- 23% 
    taking_action_count INTEGER NOT NULL DEFAULT 30,      -- 15%
    navigation_modules_count INTEGER NOT NULL DEFAULT 46, -- 23%
    reporting_export_count INTEGER NOT NULL DEFAULT 34,   -- 17%
    
    -- Session status
    status TEXT NOT NULL DEFAULT 'not_started', -- not_started, in_progress, completed, abandoned
    current_question_index INTEGER NOT NULL DEFAULT 0,
    
    -- Performance tracking
    questions_answered INTEGER NOT NULL DEFAULT 0,
    questions_correct INTEGER NOT NULL DEFAULT 0,
    total_score DECIMAL(5,2),
    passing_score_threshold DECIMAL(5,2) NOT NULL DEFAULT 70.0,
    is_passed BOOLEAN,
    
    -- Domain-specific scores
    asking_questions_score DECIMAL(5,2) DEFAULT 0.0,
    refining_targeting_score DECIMAL(5,2) DEFAULT 0.0,
    taking_action_score DECIMAL(5,2) DEFAULT 0.0,
    navigation_modules_score DECIMAL(5,2) DEFAULT 0.0,
    reporting_export_score DECIMAL(5,2) DEFAULT 0.0,
    
    -- Time tracking
    time_spent_minutes INTEGER NOT NULL DEFAULT 0,
    time_remaining_minutes INTEGER,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Question responses (normalized storage)
    question_responses JSONB NOT NULL DEFAULT '[]', -- Array of {questionId, selectedAnswer, isCorrect, timeSpent}
    
    -- Analytics and insights
    difficulty_adaptation JSONB NOT NULL DEFAULT '{}', -- Adaptive difficulty tracking
    learning_insights JSONB NOT NULL DEFAULT '{}',    -- AI-generated insights
    recommendation_data JSONB NOT NULL DEFAULT '{}',  -- Next steps recommendations
    
    -- Certification assessment
    certification_readiness_score DECIMAL(5,2),
    weak_domains JSONB NOT NULL DEFAULT '[]',
    strong_domains JSONB NOT NULL DEFAULT '[]',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User achievement tracking
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Achievement details
    achievement_type TEXT NOT NULL, -- domain_mastery, lab_completion, streak_milestone, exam_score
    achievement_name TEXT NOT NULL,
    achievement_description TEXT NOT NULL,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    
    -- Context data
    domain tco_domain,
    related_session_id UUID, -- Can reference lab_sessions or exam_sessions_enhanced
    metadata JSONB NOT NULL DEFAULT '{}', -- Flexible data storage
    
    -- Display properties
    badge_icon TEXT,
    badge_color TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamp tracking
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Prevent duplicate achievements
    UNIQUE (user_id, achievement_type, achievement_name)
);

-- Comprehensive indexes for performance
CREATE INDEX IF NOT EXISTS idx_domain_competency_user_id ON public.user_domain_competency(user_id);
CREATE INDEX IF NOT EXISTS idx_domain_competency_domain ON public.user_domain_competency(domain);
CREATE INDEX IF NOT EXISTS idx_domain_competency_competency_level ON public.user_domain_competency(competency_level);
CREATE INDEX IF NOT EXISTS idx_domain_competency_accuracy ON public.user_domain_competency(accuracy_percentage);

CREATE INDEX IF NOT EXISTS idx_lab_sessions_user_id ON public.lab_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_lab_id ON public.lab_sessions(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_domain ON public.lab_sessions(domain);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_status ON public.lab_sessions(status);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_started_at ON public.lab_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_exam_sessions_enhanced_user_id ON public.exam_sessions_enhanced(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_enhanced_exam_type ON public.exam_sessions_enhanced(exam_type);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_enhanced_status ON public.exam_sessions_enhanced(status);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_enhanced_started_at ON public.exam_sessions_enhanced(started_at);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_enhanced_total_score ON public.exam_sessions_enhanced(total_score);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON public.user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_domain ON public.user_achievements(domain);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON public.user_achievements(earned_at);

-- Row Level Security policies
ALTER TABLE public.user_domain_competency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Domain competency policies
CREATE POLICY "domain_competency_select_own" ON public.user_domain_competency
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "domain_competency_insert_own" ON public.user_domain_competency
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "domain_competency_update_own" ON public.user_domain_competency
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Lab sessions policies
CREATE POLICY "lab_sessions_select_own" ON public.lab_sessions
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "lab_sessions_insert_own" ON public.lab_sessions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lab_sessions_update_own" ON public.lab_sessions
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Enhanced exam sessions policies
CREATE POLICY "exam_sessions_enhanced_select_own" ON public.exam_sessions_enhanced
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "exam_sessions_enhanced_insert_own" ON public.exam_sessions_enhanced
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "exam_sessions_enhanced_update_own" ON public.exam_sessions_enhanced
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Achievement policies
CREATE POLICY "achievements_select_own" ON public.user_achievements
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "achievements_insert_own" ON public.user_achievements
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_domain_competency_updated_at
    BEFORE UPDATE ON public.user_domain_competency
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_lab_sessions_updated_at
    BEFORE UPDATE ON public.lab_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_exam_sessions_enhanced_updated_at
    BEFORE UPDATE ON public.exam_sessions_enhanced
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT ALL ON public.user_domain_competency TO authenticated;
GRANT ALL ON public.lab_sessions TO authenticated;
GRANT ALL ON public.exam_sessions_enhanced TO authenticated;
GRANT ALL ON public.user_achievements TO authenticated;

-- Service role gets full access for admin operations
GRANT ALL ON public.user_domain_competency TO service_role;
GRANT ALL ON public.lab_sessions TO service_role;
GRANT ALL ON public.exam_sessions_enhanced TO service_role;
GRANT ALL ON public.user_achievements TO service_role;

-- Utility functions for analytics

-- Get user's overall TCO certification readiness
CREATE OR REPLACE FUNCTION public.get_user_certification_readiness(p_user_id UUID)
RETURNS TABLE (
    overall_readiness_percentage DECIMAL(5,2),
    domains_ready INTEGER,
    total_domains INTEGER,
    recommended_focus tco_domain,
    estimated_study_hours INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH domain_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE certification_ready = TRUE) as ready,
            AVG(accuracy_percentage) as avg_accuracy
        FROM public.user_domain_competency 
        WHERE user_id = p_user_id
    ),
    weakest_domain AS (
        SELECT domain as focus_domain
        FROM public.user_domain_competency 
        WHERE user_id = p_user_id
        ORDER BY accuracy_percentage ASC, competency_level ASC
        LIMIT 1
    )
    SELECT 
        ROUND(COALESCE(ds.avg_accuracy, 0.0), 2) as overall_readiness_percentage,
        COALESCE(ds.ready, 0) as domains_ready,
        COALESCE(ds.total, 0) as total_domains,
        wd.focus_domain as recommended_focus,
        CASE 
            WHEN COALESCE(ds.avg_accuracy, 0) >= 80 THEN 10
            WHEN COALESCE(ds.avg_accuracy, 0) >= 70 THEN 20  
            WHEN COALESCE(ds.avg_accuracy, 0) >= 60 THEN 40
            ELSE 60
        END as estimated_study_hours
    FROM domain_stats ds
    CROSS JOIN weakest_domain wd;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get detailed domain analytics
CREATE OR REPLACE FUNCTION public.get_domain_analytics(p_user_id UUID, p_domain tco_domain)
RETURNS TABLE (
    competency_level_name TEXT,
    accuracy_percentage DECIMAL(5,2),
    questions_attempted INTEGER,
    questions_correct INTEGER,
    study_time_hours DECIMAL(5,2),
    labs_completed INTEGER,
    certification_ready BOOLEAN,
    improvement_suggestions TEXT[]
) AS $$
DECLARE
    suggestions TEXT[];
BEGIN
    -- Generate improvement suggestions based on performance
    SELECT ARRAY[
        CASE 
            WHEN udc.accuracy_percentage < 70 THEN 'Focus on foundational concepts and review study materials'
            WHEN udc.accuracy_percentage < 80 THEN 'Practice more challenging questions in this domain'
            WHEN udc.accuracy_percentage >= 80 THEN 'Maintain proficiency with periodic review'
        END,
        CASE 
            WHEN udc.labs_completed < 3 THEN 'Complete more hands-on lab exercises'
            WHEN udc.labs_completed < 5 THEN 'Advanced lab scenarios recommended'
            ELSE 'Lab competency achieved'
        END,
        CASE 
            WHEN udc.study_time_minutes < 300 THEN 'Increase study time to build confidence'
            WHEN udc.study_time_minutes < 600 THEN 'Good study progress, continue current pace'
            ELSE 'Extensive study time logged'
        END
    ] INTO suggestions
    FROM public.user_domain_competency udc
    WHERE udc.user_id = p_user_id AND udc.domain = p_domain;

    RETURN QUERY
    SELECT 
        udc.competency_level::TEXT as competency_level_name,
        udc.accuracy_percentage,
        udc.questions_attempted,
        udc.questions_correct,
        ROUND(udc.study_time_minutes::DECIMAL / 60, 2) as study_time_hours,
        udc.labs_completed,
        udc.certification_ready,
        suggestions as improvement_suggestions
    FROM public.user_domain_competency udc
    WHERE udc.user_id = p_user_id AND udc.domain = p_domain;
    
    -- If no record exists, return defaults
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            'novice'::TEXT as competency_level_name,
            0.0::DECIMAL(5,2) as accuracy_percentage,
            0 as questions_attempted,
            0 as questions_correct,
            0.0::DECIMAL(5,2) as study_time_hours,
            0 as labs_completed,
            FALSE as certification_ready,
            ARRAY['Begin with study materials for this domain', 'Complete introductory practice questions', 'Schedule dedicated study time']::TEXT[] as improvement_suggestions;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Table comments for documentation
COMMENT ON TABLE public.user_domain_competency IS 'TCO domain-specific competency tracking with 5-domain TAN-1000 alignment';
COMMENT ON TABLE public.lab_sessions IS 'Hands-on lab exercise sessions with console simulation tracking';
COMMENT ON TABLE public.exam_sessions_enhanced IS 'Enhanced exam sessions supporting official 105-minute TAN-1000 format';
COMMENT ON TABLE public.user_achievements IS 'Gamification system for tracking user milestones and accomplishments';

-- Validation function
CREATE OR REPLACE FUNCTION public.validate_p0_2_schema()
RETURNS TEXT AS $$
DECLARE
    result TEXT;
    domain_count INTEGER;
    competency_count INTEGER;
    lab_count INTEGER;
    exam_count INTEGER;
    achievement_count INTEGER;
BEGIN
    SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_domain_competency' INTO domain_count;
    SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'lab_sessions' INTO competency_count;
    SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'exam_sessions_enhanced' INTO lab_count;
    SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_achievements' INTO exam_count;
    
    result := 'P0-2 Schema validation: ' ||
              'domain_competency(' || domain_count || '), ' ||
              'lab_sessions(' || competency_count || '), ' ||
              'exam_enhanced(' || lab_count || '), ' ||
              'achievements(' || exam_count || ') - ' ||
              CASE WHEN (domain_count + competency_count + lab_count + exam_count) = 4 
                   THEN '✅ ALL TABLES CREATED' 
                   ELSE '❌ MISSING TABLES' 
              END;
              
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Execute validation
SELECT public.validate_p0_2_schema();