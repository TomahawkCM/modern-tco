# PostgreSQL Performance Optimization for TCO Application

## Overview

This guide covers advanced PostgreSQL performance optimization techniques specifically tailored for the TCO exam preparation system, focusing on query optimization, indexing strategies, and system tuning.

## Query Optimization Strategies

### Query Planning and Analysis

```sql
-- Analyze query execution plans
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT q.*, COUNT(ua.id) as attempt_count
FROM questions q
LEFT JOIN user_answers ua ON q.id = ua.question_id
WHERE q.metadata->>'domain' = 'asking_questions'
  AND q.metadata->>'difficulty' = 'intermediate'
GROUP BY q.id
ORDER BY q.created_at DESC;

-- Check query costs and timing
EXPLAIN (ANALYZE, COSTS, TIMING, VERBOSE)
SELECT user_id,
       AVG(score) as avg_score,
       COUNT(*) as total_attempts,
       MAX(completed_at) as last_attempt
FROM exam_sessions
WHERE completed_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id
HAVING COUNT(*) >= 3;
```

### Optimizing Complex Queries

#### JSONB Query Optimization

```sql
-- Inefficient: Sequential scan on JSONB
SELECT * FROM questions
WHERE metadata->>'domain' = 'asking_questions'
  AND metadata->>'difficulty' = 'advanced';

-- Optimized: Use GIN index with proper operators
SELECT * FROM questions
WHERE metadata @> '{"domain": "asking_questions", "difficulty": "advanced"}';

-- Create supporting index
CREATE INDEX idx_questions_metadata_domain_difficulty_gin
ON questions USING gin ((metadata -> 'domain'), (metadata -> 'difficulty'));

-- Even more efficient: Extract frequently queried fields
ALTER TABLE questions ADD COLUMN domain TEXT GENERATED ALWAYS AS (metadata->>'domain') STORED;
ALTER TABLE questions ADD COLUMN difficulty TEXT GENERATED ALWAYS AS (metadata->>'difficulty') STORED;

CREATE INDEX idx_questions_domain_difficulty ON questions (domain, difficulty)
WHERE is_active = true;
```

#### Aggregation Query Optimization

```sql
-- Slow: Multiple subqueries
SELECT
  u.id,
  u.email,
  (SELECT COUNT(*) FROM user_progress up WHERE up.user_id = u.id) as progress_count,
  (SELECT AVG(score) FROM exam_sessions es WHERE es.user_id = u.id) as avg_score,
  (SELECT MAX(completed_at) FROM exam_sessions es WHERE es.user_id = u.id) as last_exam
FROM users u;

-- Fast: Single query with JOINs
SELECT
  u.id,
  u.email,
  COUNT(DISTINCT up.id) as progress_count,
  AVG(es.score) as avg_score,
  MAX(es.completed_at) as last_exam
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN exam_sessions es ON u.id = es.user_id
GROUP BY u.id, u.email;
```

### Window Function Optimization

```sql
-- Efficient ranking and analytics
SELECT
  user_id,
  domain,
  correct_answers,
  questions_answered,
  ROUND(
    (correct_answers::decimal / NULLIF(questions_answered, 0)) * 100, 2
  ) as accuracy,
  -- Rank within domain
  RANK() OVER (PARTITION BY domain ORDER BY correct_answers DESC) as domain_rank,
  -- Percentile ranking
  PERCENT_RANK() OVER (PARTITION BY domain ORDER BY correct_answers) as percentile,
  -- Moving average over last 5 sessions
  AVG(correct_answers) OVER (
    PARTITION BY user_id, domain
    ORDER BY last_activity
    ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
  ) as moving_avg
FROM user_progress
WHERE questions_answered >= 10;
```

## Advanced Indexing Strategies

### Composite Index Design

```sql
-- Multi-column index for common query patterns
CREATE INDEX idx_exam_sessions_user_date_score
ON exam_sessions (user_id, completed_at DESC, score DESC)
WHERE completed_at IS NOT NULL;

-- Partial index for active users
CREATE INDEX idx_users_active_created
ON users (created_at DESC, id)
WHERE is_active = true AND last_login >= NOW() - INTERVAL '30 days';

-- Expression index for calculated values
CREATE INDEX idx_user_progress_accuracy
ON user_progress (user_id, ROUND((correct_answers::decimal / NULLIF(questions_answered, 0)) * 100, 2))
WHERE questions_answered > 0;
```

### Specialized Index Types

```sql
-- Hash index for exact equality lookups
CREATE INDEX idx_questions_id_hash ON questions USING hash (id);

-- BRIN index for large, ordered datasets
CREATE INDEX idx_exam_sessions_completed_brin
ON exam_sessions USING brin (completed_at);

-- GiST index for complex data types
CREATE INDEX idx_questions_content_gist
ON questions USING gist (content);

-- Bloom filter for multiple equality conditions
CREATE EXTENSION bloom;
CREATE INDEX idx_questions_bloom
ON questions USING bloom (domain, difficulty, is_active)
WITH (length=80, col1=2, col2=2, col3=1);
```

### Index Maintenance

```sql
-- Monitor index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Identify unused indexes
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND idx_tup_read = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- Rebuild fragmented indexes
REINDEX INDEX CONCURRENTLY idx_questions_metadata_gin;
REINDEX TABLE CONCURRENTLY user_progress;
```

## Database Configuration Tuning

### Memory Settings

```sql
-- View current configuration
SELECT name, setting, unit, context
FROM pg_settings
WHERE name IN (
  'shared_buffers',
  'effective_cache_size',
  'work_mem',
  'maintenance_work_mem',
  'max_connections'
);

-- Recommended settings for TCO application
-- shared_buffers = 256MB (25% of RAM for dedicated server)
-- effective_cache_size = 1GB (75% of RAM)
-- work_mem = 16MB (for sorting and hash operations)
-- maintenance_work_mem = 256MB (for maintenance operations)
-- max_connections = 100 (adjust based on connection pooling)
```

### Connection and Performance Settings

```postgresql.conf
# Connection settings
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB

# Memory settings
work_mem = 16MB
maintenance_work_mem = 256MB
dynamic_shared_memory_type = posix

# Query tuning
random_page_cost = 1.1  # For SSDs
effective_io_concurrency = 200  # For SSDs
max_worker_processes = 8
max_parallel_workers_per_gather = 4

# Write-ahead logging
wal_buffers = 16MB
checkpoint_completion_target = 0.9
wal_writer_delay = 200ms

# Query planner settings
default_statistics_target = 100
constraint_exclusion = partition
```

## Connection Pool Optimization

### PgBouncer Configuration

```ini
[databases]
tco_database = host=localhost port=5432 dbname=tco_database

[pgbouncer]
pool_mode = transaction
listen_port = 6432
listen_addr = *
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt

# Pool settings for TCO application
default_pool_size = 20
max_client_conn = 100
reserve_pool_size = 5
reserve_pool_timeout = 5

# Performance settings
server_round_robin = 1
ignore_startup_parameters = extra_float_digits
```

### Supabase Connection Optimization

```typescript
// Optimized Supabase client configuration
const supabaseOptions = {
  db: {
    schema: "public",
    max_connections: 20, // Match PgBouncer pool
    connection_timeout: 30, // 30 second timeout
    idle_timeout: 600, // 10 minute idle timeout
    statement_timeout: 300000, // 5 minute statement timeout
  },
  global: {
    headers: {
      Connection: "keep-alive",
      "Keep-Alive": "timeout=600",
    },
  },
};

// Connection retry logic
const createResilientClient = () => {
  let retryCount = 0;
  const maxRetries = 3;

  const executeWithRetry = async (operation: () => Promise<any>) => {
    try {
      return await operation();
    } catch (error) {
      if (retryCount < maxRetries && isRetryableError(error)) {
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
        return executeWithRetry(operation);
      }
      throw error;
    }
  };

  return { executeWithRetry };
};
```

## Monitoring and Diagnostics

### Performance Monitoring Queries

```sql
-- Long-running queries
SELECT
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > INTERVAL '5 minutes'
  AND state = 'active';

-- Lock monitoring
SELECT
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.DATABASE IS NOT DISTINCT FROM blocked_locks.DATABASE
  AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
  AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
  AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
  AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
  AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
  AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
  AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
  AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
  AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.GRANTED;

-- Table and index sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size,
  ROUND(100.0 * (pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) / pg_total_relation_size(schemaname||'.'||tablename), 2) AS index_ratio
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Query Performance Analysis

```sql
-- Enable pg_stat_statements extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top queries by total time
SELECT
  query,
  calls,
  total_time,
  mean_time,
  stddev_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE query NOT ILIKE '%pg_stat_statements%'
ORDER BY total_time DESC
LIMIT 10;

-- Top queries by average time
SELECT
  query,
  calls,
  mean_time,
  total_time,
  rows / calls as avg_rows
FROM pg_stat_statements
WHERE calls > 100
  AND query NOT ILIKE '%pg_stat_statements%'
ORDER BY mean_time DESC
LIMIT 10;

-- Reset statistics for fresh monitoring
SELECT pg_stat_statements_reset();
```

## Caching Strategies

### Application-Level Caching

```typescript
// Redis cache integration for frequently accessed data
import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

// Cache question metadata
const cacheQuestionMetadata = async (domain: string) => {
  const cacheKey = `questions:metadata:${domain}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const { data } = await supabase
    .from("questions")
    .select("id, title, metadata, tags")
    .eq("domain", domain)
    .eq("is_active", true);

  await redis.setex(cacheKey, 3600, JSON.stringify(data)); // 1 hour TTL
  return data;
};

// Cache user progress with invalidation
const getCachedUserProgress = async (userId: string) => {
  const cacheKey = `user:progress:${userId}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const { data } = await supabase.from("user_progress").select("*").eq("user_id", userId);

  await redis.setex(cacheKey, 1800, JSON.stringify(data)); // 30 minute TTL
  return data;
};

// Invalidate cache on updates
const updateUserProgress = async (userId: string, domain: string, progressData: any) => {
  const { data, error } = await supabase.from("user_progress").upsert(progressData);

  if (!error) {
    await redis.del(`user:progress:${userId}`);
    await redis.del(`user:analytics:${userId}`);
  }

  return { data, error };
};
```

### Database-Level Caching

```sql
-- Create materialized views for expensive aggregations
CREATE MATERIALIZED VIEW mv_user_analytics AS
SELECT
  u.id,
  u.email,
  COUNT(DISTINCT up.domain) as domains_active,
  AVG(CASE WHEN up.questions_answered > 0
      THEN (up.correct_answers::decimal / up.questions_answered) * 100
      ELSE 0 END) as overall_accuracy,
  SUM(up.questions_answered) as total_questions_answered,
  SUM(up.correct_answers) as total_correct_answers,
  MAX(up.last_activity) as last_study_activity,
  COUNT(DISTINCT es.id) as total_exams,
  AVG(es.score) as avg_exam_score,
  MAX(es.completed_at) as last_exam_date
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN exam_sessions es ON u.id = es.user_id AND es.completed_at IS NOT NULL
WHERE u.is_active = true
GROUP BY u.id, u.email;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX idx_mv_user_analytics_id ON mv_user_analytics (id);

-- Refresh materialized view (can be done concurrently)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_analytics;

-- Schedule automatic refresh (use cron or application scheduler)
-- This would typically be done via pg_cron extension or application-level scheduling
```

## Performance Testing and Benchmarking

### Load Testing Queries

```sql
-- Generate test data for performance testing
INSERT INTO questions (title, content, correct_answer, options, metadata, tags, domain, difficulty)
SELECT
  'Test Question ' || generate_series,
  'Sample content for question ' || generate_series,
  'Option A',
  ARRAY['Option A', 'Option B', 'Option C', 'Option D'],
  json_build_object(
    'type', 'multiple_choice',
    'difficulty', (ARRAY['beginner', 'intermediate', 'advanced'])[ceil(random() * 3)],
    'domain', (ARRAY['asking_questions', 'refining_questions', 'taking_action', 'navigation_modules', 'reporting_data'])[ceil(random() * 5)],
    'weight', ceil(random() * 30)
  )::jsonb,
  ARRAY['test', 'generated', 'performance'],
  (ARRAY['asking_questions', 'refining_questions', 'taking_action', 'navigation_modules', 'reporting_data'])[ceil(random() * 5)],
  (ARRAY['beginner', 'intermediate', 'advanced'])[ceil(random() * 3)]
FROM generate_series(1, 10000);

-- Benchmark common query patterns
\timing on

-- Test 1: Basic filtering with index
SELECT COUNT(*) FROM questions
WHERE domain = 'asking_questions' AND is_active = true;

-- Test 2: JSONB query performance
SELECT COUNT(*) FROM questions
WHERE metadata @> '{"difficulty": "intermediate"}';

-- Test 3: Full-text search
SELECT COUNT(*) FROM questions
WHERE to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('tanium sensor');

-- Test 4: Complex aggregation
SELECT
  domain,
  difficulty,
  COUNT(*) as question_count,
  AVG((metadata->>'weight')::numeric) as avg_weight
FROM questions
WHERE is_active = true
GROUP BY domain, difficulty
ORDER BY domain, difficulty;

\timing off
```

### Performance Monitoring Dashboard

```sql
-- Create view for performance monitoring
CREATE OR REPLACE VIEW v_performance_dashboard AS
SELECT
  'queries' as metric_type,
  'total_queries' as metric_name,
  sum(calls)::text as metric_value,
  now() as measured_at
FROM pg_stat_statements

UNION ALL

SELECT
  'queries' as metric_type,
  'avg_query_time_ms' as metric_name,
  round(avg(mean_time), 2)::text as metric_value,
  now() as measured_at
FROM pg_stat_statements

UNION ALL

SELECT
  'connections' as metric_type,
  'active_connections' as metric_name,
  count(*)::text as metric_value,
  now() as measured_at
FROM pg_stat_activity
WHERE state = 'active'

UNION ALL

SELECT
  'cache' as metric_type,
  'cache_hit_ratio_percent' as metric_name,
  round(
    100.0 * sum(blks_hit) / nullif(sum(blks_hit) + sum(blks_read), 0), 2
  )::text as metric_value,
  now() as measured_at
FROM pg_stat_database;
```

## Maintenance and Optimization Schedule

### Daily Tasks

```sql
-- Update table statistics
ANALYZE;

-- Check for long-running queries
SELECT pid, now() - query_start as duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '1 hour';
```

### Weekly Tasks

```sql
-- Vacuum analyze heavily updated tables
VACUUM ANALYZE user_progress;
VACUUM ANALYZE exam_sessions;
VACUUM ANALYZE user_answers;

-- Check for unused indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;

-- Refresh materialized views
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_analytics;
```

### Monthly Tasks

```sql
-- Full database vacuum
VACUUM FULL;

-- Reindex fragmented indexes
REINDEX DATABASE tco_database;

-- Archive old data
DELETE FROM user_answers WHERE created_at < NOW() - INTERVAL '1 year';
DELETE FROM exam_sessions WHERE completed_at < NOW() - INTERVAL '2 years';
```

This comprehensive performance optimization guide provides the foundation for maintaining optimal PostgreSQL performance in the TCO application environment.
