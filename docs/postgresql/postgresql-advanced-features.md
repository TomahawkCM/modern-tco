# PostgreSQL Advanced Features for TCO Application

## Overview

This document covers advanced PostgreSQL features utilized in the TCO exam preparation system, including extensions, advanced data types, full-text search, and custom functions for enhanced functionality.

## PostgreSQL Extensions

### Essential Extensions for TCO Application

```sql
-- UUID generation for distributed systems
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search capabilities
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Performance monitoring
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Additional data types and functions
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Administrative functions
CREATE EXTENSION IF NOT EXISTS "adminpack";

-- Check installed extensions
SELECT extname, extversion FROM pg_extension ORDER BY extname;
```

### Extension Usage Examples

```sql
-- UUID generation patterns
SELECT uuid_generate_v4() as new_uuid;
SELECT uuid_generate_v5(uuid_ns_dns(), 'tanium.com') as namespace_uuid;

-- Trigram similarity for fuzzy matching
SELECT
  title,
  similarity(title, 'tanium sensor') as sim_score
FROM questions
WHERE title % 'tanium sensor'  -- % operator for similarity
ORDER BY sim_score DESC;

-- Cryptographic hashing for secure data
SELECT encode(digest('sensitive_data', 'sha256'), 'hex') as hash_value;

-- Generate secure random values
SELECT encode(gen_random_bytes(32), 'base64') as secure_token;
```

## Advanced Data Types

### Array Operations

```sql
-- Array manipulation in questions table
ALTER TABLE questions ADD COLUMN prerequisites INTEGER[] DEFAULT '{}';
ALTER TABLE questions ADD COLUMN related_topics TEXT[] DEFAULT '{}';

-- Array query operations
-- Find questions with specific prerequisites
SELECT * FROM questions
WHERE 1 = ANY(prerequisites);  -- Contains prerequisite ID 1

-- Find questions with multiple prerequisites
SELECT * FROM questions
WHERE prerequisites @> ARRAY[1, 2];  -- Contains both 1 and 2

-- Find questions by topic overlap
SELECT q1.title as question1, q2.title as question2
FROM questions q1, questions q2
WHERE q1.id < q2.id  -- Avoid duplicates
  AND q1.related_topics && q2.related_topics;  -- Array overlap

-- Array aggregation functions
SELECT
  domain,
  array_agg(DISTINCT difficulty) as available_difficulties,
  array_agg(DISTINCT (metadata->>'type')) as question_types,
  array_length(array_agg(DISTINCT tags), 1) as unique_tag_count
FROM questions
WHERE is_active = true
GROUP BY domain;

-- Array expansion and filtering
SELECT
  id,
  title,
  unnest(tags) as tag
FROM questions
WHERE 'intermediate' = ANY(tags);
```

### JSON and JSONB Advanced Operations

```sql
-- JSON path operations (PostgreSQL 12+)
SELECT
  id,
  title,
  jsonb_path_query(metadata, '$.references[*]') as all_references,
  jsonb_path_exists(metadata, '$.media.images') as has_images,
  jsonb_path_query_first(metadata, '$.lab_exercise') as lab_exercise
FROM questions
WHERE jsonb_path_exists(metadata, '$.type ? (@ == "multiple_choice")');

-- JSON aggregation for analytics
SELECT
  jsonb_build_object(
    'domain_stats', jsonb_agg(
      jsonb_build_object(
        'domain', domain,
        'count', question_count,
        'avg_difficulty_weight', avg_weight,
        'difficulties', difficulties
      )
    )
  ) as comprehensive_stats
FROM (
  SELECT
    domain,
    COUNT(*) as question_count,
    AVG((metadata->>'weight')::numeric) as avg_weight,
    jsonb_agg(DISTINCT metadata->>'difficulty') as difficulties
  FROM questions
  WHERE is_active = true
  GROUP BY domain
) domain_summary;

-- JSON manipulation functions
UPDATE questions
SET metadata = jsonb_set(
  metadata,
  '{last_updated}',
  to_jsonb(now()::timestamp)
)
WHERE domain = 'asking_questions';

-- Conditional JSON updates
UPDATE questions
SET metadata = CASE
  WHEN metadata->>'type' = 'multiple_choice' THEN
    jsonb_set(metadata, '{max_attempts}', '3'::jsonb)
  WHEN metadata->>'type' = 'essay' THEN
    jsonb_set(metadata, '{max_attempts}', '1'::jsonb)
  ELSE metadata
END;
```

### Range Types

```sql
-- Create table with time ranges for scheduling
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  time_range TSTZRANGE NOT NULL,
  domain TEXT,
  planned_questions INTEGER,
  actual_questions INTEGER DEFAULT 0,
  EXCLUDE USING GIST (user_id WITH =, time_range WITH &&)  -- Prevent overlapping sessions
);

-- Insert study session with time range
INSERT INTO study_sessions (user_id, time_range, domain, planned_questions)
VALUES (
  'user-uuid-here',
  '[2024-01-15 14:00:00+00, 2024-01-15 16:00:00+00)',
  'asking_questions',
  20
);

-- Query sessions by time overlap
SELECT * FROM study_sessions
WHERE time_range && '[2024-01-15 15:00:00+00, 2024-01-15 17:00:00+00)';

-- Find available time slots
SELECT
  user_id,
  lag(upper(time_range)) OVER (PARTITION BY user_id ORDER BY time_range) as prev_end,
  lower(time_range) as current_start,
  CASE
    WHEN lag(upper(time_range)) OVER (PARTITION BY user_id ORDER BY time_range) < lower(time_range)
    THEN tstzrange(
      lag(upper(time_range)) OVER (PARTITION BY user_id ORDER BY time_range),
      lower(time_range),
      '()'
    )
    ELSE NULL
  END as available_gap
FROM study_sessions
WHERE user_id = 'specific-user-uuid';
```

## Full-Text Search Implementation

### Advanced Text Search Configuration

```sql
-- Create custom text search configuration for Tanium content
CREATE TEXT SEARCH CONFIGURATION tanium_search (COPY = english);

-- Add domain-specific dictionaries
CREATE TEXT SEARCH DICTIONARY tanium_dict (
  TEMPLATE = simple,
  STOPWORDS = tanium_stopwords  -- Custom stopwords list
);

ALTER TEXT SEARCH CONFIGURATION tanium_search
ALTER MAPPING FOR asciiword WITH tanium_dict, english_stem;

-- Create specialized search indexes
CREATE INDEX idx_questions_content_fts_tanium
ON questions USING gin (to_tsvector('tanium_search', title || ' ' || content || ' ' || array_to_string(tags, ' ')));

CREATE INDEX idx_questions_title_weighted
ON questions USING gin (
  setweight(to_tsvector('tanium_search', title), 'A') ||
  setweight(to_tsvector('tanium_search', content), 'B') ||
  setweight(to_tsvector('tanium_search', array_to_string(tags, ' ')), 'C')
);
```

### Advanced Search Queries

```sql
-- Weighted full-text search with ranking
CREATE OR REPLACE FUNCTION search_questions(
  search_query TEXT,
  domain_filter TEXT DEFAULT NULL,
  difficulty_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
) RETURNS TABLE (
  question_id UUID,
  title TEXT,
  content TEXT,
  domain TEXT,
  difficulty TEXT,
  rank REAL,
  headline TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id,
    q.title,
    q.content,
    q.domain,
    q.difficulty,
    ts_rank_cd(
      setweight(to_tsvector('tanium_search', q.title), 'A') ||
      setweight(to_tsvector('tanium_search', q.content), 'B') ||
      setweight(to_tsvector('tanium_search', array_to_string(q.tags, ' ')), 'C'),
      plainto_tsquery('tanium_search', search_query),
      32  -- Normalization flag
    ) as rank,
    ts_headline(
      'tanium_search',
      q.title || ' ' || q.content,
      plainto_tsquery('tanium_search', search_query),
      'MaxWords=35, MinWords=15, ShortWord=3, HighlightAll=FALSE'
    ) as headline
  FROM questions q
  WHERE to_tsvector('tanium_search', q.title || ' ' || q.content || ' ' || array_to_string(q.tags, ' '))
        @@ plainto_tsquery('tanium_search', search_query)
    AND q.is_active = true
    AND (domain_filter IS NULL OR q.domain = domain_filter)
    AND (difficulty_filter IS NULL OR q.difficulty = difficulty_filter)
  ORDER BY rank DESC, q.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Usage example
SELECT * FROM search_questions('tanium sensor CPU performance', 'asking_questions', 'intermediate');
```

### Autocomplete and Suggestions

```sql
-- Trigram-based autocomplete
CREATE OR REPLACE FUNCTION suggest_questions(
  partial_query TEXT,
  suggestion_count INTEGER DEFAULT 10
) RETURNS TABLE (
  suggestion TEXT,
  similarity_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.title,
    greatest(
      similarity(q.title, partial_query),
      similarity(array_to_string(q.tags, ' '), partial_query)
    ) as sim_score
  FROM questions q
  WHERE q.is_active = true
    AND (q.title % partial_query OR array_to_string(q.tags, ' ') % partial_query)
  ORDER BY sim_score DESC
  LIMIT suggestion_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Phrase suggestion with context
SELECT
  word,
  ndoc as document_frequency,
  nentry as term_frequency
FROM ts_stat('SELECT to_tsvector(''tanium_search'', title || '' '' || content) FROM questions WHERE is_active = true')
WHERE length(word) > 3
ORDER BY ndoc DESC, nentry DESC
LIMIT 50;
```

## Custom Functions and Procedures

### Advanced Analytics Functions

```sql
-- Calculate adaptive difficulty scoring
CREATE OR REPLACE FUNCTION calculate_adaptive_difficulty(
  user_id UUID,
  domain TEXT,
  current_accuracy DECIMAL DEFAULT NULL
) RETURNS TABLE (
  recommended_difficulty TEXT,
  confidence_score DECIMAL,
  next_question_ids UUID[]
) AS $$
DECLARE
  user_accuracy DECIMAL;
  performance_trend TEXT;
  question_pool UUID[];
BEGIN
  -- Get user's current accuracy if not provided
  IF current_accuracy IS NULL THEN
    SELECT ROUND(
      (correct_answers::decimal / NULLIF(questions_answered, 0)) * 100, 2
    ) INTO user_accuracy
    FROM user_progress
    WHERE user_id = calculate_adaptive_difficulty.user_id
      AND domain = calculate_adaptive_difficulty.domain;
  ELSE
    user_accuracy := current_accuracy;
  END IF;

  -- Determine performance trend from recent sessions
  SELECT
    CASE
      WHEN AVG(score) OVER (ORDER BY completed_at ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) >
           AVG(score) OVER (ORDER BY completed_at ROWS BETWEEN 4 PRECEDING AND 2 PRECEDING)
      THEN 'improving'
      WHEN AVG(score) OVER (ORDER BY completed_at ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) <
           AVG(score) OVER (ORDER BY completed_at ROWS BETWEEN 4 PRECEDING AND 2 PRECEDING)
      THEN 'declining'
      ELSE 'stable'
    END INTO performance_trend
  FROM exam_sessions
  WHERE user_id = calculate_adaptive_difficulty.user_id
    AND completed_at IS NOT NULL
  ORDER BY completed_at DESC
  LIMIT 1;

  -- Recommend difficulty based on accuracy and trend
  recommended_difficulty := CASE
    WHEN user_accuracy >= 85 AND performance_trend IN ('improving', 'stable') THEN 'advanced'
    WHEN user_accuracy >= 70 AND user_accuracy < 85 THEN 'intermediate'
    WHEN user_accuracy < 70 OR performance_trend = 'declining' THEN 'beginner'
    ELSE 'intermediate'
  END;

  -- Calculate confidence score
  confidence_score := LEAST(
    user_accuracy / 100.0,
    CASE performance_trend
      WHEN 'improving' THEN 0.9
      WHEN 'stable' THEN 0.75
      WHEN 'declining' THEN 0.6
      ELSE 0.7
    END
  );

  -- Get recommended questions
  SELECT array_agg(id ORDER BY RANDOM())
  INTO question_pool
  FROM questions
  WHERE domain = calculate_adaptive_difficulty.domain
    AND difficulty = recommended_difficulty
    AND is_active = true
    AND id NOT IN (
      SELECT DISTINCT question_id
      FROM user_answers
      WHERE user_id = calculate_adaptive_difficulty.user_id
        AND created_at >= NOW() - INTERVAL '7 days'  -- Avoid recently answered
    )
  LIMIT 10;

  next_question_ids := question_pool;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql STABLE;

-- Usage
SELECT * FROM calculate_adaptive_difficulty(
  'user-uuid-here',
  'asking_questions'
);
```

### Performance Analytics Functions

```sql
-- Comprehensive user performance analysis
CREATE OR REPLACE FUNCTION analyze_user_performance(
  user_id UUID,
  analysis_period INTERVAL DEFAULT INTERVAL '30 days'
) RETURNS JSON AS $$
DECLARE
  performance_data JSON;
BEGIN
  SELECT json_build_object(
    'user_id', user_id,
    'analysis_period', analysis_period,
    'overall_metrics', (
      SELECT json_build_object(
        'total_questions_answered', COALESCE(SUM(questions_answered), 0),
        'total_correct_answers', COALESCE(SUM(correct_answers), 0),
        'overall_accuracy', ROUND(
          COALESCE(SUM(correct_answers)::decimal / NULLIF(SUM(questions_answered), 0) * 100, 0), 2
        ),
        'domains_studied', COUNT(DISTINCT domain),
        'study_sessions', COUNT(DISTINCT DATE(last_activity)),
        'avg_session_length', ROUND(
          EXTRACT(EPOCH FROM AVG(session_duration)) / 60, 2
        )
      )
      FROM user_progress up
      LEFT JOIN (
        SELECT
          user_id,
          DATE(created_at) as study_date,
          MAX(created_at) - MIN(created_at) as session_duration
        FROM user_answers
        WHERE user_id = analyze_user_performance.user_id
          AND created_at >= NOW() - analysis_period
        GROUP BY user_id, DATE(created_at)
      ) sessions ON up.user_id = sessions.user_id
      WHERE up.user_id = analyze_user_performance.user_id
    ),
    'domain_breakdown', (
      SELECT json_agg(
        json_build_object(
          'domain', domain,
          'questions_answered', questions_answered,
          'correct_answers', correct_answers,
          'accuracy', ROUND(
            (correct_answers::decimal / NULLIF(questions_answered, 0)) * 100, 2
          ),
          'rank', rank() OVER (ORDER BY correct_answers DESC),
          'last_activity', last_activity
        )
      )
      FROM user_progress
      WHERE user_id = analyze_user_performance.user_id
        AND questions_answered > 0
    ),
    'recent_exams', (
      SELECT json_agg(
        json_build_object(
          'exam_id', id,
          'score', score,
          'time_taken_minutes', ROUND(
            EXTRACT(EPOCH FROM (completed_at - started_at)) / 60, 2
          ),
          'questions_count',
            COALESCE(json_array_length(exam_data->'questions'), 0),
          'completed_at', completed_at
        ) ORDER BY completed_at DESC
      )
      FROM exam_sessions
      WHERE user_id = analyze_user_performance.user_id
        AND completed_at >= NOW() - analysis_period
        AND completed_at IS NOT NULL
      LIMIT 10
    ),
    'learning_trends', (
      SELECT json_build_object(
        'weekly_progress', json_agg(
          json_build_object(
            'week_start', week_start,
            'questions_answered', weekly_questions,
            'accuracy', weekly_accuracy,
            'study_days', study_days
          ) ORDER BY week_start
        )
      )
      FROM (
        SELECT
          date_trunc('week', ua.created_at) as week_start,
          COUNT(*) as weekly_questions,
          ROUND(
            AVG(CASE WHEN ua.is_correct THEN 100.0 ELSE 0.0 END), 2
          ) as weekly_accuracy,
          COUNT(DISTINCT DATE(ua.created_at)) as study_days
        FROM user_answers ua
        WHERE ua.user_id = analyze_user_performance.user_id
          AND ua.created_at >= NOW() - analysis_period
        GROUP BY date_trunc('week', ua.created_at)
        HAVING COUNT(*) >= 5  -- At least 5 questions per week
      ) weekly_stats
    )
  ) INTO performance_data;

  RETURN performance_data;
END;
$$ LANGUAGE plpgsql STABLE;

-- Usage
SELECT analyze_user_performance('user-uuid-here', INTERVAL '60 days');
```

## Advanced Triggers and Automation

### Audit Trail System

```sql
-- Create audit log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,  -- INSERT, UPDATE, DELETE
  row_id UUID,
  old_data JSONB,
  new_data JSONB,
  changed_by UUID,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  application_name TEXT
);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  row_id UUID;
BEGIN
  -- Determine the ID of the affected row
  IF TG_OP = 'DELETE' THEN
    row_id := OLD.id;
    old_data := to_jsonb(OLD);
    new_data := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    row_id := NEW.id;
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'INSERT' THEN
    row_id := NEW.id;
    old_data := NULL;
    new_data := to_jsonb(NEW);
  END IF;

  -- Insert audit record
  INSERT INTO audit_log (
    table_name,
    operation,
    row_id,
    old_data,
    new_data,
    changed_by,
    session_id,
    application_name
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    row_id,
    old_data,
    new_data,
    COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
    current_setting('application_name', true),
    current_setting('application_name', true)
  );

  -- Return appropriate value
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables
CREATE TRIGGER questions_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON questions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER user_progress_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### Real-time Progress Updates

```sql
-- Function to update user statistics automatically
CREATE OR REPLACE FUNCTION update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user progress when answer is submitted
  INSERT INTO user_progress (user_id, domain, questions_answered, correct_answers, last_activity)
  VALUES (
    NEW.user_id,
    (SELECT domain FROM questions WHERE id = NEW.question_id),
    1,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    NEW.created_at
  )
  ON CONFLICT (user_id, domain)
  DO UPDATE SET
    questions_answered = user_progress.questions_answered + 1,
    correct_answers = user_progress.correct_answers + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    last_activity = NEW.created_at,
    current_streak = CASE
      WHEN NEW.is_correct THEN user_progress.current_streak + 1
      ELSE 0
    END,
    longest_streak = GREATEST(
      user_progress.longest_streak,
      CASE
        WHEN NEW.is_correct THEN user_progress.current_streak + 1
        ELSE user_progress.current_streak
      END
    );

  -- Update user settings with adaptive preferences
  INSERT INTO user_settings (user_id, settings)
  VALUES (
    NEW.user_id,
    jsonb_build_object(
      'last_domain_studied', (SELECT domain FROM questions WHERE id = NEW.question_id),
      'preferred_difficulty', 'adaptive',
      'study_streak_days', 1
    )
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    settings = user_settings.settings || jsonb_build_object(
      'last_domain_studied', (SELECT domain FROM questions WHERE id = NEW.question_id),
      'last_study_date', CURRENT_DATE
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic statistics updates
CREATE TRIGGER user_answer_statistics_trigger
  AFTER INSERT ON user_answers
  FOR EACH ROW EXECUTE FUNCTION update_user_statistics();
```

## Database Security and Compliance

### Row Level Security Policies

```sql
-- Enable RLS on sensitive tables
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create comprehensive security policies
-- Users can only see their own data
CREATE POLICY "user_progress_isolation" ON user_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "exam_sessions_isolation" ON exam_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "user_answers_isolation" ON user_answers
  FOR ALL USING (auth.uid() = user_id);

-- Admins can see all data
CREATE POLICY "admin_full_access" ON user_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- Questions are readable by all authenticated users
CREATE POLICY "questions_read_all" ON questions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can modify questions
CREATE POLICY "questions_admin_modify" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'content_creator')
    )
  );
```

### Data Encryption and Privacy

```sql
-- Encrypt sensitive user data
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    pgp_sym_encrypt(
      data,
      current_setting('app.encryption_key')
    ),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(
    decode(encrypted_data, 'base64'),
    current_setting('app.encryption_key')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage for sensitive user information
ALTER TABLE users ADD COLUMN encrypted_notes TEXT;

-- Update trigger for automatic encryption
CREATE OR REPLACE FUNCTION encrypt_user_notes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.notes IS DISTINCT FROM OLD.notes AND NEW.notes IS NOT NULL THEN
    NEW.encrypted_notes := encrypt_sensitive_data(NEW.notes);
    NEW.notes := NULL;  -- Clear plaintext
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER encrypt_notes_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION encrypt_user_notes();
```

This comprehensive guide covers the advanced PostgreSQL features that enhance the TCO application's capabilities, providing robust data management, security, and performance optimization.
