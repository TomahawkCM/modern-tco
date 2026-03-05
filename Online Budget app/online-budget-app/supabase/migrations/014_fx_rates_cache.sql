-- FX rate cache table for multi-currency support
CREATE TABLE IF NOT EXISTS fx_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  base_currency TEXT NOT NULL,
  target_currency TEXT NOT NULL,
  rate NUMERIC(18, 8) NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (base_currency, target_currency)
);

-- Index for lookups and TTL cleanup
CREATE INDEX idx_fx_rates_base_target ON fx_rates (base_currency, target_currency);
CREATE INDEX idx_fx_rates_fetched_at ON fx_rates (fetched_at);

-- RLS
ALTER TABLE fx_rates ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read rates (they're not user-specific)
CREATE POLICY "Authenticated users can read FX rates"
  ON fx_rates FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update rates
CREATE POLICY "Service role can manage FX rates"
  ON fx_rates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
