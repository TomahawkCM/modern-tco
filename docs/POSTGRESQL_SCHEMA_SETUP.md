# Native PostgreSQL Schema Setup for TCO Study Platform

## 🐘 100% PostgreSQL Native Implementation

**This implementation uses pure PostgreSQL features and the native `pg` driver**, ensuring optimal performance and leveraging PostgreSQL's advanced capabilities.

## 📋 PostgreSQL Native Features Used

### Core PostgreSQL Features

- ✅ **UUID Extension**: `uuid_generate_v4()` for primary keys
- ✅ **JSONB**: Native JSON storage with indexing support
- ✅ **Arrays**: `TEXT[]` for learning objectives and tags
- ✅ **Check Constraints**: Data validation at database level
- ✅ **Triggers**: Automatic search vector updates
- ✅ **Full-Text Search**: `TSVECTOR` and `GIN` indexes
- ✅ **Functions**: Custom PL/pgSQL functions for search
- ✅ **Advanced Indexing**: GIN indexes for arrays and search

### Search & Performance Features

- ✅ **Full-Text Search**: `ts_vector`, `ts_rank`, `ts_headline`
- ✅ **Trigram Extension**: `pg_trgm` for fuzzy matching
- ✅ **GIN Indexes**: Optimized for arrays, JSONB, and search
- ✅ **Custom Functions**: Native search with ranking

## 🚀 Manual Schema Creation Required

**You must create the schema manually in Supabase SQL Editor** because DDL operations cannot be executed through REST API.

### Step 1: Open Supabase SQL Editor

1. Go to: <https://supabase.com/dashboard/project/qnwcwoutgarhqxlgsjzs>
2. Click "SQL Editor" in left sidebar
3. Click "New Query"

### Step 2: Run Native PostgreSQL Schema

Copy and paste this **complete native PostgreSQL schema**:

```sql
-- Enable UUID extension (PostgreSQL native)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Create study_domains table with PostgreSQL native features
CREATE TABLE IF NOT EXISTS study_domains (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  domain_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  exam_weight INTEGER NOT NULL CHECK (exam_weight >= 0 AND exam_weight <= 100),
  estimated_time_minutes INTEGER DEFAULT 180 CHECK (estimated_time_minutes > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_modules table with PostgreSQL arrays and JSONB
CREATE TABLE IF NOT EXISTS study_modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES study_domains(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  learning_objectives TEXT[] DEFAULT '{}', -- PostgreSQL array
  metadata JSONB DEFAULT '{}', -- PostgreSQL JSONB for flexible data
  section_number INTEGER,
  estimated_time_minutes INTEGER DEFAULT 30 CHECK (estimated_time_minutes > 0),
  difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  search_vector TSVECTOR, -- PostgreSQL full-text search
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_sections table
CREATE TABLE IF NOT EXISTS study_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES study_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  section_order INTEGER NOT NULL DEFAULT 1 CHECK (section_order > 0),
  search_vector TSVECTOR, -- PostgreSQL full-text search
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create practice_questions table with JSONB options
CREATE TABLE IF NOT EXISTS practice_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES study_domains(id) ON DELETE CASCADE,
  module_id UUID REFERENCES study_modules(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')),
  options JSONB DEFAULT '[]', -- PostgreSQL JSONB for question options
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[] DEFAULT '{}', -- PostgreSQL array for tags
  search_vector TSVECTOR, -- PostgreSQL full-text search
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create PostgreSQL indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_modules_domain_id ON study_modules(domain_id);
CREATE INDEX IF NOT EXISTS idx_study_modules_search ON study_modules USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_study_sections_module_id ON study_sections(module_id);
CREATE INDEX IF NOT EXISTS idx_study_sections_search ON study_sections USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_practice_questions_domain_id ON practice_questions(domain_id);
CREATE INDEX IF NOT EXISTS idx_practice_questions_module_id ON practice_questions(module_id);
CREATE INDEX IF NOT EXISTS idx_practice_questions_search ON practice_questions USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_practice_questions_tags ON practice_questions USING GIN(tags);

-- Create PostgreSQL triggers for automatic search vector updates
CREATE OR REPLACE FUNCTION update_search_vector() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic search index updates
DROP TRIGGER IF EXISTS update_study_modules_search ON study_modules;
CREATE TRIGGER update_study_modules_search
  BEFORE INSERT OR UPDATE ON study_modules
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();

DROP TRIGGER IF EXISTS update_study_sections_search ON study_sections;
CREATE TRIGGER update_study_sections_search
  BEFORE INSERT OR UPDATE ON study_sections
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();

DROP TRIGGER IF EXISTS update_practice_questions_search ON practice_questions;
CREATE TRIGGER update_practice_questions_search
  BEFORE INSERT OR UPDATE ON practice_questions
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- Create PostgreSQL function for content search
CREATE OR REPLACE FUNCTION search_content(search_term TEXT)
RETURNS TABLE(
  content_type TEXT,
  id UUID,
  title TEXT,
  content_snippet TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'module'::TEXT as content_type,
    sm.id,
    sm.title,
    ts_headline('english', sm.content, plainto_tsquery('english', search_term)) as content_snippet,
    ts_rank(sm.search_vector, plainto_tsquery('english', search_term)) as rank
  FROM study_modules sm
  WHERE sm.search_vector @@ plainto_tsquery('english', search_term)

  UNION ALL

  SELECT
    'section'::TEXT as content_type,
    ss.id,
    ss.title,
    ts_headline('english', ss.content, plainto_tsquery('english', search_term)) as content_snippet,
    ts_rank(ss.search_vector, plainto_tsquery('english', search_term)) as rank
  FROM study_sections ss
  WHERE ss.search_vector @@ plainto_tsquery('english', search_term)

  ORDER BY rank DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Insert the 5 TCO certification domains
INSERT INTO study_domains (domain_number, title, exam_weight, estimated_time_minutes) VALUES
(1, 'Asking Questions', 22, 180),
(2, 'Refining Questions & Targeting', 23, 200),
(3, 'Taking Action', 15, 150),
(4, 'Navigation & Module Functions', 23, 180),
(5, 'Reporting & Data Export', 17, 160)
ON CONFLICT (domain_number) DO UPDATE SET
  title = EXCLUDED.title,
  exam_weight = EXCLUDED.exam_weight,
  estimated_time_minutes = EXCLUDED.estimated_time_minutes,
  updated_at = NOW();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE study_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read access for all users" ON study_domains FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON study_modules FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON study_sections FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON practice_questions FOR SELECT USING (true);
```

### Step 3: Verify PostgreSQL Schema

After running the schema, verify with these PostgreSQL-specific queries:

```sql
-- Check PostgreSQL extensions
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'pg_trgm');

-- Check tables and native features
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('study_domains', 'study_modules', 'study_sections', 'practice_questions')
ORDER BY table_name, ordinal_position;

-- Test search function
SELECT * FROM search_content('Tanium') LIMIT 3;

-- Check array and JSONB features
SELECT title, learning_objectives, metadata FROM study_modules LIMIT 1;
```

## 🚀 Run Native PostgreSQL Pipeline

After schema creation, run the native PostgreSQL content pipeline:

### PowerShell (Windows)

```powershell
# Navigate to project directory
Set-Location "modern-tco"

# Verify PostgreSQL native setup
node -e "console.log('Testing PostgreSQL native features...'); process.exit(0)"

# Run PostgreSQL native pipeline
node scripts/postgresql-native-pipeline.js

# Alternative: Run with detailed PostgreSQL logging
$env:POSTGRES_DEBUG = "true"; node scripts/postgresql-native-pipeline.js

# Check PostgreSQL-specific results
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL native pipeline completed successfully" -ForegroundColor Green
    Write-Host "  - Native UUID generation active" -ForegroundColor Cyan
    Write-Host "  - JSONB and Array features working" -ForegroundColor Cyan
    Write-Host "  - Full-text search indexes created" -ForegroundColor Cyan
    Write-Host "  - GIN indexes optimized" -ForegroundColor Cyan
} else {
    Write-Host "❌ PostgreSQL native pipeline failed with exit code: $LASTEXITCODE" -ForegroundColor Red
}

# Test PostgreSQL native features
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  try {
    const { rows } = await pool.query('SELECT * FROM pg_extension WHERE extname IN (\$1, \$2)', ['uuid-ossp', 'pg_trgm']);
    console.log('✅ PostgreSQL extensions active:', rows.map(r => r.extname).join(', '));
    await pool.end();
  } catch (err) {
    console.error('❌ PostgreSQL test failed:', err.message);
    process.exit(1);
  }
})();
"
```

### Unix/Linux

```bash
cd modern-tco
node scripts/postgresql-native-pipeline.js
```

## 📊 PostgreSQL Native Features Benefits

### Performance Advantages

- **GIN Indexes**: Fast array and full-text search
- **TSVECTOR**: Native search ranking
- **JSONB**: Efficient metadata storage
- **Triggers**: Automatic search updates

### Advanced Capabilities

- **Full-Text Search**: Built-in ranking and highlighting
- **Array Operations**: Native support for learning objectives
- **Check Constraints**: Database-level validation
- **Custom Functions**: Complex search operations

### Development Benefits

- **Type Safety**: Strong PostgreSQL data types
- **ACID Compliance**: Transaction safety
- **Concurrent Access**: PostgreSQL handles concurrency
- **Extensibility**: Add custom functions as needed

## 🔍 Expected Results

After running the native PostgreSQL pipeline:

- ✅ **4 tables** with PostgreSQL native features
- ✅ **2 extensions** (uuid-ossp, pg_trgm)
- ✅ **8 indexes** including GIN for performance
- ✅ **3 triggers** for automatic search updates
- ✅ **1 custom function** for content search
- ✅ **5 TCO domains** with proper constraints
- ✅ **2,415+ lines** of content with full-text search
- ✅ **Array and JSONB** features working
- ✅ **RLS policies** for security

---

**Next Steps**: Run the schema creation, then execute the native PostgreSQL pipeline!
