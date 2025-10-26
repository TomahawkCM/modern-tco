-- Migration: Add domain field to questions table
-- Maps existing category field to new TCO domain taxonomy

-- Step 1: Add domain field to questions table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'questions'
        AND column_name = 'domain'
    ) THEN
        ALTER TABLE public.questions ADD COLUMN domain TEXT;
    END IF;
END $$;

-- Step 2: Drop existing constraint if it exists (to allow re-running migration)
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_domain_valid;

-- Step 3: Map existing categories and domain values to new domain taxonomy
-- Clear all current domain values first
UPDATE public.questions SET domain = NULL;

-- Priority 1: Map based on specific TCO domain category names
UPDATE public.questions
SET domain = 'asking_questions'
WHERE category = 'Asking Questions'
   OR category = 'Question Structure';

UPDATE public.questions
SET domain = 'refining_targeting'
WHERE category = 'Refining Questions'
   OR category = 'Refining Questions & Targeting'
   OR category = 'Refining Questions and Targeting';

UPDATE public.questions
SET domain = 'taking_action'
WHERE category = 'Taking Action'
   OR category = 'Taking Action - Packages & Actions'
   OR category = 'Taking Action - Packages and Actions';

UPDATE public.questions
SET domain = 'navigation'
WHERE category = 'Navigation'
   OR category = 'Console Navigation'
   OR category = 'Console Features'
   OR category = 'Console Customization'
   OR category = 'Module Ecosystem'
   OR category = 'Navigation and Basic Module Functions'
   OR category = 'Navigation & Basic Module Functions';

UPDATE public.questions
SET domain = 'reporting'
WHERE category = 'Reporting & Export'
   OR category = 'Data Collection'
   OR category = 'Report Generation and Data Export'
   OR category = 'Reporting & Data Export'
   OR category = 'Report Generation & Data Export';

-- Priority 2: Map generic categories to asking_questions (most common domain)
-- These are foundational concepts that align with "asking questions" about the platform
UPDATE public.questions
SET domain = 'asking_questions'
WHERE domain IS NULL
AND (
  category IN (
    'Platform Fundamentals',
    'PLATFORM_FUNDAMENTALS',
    'Platform Architecture',
    'Platform Terminology',
    'Platform Efficiency',
    'Fundamentals',
    'Business Impact',
    'Competitive Advantage',
    'Success Metrics',
    'Performance Benefits',
    'Performance Metrics',
    'Network Efficiency',
    'Network Discovery',
    'Scalability',
    'Fault Tolerance',
    'Infrastructure Requirements',
    'Communication Model',
    'Communication Security',
    'Zone Architecture',
    'User Roles',
    'Role-Based Access'
  )
);

-- Priority 3: Map procedural and scenario categories to navigation
UPDATE public.questions
SET domain = 'navigation'
WHERE domain IS NULL
AND category IN (
  'Console Procedures',
  'CONSOLE_PROCEDURES',
  'Practical Scenarios',
  'PRACTICAL_SCENARIOS'
);

-- Priority 4: Map troubleshooting to asking_questions (diagnostic questions)
UPDATE public.questions
SET domain = 'asking_questions'
WHERE domain IS NULL
AND (category = 'Troubleshooting' OR category = 'TROUBLESHOOTING');

-- Step 4: Set default for any questions that don't match (shouldn't happen, but safety net)
UPDATE public.questions
SET domain = 'asking_questions'
WHERE domain IS NULL;

-- Step 5: Make domain field NOT NULL now that all rows have values
ALTER TABLE public.questions
ALTER COLUMN domain SET NOT NULL;

-- Step 6: Add constraint to ensure valid domain values
ALTER TABLE public.questions
ADD CONSTRAINT questions_domain_valid CHECK (
  domain IN ('asking_questions', 'refining_targeting', 'taking_action', 'navigation', 'reporting', 'troubleshooting')
);

-- Step 7: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_domain ON public.questions(domain);
CREATE INDEX IF NOT EXISTS idx_questions_domain_difficulty ON public.questions(domain, difficulty);

-- Step 8: Add comments for documentation
COMMENT ON COLUMN public.questions.domain IS 'TCO certification domain using official blueprint taxonomy (asking_questions, refining_targeting, taking_action, navigation, reporting, troubleshooting)';
COMMENT ON INDEX idx_questions_domain IS 'Index for efficient domain-based question queries in mock exam builder';
COMMENT ON INDEX idx_questions_domain_difficulty IS 'Composite index for efficient domain+difficulty queries in practice mode and exams';
