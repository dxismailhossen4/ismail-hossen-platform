-- Adds an ownership field for new records and restricts access to each authenticated user’s own records.
-- Existing records retain a NULL user_id until their rightful owner is assigned separately.
ALTER TABLE public.singapore_4d_promo_registry
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();

ALTER TABLE public.singapore_4d_promo_registry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own promo registry records" ON public.singapore_4d_promo_registry;
DROP POLICY IF EXISTS "Users can create their own promo registry records" ON public.singapore_4d_promo_registry;
DROP POLICY IF EXISTS "Users can update their own promo registry records" ON public.singapore_4d_promo_registry;

CREATE POLICY "Users can read their own promo registry records"
  ON public.singapore_4d_promo_registry
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own promo registry records"
  ON public.singapore_4d_promo_registry
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own promo registry records"
  ON public.singapore_4d_promo_registry
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
