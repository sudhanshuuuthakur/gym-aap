REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.admissions FROM anon;
REVOKE ALL ON public.payments FROM anon;
REVOKE ALL ON public.attendance FROM anon;

REVOKE EXECUTE ON FUNCTION graphql_public.graphql(text, text, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE USAGE ON SCHEMA graphql_public FROM anon, authenticated;
REVOKE USAGE ON SCHEMA graphql FROM anon, authenticated;