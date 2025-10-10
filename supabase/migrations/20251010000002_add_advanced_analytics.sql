-- =====================================================
-- ADVANCED ANALYTICS SCHEMA
-- Phase 3.3: Comparative Analytics, Heatmaps, Time-to-Mastery
-- =====================================================

-- =====================================================
-- TABLE: cohort_benchmarks
-- Purpose: Store aggregate performance metrics for cohorts
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cohort_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_name TEXT NOT NULL, -- e.g., "2025-Q1", "All Users", "Fast Track"
  cohort_type TEXT NOT NULL CHECK (cohort_type IN ('temporal', 'goal_based', 'performance_level', 'global')),

  -- Aggregate metrics
  total_students INTEGER NOT NULL DEFAULT 0,
  avg_completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  avg_overall_accuracy DECIMAL(5,2) DEFAULT 0.00,
  avg_study_hours DECIMAL(5,2) DEFAULT 0.00,
  avg_days_to_completion DECIMAL(5,2) DEFAULT NULL,
  avg_mock_exam_score DECIMAL(5,2) DEFAULT 0.00,
  avg_practice_accuracy DECIMAL(5,2) DEFAULT 0.00,
  avg_study_streak INTEGER DEFAULT 0,
  pass_rate DECIMAL(5,2) DEFAULT NULL, -- Percentage who passed exam

  -- Domain-specific averages (JSONB for flexibility)
  domain_averages JSONB DEFAULT '{}'::jsonb,
  -- Example: {"asking_questions": 78.5, "refining_targeting": 82.1, ...}

  -- Time-based metrics
  avg_time_per_module JSONB DEFAULT '{}'::jsonb,
  -- Example: {"module_0": 180, "module_1": 45, ...} (minutes)

  -- Engagement metrics
  avg_sessions_per_week DECIMAL(4,2) DEFAULT 0.00,
  avg_session_duration_minutes DECIMAL(5,2) DEFAULT 0.00,

  -- Metadata
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cohort_benchmarks_type ON public.cohort_benchmarks(cohort_type);
CREATE INDEX idx_cohort_benchmarks_dates ON public.cohort_benchmarks(date_range_start, date_range_end);

-- Enable RLS
ALTER TABLE public.cohort_benchmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can read cohort benchmarks
CREATE POLICY "Cohort benchmarks are readable by all authenticated users"
  ON public.cohort_benchmarks FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- TABLE: student_cohort_assignments
-- Purpose: Track which cohorts a student belongs to
-- =====================================================
CREATE TABLE IF NOT EXISTS public.student_cohort_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cohort_benchmark_id UUID NOT NULL REFERENCES public.cohort_benchmarks(id) ON DELETE CASCADE,

  -- Student-specific metrics for comparison
  personal_completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  personal_overall_accuracy DECIMAL(5,2) DEFAULT 0.00,
  personal_study_hours DECIMAL(5,2) DEFAULT 0.00,
  personal_days_active INTEGER DEFAULT 0,
  personal_mock_exam_best DECIMAL(5,2) DEFAULT 0.00,

  -- Percentile rankings (0-100)
  completion_percentile INTEGER CHECK (completion_percentile >= 0 AND completion_percentile <= 100),
  accuracy_percentile INTEGER CHECK (accuracy_percentile >= 0 AND accuracy_percentile <= 100),
  study_hours_percentile INTEGER CHECK (study_hours_percentile >= 0 AND study_hours_percentile <= 100),
  overall_percentile INTEGER CHECK (overall_percentile >= 0 AND overall_percentile <= 100),

  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, cohort_benchmark_id)
);

CREATE INDEX idx_student_cohort_user ON public.student_cohort_assignments(user_id);
CREATE INDEX idx_student_cohort_benchmark ON public.student_cohort_assignments(cohort_benchmark_id);

-- Enable RLS
ALTER TABLE public.student_cohort_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own cohort assignments
CREATE POLICY "Users can read their own cohort assignments"
  ON public.student_cohort_assignments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: performance_heatmaps
-- Purpose: Store granular performance data for heatmap visualizations
-- =====================================================
CREATE TABLE IF NOT EXISTS public.performance_heatmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- Heatmap type
  heatmap_type TEXT NOT NULL CHECK (heatmap_type IN ('domain_by_week', 'topic_by_difficulty', 'time_of_day', 'learning_objective')),

  -- Heatmap data (flexible JSONB structure)
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example for domain_by_week:
  -- {
  --   "weeks": ["2025-W01", "2025-W02", ...],
  --   "domains": ["asking_questions", "refining_targeting", ...],
  --   "matrix": [
  --     [78, 82, 85, 88],  -- asking_questions across weeks
  --     [65, 70, 75, 80],  -- refining_targeting across weeks
  --     ...
  --   ]
  -- }

  -- Metadata
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_performance_heatmaps_user ON public.performance_heatmaps(user_id);
CREATE INDEX idx_performance_heatmaps_type ON public.performance_heatmaps(heatmap_type);

-- Enable RLS
ALTER TABLE public.performance_heatmaps ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own heatmaps
CREATE POLICY "Users can read their own performance heatmaps"
  ON public.performance_heatmaps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own performance heatmaps"
  ON public.performance_heatmaps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own performance heatmaps"
  ON public.performance_heatmaps FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABLE: mastery_predictions
-- Purpose: ML predictions for time-to-mastery per domain
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mastery_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- Target domain or skill
  domain TEXT NOT NULL,
  current_mastery_level DECIMAL(5,2) NOT NULL CHECK (current_mastery_level >= 0 AND current_mastery_level <= 100),
  target_mastery_level DECIMAL(5,2) NOT NULL DEFAULT 80.00 CHECK (target_mastery_level >= 0 AND target_mastery_level <= 100),

  -- Predictions
  predicted_days_to_mastery INTEGER CHECK (predicted_days_to_mastery >= 0),
  predicted_study_hours_needed DECIMAL(5,2) CHECK (predicted_study_hours_needed >= 0),
  predicted_practice_questions_needed INTEGER CHECK (predicted_practice_questions_needed >= 0),

  -- Confidence metrics
  prediction_confidence DECIMAL(3,2) CHECK (prediction_confidence >= 0 AND prediction_confidence <= 1.00),
  confidence_interval_lower INTEGER, -- Days (lower bound)
  confidence_interval_upper INTEGER, -- Days (upper bound)

  -- Learning velocity (based on historical data)
  current_learning_velocity DECIMAL(5,2) DEFAULT 0.00, -- Mastery points per hour
  -- Example: 2.5 means student gains 2.5% mastery per hour of study

  -- Recommended study plan
  recommended_daily_minutes INTEGER CHECK (recommended_daily_minutes > 0),
  recommended_weekly_sessions INTEGER CHECK (recommended_weekly_sessions > 0),

  -- Model metadata
  model_version TEXT NOT NULL DEFAULT 'v1.0',
  prediction_method TEXT NOT NULL DEFAULT 'linear_projection',
  features_used JSONB DEFAULT '{}'::jsonb,

  -- Actual outcome (for model improvement)
  actual_days_to_mastery INTEGER DEFAULT NULL,
  actual_study_hours_spent DECIMAL(5,2) DEFAULT NULL,
  prediction_error DECIMAL(5,2) DEFAULT NULL, -- Signed error (actual - predicted)

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  achieved_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX idx_mastery_predictions_user ON public.mastery_predictions(user_id);
CREATE INDEX idx_mastery_predictions_domain ON public.mastery_predictions(domain);
CREATE INDEX idx_mastery_predictions_active ON public.mastery_predictions(user_id, achieved_at) WHERE achieved_at IS NULL;

-- Enable RLS
ALTER TABLE public.mastery_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own mastery predictions
CREATE POLICY "Users can read their own mastery predictions"
  ON public.mastery_predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mastery predictions"
  ON public.mastery_predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mastery predictions"
  ON public.mastery_predictions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABLE: learning_analytics_cache
-- Purpose: Cache computed analytics to reduce query load
-- =====================================================
CREATE TABLE IF NOT EXISTS public.learning_analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- Cache key (unique identifier for cached data)
  cache_key TEXT NOT NULL,
  -- Examples: "comparative_analytics", "domain_heatmap", "weekly_summary"

  -- Cached data
  data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Cache metadata
  ttl_seconds INTEGER NOT NULL DEFAULT 3600, -- Time-to-live (1 hour default)
  expires_at TIMESTAMPTZ NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, cache_key)
);

CREATE INDEX idx_analytics_cache_user ON public.learning_analytics_cache(user_id);
CREATE INDEX idx_analytics_cache_key ON public.learning_analytics_cache(cache_key);
CREATE INDEX idx_analytics_cache_expires ON public.learning_analytics_cache(expires_at);

-- Enable RLS
ALTER TABLE public.learning_analytics_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own cache
CREATE POLICY "Users can manage their own analytics cache"
  ON public.learning_analytics_cache FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS: Cohort Benchmark Calculations
-- =====================================================

-- Function to calculate global cohort benchmarks
CREATE OR REPLACE FUNCTION public.calculate_global_cohort_benchmarks()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_benchmark_id UUID;
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  v_start_date := '2025-01-01';
  v_end_date := CURRENT_DATE;

  -- Delete existing global benchmark
  DELETE FROM public.cohort_benchmarks WHERE cohort_type = 'global';

  -- Insert new global benchmark
  INSERT INTO public.cohort_benchmarks (
    cohort_name,
    cohort_type,
    total_students,
    avg_completion_percentage,
    avg_overall_accuracy,
    date_range_start,
    date_range_end
  )
  SELECT
    'All Users' as cohort_name,
    'global' as cohort_type,
    COUNT(DISTINCT user_id) as total_students,
    AVG(completion_percentage) as avg_completion_percentage,
    AVG(overall_accuracy) as avg_overall_accuracy,
    v_start_date,
    v_end_date
  FROM public.student_performance_snapshots
  WHERE created_at >= v_start_date
  RETURNING id INTO v_benchmark_id;

  RAISE NOTICE 'Global cohort benchmark calculated: %', v_benchmark_id;
END;
$$;

-- Function to assign student to cohorts
CREATE OR REPLACE FUNCTION public.assign_student_to_cohorts(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_cohort RECORD;
  v_student_data RECORD;
BEGIN
  -- Get latest student performance data
  SELECT
    completion_percentage,
    overall_accuracy,
    total_study_hours
  INTO v_student_data
  FROM public.student_performance_snapshots
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Assign to all global cohorts
  FOR v_cohort IN
    SELECT id FROM public.cohort_benchmarks WHERE cohort_type = 'global'
  LOOP
    INSERT INTO public.student_cohort_assignments (
      user_id,
      cohort_benchmark_id,
      personal_completion_percentage,
      personal_overall_accuracy,
      personal_study_hours
    )
    VALUES (
      p_user_id,
      v_cohort.id,
      v_student_data.completion_percentage,
      v_student_data.overall_accuracy,
      v_student_data.total_study_hours
    )
    ON CONFLICT (user_id, cohort_benchmark_id) DO UPDATE
    SET
      personal_completion_percentage = v_student_data.completion_percentage,
      personal_overall_accuracy = v_student_data.overall_accuracy,
      personal_study_hours = v_student_data.total_study_hours,
      last_updated_at = NOW();
  END LOOP;
END;
$$;

-- Function to calculate percentiles
CREATE OR REPLACE FUNCTION public.calculate_student_percentiles(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_assignment RECORD;
  v_completion_percentile INTEGER;
  v_accuracy_percentile INTEGER;
  v_overall_percentile INTEGER;
BEGIN
  FOR v_assignment IN
    SELECT * FROM public.student_cohort_assignments WHERE user_id = p_user_id
  LOOP
    -- Calculate completion percentile
    SELECT ROUND(
      (COUNT(*) FILTER (WHERE personal_completion_percentage <= v_assignment.personal_completion_percentage)::DECIMAL /
       COUNT(*)::DECIMAL) * 100
    )::INTEGER
    INTO v_completion_percentile
    FROM public.student_cohort_assignments
    WHERE cohort_benchmark_id = v_assignment.cohort_benchmark_id;

    -- Calculate accuracy percentile
    SELECT ROUND(
      (COUNT(*) FILTER (WHERE personal_overall_accuracy <= v_assignment.personal_overall_accuracy)::DECIMAL /
       COUNT(*)::DECIMAL) * 100
    )::INTEGER
    INTO v_accuracy_percentile
    FROM public.student_cohort_assignments
    WHERE cohort_benchmark_id = v_assignment.cohort_benchmark_id;

    -- Overall percentile (average of completion and accuracy)
    v_overall_percentile := ROUND((v_completion_percentile + v_accuracy_percentile) / 2.0);

    -- Update assignment with percentiles
    UPDATE public.student_cohort_assignments
    SET
      completion_percentile = v_completion_percentile,
      accuracy_percentile = v_accuracy_percentile,
      overall_percentile = v_overall_percentile,
      last_updated_at = NOW()
    WHERE id = v_assignment.id;
  END LOOP;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cohort_benchmarks_updated_at
  BEFORE UPDATE ON public.cohort_benchmarks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_cohort_assignments_updated_at
  BEFORE UPDATE ON public.student_cohort_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_heatmaps_updated_at
  BEFORE UPDATE ON public.performance_heatmaps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mastery_predictions_updated_at
  BEFORE UPDATE ON public.mastery_predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_analytics_cache_updated_at
  BEFORE UPDATE ON public.learning_analytics_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================

-- Seed global cohort benchmark (will be recalculated with real data)
INSERT INTO public.cohort_benchmarks (
  cohort_name,
  cohort_type,
  total_students,
  avg_completion_percentage,
  avg_overall_accuracy,
  avg_study_hours,
  avg_mock_exam_score,
  avg_study_streak,
  date_range_start,
  date_range_end
) VALUES (
  'All Users',
  'global',
  0,
  0.00,
  0.00,
  0.00,
  0.00,
  0,
  '2025-01-01',
  CURRENT_DATE
) ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.cohort_benchmarks IS 'Stores aggregate performance metrics for student cohorts (global, temporal, performance-based)';
COMMENT ON TABLE public.student_cohort_assignments IS 'Maps students to cohorts with percentile rankings for comparative analytics';
COMMENT ON TABLE public.performance_heatmaps IS 'Stores granular performance data for heatmap visualizations (domain×week, topic×difficulty)';
COMMENT ON TABLE public.mastery_predictions IS 'ML-based predictions for time-to-mastery and recommended study plans per domain';
COMMENT ON TABLE public.learning_analytics_cache IS 'Caches computed analytics to reduce database load and improve performance';

COMMENT ON FUNCTION public.calculate_global_cohort_benchmarks IS 'Recalculates global cohort benchmarks from all student performance data';
COMMENT ON FUNCTION public.assign_student_to_cohorts IS 'Assigns a student to appropriate cohorts and updates their personal metrics';
COMMENT ON FUNCTION public.calculate_student_percentiles IS 'Calculates percentile rankings for a student across all their cohort assignments';
