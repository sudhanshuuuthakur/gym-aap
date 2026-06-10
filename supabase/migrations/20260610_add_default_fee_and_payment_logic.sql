-- Add default membership fee to profiles
ALTER TABLE public.profiles 
ADD COLUMN default_membership_fee NUMERIC NOT NULL DEFAULT 500;

-- Create a function to check if a member is paid (within 30 days)
CREATE OR REPLACE FUNCTION public.is_member_paid(admission_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.payments
    WHERE admission_id = $1
    AND payment_date > CURRENT_DATE - INTERVAL '30 days'
    ORDER BY payment_date DESC
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to get the latest payment date for a member
CREATE OR REPLACE FUNCTION public.get_latest_payment_date(admission_id UUID)
RETURNS DATE AS $$
DECLARE
  latest_date DATE;
BEGIN
  SELECT payment_date INTO latest_date
  FROM public.payments
  WHERE admission_id = $1
  ORDER BY payment_date DESC
  LIMIT 1;
  RETURN latest_date;
END;
$$ LANGUAGE plpgsql;

-- Create a function to calculate days until membership expires
CREATE OR REPLACE FUNCTION public.days_until_expiry(admission_id UUID)
RETURNS INTEGER AS $$
DECLARE
  latest_date DATE;
  days_left INTEGER;
BEGIN
  SELECT payment_date INTO latest_date
  FROM public.payments
  WHERE admission_id = $1
  ORDER BY payment_date DESC
  LIMIT 1;
  
  IF latest_date IS NULL THEN
    RETURN 0;
  END IF;
  
  days_left := 30 - (CURRENT_DATE - latest_date);
  RETURN GREATEST(days_left, 0);
END;
$$ LANGUAGE plpgsql;
