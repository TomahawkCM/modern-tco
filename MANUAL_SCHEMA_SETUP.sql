-- MANUAL SCHEMA SETUP FOR SUPABASE DASHBOARD
-- Copy and paste this entire SQL into the Supabase Dashboard SQL Editor
-- Go to: https://huvgbelulauauxvlqjvz.supabase.co/project/default/sql

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create study_modules table
CREATE TABLE IF NOT EXISTS public.study_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    exam_weight INTEGER NOT NULL CHECK (exam_weight > 0 AND exam_weight <= 100),
    estimated_time TEXT NOT NULL,
    learning_objectives JSONB NOT NULL DEFAULT '[]',
    references JSONB NOT NULL DEFAULT '[]',
    exam_prep JSONB NOT NULL DEFAULT '{}',
    version TEXT NOT NULL DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Step 3: Create study_sections table
CREATE TABLE IF NOT EXISTS public.study_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.study_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    section_type TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    estimated_time INTEGER NOT NULL DEFAULT 0,
    key_points JSONB NOT NULL DEFAULT '[]',
    procedures JSONB NOT NULL DEFAULT '[]',
    troubleshooting JSONB NOT NULL DEFAULT '[]',
    playbook JSONB,
    references JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(module_id, order_index)
);

-- Step 4: Create user progress tables
CREATE TABLE IF NOT EXISTS public.user_study_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    module_id UUID NOT NULL REFERENCES public.study_modules(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.study_sections(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started',
    time_spent INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, module_id, section_id)
);

CREATE TABLE IF NOT EXISTS public.user_study_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    section_id UUID NOT NULL REFERENCES public.study_sections(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, section_id, position)
);

-- Step 5: Add indexes
CREATE INDEX IF NOT EXISTS idx_study_modules_domain ON public.study_modules(domain);
CREATE INDEX IF NOT EXISTS idx_study_sections_module_id ON public.study_sections(module_id);
CREATE INDEX IF NOT EXISTS idx_study_sections_module_order ON public.study_sections(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_study_progress_user_id ON public.user_study_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_study_progress_module_id ON public.user_study_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_user_study_progress_status ON public.user_study_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_study_bookmarks_user_id ON public.user_study_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_study_bookmarks_section_id ON public.user_study_bookmarks(section_id);

-- Step 6: Add constraints
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_section_type') THEN
        ALTER TABLE public.study_sections ADD CONSTRAINT check_section_type 
            CHECK (section_type IN ('overview', 'learning_objectives', 'procedures', 'troubleshooting', 'playbook', 'exam_prep', 'references'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_progress_status') THEN
        ALTER TABLE public.user_study_progress ADD CONSTRAINT check_progress_status 
            CHECK (status IN ('not_started', 'in_progress', 'completed', 'needs_review'));
    END IF;
END $$;

-- Step 7: Enable RLS
ALTER TABLE public.study_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_study_bookmarks ENABLE ROW LEVEL SECURITY;

-- Step 8: Create policies (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Study modules are viewable by authenticated users" ON public.study_modules;
DROP POLICY IF EXISTS "Study sections are viewable by authenticated users" ON public.study_sections;

CREATE POLICY "Study modules are viewable by authenticated users" ON public.study_modules
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Study sections are viewable by authenticated users" ON public.study_sections
    FOR SELECT USING (auth.role() = 'authenticated');

-- User progress policies
DROP POLICY IF EXISTS "Users can view their own study progress" ON public.user_study_progress;
DROP POLICY IF EXISTS "Users can insert their own study progress" ON public.user_study_progress;
DROP POLICY IF EXISTS "Users can update their own study progress" ON public.user_study_progress;
DROP POLICY IF EXISTS "Users can delete their own study progress" ON public.user_study_progress;

CREATE POLICY "Users can view their own study progress" ON public.user_study_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study progress" ON public.user_study_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study progress" ON public.user_study_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study progress" ON public.user_study_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Bookmark policies
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.user_study_bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON public.user_study_bookmarks;
DROP POLICY IF EXISTS "Users can update their own bookmarks" ON public.user_study_bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.user_study_bookmarks;

CREATE POLICY "Users can view their own bookmarks" ON public.user_study_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON public.user_study_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" ON public.user_study_bookmarks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON public.user_study_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Step 9: Create helper functions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

-- Step 10: Create triggers
DROP TRIGGER IF EXISTS handle_study_modules_updated_at ON public.study_modules;
DROP TRIGGER IF EXISTS handle_study_sections_updated_at ON public.study_sections;
DROP TRIGGER IF EXISTS handle_user_study_progress_updated_at ON public.user_study_progress;

CREATE TRIGGER handle_study_modules_updated_at
    BEFORE UPDATE ON public.study_modules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_study_sections_updated_at
    BEFORE UPDATE ON public.study_sections
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_study_progress_updated_at
    BEFORE UPDATE ON public.user_study_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 11: Create validation function
CREATE OR REPLACE FUNCTION public.validate_study_content_integrity()
RETURNS TEXT AS $$
DECLARE
    result TEXT;
    module_count INTEGER;
    section_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO module_count FROM public.study_modules;
    SELECT COUNT(*) INTO section_count FROM public.study_sections;
    
    result := 'Study content validation: ' || 
              module_count || ' modules, ' || 
              section_count || ' sections';
              
    RETURN result;
END;
$$ language plpgsql;

-- Step 12: Grant permissions
GRANT ALL ON public.study_modules TO service_role;
GRANT ALL ON public.study_sections TO service_role;
GRANT ALL ON public.user_study_progress TO service_role;
GRANT ALL ON public.user_study_bookmarks TO service_role;

GRANT SELECT ON public.study_modules TO authenticated;
GRANT SELECT ON public.study_sections TO authenticated;
GRANT ALL ON public.user_study_progress TO authenticated;
GRANT ALL ON public.user_study_bookmarks TO authenticated;

-- Step 13: Add table comments
COMMENT ON TABLE public.study_modules IS 'Comprehensive study modules for TCO certification domains';
COMMENT ON TABLE public.study_sections IS 'Individual study sections within modules containing markdown content';
COMMENT ON TABLE public.user_study_progress IS 'User progress tracking through study materials';
COMMENT ON TABLE public.user_study_bookmarks IS 'User bookmarks for specific locations in study content';

-- Verification: Check that tables were created
SELECT 'Tables created successfully!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'study_%' ORDER BY table_name;