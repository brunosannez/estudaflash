
# Plano: Renomear Quizzes, Histórico Completo e Gamificação de Pontuação

## Visão Geral
Implementar três funcionalidades interligadas:
1. **Renomear quizzes** - permitir que o usuário personalize o nome
2. **Nome automático com data** - IA gera nome padrão: "Tema - DD/MM HH:mm"
3. **Gamificação de pontuação** - XP por respostas corretas/erradas durante o quiz

---

## 1. Renomear Quizzes

### 1.1 Alteração no Banco de Dados
Adicionar coluna `custom_name` na tabela `enem_quiz_metadata`:
- Tipo: `text`, nullable
- Padrão: NULL (usa nome gerado automaticamente)

**Migration SQL:**
```sql
ALTER TABLE enem_quiz_metadata 
ADD COLUMN custom_name text DEFAULT NULL;
```

### 1.2 Nome Automático Gerado pela IA
Na Edge Function `generate-enem-quiz`, ao inserir o quiz metadata:
- Gerar nome padrão: `{Tema} - {DD/MM/YYYY HH:mm}`
- Exemplo: "História - 03/02/2026 13:35"

**Arquivo:** `supabase/functions/generate-enem-quiz/index.ts`

### 1.3 Interface de Renomear na Página do Quiz
**Arquivo:** `src/pages/EnemQuiz.tsx`

Adicionar botão de edição (ícone lápis) ao lado do nome do quiz que:
- Abre um dialog/input inline
- Permite editar `custom_name`
- Salva via `useEnemQuiz.renameQuiz(quizId, newName)`
- Atualiza a interface imediatamente

### 1.4 Hook para Renomear
**Arquivo:** `src/hooks/useEnemQuiz.ts`

Nova função:
```typescript
const renameQuiz = async (quizId: string, newName: string) => {
  await supabase
    .from('enem_quiz_metadata')
    .update({ custom_name: newName, updated_at: new Date().toISOString() })
    .eq('id', quizId);
}
```

### 1.5 Exibição do Nome
- Se `custom_name` existir: usar `custom_name`
- Senão: gerar nome padrão "{tema} - {data formatada}"

---

## 2. Histórico de Quizzes Aprimorado

### 2.1 Atualizar QuizHistory.tsx
**Arquivo:** `src/pages/QuizHistory.tsx`

- Exibir nome do quiz (custom_name ou nome gerado)
- Mostrar estatísticas resumidas: tentativas, melhor score
- Ordenar por data mais recente
- Filtros: por tema, por data, completos/pendentes

### 2.2 Seletor de Quiz na página EnemQuiz
**Arquivo:** `src/pages/EnemQuiz.tsx`

Melhorar o dropdown de seleção para exibir:
- Nome customizado (se existir)
- Ou nome padrão: "Quiz {tema} - {data}"
- Badge com quantidade de questões

---

## 3. Gamificação de Pontuação por Respostas

### 3.1 Sistema de XP
**Regras de pontuação:**
| Evento | XP |
|--------|-----|
| Resposta correta (objetiva) | +15 XP |
| Resposta correta (V/F) | +10 XP |
| Resposta incorreta | +2 XP (encorajamento) |
| Quiz concluído | +25 XP (bônus) |
| Quiz perfeito (100%) | +50 XP (bônus extra) |

### 3.2 Implementação no EnemQuizPlayer
**Arquivo:** `src/components/enem/EnemQuizPlayer.tsx`

No `handleConfirmAnswer`:
1. Verificar se resposta está correta
2. Calcular XP baseado no tipo de questão
3. Chamar `addXP(xpAmount, 'quiz_correct')` ou `addXP(xpAmount, 'quiz_incorrect')`
4. Mostrar feedback visual: toast com XP ganho

No `finishQuiz`:
1. Adicionar bônus de conclusão (+25 XP)
2. Se 100% de acertos: adicionar bônus perfeito (+50 XP extra)
3. Atualizar `daily_activities.quizzes_completed` e `quiz_correct_answers`

### 3.3 Hook de Gamificação
**Arquivo:** `src/hooks/useGameification.ts`

O hook já existe com:
- `addXP(amount, activityType)` 
- Activity types: 'quiz_correct', 'quiz_incorrect', 'quiz_complete', 'quiz_perfect'

### 3.4 Feedback Visual Durante o Quiz
**Arquivos:** 
- `src/components/enem/EnemObjectiveQuestion.tsx`
- `src/components/enem/EnemVFQuestion.tsx`
- `src/components/enem/EnemQuizPlayer.tsx`

Adicionar animação de XP ao confirmar resposta:
- Toast colorido: verde (+15 XP) ou amarelo (+2 XP)
- Contador de XP acumulado no header do quiz

### 3.5 Atualização do Banco de Dados
Na tabela `daily_activities`, já existem as colunas:
- `quizzes_completed` (integer)
- `quiz_correct_answers` (integer)
- `xp_earned` (integer)

Atualizar ao finalizar quiz:
```typescript
await supabase
  .from('daily_activities')
  .update({ 
    quizzes_completed: prev.quizzes_completed + 1,
    quiz_correct_answers: prev.quiz_correct_answers + correctCount,
    xp_earned: prev.xp_earned + totalXpEarned
  })
  .eq('user_id', userId)
  .eq('activity_date', today);
```

---

## 4. Arquivos a Serem Modificados

### Frontend
| Arquivo | Alteração |
|---------|-----------|
| `src/pages/EnemQuiz.tsx` | Adicionar botão de renomear, exibir nome customizado, integrar gamificação |
| `src/components/enem/EnemQuizPlayer.tsx` | Integrar XP por resposta, mostrar contador de XP, bônus ao finalizar |
| `src/pages/QuizHistory.tsx` | Exibir nomes customizados, melhorar estatísticas |
| `src/hooks/useEnemQuiz.ts` | Adicionar `renameQuiz()`, atualizar `EnemQuizMetadata` interface |
| `src/hooks/useGameification.ts` | Garantir activity types para quiz |
| `src/components/enem/EnemObjectiveQuestion.tsx` | (Já implementado) feedback visual |
| `src/components/enem/EnemVFQuestion.tsx` | (Já implementado) feedback visual |

### Backend
| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/generate-enem-quiz/index.ts` | Gerar nome padrão automaticamente |

### Banco de Dados
- Adicionar coluna `custom_name` em `enem_quiz_metadata`

---

## 5. Fluxo de Usuário Final

```text
1. Usuário gera quiz
   ↓
2. IA cria com nome automático: "História - 03/02/2026 13:35"
   ↓
3. Usuário pode renomear: "Quiz Chegada dos Portugueses"
   ↓
4. Ao responder cada questão:
   - Correta → +15 XP (objetiva) ou +10 XP (V/F)
   - Errada → +2 XP
   - Toast mostra XP ganho
   ↓
5. Ao finalizar quiz:
   - +25 XP bônus de conclusão
   - +50 XP extra se 100%
   - Atualiza estatísticas do dia
   ↓
6. Histórico mostra todos os quizzes com nomes personalizados
```

---

## 6. Interface do Renomear (Design)

Na página do quiz, ao lado do título:
```
[ Quiz ENEM 📝 ]  ← clicável
        ↓
[ Input: "Digite o nome..." ] [Salvar] [Cancelar]
```

Ou:
- Ícone de lápis ao lado do dropdown de seleção de quiz
- Ao clicar, transforma em input inline
- Enter para salvar, Escape para cancelar

---

## 7. Tipos TypeScript Atualizados

```typescript
// src/hooks/useEnemQuiz.ts
export interface EnemQuizMetadata {
  id: string;
  resumo_id: string;
  tema: string;
  custom_name: string | null; // NOVO
  // ... resto
}

// src/types/gamification.ts
export type ActivityType = 
  | 'flashcard' 
  | 'quiz_correct' 
  | 'quiz_incorrect'
  | 'quiz_perfect'    // Já existe
  | 'quiz_excellent'  // Já existe
  | 'quiz_good'       // Já existe
  | 'quiz_complete';  // Já existe
```

---

## Resultado Esperado

1. **Organização**: Usuário pode renomear quizzes para fácil identificação
2. **Nome automático inteligente**: Quizzes já vêm com nome "{tema} - {data}"
3. **Motivação**: XP por cada resposta incentiva engajamento
4. **Feedback instantâneo**: Toast mostra XP ganho em tempo real
5. **Progressão visível**: XP acumulado aparece durante e após o quiz
