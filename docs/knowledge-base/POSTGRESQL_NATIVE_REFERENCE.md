# PostgreSQL Native Features Knowledge Base

## Overview

This comprehensive reference covers PostgreSQL native features essential for the Tanium TCO Study Platform, including arrays, JSONB, full-text search, triggers, and functions with performance optimization strategies.

## 🗂️ PostgreSQL Arrays

### Array Types and Usage

**Array Declaration**:

```sql
CREATE TABLE study_modules (
  id UUID PRIMARY KEY,
  learning_objectives TEXT[] DEFAULT '{}',
  tags VARCHAR(50)[] DEFAULT '{}'
);
```

**Array Operations**:

```sql
-- Insert array data
INSERT INTO study_modules (learning_objectives)
VALUES (ARRAY['Understand Tanium Console', 'Master Query Syntax', 'Deploy Actions']);

-- Query array elements
SELECT * FROM study_modules
WHERE 'Understand Tanium Console' = ANY(learning_objectives);

-- Array containment
SELECT * FROM study_modules
WHERE learning_objectives @> ARRAY['Master Query Syntax'];
```

### Performance Considerations

**Indexing Arrays**:

```sql
-- GIN index for array containment queries
CREATE INDEX idx_learning_objectives ON study_modules USING GIN(learning_objectives);

-- B-tree index for specific array elements
CREATE INDEX idx_first_objective ON study_modules ((learning_objectives[1]));
```

**Best Practices**:

- Use GIN indexes for containment queries (@>, <@, &&)
- Limit array size to reasonable bounds (< 1000 elements)
- Consider JSONB arrays for complex nested structures

## 📄 JSONB (Binary JSON)

### JSONB vs JSON Performance

**Storage Differences**:

- **JSON**: Stored as exact copy of input text
- **JSONB**: Stored in decomposed binary format

**Performance Characteristics**:

- **Write Performance**: JSONB slower due to conversion overhead
- **Read Performance**: JSONB significantly faster (no reparsing needed)
- **Storage**: JSONB more efficient, eliminates duplicate keys
- **Indexing**: Only JSONB supports indexing

### JSONB Operations

**Basic JSONB Usage**:

```sql
CREATE TABLE study_modules (
  id UUID PRIMARY KEY,
  metadata JSONB DEFAULT '{}',
  content_structure JSONB
);

-- Insert JSONB data
INSERT INTO study_modules (metadata) VALUES (
  '{"difficulty": "intermediate", "duration_minutes": 30, "prerequisites": ["basic_tanium"]}'
);

-- Query JSONB data
SELECT * FROM study_modules
WHERE metadata->>'difficulty' = 'intermediate';

-- Path queries
SELECT * FROM study_modules
WHERE metadata #> '{prerequisites,0}' = '"basic_tanium"';
```

### JSONB Indexing Strategies

**GIN Index Types**:

```sql
-- Default jsonb_ops (supports ?, ?&, ?|, @>)
CREATE INDEX idx_metadata_gin ON study_modules USING GIN(metadata);

-- jsonb_path_ops (supports @> only, smaller index)
CREATE INDEX idx_metadata_path ON study_modules USING GIN(metadata jsonb_path_ops);

-- Partial index for specific keys
CREATE INDEX idx_difficulty ON study_modules USING GIN((metadata->'difficulty'));
```

**B-tree Indexes for Extracted Values**:

```sql
-- Index extracted text values
CREATE INDEX idx_metadata_difficulty ON study_modules ((metadata->>'difficulty'));

-- Composite index with extracted values
CREATE INDEX idx_metadata_composite ON study_modules (
  (metadata->>'difficulty'),
  (metadata->>'duration_minutes')::integer
);
```

### Performance Optimization

**Query Optimization Patterns**:

```sql
-- Efficient containment queries
SELECT * FROM study_modules
WHERE metadata @> '{"difficulty": "intermediate"}';

-- Extract multiple values efficiently
SELECT
  id,
  metadata->>'difficulty' as difficulty,
  metadata->>'duration_minutes' as duration,
  (metadata->'prerequisites')::text[] as prerequisites
FROM study_modules;

-- Avoid redundant key extractions in WHERE clauses
-- GOOD: Single extraction
SELECT * FROM study_modules
WHERE (metadata->>'duration_minutes')::integer > 30;

-- BAD: Multiple extractions
SELECT * FROM study_modules
WHERE metadata->>'duration_minutes' > '30'
  AND (metadata->>'duration_minutes')::integer < 60;
```

**Performance Benchmarks**:

- **EAV Replacement**: Up to 1000x performance improvement
- **Index Size**: jsonb_path_ops 20-30% smaller than jsonb_ops
- **Query Speed**: GIN indexes provide sub-millisecond JSONB queries

## 🔍 Full-Text Search

### TSVECTOR and Search Configuration

**Search Vector Setup**:

```sql
CREATE TABLE study_modules (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  search_vector TSVECTOR
);

-- Update search vector
UPDATE study_modules
SET search_vector = to_tsvector('english', title || ' ' || content);
```

**Automatic Search Vector Updates**:

```sql
-- Trigger function for automatic updates
CREATE OR REPLACE FUNCTION update_search_vector() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_study_modules_search
  BEFORE INSERT OR UPDATE ON study_modules
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();
```

### GIN Indexes for Full-Text Search

**Search Index Creation**:

```sql
-- GIN index for full-text search
CREATE INDEX idx_study_modules_search ON study_modules USING GIN(search_vector);

-- Trigram index for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_content_trigram ON study_modules USING GIN(content gin_trgm_ops);
```

**Search Queries**:

```sql
-- Basic full-text search
SELECT *, ts_rank(search_vector, plainto_tsquery('english', 'Tanium sensor')) as rank
FROM study_modules
WHERE search_vector @@ plainto_tsquery('english', 'Tanium sensor')
ORDER BY rank DESC;

-- Search with highlighting
SELECT
  title,
  ts_headline('english', content, plainto_tsquery('english', 'Tanium sensor')) as highlight
FROM study_modules
WHERE search_vector @@ plainto_tsquery('english', 'Tanium sensor');

-- Fuzzy search with trigrams
SELECT *, similarity(content, 'Tanium Sensor') as sim
FROM study_modules
WHERE content % 'Tanium Sensor'
ORDER BY sim DESC;
```

## ⚡ Triggers and Functions

### Trigger Best Practices

**Efficient Trigger Design**:

```sql
-- Good: Conditional trigger execution
CREATE OR REPLACE FUNCTION smart_update_trigger() RETURNS TRIGGER AS $$
BEGIN
  -- Only update search vector if relevant columns changed
  IF (TG_OP = 'UPDATE' AND (OLD.title IS DISTINCT FROM NEW.title
                           OR OLD.content IS DISTINCT FROM NEW.content))
     OR TG_OP = 'INSERT' THEN
    NEW.search_vector := to_tsvector('english',
      COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, '')
    );
    NEW.updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### PL/pgSQL Function Development

**Complex Business Logic Functions**:

```sql
CREATE OR REPLACE FUNCTION search_content(search_term TEXT)
RETURNS TABLE(
  content_type TEXT,
  id UUID,
  title TEXT,
  content_snippet TEXT,
  rank REAL
) AS $$
DECLARE
  query_ts tsquery;
BEGIN
  -- Prepare the search query
  query_ts := plainto_tsquery('english', search_term);

  -- Return combined results from multiple tables
  RETURN QUERY
  SELECT
    'module'::TEXT as content_type,
    sm.id,
    sm.title,
    ts_headline('english', sm.content, query_ts) as content_snippet,
    ts_rank(sm.search_vector, query_ts) as rank
  FROM study_modules sm
  WHERE sm.search_vector @@ query_ts

  UNION ALL

  SELECT
    'section'::TEXT as content_type,
    ss.id,
    ss.title,
    ts_headline('english', ss.content, query_ts) as content_snippet,
    ts_rank(ss.search_vector, query_ts) as rank
  FROM study_sections ss
  WHERE ss.search_vector @@ query_ts

  ORDER BY rank DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;
```

## 🚀 Performance Optimization Strategies

### Index Selection Guidelines

**Decision Matrix**:

| Data Type | Query Pattern | Recommended Index |
|-----------|---------------|-------------------|
| JSONB | Containment (@>) | GIN (jsonb_ops) |
| JSONB | Path queries | GIN (jsonb_path_ops) |
| JSONB | Equality on keys | B-tree on extracted value |
| Arrays | Containment (@>) | GIN |
| Arrays | Specific elements | B-tree on element |
| Text | Full-text search | GIN (tsvector) |
| Text | Fuzzy matching | GIN (pg_trgm) |

### Query Optimization Patterns

**Efficient JSONB Queries**:

```sql
-- Optimize: Use containment for structured queries
SELECT * FROM modules WHERE metadata @> '{"type": "hands-on-lab"}';

-- Avoid: String comparison on JSONB
SELECT * FROM modules WHERE metadata::text LIKE '%hands-on-lab%';

-- Optimize: Extract once, use multiple times
WITH extracted_data AS (
  SELECT
    id,
    metadata->>'difficulty' as difficulty,
    (metadata->'duration_minutes')::integer as duration
  FROM study_modules
)
SELECT * FROM extracted_data
WHERE difficulty = 'advanced' AND duration > 45;
```

**Array Query Optimization**:

```sql
-- Optimize: Use array operators
SELECT * FROM modules WHERE tags && ARRAY['certification', 'exam'];

-- Avoid: String operations on arrays
SELECT * FROM modules WHERE array_to_string(tags, ',') LIKE '%certification%';
```

## 📏 Size Limitations and Scalability

### Storage Limits

**JSONB Constraints**:

- Maximum document size: 255 MB per JSONB field
- Practical limit: Keep documents under 1 MB for optimal performance
- Nesting depth: No hard limit, but deeper nesting affects performance

**Array Constraints**:

- Maximum array size: Limited by available memory
- Practical limit: Keep arrays under 10,000 elements
- Consider partitioning for larger datasets

### Scalability Patterns

**Partitioning Strategies**:

```sql
-- Partition large tables by date
CREATE TABLE study_progress (
  id UUID,
  user_id UUID,
  module_id UUID,
  progress_data JSONB,
  created_at TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE study_progress_2025_01 PARTITION OF study_progress
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

## 🔧 Integration with Supabase

### Supabase-Specific Features

**Real-time Subscriptions**:

```sql
-- Enable real-time for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE study_modules;
```

**Row Level Security (RLS)**:

```sql
-- Enable RLS
ALTER TABLE study_modules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students can view published modules" ON study_modules
FOR SELECT USING (
  metadata->>'status' = 'published' OR
  auth.uid() IN (
    SELECT user_id FROM student_enrollments
    WHERE module_id = study_modules.id
  )
);
```

### Supabase Client Integration

**JavaScript/TypeScript Usage**:

```typescript
// Type-safe JSONB queries
interface ModuleMetadata {
  difficulty: "beginner" | "intermediate" | "advanced";
  duration_minutes: number;
  prerequisites: string[];
}

const { data, error } = await supabase
  .from("study_modules")
  .select("id, title, metadata")
  .filter("metadata->difficulty", "eq", "intermediate")
  .filter("metadata->duration_minutes", "gte", 30);

// Full-text search
const { data: searchResults } = await supabase.rpc("search_content", {
  search_term: "Tanium console navigation",
});
```

## 📊 Monitoring and Maintenance

### Performance Monitoring Queries

**Index Usage Analysis**:

```sql
-- Check index usage statistics
SELECT
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  idx_tup_read / GREATEST(idx_tup_fetch, 1) as selectivity
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_tup_read DESC;

-- JSONB key frequency analysis
SELECT
  key,
  COUNT(*) as frequency
FROM study_modules,
     LATERAL jsonb_object_keys(metadata) as key
GROUP BY key
ORDER BY frequency DESC;
```

**Query Performance Analysis**:

```sql
-- Enable query statistics
-- Add to postgresql.conf: shared_preload_libraries = 'pg_stat_statements'

-- Analyze slow JSONB queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE query LIKE '%metadata%'
ORDER BY mean_time DESC;
```

## 🛠️ Troubleshooting Common Issues

### Performance Problems

**Problem**: Slow JSONB queries
**Solutions**:

1. Add appropriate GIN indexes
2. Use containment (@>) instead of equality on nested keys
3. Extract frequently queried keys to separate columns

**Problem**: Large JSONB documents affecting performance
**Solutions**:

1. Split large documents into smaller, focused structures
2. Use separate tables for infrequently accessed data
3. Implement document compression for archived data

**Problem**: Array queries not using indexes
**Solutions**:

1. Ensure GIN index exists for array columns
2. Use array operators (&&, @>, <@) instead of functions
3. Check query plan with EXPLAIN ANALYZE

### Common Pitfalls

**JSONB Pitfalls**:

- Don't use JSONB for frequently changing data structures
- Avoid deep nesting (>3 levels) for performance
- Don't store large binary data in JSONB

**Array Pitfalls**:

- Don't use arrays for data that should be in separate tables
- Avoid very large arrays (>1000 elements)
- Don't use arrays when you need referential integrity

## 📚 Resources and Tools

### Essential Extensions

```sql
-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fuzzy string matching
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Additional JSONB functions (if available)
CREATE EXTENSION IF NOT EXISTS "jsonb_plpython3u";
```

### Monitoring Tools

- **pg_stat_statements**: Query performance analysis
- **pg_stat_user_indexes**: Index usage statistics
- **EXPLAIN ANALYZE**: Query execution planning
- **Supabase Dashboard**: Real-time performance metrics

---

_This knowledge base is maintained for the Tanium TCO Study Platform and reflects PostgreSQL 17.x best practices as of 2025._
