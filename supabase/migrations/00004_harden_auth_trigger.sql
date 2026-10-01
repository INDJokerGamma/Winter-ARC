-- Harden the signup trigger function reported by Supabase Security Advisor.
ALTER FUNCTION public.handle_new_user()
SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
