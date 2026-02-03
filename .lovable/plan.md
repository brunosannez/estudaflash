
# Plano de Correção e Modernização do Studa Flash

## Resumo do Diagnóstico

Com base na análise completa do projeto, identifiquei os seguintes problemas críticos:

### Erros Encontrados (Logs das Edge Functions)

1. **Quiz ENEM (`generate-enem-quiz`)**: Erro 401 - "Incorrect API key provided" para OpenAI
   - A variável `OPENAI_API_KEY` contém valor inválido ou expirado
   
2. **Flashcards (`generate-flashcards`)**: 
   - Erro 410 - "https://api-inference.huggingface.co is no longer supported" (API deprecated)
   - Fallback para Anthropic falha com 404 - modelo "claude-3-5-sonnet-20241022" não existe
   
3. **Resumo (`generate-summary`)**: Modelo Anthropic incorreto pode causar erro 404
   - Está usando `claude-3-5-sonnet-20240620` que é válido

4. **Mapa Mental (`generate-mind-map`)**: Usa `claude-3-haiku-20240307` - válido

### Problemas de Configuração de IA

| Função | Provedor Atual | Modelo Atual | Status |
|--------|---------------|--------------|--------|
| generate-summary | Anthropic | claude-3-5-sonnet-20240620 | ✓ OK |
| generate-flashcards | HuggingFace → Anthropic | deepseek-ai + claude-3-5-sonnet-20241022 | ❌ FALHA |
| generate-enem-quiz | OpenAI | gpt-4o-mini | ❌ FALHA (API key inválida) |
| generate-mind-map | Anthropic | claude-3-haiku-20240307 | ✓ OK |

---

## Solução Proposta: Estratégia Multi-Modelo Otimizada

Baseado no seu pedido de usar diferentes modelos para otimizar custo-benefício:

| Função | Novo Provedor | Modelo Recomendado | Justificativa |
|--------|--------------|-------------------|---------------|
| **Resumo** | Anthropic (Claude) | claude-3-5-sonnet-20241022 | Melhor escrita e contextualização |
| **Flashcards** | Anthropic (Claude) | claude-3-haiku-20240307 | Custo baixo, boa qualidade para cards curtos |
| **Quiz ENEM** | Anthropic (Claude) | claude-3-5-sonnet-20241022 | Raciocínio complexo para questões |
| **Mapa Mental** | Anthropic (Claude) | claude-3-haiku-20240307 | Estruturas simples, custo baixo |

**Por que remover OpenAI e HuggingFace?**
- OpenAI: API key com problema e custo mais alto
- HuggingFace: API descontinuada (erro 410)
- Anthropic: Você já tem uma `ANTHROPIC_API_KEY` configurada e funcionando

---

## Fases de Implementação

### FASE 1: Corrigir Edge Functions (Prioridade Alta)

#### 1.1. Corrigir `generate-enem-quiz/index.ts`
- Migrar de OpenAI para Anthropic Claude
- Usar modelo `claude-3-5-sonnet-20241022`
- Manter mesma lógica de geração de quiz ENEM
- Adicionar suporte a múltiplos quizzes por resumo

#### 1.2. Corrigir `generate-flashcards/index.ts`
- Remover HuggingFace completamente (deprecated)
- Usar Anthropic Claude Haiku (custo baixo)
- Corrigir nome do modelo para `claude-3-haiku-20240307`
- Manter validação de qualidade dos flashcards

#### 1.3. Atualizar `generate-summary/index.ts`
- Atualizar modelo para `claude-3-5-sonnet-20241022` (mais recente)
- Manter estrutura atual que está funcionando

#### 1.4. Verificar `generate-mind-map/index.ts`
- Já está usando Claude Haiku corretamente
- Apenas verificar se continua funcionando

---

### FASE 2: Melhorar Tratamento de Erros no Frontend

#### 2.1. Atualizar `useEnemQuiz.ts`
- Melhorar mensagens de erro específicas
- Adicionar timeout handling
- Mostrar estado de loading mais informativo

#### 2.2. Atualizar `useAutoFlashcards.ts`
- Melhorar feedback de erros
- Adicionar retry automático com backoff

#### 2.3. Atualizar `Resumo.tsx`
- Melhorar feedback visual durante geração
- Adicionar estados intermediários

---

### FASE 3: Sistema de Múltiplos Quizzes

#### 3.1. Atualizar lógica no banco
- Já suporta múltiplos quizzes (tabela `enem_quiz_metadata` não tem constraint unique)
- Adicionar UI para listar e selecionar quizzes existentes

#### 3.2. Atualizar `EnemQuiz.tsx`
- Mostrar lista de quizzes disponíveis
- Permitir selecionar qual quiz jogar
- Manter opção de gerar novo quiz

---

### FASE 4: Otimizações de Custo

#### 4.1. Implementar cache de prompts
- Evitar regenerar conteúdo idêntico
- Usar hash do conteúdo para verificar duplicidade

#### 4.2. Otimizar tokens enviados
- Truncar resumos muito longos para flashcards/quiz
- Usar chunking inteligente para resumos grandes

---

## Arquivos a Serem Modificados

### Edge Functions (Supabase)
1. `supabase/functions/generate-enem-quiz/index.ts` - Migrar para Anthropic
2. `supabase/functions/generate-flashcards/index.ts` - Corrigir modelo e remover HuggingFace
3. `supabase/functions/generate-summary/index.ts` - Atualizar modelo

### Frontend (React)
4. `src/hooks/useEnemQuiz.ts` - Melhorar tratamento de erros
5. `src/hooks/useAutoFlashcards.ts` - Melhorar feedback
6. `src/pages/Resumo.tsx` - Melhorar estados de loading
7. `src/pages/EnemQuiz.tsx` - Suporte a múltiplos quizzes
8. `src/services/aiModelService.ts` - Atualizar configurações de modelos

---

## Custos Estimados por Modelo (Anthropic)

| Modelo | Input (1M tokens) | Output (1M tokens) | Uso Típico |
|--------|------------------|-------------------|------------|
| Claude 3.5 Sonnet | $3.00 | $15.00 | Resumo, Quiz (qualidade) |
| Claude 3 Haiku | $0.25 | $1.25 | Flashcards, Mapa Mental (economia) |

**Economia estimada:** Ao usar Haiku para flashcards/mapa mental, redução de ~80% no custo dessas operações.

---

## Resultado Esperado

Após implementação:
- ✅ Quiz ENEM funcionando sem erros
- ✅ Flashcards gerando corretamente
- ✅ Mapa mental funcionando
- ✅ Resumo com qualidade mantida
- ✅ Múltiplos quizzes por resumo
- ✅ Custos otimizados com modelos apropriados
- ✅ Melhor feedback de erros para o usuário
