
# Correcao: Flashcard Travando no Segundo Card

## Problema Identificado

O efeito de sincronizacao (`syncWithSession`) roda **a cada salvamento de progresso**, nao apenas na carga inicial da sessao. Isso causa um ciclo destrutivo:

```text
1. Usuario ve card 0 (pergunta)
2. Clica "Lembrei" -> handleAnswer salva nextIndex=1 no banco
3. Session manager atualiza estado -> sessionCurrentIndex = 1
4. Efeito de sync dispara -> setCurrentIndex(1) -> card muda para 1
5. Mas o feedback ainda esta aberto! A tela de feedback agora mostra
   a pergunta e resposta do card 1 (errado!)
6. Usuario clica "Proximo Card" -> currentIndex ja e 1, sobe para 2
7. Card 1 foi PULADO completamente
8. Com poucos cards, a sessao "termina" antes da hora
```

## Correcao

### 1. Limitar sincronizacao apenas a carga inicial

**Arquivo**: `src/hooks/flashcard-study/useFlashcardStudyManager.ts`

O efeito de sync (linhas 108-113) precisa rodar **apenas uma vez**, quando a sessao e carregada pela primeira vez. Adicionar um `useRef` chamado `hasSyncedRef` que:
- Comeca como `false`
- Muda para `true` apos o primeiro sync
- Impede que `syncWithSession` rode novamente durante o estudo normal

```text
Antes (roda a cada save):
  useEffect => syncWithSession(sessionCurrentIndex, ...)
  deps: [activeSessionId, sessionLoading, sessionCurrentIndex, sessionCompletedCards, sessionStats]

Depois (roda apenas 1 vez):
  useEffect => if (!hasSyncedRef.current && activeSessionId) { syncWithSession(...); hasSyncedRef.current = true; }
  deps: [activeSessionId, sessionLoading]
```

### 2. Nao atualizar estado da sessao apos cada save

**Arquivo**: `src/hooks/flashcard-session/useFlashcardSessionManager.ts`

Na funcao `saveCurrentProgress` (linhas 80-101), o `updateState` atualiza `currentCardIndex`, `completedCards` e `sessionStats` no estado do hook de sessao apos cada save. Isso dispara o efeito de sync.

A correcao e **remover** o `updateState` do `saveCurrentProgress`. O estado local (no `useFlashcardState`) ja e a fonte de verdade durante o estudo. O estado da sessao so precisa ser atualizado na carga inicial.

```text
Antes:
  saveCurrentProgress -> save to DB -> updateState({ currentCardIndex, completedCards, sessionStats })

Depois:
  saveCurrentProgress -> save to DB -> (sem updateState, apenas salva no banco)
```

### 3. Resetar flag de sync ao iniciar nova sessao

**Arquivo**: `src/hooks/flashcard-study/useFlashcardStudyManager.ts`

Na funcao `handleStudyAgain`, resetar `hasSyncedRef.current = false` para que uma nova sessao possa fazer o sync inicial corretamente.

---

## Detalhes Tecnicos

### useFlashcardStudyManager.ts - Mudancas

```text
// Adicionar ref de controle
const hasSyncedRef = useRef(false);

// Sync limitado a carga inicial
useEffect(() => {
  if (activeSessionId && !sessionLoading && !hasSyncedRef.current) {
    console.log('Syncing with session state (initial load)');
    syncWithSession(sessionCurrentIndex, sessionCompletedCards, sessionStats);
    hasSyncedRef.current = true;
  }
}, [activeSessionId, sessionLoading]);

// Reset no handleStudyAgain
const handleStudyAgain = () => {
  setIsCompleted(false);
  setCurrentIndex(0);
  resetFlipState();
  hasSyncedRef.current = false; // permitir novo sync
};
```

### useFlashcardSessionManager.ts - Mudancas

```text
// saveCurrentProgress simplificado
const saveCurrentProgress = useCallback(async (cardIndex, completedCardIds, stats) => {
  if (!state.sessionId) return false;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    await saveProgress(state.sessionId, cardIndex, completedCardIds, stats);
    // REMOVIDO: updateState(...) - nao atualizar estado local apos save
    console.log('Flashcard progress saved');
    return true;
  } catch (err) {
    console.error('Save progress error:', err);
    return false;
  }
}, [state.sessionId, saveProgress]);
```

---

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/hooks/flashcard-study/useFlashcardStudyManager.ts` | Adicionar `hasSyncedRef`, limitar sync a carga inicial, resetar no studyAgain |
| `src/hooks/flashcard-session/useFlashcardSessionManager.ts` | Remover `updateState` do `saveCurrentProgress` |

## Resultado Esperado

- Usuario responde card 0 -> feedback mostra conteudo do card 0 (correto)
- Clica "Proximo" -> ve card 1 (nao pula nenhum)
- Progresso continua normalmente ate o ultimo card
- Ao retomar sessao, comeca exatamente no card certo (sync inicial funciona)
- Nenhum card e pulado durante o estudo
