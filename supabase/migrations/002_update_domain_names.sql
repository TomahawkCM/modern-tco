-- Migration to update TCO domain names to official blueprint terminology
-- This migration updates existing data to use the new official domain names

-- Update the existing questions to use the new domain names
UPDATE public.questions 
SET category = 'Refining Questions'
WHERE category = 'Refining Questions & Targeting' 
   OR category = 'Refining Questions and Targeting';

UPDATE public.questions 
SET category = 'Taking Action'
WHERE category = 'Taking Action - Packages & Actions' 
   OR category = 'Taking Action - Packages and Actions';

UPDATE public.questions 
SET category = 'Navigation and Basic Module Functions'
WHERE category = 'Navigation & Basic Module Functions' 
   OR category = 'Navigation and Basic Module Functions';

UPDATE public.questions 
SET category = 'Report Generation and Data Export'
WHERE category = 'Reporting & Data Export' 
   OR category = 'Reporting and Data Export'
   OR category = 'Report Generation & Data Export';

-- Update user_statistics table to use new category names
UPDATE public.user_statistics 
SET category = 'Refining Questions'
WHERE category = 'Refining Questions & Targeting' 
   OR category = 'Refining Questions and Targeting';

UPDATE public.user_statistics 
SET category = 'Taking Action'
WHERE category = 'Taking Action - Packages & Actions' 
   OR category = 'Taking Action - Packages and Actions';

UPDATE public.user_statistics 
SET category = 'Navigation and Basic Module Functions'
WHERE category = 'Navigation & Basic Module Functions' 
   OR category = 'Navigation and Basic Module Functions';

UPDATE public.user_statistics 
SET category = 'Report Generation and Data Export'
WHERE category = 'Reporting & Data Export' 
   OR category = 'Reporting and Data Export'
   OR category = 'Report Generation & Data Export';

-- Create index on updated category field if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_questions_category_updated ON public.questions(category);
CREATE INDEX IF NOT EXISTS idx_user_statistics_category ON public.user_statistics(category);

-- Add comment to track migration
COMMENT ON TABLE public.questions IS 'Updated to use official TCO exam blueprint domain names - Migration 002';
COMMENT ON TABLE public.user_statistics IS 'Updated to use official TCO exam blueprint domain names - Migration 002';