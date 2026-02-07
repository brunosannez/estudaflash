
# Memoria de Flashcards: Continuar Exatamente de Onde Parou

## Problema Atual

O sistema de sessoes de flashcards tem a infraestrutura (tabela `flashcard_sessions`, hooks, dialog de continuar), mas nao funciona corretamente por varios motivos:

- O botao "Estudar Agora" no card nunca verifica se existe uma sessao ativa -- sempre começa do zero
- Ha uma corrida (race condition) que cria sessoes novas antes de verificar as existentes
- O indice do card salvo esta errado: salva o card ja respondido em vez do proximo
- Sessoes antigas nunca sao encerradas -- um resumo tem ate 10 sessoes "ativas" simultaneas
- O dialog de "Continuar Sessao" nao mostra informacoes uteis (quantos cards faltam, pontuacao)

## Mudancas Planejadas

### 1. FlashcardSetCard com Indicador de Sessao Ativa

**Arquivo**: `src/components/my-flashcards/FlashcardSetCard.tsx`

O card de cada conjunto de flashcards vai verificar no banco se existe uma sessao ativa e mostrar:
- Barra de progresso com "X de Y cards respondidos"
- Botao "Continuar" (verde) quando ha sessao ativa, com o sessionId
- Botao "Novo Estudo" (azul) como opcao secundaria
- Se nao ha sessao ativa, mostra apenas "Estudar Agora" como hoje

### 2. Corrigir o Indice Salvo no handleAnswer

**Arquivo**: `src/hooks/flashcard-study/useFlashcardActions.ts`

O `handleAnswer` atualmente salva `currentIndex` (o card que acabou de ser respondido). Isso faz o usuario ver o mesmo card ao retomar. A correcao e salvar `currentIndex + 1` quando nao for o ultimo card, ou manter `currentIndex` se for o ultimo (pois a sessao sera concluida).

### 3. Eliminar Race Condition na Inicializacao

**Arquivo**: `src/components/FlashcardStudyModeImproved.tsx`

Atualmente, `useFlashcardStudy` e chamado imediatamente com `existingSessionId` que começa como `null`. A verificacao de sessao existente e async e roda depois.

A correcao:
- Adicionar um estado `initializing` que bloqueia o render ate a verificacao completar
- Somente apos saber se ha sessao ativa (ou nao), inicializar o `useFlashcardStudy`
- Se `sessionId` for passado como prop (vindo do FlashcardSetCard), pular a verificacao

### 4. Limpar Sessoes Orfas

**Arquivo**: `src/hooks/flashcard-session/useFlashcardSessionDatabase.ts`

Adicionar funcao `cleanupOldSessions` que, ao criar uma nova sessao:
- Marca todas as sessoes ativas antigas do mesmo resumo como "abandoned"
- Garante que so exista 1 sessao ativa por resumo por usuario

### 5. Dialog de Continuar com Informacoes de Progresso

**Arquivo**: `src/components/flashcard-study/FlashcardContinueDialog.tsx`

Exibir no dialog:
- Quantos cards foram respondidos e quantos faltam
- Pontuacao parcial (acertos/erros)
- XP acumulado na sessao
- Data da ultima atividade

### 6. Corrigir Stale Closure no Cleanup

**Arquivo**: `src/hooks/flashcard-study/useFlashcardStudyManager.ts`

O efeito de cleanup no unmount usa `[]` como dependencias, capturando os valores iniciais para sempre. Corrigir para usar `useRef` que sempre tem o valor atualizado.

---

## Detalhes Tecnicos

### FlashcardSetCard - Nova logica de sessao

```text
Ao montar o card:
1. Buscar sessao ativa: SELECT id, current_card_index, completed_cards, session_stats 
   FROM flashcard_sessions 
   WHERE resumo_id = X AND user_id = Y AND status = 'active'
   ORDER BY last_activity_at DESC LIMIT 1

2. Se encontrar com progresso (completed_cards.length > 0):
   - Mostrar barra de progresso: "7 de 12 cards"
   - Botao verde: "Continuar de onde parou" -> onStartStudy(set, sessionId)
   - Botao secundario: "Novo Estudo" -> limpa sessao antiga, onStartStudy(set)

3. Se nao encontrar:
   - Botao padrao: "Estudar Agora" -> onStartStudy(set)
```

### handleAnswer - Indice corrigido

```text
Antes:
  saveProgress(currentIndex, completedIds, stats)
  
Depois:
  const nextIndex = currentIndex + 1 < flashcards.length 
    ? currentIndex + 1 
    : currentIndex;
  saveProgress(nextIndex, completedIds, stats)
```

### FlashcardStudyModeImproved - Eliminacao da race condition

```text
Fluxo atual (problematico):
  1. Render -> useFlashcardStudy(resumoId, null) -> cria sessao nova
  2. useEffect -> checkForExistingSession -> encontra sessao antiga -> tarde demais

Fluxo corrigido:
  1. Render com initializing=true -> mostra loading
  2. Se sessionId prop existe -> pula verificacao, usa direto
  3. Se nao -> checkForExistingSession async
  4. Ao resolver -> seta resolvedSessionId e initializing=false
  5. useFlashcardStudy(resumoId, resolvedSessionId) so e chamado quando pronto
```

### cleanupOldSessions - Nova funcao

```text
async cleanupOldSessions(resumoId, userId, keepSessionId?):
  UPDATE flashcard_sessions 
  SET status = 'abandoned'
  WHERE resumo_id = X 
    AND user_id = Y 
    AND status = 'active'
    AND id != keepSessionId (se fornecido)
```

### FlashcardContinueDialog - Props expandidas

```text
Props atuais: { onContinue, onStartNew }
Props novas: { 
  onContinue, onStartNew,
  completedCount: number,
  totalCards: number,
  score: { correct: number, incorrect: number },
  xpEarned: number,
  lastActivityAt: string
}
```

---

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/my-flashcards/FlashcardSetCard.tsx` | Verificar sessao ativa, mostrar progresso, botao continuar |
| `src/hooks/flashcard-study/useFlashcardActions.ts` | Salvar currentIndex + 1 em vez de currentIndex |
| `src/components/FlashcardStudyModeImproved.tsx` | Eliminar race condition com estado initializing |
| `src/hooks/flashcard-session/useFlashcardSessionDatabase.ts` | Adicionar cleanupOldSessions |
| `src/components/flashcard-study/FlashcardContinueDialog.tsx` | Mostrar progresso, score, XP no dialog |
| `src/hooks/flashcard-study/useFlashcardStudyManager.ts` | Corrigir stale closure no cleanup com useRef |

## Resultado Esperado

- Ao abrir "Meus Flashcards", cada card mostra se ha sessao em andamento com progresso visual
- Clicar "Continuar" abre exatamente no proximo card nao respondido
- O dialog mostra quantos cards faltam e a pontuacao parcial
- Sessoes antigas sao automaticamente limpas ao iniciar nova sessao
- O progresso e salvo corretamente a cada resposta, troca de aba e saida da pagina
