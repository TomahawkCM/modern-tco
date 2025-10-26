# Supabase Schema Setup for TCO Study Platform

## 🚨 CRITICAL: Manual Schema Creation Required

**The database schema must be created manually in the Supabase SQL Editor** because DDL operations cannot be executed through the REST API or RPC functions.

## 📋 Steps to Complete Setup

### 1. Open Supabase SQL Editor

1. Go to your Supabase project dashboard: <https://supabase.com/dashboard/project/qnwcwoutgarhqxlgsjzs>
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### 2. Run This Complete SQL Script

Copy and paste the following SQL into the SQL Editor and click "Run":

```sql
-- TCO Study Platform Database Schema
-- Creates comprehensive schema for Tanium Certified Operator content

-- Create study_domains table
CREATE TABLE IF NOT EXISTS study_domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  exam_weight INTEGER NOT NULL,
  estimated_time_minutes INTEGER DEFAULT 180,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_modules table
CREATE TABLE IF NOT EXISTS study_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES study_domains(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  learning_objectives TEXT[],
  section_number INTEGER,
  estimated_time_minutes INTEGER DEFAULT 30,
  difficulty_level TEXT DEFAULT 'intermediate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_sections table
CREATE TABLE IF NOT EXISTS study_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES study_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  section_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create practice_questions table
CREATE TABLE IF NOT EXISTS practice_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES study_domains(id) ON DELETE CASCADE,
  module_id UUID REFERENCES study_modules(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty_level TEXT DEFAULT 'intermediate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_modules_domain_id ON study_modules(domain_id);
CREATE INDEX IF NOT EXISTS idx_study_sections_module_id ON study_sections(module_id);
CREATE INDEX IF NOT EXISTS idx_practice_questions_domain_id ON practice_questions(domain_id);
CREATE INDEX IF NOT EXISTS idx_practice_questions_module_id ON practice_questions(module_id);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE study_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (study content should be accessible to all users)
CREATE POLICY "Enable read access for all users" ON study_domains FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON study_modules FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON study_sections FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON practice_questions FOR SELECT USING (true);

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
```

### 3. Verify Tables Created

After running the SQL, verify the tables were created by running this query:

```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('study_domains', 'study_modules', 'study_sections', 'practice_questions')
ORDER BY table_name, ordinal_position;
```

### 4. Check Domain Data

Verify the domain data was inserted:

```sql
SELECT * FROM study_domains ORDER BY domain_number;
```

## 🚀 After Schema Creation

Once the schema is created successfully, run this command to migrate all 2,415 lines of TCO content:

### PowerShell (Windows)

```powershell
# Navigate to project directory
Set-Location "modern-tco"

# Verify Node.js environment
node --version

# Run content migration pipeline
node scripts/comprehensive-content-pipeline.js

# Alternative: Run with verbose logging
$env:DEBUG = "true"; node scripts/comprehensive-content-pipeline.js

# Check pipeline results
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Content migration completed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Content migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
}
```

### Unix/Linux

```bash
cd modern-tco
node scripts/comprehensive-content-pipeline.js
```

## 📊 Expected Results

- ✅ 4 tables created (study_domains, study_modules, study_sections, practice_questions)
- ✅ 5 TCO certification domains inserted
- ✅ Row Level Security enabled with public read policies
- ✅ Performance indexes created
- ✅ Ready for content migration

## 🔍 Troubleshooting

If you encounter any errors:

### PowerShell (Windows)

```powershell
# Check Supabase connection
$env:SUPABASE_URL = "https://qnwcwoutgarhqxlgsjzs.supabase.co"
$env:SUPABASE_ANON_KEY = "your-anon-key"

# Test database connection
try {
    node -e "console.log('Testing Supabase connection...'); process.exit(0)"
    Write-Host "✅ Node.js environment ready" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js environment issue: $_" -ForegroundColor Red
}

# Check for required files
if (Test-Path "scripts/comprehensive-content-pipeline.js") {
    Write-Host "✅ Migration script found" -ForegroundColor Green
} else {
    Write-Host "❌ Migration script not found" -ForegroundColor Red
}
```

### Common Issues

1. **Permission Denied**: Make sure you're using a service role key in your .env.local
2. **Table Already Exists**: The IF NOT EXISTS clauses handle this gracefully
3. **Foreign Key Errors**: Run the domains INSERT first, then modules/sections
4. **PowerShell Execution Policy**: Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## 📋 Next Steps

After successful schema creation:

1. Run content migration pipeline
2. Verify 2,415 lines of content in database
3. Update StudyModuleViewer component
4. Test in browser with DevTools

---

**Status**: Ready for manual execution in Supabase SQL Editor
**Contact**: Run the pipeline after schema creation is complete
