-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enums
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE session_type AS ENUM ('practice', 'mock', 'timed');

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'intermediate',
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT questions_correct_answer_valid CHECK (correct_answer >= 0),
  CONSTRAINT questions_options_not_empty CHECK (jsonb_array_length(options) > 0)
);

-- Create exam_sessions table
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  session_type session_type NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score DECIMAL(5,2),
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  is_passed BOOLEAN,
  
  -- Constraints
  CONSTRAINT exam_sessions_score_valid CHECK (score >= 0 AND score <= 100),
  CONSTRAINT exam_sessions_correct_answers_valid CHECK (correct_answers >= 0),
  CONSTRAINT exam_sessions_time_spent_valid CHECK (time_spent >= 0)
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  is_correct BOOLEAN NOT NULL,
  selected_answer INTEGER NOT NULL,
  time_taken INTEGER NOT NULL DEFAULT 0, -- in seconds
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  exam_session_id UUID REFERENCES public.exam_sessions(id) ON DELETE SET NULL,
  
  -- Ensure one progress record per user per question per session
  UNIQUE(user_id, question_id, exam_session_id),
  
  -- Constraints
  CONSTRAINT user_progress_selected_answer_valid CHECK (selected_answer >= 0),
  CONSTRAINT user_progress_time_taken_valid CHECK (time_taken >= 0)
);

-- Create user_statistics table (materialized view as table)
CREATE TABLE IF NOT EXISTS public.user_statistics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,2) DEFAULT 0,
  average_time DECIMAL(8,2) DEFAULT 0, -- in seconds
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint for user-category combination
  UNIQUE(user_id, category),
  
  -- Constraints
  CONSTRAINT user_statistics_accuracy_valid CHECK (accuracy_rate >= 0 AND accuracy_rate <= 100),
  CONSTRAINT user_statistics_totals_valid CHECK (correct_answers <= total_questions)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_question_id ON public.user_progress(question_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed_at ON public.user_progress(completed_at);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_id ON public.exam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_started_at ON public.exam_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON public.user_statistics(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER questions_updated_at 
  BEFORE UPDATE ON public.questions 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically update user statistics
CREATE OR REPLACE FUNCTION public.update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update statistics for the user and category
  INSERT INTO public.user_statistics (user_id, category, total_questions, correct_answers, accuracy_rate, average_time)
  SELECT 
    NEW.user_id,
    q.category,
    COUNT(*) as total_questions,
    SUM(CASE WHEN up.is_correct THEN 1 ELSE 0 END) as correct_answers,
    ROUND((SUM(CASE WHEN up.is_correct THEN 1 ELSE 0 END)::decimal / COUNT(*)) * 100, 2) as accuracy_rate,
    ROUND(AVG(up.time_taken), 2) as average_time
  FROM public.user_progress up
  JOIN public.questions q ON up.question_id = q.id
  WHERE up.user_id = NEW.user_id AND q.category = (SELECT category FROM public.questions WHERE id = NEW.question_id)
  GROUP BY NEW.user_id, q.category
  ON CONFLICT (user_id, category) 
  DO UPDATE SET
    total_questions = EXCLUDED.total_questions,
    correct_answers = EXCLUDED.correct_answers,
    accuracy_rate = EXCLUDED.accuracy_rate,
    average_time = EXCLUDED.average_time,
    last_updated = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply statistics update trigger
CREATE TRIGGER user_progress_update_statistics
  AFTER INSERT OR UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_user_statistics();