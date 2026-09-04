-- Configurable content access rules for Free, Member/Freemium Plus, and VIP tiers.
CREATE TABLE IF NOT EXISTS public.content_access_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL UNIQUE,
  label text NOT NULL,
  minimum_tier text NOT NULL CHECK (minimum_tier IN ('free', 'member', 'vip')),
  description text,
  is_active boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_access_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view active content rules" ON public.content_access_rules;
CREATE POLICY "Authenticated users can view active content rules"
  ON public.content_access_rules FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage content rules" ON public.content_access_rules;
CREATE POLICY "Admins can manage content rules"
  ON public.content_access_rules FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO public.content_access_rules (content_key, label, minimum_tier, description)
VALUES
  ('daily_photo', 'Daily Photo Post', 'free', 'The current public daily image and date label.'),
  ('public_updates', 'Public Updates', 'free', 'Announcements and platform notices available to every visitor.'),
  ('free_tips', 'Free Daily Tips', 'free', 'The limited daily free-tip content.'),
  ('member_preview', 'Member/Freemium Plus Preview', 'member', 'Limited previews, saved history, notifications, and member-only updates.'),
  ('member_updates', 'Member-only Updates', 'member', 'Additional non-VIP updates for authenticated Member/Freemium Plus users.'),
  ('vip_predictions', 'VIP Predictions', 'vip', 'The complete VIP prediction pack for active approved members.'),
  ('vip_daily_set', 'VIP Complete Daily Set', 'vip', 'Full daily set, primary/backup selections, and draw-wise notes.'),
  ('vip_archive', 'VIP Archive', 'vip', 'Historical VIP content available while membership access is active.')
ON CONFLICT (content_key) DO NOTHING;

CREATE INDEX IF NOT EXISTS content_access_rules_tier_active_idx
  ON public.content_access_rules (minimum_tier, is_active);

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.memberships;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_access_content(p_content_key text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_minimum_tier text;
  v_user_tier text := 'free';
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  SELECT minimum_tier INTO v_minimum_tier
  FROM public.content_access_rules
  WHERE content_key = p_content_key
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  SELECT COALESCE(mp.tier, 'vip')
  INTO v_user_tier
  FROM public.memberships AS m
  LEFT JOIN public.membership_plans AS mp ON mp.id = m.plan_id
  WHERE m.user_id = auth.uid()
    AND m.status = 'active'
    AND (m.expires_at IS NULL OR m.expires_at > now())
  ORDER BY CASE WHEN mp.tier = 'vip' THEN 2 WHEN mp.tier = 'member' THEN 1 ELSE 0 END DESC
  LIMIT 1;

  RETURN CASE v_user_tier
    WHEN 'vip' THEN v_minimum_tier IN ('free', 'member', 'vip')
    WHEN 'member' THEN v_minimum_tier IN ('free', 'member')
    ELSE v_minimum_tier = 'free'
  END;
END;
$$;

REVOKE ALL ON FUNCTION public.can_access_content(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_content(text) TO authenticated;
