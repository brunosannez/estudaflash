-- Idempotência do verify-payment: registrar a sessão Stripe que originou
-- cada assinatura, para reprocessamentos (refresh em /payment-success)
-- não criarem registros duplicados
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_session_id_key
  ON public.subscriptions (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
