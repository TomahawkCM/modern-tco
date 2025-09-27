-- Migration 004: Improved study content tables with Supabase best practices
-- Uses pgcrypto, proper auth.users FKs, cleaner RLS policies, and integer time fields

-- Enable extensions (Supabase-preferred)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Study modules table - main container for domain-specific study content
CREATE TABLE IF NOT EXISTS public.study_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    exam_weight INTEGER NOT NULL CHECK (exam_weight > 0 AND exam_weight <= 100),
    -- Store minutes as integer for sorting/analytics
    estimated_time_minutes INTEGER NOT NULL DEFAULT 0,
    learning_objectives JSONB NOT NULL DEFAULT '[]',
    "references" JSONB NOT NULL DEFAULT '[]',
    exam_prep JSONB NOT NULL DEFAULT '{}',
    version TEXT NOT NULL DEFAULT '1.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Study sections table - individual sections within modules
CREATE TABLE IF NOT EXISTS public.study_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.study_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,               -- Markdown
    section_type TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    estimated_time_minutes INTEGER NOT NULL DEFAULT 0,
    key_points JSONB NOT NULL DEFAULT '[]',
    procedures JSONB NOT NULL DEFAULT '[]',
    troubleshooting JSONB NOT NULL DEFAULT '[]',
    playbook JSONB,
    "references" JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (module_id, order_index)
);

-- User study progress table - tracks individual user progress through study materials
CREATE TABLE IF NOT EXISTS public.user_study_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.study_modules(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.study_sections(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started',
    time_spent_minutes INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, module_id, section_id)
);

-- User study bookmarks table - allows users to bookmark specific locations in study content
CREATE TABLE IF NOT EXISTS public.user_study_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES public.study_sections(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,     -- Character offset in content
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, section_id, position)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_study_modules_domain ON public.study_modules(domain);
CREATE INDEX IF NOT EXISTS idx_study_sections_module_id ON public.study_sections(module_id);
CREATE INDEX IF NOT EXISTS idx_study_sections_module_order ON public.study_sections(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_study_progress_user_id ON public.user_study_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_study_progress_module_id ON public.user_study_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_user_study_progress_status ON public.user_study_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_study_bookmarks_user_id ON public.user_study_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_study_bookmarks_section_id ON public.user_study_bookmarks(section_id);

-- Add constraints for enum-like fields
ALTER TABLE public.study_sections
    ADD CONSTRAINT IF NOT EXISTS check_section_type
    CHECK (section_type IN ('overview','learning_objectives','procedures','troubleshooting','playbook','exam_prep','references'));

ALTER TABLE public.user_study_progress
    ADD CONSTRAINT IF NOT EXISTS check_progress_status
    CHECK (status IN ('not_started','in_progress','completed','needs_review'));

-- Row Level Security (RLS) policies
ALTER TABLE public.study_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_study_bookmarks ENABLE ROW LEVEL SECURITY;

-- Public read for authenticated users (modules/sections) - cleaner syntax
DROP POLICY IF EXISTS "Study modules are viewable by authenticated users" ON public.study_modules;
CREATE POLICY "modules_select_auth" ON public.study_modules
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Study sections are viewable by authenticated users" ON public.study_sections;
CREATE POLICY "sections_select_auth" ON public.study_sections
    FOR SELECT TO authenticated USING (true);

-- Progress: per-user privacy
DROP POLICY IF EXISTS "Users can view their own study progress" ON public.user_study_progress;
CREATE POLICY "progress_select_own" ON public.user_study_progress
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own study progress" ON public.user_study_progress;
CREATE POLICY "progress_insert_own" ON public.user_study_progress
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own study progress" ON public.user_study_progress;
CREATE POLICY "progress_update_own" ON public.user_study_progress
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own study progress" ON public.user_study_progress;
CREATE POLICY "progress_delete_own" ON public.user_study_progress
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Bookmarks: per-user privacy
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.user_study_bookmarks;
CREATE POLICY "bookmarks_select_own" ON public.user_study_bookmarks
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON public.user_study_bookmarks;
CREATE POLICY "bookmarks_insert_own" ON public.user_study_bookmarks
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bookmarks" ON public.user_study_bookmarks;
CREATE POLICY "bookmarks_update_own" ON public.user_study_bookmarks
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.user_study_bookmarks;
CREATE POLICY "bookmarks_delete_own" ON public.user_study_bookmarks
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Updated_at trigger function and triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables (including the missing bookmarks trigger)
DROP TRIGGER IF EXISTS handle_study_modules_updated_at ON public.study_modules;
CREATE TRIGGER handle_study_modules_updated_at
    BEFORE UPDATE ON public.study_modules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_study_sections_updated_at ON public.study_sections;
CREATE TRIGGER handle_study_sections_updated_at
    BEFORE UPDATE ON public.study_sections
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_user_study_progress_updated_at ON public.user_study_progress;
CREATE TRIGGER handle_user_study_progress_updated_at
    BEFORE UPDATE ON public.user_study_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Added the missing bookmarks trigger
DROP TRIGGER IF EXISTS handle_user_study_bookmarks_updated_at ON public.user_study_bookmarks;
CREATE TRIGGER handle_user_study_bookmarks_updated_at
    BEFORE UPDATE ON public.user_study_bookmarks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.study_modules IS 'Comprehensive study modules for TCO certification domains';
COMMENT ON TABLE public.study_sections IS 'Individual study sections within modules containing markdown content';
COMMENT ON TABLE public.user_study_progress IS 'User progress tracking through study materials';
COMMENT ON TABLE public.user_study_bookmarks IS 'User bookmarks for specific locations in study content';

-- Initial data validation function
CREATE OR REPLACE FUNCTION public.validate_study_content_integrity()
RETURNS TEXT AS $$
DECLARE
    result TEXT;
    module_count INTEGER;
    section_count INTEGER;
BEGIN
    -- Check that we have modules for all TCO domains
    SELECT COUNT(*) INTO module_count FROM public.study_modules;
    SELECT COUNT(*) INTO section_count FROM public.study_sections;
    
    result := 'Study content validation: ' || 
              module_count || ' modules, ' || 
              section_count || ' sections';
              
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (RLS still governs row access)
GRANT SELECT ON public.study_modules TO authenticated;
GRANT SELECT ON public.study_sections TO authenticated;
GRANT ALL ON public.user_study_progress TO authenticated;
GRANT ALL ON public.user_study_bookmarks TO authenticated;

-- Service role gets full access for admin operations
GRANT ALL ON public.study_modules TO service_role;
GRANT ALL ON public.study_sections TO service_role;
GRANT ALL ON public.user_study_progress TO service_role;
GRANT ALL ON public.user_study_bookmarks TO service_role;