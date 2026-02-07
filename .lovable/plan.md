
# Correcao Completa: Flashcards, CORS, JWT e Estabilidade do App

## Diagnostico Completo

Apos analise detalhada de todos os arquivos do backend e frontend, identifiquei os seguintes problemas:

### Problema 1: Flashcards falhando com JSON truncado (CRITICO)
- A funcao `generate-flashcards` pede ate **20 flashcards**, cada um com **7 campos** (front, back, explanation, type, difficulty, tags, evidence)
- O limite de `max_tokens: 4000` nao comporta 20 cards detalhados
- O JSON e cortado no meio, causando `SyntaxError` no parse
- Os creditos sao consumidos ANTES da chamada a API, desperdicando 3 creditos por falha

### Problema 2: config.toml faltando `generate-enem-quiz` (CRITICO)
- O arquivo `config.toml` tem `[functions.generate-quiz]` mas a funcao real se chama `generate-enem-quiz`
- Isso significa que o quiz pode falhar por nao ter configuracao de JWT
- Precisa adicionar `[functions.generate-enem-quiz]`

### Problema 3: CORS incompletos em 3 funcoes
- `generate-flashcards`, `generate-mind-map` e `generate-summary` usam CORS simples:
  ```
  authorization, x-client-info, apikey, content-type
  ```
- Faltam headers que o client Supabase envia automaticamente:
  ```
  x-supabase-client-platform, x-supabase-client-platform-version,
  x-supabase-client-runtime, x-supabase-client-runtime-version
  ```
- A funcao `generate-enem-quiz` ja tem os headers completos (modelo correto)
- A funcao `extract-text-from-image` tambem tem CORS simples

### Problema 4: verify_jwt=true conflita com auth manual
- Todas as funcoes fazem verificacao manual de JWT no codigo (via `verifyAuth`)
- Mas `config.toml` tem `verify_jwt = true`, que bloqueia requests OPTIONS (preflight CORS)
- A documentacao recomenda `verify_jwt = false` quando a funcao faz sua propria verificacao

### Problema 5: Prompt dos flashcards pede campos desnecessarios
- O campo `evidence` (trecho literal de 200 chars) e `tags` (redundante com tema auto-detectado) inflam o JSON de saida
- A validacao de "keyword overlap" rejeita cards validos que usam sinonimos ou explicacoes proprias

---

## Plano de Correcao

### 1. Reescrever `generate-flashcards` Edge Function

**Arquivo**: `supabase/functions/generate-flashcards/index.ts`

Mudancas:
- **CORS completos**: Adicionar todos os headers que o client Supabase envia
- **Reduzir limite de cards**: Maximo 12 cards (em vez de 20)
- **Aumentar max_tokens**: De 4000 para 8000 (Claude Haiku suporta ate 4096 de OUTPUT mas o limite na API pode ser maior)
- **Simplificar prompt**: Remover campos `evidence` e `tags` do JSON de saida (5 campos por card em vez de 7)
- **Adicionar recuperacao de JSON truncado**: Se `JSON.parse` falhar, tentar reparar o JSON cortado recuperando os cards completos
- **Suavizar validacao de fidelidade**: Reduzir threshold de overlap de 0.15 para 0.05 (flashcards podem reformular conceitos)

Nova formula de cards:

```text
<= 300 palavras: 5-8 cards
<= 600 palavras: 8-10 cards  
<= 900 palavras: 10-12 cards
> 900 palavras: 12 cards (maximo absoluto)
```

Nova estrutura de card no prompt (5 campos):
```text
{
  "front": "Pergunta clara?",
  "back": "Resposta concisa.",
  "explanation": "Contexto adicional.",
  "type": "definicao",
  "difficulty": "medium"
}
```

Logica de recuperacao de JSON truncado:
```text
1. Tentar JSON.parse normal
2. Se falhar, localizar o ultimo "}" completo no texto
3. Fechar o array e o objeto: adicionar "]}" 
4. Tentar parsear novamente
5. Se recuperar >= 3 cards, usa-los normalmente
6. Se nao, lancar o erro original
```

### 2. Atualizar CORS em `generate-mind-map`

**Arquivo**: `supabase/functions/generate-mind-map/index.ts`

Atualizar corsHeaders para o conjunto completo (igual ao `generate-enem-quiz`).

### 3. Atualizar CORS em `generate-summary`

**Arquivo**: `supabase/functions/generate-summary/index.ts`

Atualizar corsHeaders para o conjunto completo.

### 4. Atualizar CORS em `extract-text-from-image`

**Arquivo**: `supabase/functions/extract-text-from-image/index.ts`

Atualizar corsHeaders para o conjunto completo.

### 5. Corrigir `config.toml`

**Arquivo**: `supabase/config.toml`

- Adicionar `[functions.generate-enem-quiz]` que esta faltando
- Alterar `verify_jwt = false` para todas as funcoes que fazem auth manual
- Isso garante que requests OPTIONS (preflight CORS) passem sem bloqueio

Nova configuracao:
```text
[functions.generate-summary]
verify_jwt = false

[functions.generate-quiz]
verify_jwt = false

[functions.generate-enem-quiz]
verify_jwt = false

[functions.generate-flashcards]
verify_jwt = false

[functions.generate-mind-map]
verify_jwt = false

[functions.extract-text-from-image]
verify_jwt = false

[functions.reset-usage-counters]
verify_jwt = false

[functions.admin-rotate-guardian-key]
verify_jwt = false

[functions.create-stripe-checkout]
verify_jwt = false

[functions.verify-payment]
verify_jwt = false
```

### 6. Deploy de todas as Edge Functions modificadas

Apos as alteracoes, fazer deploy de:
- `generate-flashcards`
- `generate-mind-map`
- `generate-summary`
- `extract-text-from-image`

---

## Sobre a Pergunta: "E possivel aumentar os tokens?"

**Sim, e absolutamente possivel.** O modelo Claude 3 Haiku suporta ate **4096 tokens de saida**, mas podemos configurar `max_tokens` na chamada da API ate esse limite. Alem disso:

- Reduzindo o numero de campos por card de 7 para 5 e o maximo de cards de 20 para 12, o JSON de saida fica **~60% menor**
- Com 8000 de `max_tokens` (acima do limite real do modelo de 4096), o Haiku usara ate seu limite maximo naturalmente
- Se ainda truncar, a logica de recuperacao salvara os cards ja completos

O resultado pratico: para um resumo de ~1200 palavras, serao gerados **12 flashcards de alta qualidade** que cobrem todos os pontos principais, em vez de 20 flashcards que nunca chegam a ser salvos por truncamento.

---

## Visao Geral do Fluxo Corrigido

```text
1. Upload da imagem -> OCR (Google Vision) -> Texto extraido
2. Texto -> generate-summary (Claude Sonnet 4) -> Resumo denso e completo
3. Resumo -> generate-flashcards (Claude Haiku) -> 5-12 cards para fixacao
4. Resumo -> generate-enem-quiz (Claude Sonnet 4) -> Quiz simulado estilo ENEM
5. Resumo -> generate-mind-map (Claude Haiku) -> Mapa mental visual
```

Cada etapa consome creditos, tem pre-validacao no frontend, e o backend faz a deducao real via `consume_credits`.

---

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `supabase/functions/generate-flashcards/index.ts` | CORS, prompt, max_tokens, recuperacao JSON, validacao |
| `supabase/functions/generate-mind-map/index.ts` | CORS completos |
| `supabase/functions/generate-summary/index.ts` | CORS completos |
| `supabase/functions/extract-text-from-image/index.ts` | CORS completos |
| `supabase/config.toml` | Adicionar generate-enem-quiz, verify_jwt=false em todas |
