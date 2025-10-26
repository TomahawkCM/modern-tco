-- ==================== PHASE 3: AI-POWERED PERSONALIZATION ====================
-- Migration: Add AI personalization features
-- Author: Claude Code - Tanium TCO Learning Platform
-- Date: 2025-10-10
--
-- This migration adds:
-- 1. Student goals and preferences
-- 2. Adaptive learning paths (AI-generated)
-- 3. Smart recommendations engine
-- 4. Pass probability predictions
-- 5. AI tutor conversations
-- 6. Performance snapshots for analytics
-- 7. Early intervention alert system

-- ==================== 1. STUDENT GOALS & PREFERENCES ====================

CREATE TABLE IF NOT EXISTS public.student_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- Goal Configuration
  target_exam_date DATE,
  study_hours_per_week INTEGER CHECK (study_hours_per_week > 0 AND study_hours_per_week <= 40),
  preferred_study_times TEXT[], -- ['morning', 'afternoon', 'evening', 'night']

  -- Learning Preferences
  learning_style TEXT CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading', 'mixed')),
  preferred_content_types TEXT[], -- ['video', 'text', 'interactive', 'practice']
  difficulty_preference TEXT CHECK (difficulty_preference IN ('gradual', 'challenging', 'adaptive')),

  -- Progress Targets
  target_pass_score INTEGER CHECK (target_pass_score >= 70 AND target_pass_score <= 100),
  priority_domains TEXT[], -- Focus areas

  -- AI Personalization Settings
  enable_adaptive_path BOOLEAN DEFAULT true,
  enable_ai_recommendations BOOLEAN DEFAULT true,
  enable_intervention_alerts BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_goals_user ON public.student_goals(user_id);
CREATE INDEX idx_student_goals_exam_date ON public.student_goals(target_exam_date) WHERE target_exam_date IS NOT NULL;

-- RLS Policies
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY student_goals_select_own ON public.student_goals
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY student_goals_insert_own ON public.student_goals
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY student_goals_update_own ON public.student_goals
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trigger for updated_at
DROP TRIGGER IF EXISTS student_goals_updated_at ON public.student_goals;
CREATE TRIGGER student_goals_updated_at
  BEFORE UPDATE ON public.student_goals
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- ==================== 2. ADAPTIVE LEARNING PATHS ====================

CREATE TABLE IF NOT EXISTS public.adaptive_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  goal_id UUID REFERENCES public.student_goals(id) ON DELETE CASCADE,

  -- Path Configuration
  path_name TEXT NOT NULL,
  path_type TEXT CHECK (path_type IN ('beginner', 'fast_track', 'comprehensive', 'remediation', 'custom')),
  estimated_completion_hours INTEGER,

  -- AI Generation Metadata
  generated_by TEXT DEFAULT 'claude-3.5-sonnet', -- AI model used
  generation_prompt TEXT, -- Prompt used for generation
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),

  -- Status
  status TEXT CHECK (status IN ('active', 'paused', 'completed', 'abandoned')) DEFAULT 'active',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Progress Tracking
  total_steps INTEGER DEFAULT 0,
  completed_steps INTEGER DEFAULT 0,
  current_step_index INTEGER DEFAULT 0,

  -- Performance Prediction
  predicted_pass_probability DECIMAL(3,2) CHECK (predicted_pass_probability >= 0 AND predicted_pass_probability <= 1),
  predicted_completion_date DATE,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_paths_user ON public.adaptive_learning_paths(user_id);
CREATE INDEX idx_learning_paths_status ON public.adaptive_learning_paths(status);
CREATE INDEX idx_learning_paths_user_active ON public.adaptive_learning_paths(user_id, status) WHERE status = 'active';

-- RLS Policies
ALTER TABLE public.adaptive_learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY learning_paths_select_own ON public.adaptive_learning_paths
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY learning_paths_insert_own ON public.adaptive_learning_paths
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY learning_paths_update_own ON public.adaptive_learning_paths
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP TRIGGER IF EXISTS learning_paths_updated_at ON public.adaptive_learning_paths;
CREATE TRIGGER learning_paths_updated_at
  BEFORE UPDATE ON public.adaptive_learning_paths
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- ==================== 3. LEARNING PATH STEPS ====================

CREATE TABLE IF NOT EXISTS public.learning_path_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES public.adaptive_learning_paths(id) ON DELETE CASCADE,

  -- Step Details
  step_index INTEGER NOT NULL, -- Order in path
  step_type TEXT CHECK (step_type IN ('module', 'practice', 'video', 'lab', 'quiz', 'review', 'break')) NOT NULL,

  -- Content References
  content_id TEXT, -- Module ID, video ID, etc.
  content_domain TEXT, -- TCO domain
  title TEXT NOT NULL,
  description TEXT,

  -- Time Estimates
  estimated_minutes INTEGER,
  actual_minutes INTEGER,

  -- Prerequisites
  prerequisite_step_ids UUID[], -- Steps that must be completed first

  -- Completion Tracking
  status TEXT CHECK (status IN ('locked', 'available', 'in_progress', 'completed', 'skipped')) DEFAULT 'locked',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Performance
  score DECIMAL(5,2), -- If applicable (quiz, practice)
  attempts INTEGER DEFAULT 0,

  -- AI Recommendations
  recommended_resources JSONB, -- Additional helpful resources
  difficulty_adjustment DECIMAL(3,2) DEFAULT 1.0, -- Multiplier based on performance

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_path_steps_path ON public.learning_path_steps(path_id);
CREATE INDEX idx_path_steps_path_index ON public.learning_path_steps(path_id, step_index);
CREATE INDEX idx_path_steps_status ON public.learning_path_steps(status);
CREATE INDEX idx_path_steps_domain ON public.learning_path_steps(content_domain);

-- RLS Policies
ALTER TABLE public.learning_path_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY path_steps_select_own ON public.learning_path_steps
  FOR SELECT TO authenticated
  USING (
    path_id IN (
      SELECT id FROM public.adaptive_learning_paths WHERE user_id = auth.uid()
    )
  );

CREATE POLICY path_steps_update_own ON public.learning_path_steps
  FOR UPDATE TO authenticated
  USING (
    path_id IN (
      SELECT id FROM public.adaptive_learning_paths WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    path_id IN (
      SELECT id FROM public.adaptive_learning_paths WHERE user_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS path_steps_updated_at ON public.learning_path_steps;
CREATE TRIGGER path_steps_updated_at
  BEFORE UPDATE ON public.learning_path_steps
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- ==================== 4. SMART RECOMMENDATIONS ====================

CREATE TABLE IF NOT EXISTS public.study_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- Recommendation Details
  recommendation_type TEXT CHECK (recommendation_type IN (
    'next_action',
    'weak_domain',
    'study_schedule',
    'resource',
    'strategy',
    'intervention'
  )) NOT NULL,

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',

  -- AI Generation
  generated_by TEXT DEFAULT 'claude-3.5-sonnet',
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning TEXT, -- Why this recommendation was made

  -- Action Items
  suggested_actions JSONB, -- Specific steps to take
  estimated_impact TEXT, -- Expected improvement

  -- Context
  related_domain TEXT,
  related_module_id UUID,
  related_content_id TEXT,

  -- Engagement
  status TEXT CHECK (status IN ('active', 'dismissed', 'completed', 'expired')) DEFAULT 'active',
  viewed_at TIMESTAMPTZ,
  actioned_at TIMESTAMPTZ,

  -- Expiration
  expires_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recommendations_user ON public.study_recommendations(user_id);
CREATE INDEX idx_recommendations_user_status ON public.study_recommendations(user_id, status);
CREATE INDEX idx_recommendations_priority ON public.study_recommendations(priority, created_at DESC);
CREATE INDEX idx_recommendations_type ON public.study_recommendations(recommendation_type);

-- RLS Policies
ALTER TABLE public.study_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY recommendations_select_own ON public.study_recommendations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY recommendations_update_own ON public.study_recommendations
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP TRIGGER IF EXISTS recommendations_updated_at ON public.study_recommendations;
CREATE TRIGGER recommendations_updated_at
  BEFORE UPDATE ON public.study_recommendations
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- ==================== 5. PASS PROBABILITY PREDICTIONS ====================

CREATE TABLE IF NOT EXISTS public.pass_probability_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- Prediction Details
  predicted_probability DECIMAL(5,2) CHECK (predicted_probability >= 0 AND predicted_probability <= 100) NOT NULL,
  confidence_interval DECIMAL(5,2), -- +/- range

  -- Model Information
  model_version TEXT DEFAULT 'v1.0',
  prediction_method TEXT CHECK (prediction_method IN (
    'bayesian',
    'regression',
    'neural_network',
    'ensemble',
    'rule_based'
  )),

  -- Input Features
  features_used JSONB, -- What data was used for prediction
  domain_scores JSONB, -- Per-domain predicted scores

  -- Contributing Factors
  strengths JSONB, -- Strong areas
  weaknesses JSONB, -- Areas needing improvement
  risk_factors TEXT[], -- Things that could impact success

  -- Time Projection
  prediction_for_date DATE, -- When is this prediction for
  days_until_exam INTEGER,

  -- Recommendations
  recommended_actions JSONB,
  estimated_study_hours_needed INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_predictions_user ON public.pass_probability_predictions(user_id);
CREATE INDEX idx_predictions_user_created ON public.pass_probability_predictions(user_id, created_at DESC);
CREATE INDEX idx_predictions_exam_date ON public.pass_probability_predictions(prediction_for_date);

-- RLS Policies
ALTER TABLE public.pass_probability_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY predictions_select_own ON public.pass_probability_predictions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ==================== 6. AI TUTOR CONVERSATIONS ====================

CREATE TABLE IF NOT EXISTS public.ai_tutor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- Conversation Details
  title TEXT, -- Optional user-provided title
  conversation_type TEXT CHECK (conversation_type IN (
    'general_help',
    'concept_explanation',
    'exam_strategy',
    'troubleshooting',
    'study_planning',
    'motivation'
  )) DEFAULT 'general_help',

  -- Context
  related_module_id UUID,
  related_domain TEXT,
  related_section_id TEXT,

  -- Status
  status TEXT CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),

  -- AI Configuration
  ai_model TEXT DEFAULT 'claude-3.5-sonnet',
  system_prompt TEXT, -- Custom system prompt if any

  -- Metadata
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON public.ai_tutor_conversations(user_id);
CREATE INDEX idx_conversations_user_active ON public.ai_tutor_conversations(user_id, status) WHERE status = 'active';
CREATE INDEX idx_conversations_last_message ON public.ai_tutor_conversations(last_message_at DESC);

-- RLS Policies
ALTER TABLE public.ai_tutor_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY conversations_select_own ON public.ai_tutor_conversations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY conversations_insert_own ON public.ai_tutor_conversations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY conversations_update_own ON public.ai_tutor_conversations
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP TRIGGER IF EXISTS conversations_updated_at ON public.ai_tutor_conversations;
CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.ai_tutor_conversations
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- ==================== 7. AI TUTOR MESSAGES ====================

CREATE TABLE IF NOT EXISTS public.ai_tutor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_tutor_conversations(id) ON DELETE CASCADE,

  -- Message Details
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,

  -- AI Metadata (for assistant messages)
  model TEXT,
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  confidence_score DECIMAL(3,2),

  -- References
  referenced_content JSONB, -- Links to modules, questions, etc.
  code_snippets JSONB, -- If showing Tanium queries, etc.

  -- Engagement
  was_helpful BOOLEAN,
  user_feedback TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON public.ai_tutor_messages(conversation_id);
CREATE INDEX idx_messages_conversation_created ON public.ai_tutor_messages(conversation_id, created_at);
CREATE INDEX idx_messages_role ON public.ai_tutor_messages(role);

-- RLS Policies
ALTER TABLE public.ai_tutor_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY messages_select_own ON public.ai_tutor_messages
  FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM public.ai_tutor_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY messages_insert_own ON public.ai_tutor_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.ai_tutor_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY messages_update_own ON public.ai_tutor_messages
  FOR UPDATE TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM public.ai_tutor_conversations WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.ai_tutor_conversations WHERE user_id = auth.uid()
    )
  );

-- ==================== 8. PERFORMANCE SNAPSHOTS ====================

CREATE TABLE IF NOT EXISTS public.student_performance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- Timing
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  snapshot_type TEXT CHECK (snapshot_type IN ('daily', 'weekly', 'milestone', 'manual')) DEFAULT 'daily',

  -- Overall Progress
  total_study_hours DECIMAL(6,2),
  modules_completed INTEGER,
  modules_total INTEGER,
  overall_completion_percentage DECIMAL(5,2),

  -- Domain Performance
  domain_scores JSONB, -- Per-domain average scores
  domain_time_spent JSONB, -- Hours per domain
  domain_confidence JSONB, -- Self-assessed confidence per domain

  -- Practice & Assessment
  total_questions_answered INTEGER,
  overall_accuracy DECIMAL(5,2),
  practice_sessions_completed INTEGER,
  mock_exams_taken INTEGER,
  best_mock_exam_score DECIMAL(5,2),
  latest_mock_exam_score DECIMAL(5,2),

  -- Engagement Metrics
  streak_days INTEGER,
  daily_active_days INTEGER, -- Last 7 days
  weekly_active_days INTEGER, -- Last 30 days

  -- Spaced Repetition
  flashcards_mastered INTEGER,
  questions_mastered INTEGER,
  items_due_for_review INTEGER,

  -- AI Predictions
  current_pass_probability DECIMAL(5,2),
  days_until_ready INTEGER, -- Estimated days until exam-ready

  -- Trends (vs previous snapshot)
  accuracy_trend DECIMAL(5,2), -- +/- change
  completion_trend DECIMAL(5,2),
  pass_probability_trend DECIMAL(5,2),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_snapshots_user ON public.student_performance_snapshots(user_id);
CREATE INDEX idx_snapshots_user_date ON public.student_performance_snapshots(user_id, snapshot_date DESC);
CREATE INDEX idx_snapshots_date ON public.student_performance_snapshots(snapshot_date DESC);

-- RLS Policies
ALTER TABLE public.student_performance_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY snapshots_select_own ON public.student_performance_snapshots
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ==================== 9. INTERVENTION ALERTS ====================

CREATE TABLE IF NOT EXISTS public.intervention_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- Alert Details
  alert_type TEXT CHECK (alert_type IN (
    'low_engagement',
    'poor_performance',
    'missed_milestone',
    'declining_trend',
    'exam_unready',
    'burnout_risk'
  )) NOT NULL,

  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'warning',

  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Trigger Conditions
  triggered_by JSONB, -- What conditions caused this alert
  threshold_values JSONB, -- Expected vs actual values

  -- Recommendations
  suggested_actions JSONB,
  support_resources JSONB,

  -- Status
  status TEXT CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')) DEFAULT 'active',
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,

  -- Follow-up
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_user ON public.intervention_alerts(user_id);
CREATE INDEX idx_alerts_user_status ON public.intervention_alerts(user_id, status);
CREATE INDEX idx_alerts_severity ON public.intervention_alerts(severity, created_at DESC);
CREATE INDEX idx_alerts_type ON public.intervention_alerts(alert_type);

-- RLS Policies
ALTER TABLE public.intervention_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY alerts_select_own ON public.intervention_alerts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY alerts_update_own ON public.intervention_alerts
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP TRIGGER IF EXISTS alerts_updated_at ON public.intervention_alerts;
CREATE TRIGGER alerts_updated_at
  BEFORE UPDATE ON public.intervention_alerts
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- ==================== HELPER FUNCTIONS ====================

-- Function to get active learning path for user
CREATE OR REPLACE FUNCTION public.get_active_learning_path(p_user_id UUID)
RETURNS TABLE (
  path_id UUID,
  path_name TEXT,
  total_steps INTEGER,
  completed_steps INTEGER,
  current_step_index INTEGER,
  predicted_pass_probability DECIMAL(3,2),
  next_step_id UUID,
  next_step_title TEXT,
  next_step_type TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    alp.id,
    alp.path_name,
    alp.total_steps,
    alp.completed_steps,
    alp.current_step_index,
    alp.predicted_pass_probability,
    lps.id,
    lps.title,
    lps.step_type
  FROM public.adaptive_learning_paths alp
  LEFT JOIN public.learning_path_steps lps ON
    lps.path_id = alp.id AND
    lps.step_index = alp.current_step_index
  WHERE
    alp.user_id = p_user_id AND
    alp.status = 'active'
  ORDER BY alp.created_at DESC
  LIMIT 1;
END;
$$;

-- Function to get next smart recommendation
CREATE OR REPLACE FUNCTION public.get_next_recommendation(p_user_id UUID)
RETURNS TABLE (
  recommendation_id UUID,
  title TEXT,
  description TEXT,
  priority TEXT,
  recommendation_type TEXT,
  suggested_actions JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sr.id,
    sr.title,
    sr.description,
    sr.priority,
    sr.recommendation_type,
    sr.suggested_actions
  FROM public.study_recommendations sr
  WHERE
    sr.user_id = p_user_id AND
    sr.status = 'active' AND
    (sr.expires_at IS NULL OR sr.expires_at > NOW())
  ORDER BY
    CASE sr.priority
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      ELSE 4
    END,
    sr.created_at DESC
  LIMIT 1;
END;
$$;

-- Function to get latest pass probability
CREATE OR REPLACE FUNCTION public.get_latest_pass_probability(p_user_id UUID)
RETURNS TABLE (
  probability DECIMAL(5,2),
  confidence_interval DECIMAL(5,2),
  strengths JSONB,
  weaknesses JSONB,
  recommended_actions JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ppp.predicted_probability,
    ppp.confidence_interval,
    ppp.strengths,
    ppp.weaknesses,
    ppp.recommended_actions,
    ppp.created_at
  FROM public.pass_probability_predictions ppp
  WHERE ppp.user_id = p_user_id
  ORDER BY ppp.created_at DESC
  LIMIT 1;
END;
$$;

-- ==================== GRANTS ====================

GRANT SELECT, INSERT, UPDATE ON public.student_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.adaptive_learning_paths TO authenticated;
GRANT SELECT, UPDATE ON public.learning_path_steps TO authenticated;
GRANT SELECT, UPDATE ON public.study_recommendations TO authenticated;
GRANT SELECT ON public.pass_probability_predictions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ai_tutor_conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ai_tutor_messages TO authenticated;
GRANT SELECT ON public.student_performance_snapshots TO authenticated;
GRANT SELECT, UPDATE ON public.intervention_alerts TO authenticated;

-- ==================== COMMENTS ====================

COMMENT ON TABLE public.student_goals IS
'Student learning goals, preferences, and AI personalization settings';

COMMENT ON TABLE public.adaptive_learning_paths IS
'AI-generated personalized learning paths tailored to student goals and performance';

COMMENT ON TABLE public.learning_path_steps IS
'Individual steps in an adaptive learning path with progress tracking';

COMMENT ON TABLE public.study_recommendations IS
'AI-powered smart recommendations for next actions and study strategies';

COMMENT ON TABLE public.pass_probability_predictions IS
'ML-based predictions of exam pass probability with confidence intervals';

COMMENT ON TABLE public.ai_tutor_conversations IS
'Conversations with AI tutor for 24/7 learning support';

COMMENT ON TABLE public.ai_tutor_messages IS
'Individual messages within AI tutor conversations';

COMMENT ON TABLE public.student_performance_snapshots IS
'Point-in-time snapshots of student performance for trend analysis and analytics';

COMMENT ON TABLE public.intervention_alerts IS
'Early warning system alerts for struggling students requiring intervention';

-- ==================== VACUUM & ANALYZE ====================

ANALYZE public.student_goals;
ANALYZE public.adaptive_learning_paths;
ANALYZE public.learning_path_steps;
ANALYZE public.study_recommendations;
ANALYZE public.pass_probability_predictions;
ANALYZE public.ai_tutor_conversations;
ANALYZE public.ai_tutor_messages;
ANALYZE public.student_performance_snapshots;
ANALYZE public.intervention_alerts;
