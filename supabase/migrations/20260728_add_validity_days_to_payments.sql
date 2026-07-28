-- Add validity_days column to payments table (default 30 days for monthly memberships)
ALTER TABLE IF EXISTS public.payments
  ADD COLUMN IF NOT EXISTS validity_days INTEGER NOT NULL DEFAULT 30;

-- Backfill any existing NULL rows just in case
UPDATE public.payments SET validity_days = 30 WHERE validity_days IS NULL;
