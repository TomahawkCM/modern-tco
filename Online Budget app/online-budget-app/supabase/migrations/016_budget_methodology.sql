-- Add budget methodology to user_settings
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS budget_methodology TEXT NOT NULL DEFAULT 'envelope'
  CHECK (budget_methodology IN ('envelope', 'zero_based', 'fifty_thirty_twenty', 'pay_yourself_first'));

COMMENT ON COLUMN user_settings.budget_methodology IS 'Budget methodology: envelope, zero_based, fifty_thirty_twenty, pay_yourself_first';
