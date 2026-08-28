CREATE OR REPLACE FUNCTION public.get_daily_photo()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT value FROM public.admin_settings WHERE key = 'daily_photo' LIMIT 1),
    '{}'::jsonb
  );
$$;

REVOKE ALL ON FUNCTION public.get_daily_photo() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_daily_photo() TO anon, authenticated;
