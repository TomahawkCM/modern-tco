-- Add last_viewed_section_id column to user_study_progress table
-- This tracks the last section the user was viewing in a module
ALTER TABLE public.user_study_progress
ADD COLUMN IF NOT EXISTS last_viewed_section_id TEXT;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_study_progress_last_viewed
ON public.user_study_progress(user_id, module_id, last_viewed_section_id)
WHERE last_viewed_section_id IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN public.user_study_progress.last_viewed_section_id IS
'The ID of the last section viewed by the user in this module (HTML element ID, not database ID)';