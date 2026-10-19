CREATE TABLE public.gyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'GYM NAME',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gyms_id_owner_id_key UNIQUE (id, owner_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gyms TO authenticated;
GRANT ALL ON public.gyms TO service_role;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view their gyms" ON public.gyms FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owners can create their gyms" ON public.gyms FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update their gyms" ON public.gyms FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can delete their gyms" ON public.gyms FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX gyms_owner_created_idx ON public.gyms (owner_id, created_at, id);

INSERT INTO public.gyms (owner_id, name)
SELECT owner_ids.user_id, 'GYM NAME'
FROM (
  SELECT user_id FROM public.profiles
  UNION SELECT user_id FROM public.admissions
  UNION SELECT user_id FROM public.payments
  UNION SELECT user_id FROM public.attendance
) AS owner_ids
WHERE NOT EXISTS (
  SELECT 1 FROM public.gyms existing WHERE existing.owner_id = owner_ids.user_id
);

ALTER TABLE public.admissions ADD COLUMN gym_id uuid;
ALTER TABLE public.payments ADD COLUMN gym_id uuid;
ALTER TABLE public.attendance ADD COLUMN gym_id uuid;

UPDATE public.admissions a
SET gym_id = g.id
FROM public.gyms g
WHERE a.user_id = g.owner_id AND a.gym_id IS NULL;
UPDATE public.payments p
SET gym_id = g.id
FROM public.gyms g
WHERE p.user_id = g.owner_id AND p.gym_id IS NULL;
UPDATE public.attendance a
SET gym_id = g.id
FROM public.gyms g
WHERE a.user_id = g.owner_id AND a.gym_id IS NULL;

CREATE OR REPLACE FUNCTION public.assign_default_gym()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.gym_id IS NULL THEN
    SELECT id INTO NEW.gym_id
    FROM public.gyms
    WHERE owner_id = NEW.user_id
    ORDER BY created_at, id
    LIMIT 1;
  END IF;
  IF NEW.gym_id IS NULL THEN
    RAISE EXCEPTION 'No gym exists for this owner';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER admissions_assign_default_gym BEFORE INSERT ON public.admissions FOR EACH ROW EXECUTE FUNCTION public.assign_default_gym();
CREATE TRIGGER payments_assign_default_gym BEFORE INSERT ON public.payments FOR EACH ROW EXECUTE FUNCTION public.assign_default_gym();
CREATE TRIGGER attendance_assign_default_gym BEFORE INSERT ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.assign_default_gym();

ALTER TABLE public.admissions ADD CONSTRAINT admissions_gym_owner_fkey FOREIGN KEY (gym_id, user_id) REFERENCES public.gyms (id, owner_id);
ALTER TABLE public.payments ADD CONSTRAINT payments_gym_owner_fkey FOREIGN KEY (gym_id, user_id) REFERENCES public.gyms (id, owner_id);
ALTER TABLE public.attendance ADD CONSTRAINT attendance_gym_owner_fkey FOREIGN KEY (gym_id, user_id) REFERENCES public.gyms (id, owner_id);
ALTER TABLE public.admissions ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE public.payments ALTER COLUMN gym_id SET NOT NULL;
ALTER TABLE public.attendance ALTER COLUMN gym_id SET NOT NULL;

CREATE INDEX admissions_gym_id_idx ON public.admissions (gym_id);
CREATE INDEX payments_gym_id_idx ON public.payments (gym_id);
CREATE INDEX attendance_gym_id_idx ON public.attendance (gym_id);