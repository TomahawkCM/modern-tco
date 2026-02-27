-- Migration: 007_auto_trial_on_signup
-- Updates handle_new_user() to auto-provision a 14-day trial subscription on signup
-- Also backfills trial subscriptions for existing users who have no subscription row

-- Update the trigger function to include subscription creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  -- Auto-provision 14-day trial subscription
  INSERT INTO public.subscriptions (user_id, status, tier, trial_end)
  VALUES (NEW.id, 'trialing', 'premium', now() + interval '14 days');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill: create trial subscriptions for existing users who don't have one
INSERT INTO public.subscriptions (user_id, status, tier, trial_end)
SELECT u.id, 'trialing', 'premium', now() + interval '14 days'
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions s WHERE s.user_id = u.id
);
