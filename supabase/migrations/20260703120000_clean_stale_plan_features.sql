-- A coluna plans.features guardava textos de marketing de antes do
-- sistema de créditos ("10 uploads de imagens por mês", "100 resumos
-- com IA avançada"), duplicando e contradizendo as capacidades
-- derivadas de créditos exibidas na UI (PlanCard, PricingSection,
-- ChoosePlan). Substituído por diferenciais reais que não competem
-- com a lista de créditos.
UPDATE public.plans SET features = ARRAY[
  'Extração de texto de imagens (OCR)',
  'Sistema de gamificação e conquistas'
]
WHERE LOWER(name) = 'free';

UPDATE public.plans SET features = ARRAY[
  'Tudo do plano Free',
  'Suporte prioritário',
  'Sem anúncios'
]
WHERE LOWER(name) = 'pro';

UPDATE public.plans SET features = ARRAY[
  'Tudo do plano Pro',
  'Suporte prioritário via WhatsApp',
  'Acesso antecipado a novos recursos'
]
WHERE LOWER(name) = 'pro max';
