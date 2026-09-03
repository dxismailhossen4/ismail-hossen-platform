-- Membership verification dashboard schema extension.
-- Non-destructive: preserves existing profiles, memberships, payments, and RLS.

CREATE TABLE IF NOT EXISTS public.membership_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('member', 'vip')),
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  currency text NOT NULL DEFAULT 'MYR' CHECK (char_length(currency) BETWEEN 3 AND 5),
  duration_days integer NOT NULL CHECK (duration_days > 0),
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.memberships
  ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.membership_plans(id) ON DELETE SET NULL;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.membership_plans(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.payment_review_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  previous_status public.payment_status NOT NULL,
  new_status public.payment_status NOT NULL,
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.membership_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id uuid NOT NULL REFERENCES public.memberships(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  event_type text NOT NULL CHECK (event_type IN ('activated', 'extended', 'expired', 'suspended', 'restored')),
  previous_status public.membership_status,
  new_status public.membership_status NOT NULL,
  starts_at timestamptz,
  expires_at timestamptz,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_review_events_payment_created_idx
  ON public.payment_review_events (payment_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payment_review_events_user_created_idx
  ON public.payment_review_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS membership_events_membership_created_idx
  ON public.membership_events (membership_id, created_at DESC);
CREATE INDEX IF NOT EXISTS memberships_status_expiry_idx
  ON public.memberships (status, expires_at);
CREATE INDEX IF NOT EXISTS payments_status_created_idx
  ON public.payments (status, created_at);

ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_review_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view active membership plans" ON public.membership_plans;
CREATE POLICY "Authenticated users can view active membership plans"
  ON public.membership_plans FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Users can view their payment review events" ON public.payment_review_events;
CREATE POLICY "Users can view their payment review events"
  ON public.payment_review_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can view their membership events" ON public.membership_events;
CREATE POLICY "Users can view their membership events"
  ON public.membership_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage membership plans" ON public.membership_plans;
CREATE POLICY "Admins can manage membership plans"
  ON public.membership_plans FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

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
  v_membership public.memberships%ROWTYPE;
  v_membership_expiry timestamptz;
  v_event_type text;
  v_previous_membership_status public.membership_status;
  v_previous_membership_expires_at timestamptz;
  v_had_membership boolean := false;
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
    status = p_decision::public.payment_status,
    admin_note = NULLIF(trim(COALESCE(p_admin_note, '')), ''),
    verified_at = CASE WHEN p_decision = 'approved' THEN now() ELSE NULL END,
    verified_by = CASE WHEN p_decision = 'approved' THEN auth.uid() ELSE NULL END,
    updated_at = now()
  WHERE id = v_payment.id;

  INSERT INTO public.payment_review_events (
    payment_id, user_id, admin_id, previous_status, new_status, admin_note
  ) VALUES (
    v_payment.id,
    v_payment.user_id,
    auth.uid(),
    v_payment.status,
    p_decision::public.payment_status,
    NULLIF(trim(COALESCE(p_admin_note, '')), '')
  );

  IF p_decision = 'approved' THEN
    SELECT status, expires_at
    INTO v_previous_membership_status, v_previous_membership_expires_at
    FROM public.memberships
    WHERE user_id = v_payment.user_id
    FOR UPDATE;

    v_had_membership := FOUND;

    INSERT INTO public.memberships (user_id, plan_id, status, starts_at, expires_at)
    VALUES (v_payment.user_id, v_payment.plan_id, 'active', now(), now() + interval '30 days')
    ON CONFLICT (user_id) DO UPDATE
    SET
      plan_id = COALESCE(EXCLUDED.plan_id, public.memberships.plan_id),
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
      updated_at = now()
    RETURNING * INTO v_membership;

    v_event_type := CASE
      WHEN v_had_membership
        AND v_previous_membership_status = 'active'
        AND v_previous_membership_expires_at > now()
        THEN 'extended'
      ELSE 'activated'
    END;

    INSERT INTO public.membership_events (
      membership_id, user_id, payment_id, actor_id, event_type,
      previous_status, new_status, starts_at, expires_at, note
    ) VALUES (
      v_membership.id,
      v_membership.user_id,
      v_payment.id,
      auth.uid(),
      v_event_type,
      v_previous_membership_status,
      'active',
      v_membership.starts_at,
      v_membership.expires_at,
      NULLIF(trim(COALESCE(p_admin_note, '')), '')
    );

    v_membership_expiry := v_membership.expires_at;
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
