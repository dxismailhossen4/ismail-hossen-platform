CREATE TABLE IF NOT EXISTS public.free_tip_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 140),
  body text NOT NULL CHECK (char_length(body) BETWEEN 10 AND 4000),
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  updated_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS free_tip_posts_publication_idx
  ON public.free_tip_posts (is_published, published_at DESC, created_at DESC);

ALTER TABLE public.free_tip_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published free tips" ON public.free_tip_posts;
CREATE POLICY "Anyone can view published free tips"
  ON public.free_tip_posts FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage free tips" ON public.free_tip_posts;
CREATE POLICY "Admins can manage free tips"
  ON public.free_tip_posts FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.publish_free_tip(
  p_title text,
  p_body text,
  p_post_id uuid DEFAULT NULL
)
RETURNS public.free_tip_posts
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_post public.free_tip_posts;
BEGIN
  IF v_user_id IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access is required to publish Free Tips';
  END IF;

  IF char_length(trim(p_title)) NOT BETWEEN 3 AND 140 THEN
    RAISE EXCEPTION 'Free Tip title must be between 3 and 140 characters';
  END IF;
  IF char_length(trim(p_body)) NOT BETWEEN 10 AND 4000 THEN
    RAISE EXCEPTION 'Free Tip content must be between 10 and 4000 characters';
  END IF;

  UPDATE public.free_tip_posts
  SET is_published = false, updated_at = now(), updated_by = v_user_id
  WHERE is_published = true;

  IF p_post_id IS NULL THEN
    INSERT INTO public.free_tip_posts (title, body, is_published, published_at, created_by, updated_by)
    VALUES (trim(p_title), trim(p_body), true, now(), v_user_id, v_user_id)
    RETURNING * INTO v_post;
  ELSE
    UPDATE public.free_tip_posts
    SET title = trim(p_title), body = trim(p_body), is_published = true,
        published_at = now(), updated_at = now(), updated_by = v_user_id
    WHERE id = p_post_id
    RETURNING * INTO v_post;

    IF v_post.id IS NULL THEN
      RAISE EXCEPTION 'Free Tip post was not found';
    END IF;
  END IF;

  RETURN v_post;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_free_tip(text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_free_tip(text, text, uuid) TO authenticated;
