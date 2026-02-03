
## O que está acontecendo (diagnóstico)

### 1) Erro 404 em `/quiz-history`
- A rota `/quiz-history` é usada em vários lugares (menu, ações rápidas etc.), mas **não existe no `src/App.tsx`**.
- Por isso, quando você abre “Histórico Quiz”, cai no **NotFound (404)**.

### 2) Botão “Quiz ENEM” no Resumo não gera e você fica em “Carregando resumo…”
Pelos logs mais recentes da Edge Function **generate-enem-quiz**, o problema principal é:

- A função está recebendo a requisição **sem header Authorization**.
- Log da função: **“Falha na autenticação: Token de autenticação não fornecido”**.
- Resultado: a Edge Function retorna 401 e o quiz não é criado.

Além disso, há um risco de “carregamento infinito” na página `EnemQuiz.tsx`:
- `EnemQuiz.tsx` começa com `loadingData = true`.
- Se o `user` estiver temporariamente `null` (carregando auth), o `useEffect` dá `return` cedo e pode **não derrubar o loading** em alguns cenários, causando sensação de travamento.

---

## Objetivo do ajuste
1) Fazer o quiz gerar sempre (corrigindo autenticação na chamada da edge function).  
2) Evitar loading infinito na tela do quiz.  
3) Criar a página `/quiz-history` (histórico real do sistema ENEM) para eliminar o 404.  
4) Melhorar UX do botão de quiz no resumo: se já existe quiz, abrir; se não existe, gerar.

---

## Implementação (passo a passo)

### Fase A — Corrigir o 404 do Histórico de Quiz
1. **Criar página** `src/pages/QuizHistory.tsx` (ou nome equivalente) para:
   - Listar sessões em `enem_quiz_sessions` do usuário logado.
   - Exibir informações do resumo relacionado (join com `enem_quiz_metadata` e `resumos/uploads`).
   - Permitir:
     - Continuar/refazer (navegar para `/quiz-enem/:resumoId` e selecionar o quiz mais recente, ou retomar sessão se aplicável).
     - Deletar sessão (reusar `useQuizDeleteHandler` que já apaga `enem_quiz_sessions`).
2. **Adicionar a rota** no `src/App.tsx`:
   - `path="/quiz-history"` com `ProtectedRoute`.
3. (Opcional) Ajustar links do app para apontar para essa rota (já estão apontando; o que falta é a rota existir).

Arquivos envolvidos:
- `src/App.tsx` (adicionar route)
- `src/pages/QuizHistory.tsx` (novo)
- Reuso de componentes existentes em `src/components/quiz-history/*` (principalmente `EnhancedQuizHistoryItem`, `EnhancedQuizHistoryStats`, `QuizHistoryEmpty`, etc.)

---

### Fase B — Fazer a Edge Function receber autenticação corretamente (principal causa do quiz não gerar)
Hoje a `generate-enem-quiz` falha porque **não chega token** no request.

Vamos fazer duas correções complementares:

#### B1) Frontend: sempre enviar Authorization manualmente ao invocar Edge Functions
1. Criar um helper (ex.: `src/services/edgeFunctionInvoker.ts`) que:
   - Faz `supabase.auth.getSession()`
   - Pega `session?.access_token`
   - Chama `supabase.functions.invoke(name, { body, headers: { Authorization: \`Bearer ${token}\` } })`
   - Se não existir token, retorna erro amigável (“Sessão expirada. Faça login novamente.”)

2. Substituir chamadas diretas a `supabase.functions.invoke(...)` por esse helper nas features críticas:
   - Quiz ENEM: `src/hooks/useEnemQuiz.ts`
   - Resumo: `src/hooks/useSummaryGenerator.ts`, `src/services/summaryGenerationService.ts`, `src/services/summariesCombinerService.ts`
   - Flashcards: hooks/services que chamam `generate-flashcards`
   - Mapa mental: hooks/services que chamam `generate-mind-map`

Isso garante que **mesmo se o Supabase não anexar automaticamente**, o token vai junto.

#### B2) Edge Function: robustez de header + CORS correto
1. Atualizar o CORS nas edge functions (principalmente `generate-enem-quiz`) para permitir os headers completos recomendados (inclui `authorization` e headers da plataforma supabase).
2. Melhorar `verifyAuth` para checar também `req.headers.get('authorization')` além de `Authorization` (mesmo sendo case-insensitive na prática, isso evita surpresas entre ambientes).
3. Garantir que a função retorne erros claros (401) com mensagem consumível pelo frontend.

Arquivos envolvidos:
- `src/hooks/useEnemQuiz.ts` (usar helper com Authorization)
- `supabase/functions/generate-enem-quiz/index.ts` (CORS + verifyAuth)
- (Opcional para consistência) Outras edge functions: `generate-summary`, `generate-flashcards`, `generate-mind-map`

---

### Fase C — Corrigir o “loading infinito” e melhorar UX do fluxo Resumo → Quiz
#### C1) `EnemQuiz.tsx`: não travar em “Carregando resumo…”
1. Ajustar o `useEffect` de carregamento para:
   - Aguardar `authLoading` (do `useAuth`) antes de executar `loadData`.
   - Se `user` for null após authLoading terminar, finalizar loading e redirecionar/login com toast.
   - Sempre garantir que `setLoadingData(false)` aconteça em cenários de saída antecipada.

#### C2) Botão “Quiz ENEM” no `Resumo.tsx`: abrir quiz existente antes de tentar gerar
Hoje o botão sempre tenta gerar. Melhor:
1. Ao clicar:
   - Buscar se já existe quiz metadata para esse resumo.
   - Se existir: navegar direto para `/quiz-enem/:id`
   - Se não existir: gerar e navegar após sucesso

Isso reduz custo e evita “parece que não aconteceu nada” quando já há quiz.

Arquivos envolvidos:
- `src/pages/EnemQuiz.tsx`
- `src/pages/Resumo.tsx`
- `src/hooks/useEnemQuiz.ts` (adicionar método `listQuizMetadata(resumoId)` se necessário)

---

### Fase D — Suporte real a “Múltiplos quizzes por resumo” (já que você escolheu isso)
Atualmente o hook `getQuizMetadata` pega apenas o mais recente. Vamos melhorar:
1. No hook `useEnemQuiz.ts`:
   - Criar `listQuizMetadata(resumoId)` que retorna todos (order por `created_at desc`)
2. No `EnemQuiz.tsx`:
   - Mostrar um seletor (dropdown) com “Quiz gerado em DD/MM HH:mm” (ou tema + data)
   - Permitir selecionar qual quiz jogar
   - “Gerar novo quiz” cria um novo metadata e seleciona automaticamente o mais recente
   - O botão “Deletar Quiz” deleta o quiz selecionado e volta para a lista (ou seleciona o próximo mais recente)

Arquivos envolvidos:
- `src/hooks/useEnemQuiz.ts`
- `src/pages/EnemQuiz.tsx`

---

## Verificações e testes (obrigatórios para fechar o bug)
1. **Teste E2E**:
   - Abrir um resumo → clicar “Quiz ENEM”
   - Ver se aparece toast de sucesso e se a página abre o quiz.
2. **Checar logs da edge function** `generate-enem-quiz`:
   - Confirmar que não aparece mais “Token de autenticação não fornecido”
   - Confirmar status 200 e insert em `enem_quiz_metadata` e `enem_questions`
3. **Teste do histórico**:
   - Ir em “Histórico Quiz” no menu
   - Confirmar que não dá 404 e lista suas sessões
4. **Teste multi-quiz**:
   - Gerar 2 quizzes no mesmo resumo
   - Confirmar que consegue alternar entre eles

---

## Observação importante sobre modelos de IA (para estabilidade)
Atualmente `generate-enem-quiz` e `generate-summary` estão usando `claude-sonnet-4-20250514`. Se houver qualquer erro 404/400 da Anthropic após corrigirmos autenticação, o ajuste imediato será:
- Voltar para modelos comprovadamente estáveis no projeto:
  - Resumo/Quiz: `claude-3-5-sonnet-20241022`
  - Flashcards/Mapa mental: `claude-3-haiku-20240307`

Isso mantém custo controlado e evita quebra por nome de modelo.

---

## Lista de arquivos que provavelmente serão alterados
- `src/App.tsx` (adicionar rota `/quiz-history`)
- `src/pages/QuizHistory.tsx` (novo)
- `src/pages/EnemQuiz.tsx` (loading + multi-quiz selector)
- `src/pages/Resumo.tsx` (abrir quiz existente antes de gerar)
- `src/hooks/useEnemQuiz.ts` (usar invoker com Authorization + listar quizzes)
- `src/services/edgeFunctionInvoker.ts` (novo helper)
- `supabase/functions/generate-enem-quiz/index.ts` (CORS + verifyAuth robusto)
- (Possível) outros chamadores de edge function para padronizar Authorization

