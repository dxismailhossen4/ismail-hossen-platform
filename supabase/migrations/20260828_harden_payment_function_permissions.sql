-- The profile helper is invoked only by auth.users trigger; it must not be callable through REST RPC.
REVOKE ALL ON FUNCTION public.handle_new_user_profile() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user_profile() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user_profile() FROM authenticated;

-- Payment review runs with the caller’s role, so the existing administrator RLS policies remain the authorization boundary.
ALTER FUNCTION public.review_vip_payment(uuid, text, text) SECURITY INVOKER;
REVOKE ALL ON FUNCTION public.review_vip_payment(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_vip_payment(uuid, text, text) TO authenticated;
