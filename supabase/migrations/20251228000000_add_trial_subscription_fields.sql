-- Add trial and subscription fields to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled'));

-- Add index for subscription status queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);

-- Add comment
COMMENT ON COLUMN public.users.trial_start IS 'When the user started their trial period';
COMMENT ON COLUMN public.users.subscription_status IS 'Current subscription status: trial, active, expired, or cancelled';
