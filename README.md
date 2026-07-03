# Estuda Flash

App de estudos com IA: o aluno envia fotos do material (caderno, livro, slides),
e a IA gera **resumos didáticos**, **flashcards** e **quizzes estilo ENEM**
automaticamente. Inclui gamificação (XP, níveis, conquistas, sequência diária) e
sistema de créditos por plano.

- **Produção:** https://estudaflash.com
- **Backend:** Supabase (Postgres + Auth + Edge Functions)
- **IA:** Anthropic Claude (Sonnet 5 para resumos e quiz, Haiku 4.5 para
  flashcards e mapas mentais) + Google Vision (OCR)
- **Pagamentos:** Stripe

## Stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- React Router
- Supabase JS

## Desenvolvimento local

Requer Node.js e npm.

```sh
# 1. Instalar dependências
npm install

# 2. Rodar o servidor de desenvolvimento (porta 8080)
npm run dev

# 3. Build de produção
npm run build
```

## Deploy

O frontend é hospedado na **Vercel**. Para publicar:

```sh
npm run build
npx vercel --prod
```

As **Edge Functions** (geração de IA, checkout, etc.) ficam em
`supabase/functions/` e são publicadas via Supabase CLI:

```sh
npx supabase functions deploy <nome-da-funcao>
```

As **migrations** de banco ficam em `supabase/migrations/`.

## Variáveis e segredos

- Frontend: a URL e a chave pública (anon) do Supabase ficam em
  `src/integrations/supabase/client.ts`.
- Edge Functions (segredos no Supabase Dashboard → Edge Functions → Secrets):
  `ANTHROPIC_API_KEY`, `GOOGLE_VISION_API_KEY`, `STRIPE_SECRET_KEY`,
  `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
