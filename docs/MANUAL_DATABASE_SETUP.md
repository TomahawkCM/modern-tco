# Manual Database Setup Guide

Since automated migration scripts are encountering API limitations, this guide provides step-by-step instructions for manually setting up the TCO database schema in Supabase.

## Prerequisites

- Access to Supabase Dashboard: <https://app.supabase.com/>
- Project: qnwcwoutgarhqxlgsjzs
- SQL Editor permissions

## Step 1: Access Supabase SQL Editor

1. Go to <https://app.supabase.com/>
2. Select project `qnwcwoutgarhqxlgsjzs`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

## Step 2: Create Database Schema

Copy and paste the following SQL into the SQL Editor and run it:

```sql
-- TCO Study Platform Database Schema
-- Creates comprehensive schema for Tanium Certified Operator content

-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create study_domains table
CREATE TABLE IF NOT EXISTS study_domains (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  domain_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  exam_weight INTEGER NOT NULL,
  estimated_time_minutes INTEGER DEFAULT 180,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_modules table
CREATE TABLE IF NOT EXISTS study_modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES study_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  section_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create practice_questions table
CREATE TABLE IF NOT EXISTS practice_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Create policies to allow public read access (study content should be accessible to all users)
CREATE POLICY "Enable read access for all users" ON study_domains FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON study_modules FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON study_sections FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON practice_questions FOR SELECT USING (true);
```

## Step 3: Verify Schema Creation

After running the SQL, verify the tables were created:

1. In Supabase Dashboard, go to **Table Editor**
2. You should see 4 new tables:
   - `study_domains` (5 rows - the TCO certification domains)
   - `study_modules` (empty - will be populated next)
   - `study_sections` (empty - will be populated next)
   - `practice_questions` (empty - will be populated next)

## Step 4: Populate Initial Study Content

Create a new SQL query and run this to populate basic study modules:

```sql
-- Insert study modules for all 5 TCO domains
INSERT INTO study_modules (domain_id, title, content, learning_objectives, section_number, estimated_time_minutes, difficulty_level)
SELECT
  d.id,
  CASE d.domain_number
    WHEN 1 THEN 'Domain 1: Asking Questions - Study Guide'
    WHEN 2 THEN 'Domain 2: Refining Questions and Targeting - Study Guide'
    WHEN 3 THEN 'Domain 3: Taking Action - Study Guide'
    WHEN 4 THEN 'Domain 4: Navigation and Module Functions - Study Guide'
    WHEN 5 THEN 'Domain 5: Reporting and Data Export - Study Guide'
  END,
  CASE d.domain_number
    WHEN 1 THEN 'Master natural language questioning in Tanium for real-time endpoint data collection. Learn sensor selection, query construction, and result interpretation for effective information gathering.'
    WHEN 2 THEN 'Advanced filtering and targeting techniques for precise endpoint management. Covers computer groups, RBAC controls, and intelligent query optimization for effective scope management.'
    WHEN 3 THEN 'Package deployment and action management for effective endpoint operations. Learn approval workflows, action monitoring, and emergency response procedures for secure action execution.'
    WHEN 4 THEN 'Master the Tanium Console interface and core module functionality. Learn efficient navigation, dashboard customization, and workflow management for optimal operational productivity.'
    WHEN 5 THEN 'Comprehensive data reporting and export techniques for compliance and analysis. Master automated workflows, format customization, and large dataset management for stakeholder reporting.'
  END,
  CASE d.domain_number
    WHEN 1 THEN ARRAY['Construct natural language questions using Tanium''s query interface', 'Select appropriate sensors for data collection requirements', 'Create and manage saved questions for repeated use']
    WHEN 2 THEN ARRAY['Create and manage computer groups for precise targeting', 'Construct advanced filters using logical operators', 'Apply least privilege principles in targeting']
    WHEN 3 THEN ARRAY['Deploy packages and execute actions on targeted endpoint groups', 'Navigate approval workflows and understand processes', 'Monitor action execution status']
    WHEN 4 THEN ARRAY['Navigate the Tanium Console interface efficiently', 'Utilize core modules for daily operations', 'Customize dashboard views for optimal workflow']
    WHEN 5 THEN ARRAY['Generate comprehensive reports from Tanium data', 'Export data in multiple formats for different use cases', 'Create automated reporting workflows']
  END,
  1,
  CASE d.domain_number
    WHEN 1 THEN 180
    WHEN 2 THEN 200
    WHEN 3 THEN 150
    WHEN 4 THEN 180
    WHEN 5 THEN 160
  END,
  'intermediate'
FROM study_domains d
ON CONFLICT DO NOTHING;
```

## Step 5: Verify Data Population

1. Go to **Table Editor** → **study_domains**
   - Should show 5 domains with proper exam weights
2. Go to **Table Editor** → **study_modules**
   - Should show 5 study modules (one for each domain)

## Step 6: Test Application Connection

### PowerShell (Windows)

```powershell
# Navigate to project directory
Set-Location "modern-tco"

# Verify environment variables are set
if (-not $env:SUPABASE_URL) {
    Write-Host "⚠️  Warning: SUPABASE_URL not set" -ForegroundColor Yellow
    Write-Host "Setting default URL..." -ForegroundColor Cyan
    $env:SUPABASE_URL = "https://qnwcwoutgarhqxlgsjzs.supabase.co"
}

if (-not $env:SUPABASE_ANON_KEY) {
    Write-Host "⚠️  Warning: SUPABASE_ANON_KEY not set" -ForegroundColor Yellow
    Write-Host "Please check your .env.local file" -ForegroundColor Red
}

# Start development server
Write-Host "🚀 Starting development server..." -ForegroundColor Green
npm run dev

# Alternative: Start with specific port
# $env:PORT = "3000"; npm run dev
```

### Unix/Linux

```bash
npm run dev
```

### Testing Steps

1. Open browser to <http://localhost:3000>
2. Check browser console for database connection errors
3. Navigate to study modules to verify data loads properly
4. Test database connectivity:

```powershell
# PowerShell: Test database connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://qnwcwoutgarhqxlgsjzs.supabase.co',
  process.env.SUPABASE_ANON_KEY
);

(async () => {
  try {
    const { data, error } = await supabase.from('study_domains').select('count');
    if (error) throw error;
    console.log('✅ Database connection successful');
    console.log('📊 Domain count check passed');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
})();
"
```

## Expected Results

After completing this setup:

- ✅ 4 database tables created with proper relationships
- ✅ 5 TCO certification domains populated
- ✅ 5 basic study modules created
- ✅ Row Level Security policies enabled
- ✅ Performance indexes created
- ✅ Application can connect to live database

## Next Steps

1. Populate detailed study sections content
2. Add practice questions to each domain
3. Test all application features with live data
4. Enable real-time subscriptions for collaborative features

## Troubleshooting

### PowerShell (Windows)

```powershell
# Check environment variables
Write-Host "Environment Check:" -ForegroundColor Cyan
Write-Host "SUPABASE_URL: $($env:SUPABASE_URL)" -ForegroundColor Yellow
Write-Host "SUPABASE_ANON_KEY: $($env:SUPABASE_ANON_KEY -replace '.{10}$', '...[HIDDEN]')" -ForegroundColor Yellow

# Test Node.js and npm
node --version
npm --version

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local file missing" -ForegroundColor Red
    Write-Host "Create .env.local with your Supabase credentials" -ForegroundColor Yellow
}

# Test project dependencies
if (Test-Path "node_modules") {
    Write-Host "✅ Node modules installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Running npm install..." -ForegroundColor Yellow
    npm install
}
```

### Common Issues

- **Tables not appearing**: Refresh the Table Editor page
- **Permission errors**: Verify you have admin access to the Supabase project
- **SQL errors**: Check for typos and run statements individually if needed
- **Connection issues**: Verify .env.local has correct project URL and keys
- **PowerShell script errors**: Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
