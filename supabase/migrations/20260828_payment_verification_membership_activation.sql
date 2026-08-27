-- Only an authenticated administrator may verify a pending payment.
-- An approval activates or extends the owner’s VIP membership for 30 days.
CREATE OR REPLACE FUNCTION public.review_vip_payment(
  p_payment_id uuid,
  p_decision text,
  p_admin_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment public.payments%ROWTYPE;
  v_membership_expiry timestamptz;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access is required';
  END IF;

  IF p_decision NOT IN ('approved', 'rejected', 'more_info') THEN
    RAISE EXCEPTION 'Unsupported payment decision';
  END IF;

  SELECT * INTO v_payment
  FROM public.payments
  WHERE id = p_payment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment record was not found';
  END IF;

  IF v_payment.status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending payments can be reviewed';
  END IF;

  UPDATE public.payments
  SET
    status = p_decision::payment_status,
    admin_note = NULLIF(trim(COALESCE(p_admin_note, '')), ''),
    verified_at = CASE WHEN p_decision = 'approved' THEN now() ELSE NULL END,
    verified_by = CASE WHEN p_decision = 'approved' THEN auth.uid() ELSE NULL END,
    updated_at = now()
  WHERE id = v_payment.id;

  IF p_decision = 'approved' THEN
    INSERT INTO public.memberships (user_id, status, starts_at, expires_at)
    VALUES (v_payment.user_id, 'active', now(), now() + interval '30 days')
    ON CONFLICT (user_id) DO UPDATE
    SET
      status = 'active',
      starts_at = CASE
        WHEN public.memberships.status = 'active' AND public.memberships.expires_at > now()
          THEN public.memberships.starts_at
        ELSE now()
      END,
      expires_at = CASE
        WHEN public.memberships.status = 'active' AND public.memberships.expires_at > now()
          THEN public.memberships.expires_at + interval '30 days'
        ELSE now() + interval '30 days'
      END,
      updated_at = now();

    SELECT expires_at INTO v_membership_expiry
    FROM public.memberships
    WHERE user_id = v_payment.user_id;
  END IF;

  RETURN jsonb_build_object(
    'payment_id', v_payment.id,
    'payment_status', p_decision,
    'membership_activated', p_decision = 'approved',
    'membership_expires_at', v_membership_expiry
  );
END;
$$;

REVOKE ALL ON FUNCTION public.review_vip_payment(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_vip_payment(uuid, text, text) TO authenticated;
