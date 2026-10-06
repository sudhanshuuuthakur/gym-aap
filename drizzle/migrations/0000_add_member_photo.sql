ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS avatar_url text;
COMMENT ON COLUMN public.admissions.avatar_url IS 'Owner-prefixed private avatars storage path for the member photo';