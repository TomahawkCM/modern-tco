-- TCO Content Integration Pipeline - Database Schema
-- This creates the tables needed for loading comprehensive study content

-- Create tables for TCO study content integration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Study modules table (domains like "domain1-asking-questions")
CREATE TABLE IF NOT EXISTS public.study_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL, -- e.g., "domain1-asking-questions"
    title TEXT NOT NULL,
    description TEXT,
    exam_weight INTEGER, -- percentage weight in exam
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study sections table (sections within each domain)
CREATE TABLE IF NOT EXISTS public.study_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES public.study_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT, -- markdown content
    section_type TEXT DEFAULT 'content', -- 'content', 'lab', 'practice', 'assessment'
    order_index INTEGER DEFAULT 0,
    estimated_time INTEGER, -- minutes to complete
    difficulty_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practice questions table (enhanced version compatible with existing schema)
CREATE TABLE IF NOT EXISTS public.content_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES public.study_sections(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice', -- 'multiple_choice', 'true_false', 'scenario'
    options JSONB, -- array of answer options
    correct_answer TEXT,
    explanation TEXT,
    difficulty_level TEXT DEFAULT 'intermediate',
    tags TEXT[],
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning objectives table
CREATE TABLE IF NOT EXISTS public.learning_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES public.study_sections(id) ON DELETE CASCADE,
    objective_text TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study progress tracking (separate from existing user_progress for exams)
CREATE TABLE IF NOT EXISTS public.study_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- will integrate with auth later
    section_id UUID REFERENCES public.study_sections(id) ON DELETE CASCADE,
    completion_status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    completion_percentage INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- minutes
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, section_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_sections_module_id ON public.study_sections(module_id);
CREATE INDEX IF NOT EXISTS idx_content_questions_section_id ON public.content_questions(section_id);
CREATE INDEX IF NOT EXISTS idx_learning_objectives_section_id ON public.learning_objectives(section_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_user_id ON public.study_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_section_id ON public.study_progress(section_id);

-- Enable Row Level Security
ALTER TABLE public.study_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (study content should be readable by all)
CREATE POLICY IF NOT EXISTS "Public read access for study modules" ON public.study_modules FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read access for study sections" ON public.study_sections FOR SELECT USING (true);  
CREATE POLICY IF NOT EXISTS "Public read access for content questions" ON public.content_questions FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read access for learning objectives" ON public.learning_objectives FOR SELECT USING (true);

-- Study progress should only be accessible by the user who owns it
CREATE POLICY IF NOT EXISTS "Users can view own study progress" ON public.study_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own study progress" ON public.study_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own study progress" ON public.study_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to new tables
DROP TRIGGER IF EXISTS study_modules_updated_at ON public.study_modules;
CREATE TRIGGER study_modules_updated_at
  BEFORE UPDATE ON public.study_modules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS study_sections_updated_at ON public.study_sections;
CREATE TRIGGER study_sections_updated_at
  BEFORE UPDATE ON public.study_sections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS study_progress_updated_at ON public.study_progress;
CREATE TRIGGER study_progress_updated_at
  BEFORE UPDATE ON public.study_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();