ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS payment_proof_key text,
  ADD COLUMN IF NOT EXISTS payment_proof_filename text,
  ADD COLUMN IF NOT EXISTS payment_proof_content_type text;
