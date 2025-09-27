# PostgreSQL Fundamentals for TCO Application

## Overview

PostgreSQL is the underlying database engine powering Supabase, providing robust ACID compliance, advanced query capabilities, and extensibility for the TCO exam preparation system.

## PostgreSQL Architecture

### Database Structure

```sql
-- Database hierarchy
Database (tco_database)
├── Schemas (public, auth, storage, realtime)
├── Tables (users, questions, user_progress, etc.)
├── Views (question_analytics, user_performance)
├── Functions (calculate_score, update_progress)
├── Triggers (auto_timestamps, progress_tracking)
└── Extensions (uuid-ossp, pg_trgm, btree_gin)
```

### Key PostgreSQL Features Used

- **JSONB Support**: Flexible question metadata and user preferences
- **Full-Text Search**: Advanced question and content searching
- **Array Operations**: Storing question tags and categories
- **UUID Primary Keys**: Distributed-friendly identifiers
- **Triggers**: Automatic timestamp and audit logging
- **Extensions**: Enhanced functionality (uuid, text search, GIN indexes)

## Data Types in TCO Application

### Core Data Types

```sql
-- User identification
id UUID DEFAULT gen_random_uuid() PRIMARY KEY

-- Text and content
title TEXT NOT NULL
description TEXT
content JSONB

-- Temporal data
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()

-- Numeric scores and progress
score INTEGER CHECK (score >= 0 AND score <= 100)
progress DECIMAL(5,2) DEFAULT 0.00

-- Arrays for categories
tags TEXT[] DEFAULT '{}'
categories INTEGER[] DEFAULT '{}'

-- Boolean flags
is_active BOOLEAN DEFAULT true
is_completed BOOLEAN DEFAULT false
```

### JSONB Usage Patterns

```sql
-- Question metadata structure
{
  "type": "multiple_choice",
  "difficulty": "intermediate",
  "domain": "asking_questions",
  "weight": 22,
  "explanation": "Detailed explanation text",
  "references": ["tanium_docs_v7.5", "certification_guide"],
  "lab_exercise": "LAB-AQ-001",
  "time_limit": 120,
  "media": {
    "images": ["screenshot1.png"],
    "videos": ["demo_video.mp4"]
  }
}

-- User preferences structure
{
  "study_mode": "adaptive",
  "difficulty_preference": "progressive",
  "time_per_question": 90,
  "show_explanations": true,
  "audio_enabled": false,
  "theme": "dark",
  "notification_settings": {
    "daily_reminder": true,
    "achievement_alerts": true,
    "progress_updates": "weekly"
  }
}
```

## Query Patterns and Best Practices

### Basic CRUD Operations

```sql
-- Create new question
INSERT INTO questions (title, content, correct_answer, options, metadata)
VALUES (
  'Which Tanium sensor provides CPU information?',
  'Select the appropriate sensor for retrieving CPU utilization data',
  'Computer Performance Summary',
  ARRAY['Computer Performance Summary', 'System Information', 'Hardware Inventory', 'Process Information'],
  '{"type": "multiple_choice", "difficulty": "beginner", "domain": "asking_questions", "weight": 22}'::JSONB
);

-- Read with filtering and pagination
SELECT q.*,
       COUNT(*) OVER() as total_count
FROM questions q
WHERE q.metadata->>'domain' = 'asking_questions'
  AND q.metadata->>'difficulty' = 'intermediate'
  AND q.is_active = true
ORDER BY q.created_at DESC
LIMIT 20 OFFSET 40;

-- Update user progress with atomic operations
UPDATE user_progress
SET
  questions_answered = questions_answered + 1,
  correct_answers = correct_answers + CASE WHEN $2 THEN 1 ELSE 0 END,
  last_activity = NOW(),
  current_streak = CASE
    WHEN $2 THEN current_streak + 1
    ELSE 0
  END
WHERE user_id = $1 AND domain = $3;

-- Delete with soft delete pattern
UPDATE questions
SET is_active = false, deleted_at = NOW()
WHERE id = $1;
```

### Advanced Query Patterns

```sql
-- Full-text search with ranking
SELECT q.*,
       ts_rank(to_tsvector('english', q.title || ' ' || q.content), plainto_tsquery($1)) as rank
FROM questions q
WHERE to_tsvector('english', q.title || ' ' || q.content) @@ plainto_tsquery($1)
  AND q.is_active = true
ORDER BY rank DESC, q.created_at DESC;

-- JSON aggregation for analytics
SELECT
  metadata->>'domain' as domain,
  COUNT(*) as question_count,
  AVG((metadata->>'weight')::numeric) as avg_weight,
  json_agg(
    json_build_object(
      'difficulty', metadata->>'difficulty',
      'count', count
    )
  ) as difficulty_distribution
FROM questions
WHERE is_active = true
GROUP BY metadata->>'domain';

-- Window functions for progress tracking
SELECT
  user_id,
  domain,
  questions_answered,
  correct_answers,
  ROUND(
    (correct_answers::decimal / NULLIF(questions_answered, 0)) * 100, 2
  ) as accuracy_percentage,
  RANK() OVER (PARTITION BY domain ORDER BY correct_answers DESC) as domain_rank,
  LAG(questions_answered) OVER (PARTITION BY user_id ORDER BY last_activity) as previous_count
FROM user_progress
WHERE questions_answered > 0;
```

## Indexing Strategies

### Primary Indexes

```sql
-- B-tree indexes for frequent lookups
CREATE INDEX idx_questions_domain ON questions USING btree ((metadata->>'domain'));
CREATE INDEX idx_questions_difficulty ON questions USING btree ((metadata->>'difficulty'));
CREATE INDEX idx_user_progress_user_domain ON user_progress (user_id, domain);

-- Partial indexes for active records
CREATE INDEX idx_questions_active ON questions (created_at, id)
WHERE is_active = true;

-- Composite indexes for complex queries
CREATE INDEX idx_questions_domain_difficulty_active
ON questions ((metadata->>'domain'), (metadata->>'difficulty'), is_active);
```

### Specialized Indexes

```sql
-- GIN indexes for JSONB and array operations
CREATE INDEX idx_questions_metadata_gin ON questions USING gin (metadata);
CREATE INDEX idx_questions_tags_gin ON questions USING gin (tags);

-- Full-text search indexes
CREATE INDEX idx_questions_fts ON questions
USING gin (to_tsvector('english', title || ' ' || content));

-- Trigram indexes for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_questions_title_trgm ON questions
USING gin (title gin_trgm_ops);
```

## Stored Functions and Procedures

### Progress Calculation Functions

```sql
CREATE OR REPLACE FUNCTION calculate_domain_progress(
  p_user_id UUID,
  p_domain TEXT
) RETURNS TABLE(
  total_questions INTEGER,
  answered_questions INTEGER,
  correct_answers INTEGER,
  accuracy_percentage DECIMAL,
  estimated_completion_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(q.id)::INTEGER as total_questions,
    COALESCE(up.questions_answered, 0)::INTEGER as answered_questions,
    COALESCE(up.correct_answers, 0)::INTEGER as correct_answers,
    CASE
      WHEN COALESCE(up.questions_answered, 0) > 0
      THEN ROUND((up.correct_answers::decimal / up.questions_answered) * 100, 2)
      ELSE 0.00
    END as accuracy_percentage,
    CASE
      WHEN COALESCE(up.questions_answered, 0) > 0
      THEN (INTERVAL '90 seconds' * (COUNT(q.id) - COALESCE(up.questions_answered, 0)))
      ELSE (INTERVAL '90 seconds' * COUNT(q.id))
    END as estimated_completion_time
  FROM questions q
  LEFT JOIN user_progress up ON up.user_id = p_user_id AND up.domain = p_domain
  WHERE q.metadata->>'domain' = p_domain
    AND q.is_active = true
  GROUP BY up.questions_answered, up.correct_answers;
END;
$$ LANGUAGE plpgsql STABLE;

-- Usage example
SELECT * FROM calculate_domain_progress(
  '123e4567-e89b-12d3-a456-426614174000'::UUID,
  'asking_questions'
);
```

### Audit Trigger Function

```sql
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER update_questions_modtime
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_progress_modtime
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
```

## Connection Management

### Connection Pooling Best Practices

```sql
-- View active connections
SELECT
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  state_change
FROM pg_stat_activity
WHERE state = 'active';

-- Connection limits and settings
SHOW max_connections;
SHOW shared_buffers;
SHOW effective_cache_size;
```

### Connection Pool Configuration

```typescript
// Supabase connection pool settings
const supabaseOptions = {
  db: {
    schema: "public",
    max_connections: 20,
    connection_timeout: 30,
    idle_timeout: 600,
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
};
```

## Performance Monitoring

### Key Metrics to Track

```sql
-- Query performance analysis
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Index usage statistics
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Table size and bloat analysis
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  pg_stat_get_live_tuples(c.oid) as live_tuples,
  pg_stat_get_dead_tuples(c.oid) as dead_tuples
FROM pg_tables pt
JOIN pg_class c ON c.relname = pt.tablename
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Backup and Maintenance

### Regular Maintenance Tasks

```sql
-- Analyze table statistics
ANALYZE questions;
ANALYZE user_progress;
ANALYZE exam_sessions;

-- Vacuum to reclaim space
VACUUM (ANALYZE, VERBOSE) questions;

-- Reindex when needed
REINDEX INDEX CONCURRENTLY idx_questions_metadata_gin;

-- Update query planner statistics
SELECT pg_stat_reset();
```

### Backup Strategies

```bash
# Full database backup
pg_dump -Fc -v --host=localhost --username=postgres tco_database > backup.dump

# Schema-only backup
pg_dump -s --host=localhost --username=postgres tco_database > schema.sql

# Data-only backup for specific tables
pg_dump -a -t questions -t user_progress --host=localhost --username=postgres tco_database > data.sql
```

## Security Considerations

### Row Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for data access
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);
```

### Database Roles and Permissions

```sql
-- Read-only role for analytics
CREATE ROLE analytics_reader;
GRANT CONNECT ON DATABASE tco_database TO analytics_reader;
GRANT USAGE ON SCHEMA public TO analytics_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_reader;

-- Application role with limited permissions
CREATE ROLE tco_app;
GRANT CONNECT ON DATABASE tco_database TO tco_app;
GRANT USAGE, CREATE ON SCHEMA public TO tco_app;
GRANT SELECT, INSERT, UPDATE ON questions, user_progress TO tco_app;
```

## Troubleshooting Common Issues

### Performance Issues

1. **Slow queries**: Check `pg_stat_statements` for expensive operations
2. **Missing indexes**: Analyze query plans with `EXPLAIN ANALYZE`
3. **Connection limits**: Monitor `pg_stat_activity` for connection usage
4. **Lock contention**: Check `pg_locks` for blocking queries

### Data Integrity Issues

1. **Constraint violations**: Review constraint definitions and data validation
2. **Orphaned records**: Use foreign key constraints and cascade options
3. **Data type mismatches**: Ensure proper type casting in queries
4. **JSON validation**: Implement JSON schema validation functions

This document provides the foundation for understanding PostgreSQL in the context of the TCO application. For performance optimization and advanced features, see the related documentation files.
