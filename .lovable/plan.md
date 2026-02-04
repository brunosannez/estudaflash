

# Plano: Integração de Badges nos Fluxos de Quiz, Resumo e Upload

## Objetivo

Conectar o sistema de badges existente (`useAdvancedBadges`) aos fluxos de atividade para que a verificação automática de conquistas ocorra sempre que o usuário completar ações importantes.

---

## Status Atual

### Já Implementado
- Catálogo com 22 badges em `src/data/badgesCatalog.ts`
- Hook `useAdvancedBadges` com `checkBadgesForActivity()` e `awardBadge()`
- Animação de desbloqueio `BadgeUnlockAnimation.tsx`
- Vitrines de badges no Dashboard e Progresso
- Integração parcial no fluxo de Flashcards

### Faltando Integrar
1. **Quiz ENEM** - Quando o usuário finaliza um quiz
2. **Resumos** - Quando um resumo é gerado com sucesso
3. **Uploads** - Quando um upload é processado com sucesso

---

## Arquivos a Modificar

### 1. `src/components/enem/EnemQuizPlayer.tsx`
**Linha de integração:** Após a linha 254 (após adicionar XP de conclusão)

**Mudanças:**
- Importar `useAdvancedBadges`
- Chamar `checkBadgesForActivity('quiz')` no `finishQuiz()`
- Passar dados de performance (tempo, acertos) para verificar badges como "Velocista"

### 2. `src/hooks/useSummary.ts`
**Linha de integração:** Após a linha 40 (após incrementar uso)

**Mudanças:**
- Importar `useAdvancedBadges`
- Chamar `checkBadgesForActivity('summary')` após gerar resumo com sucesso

### 3. `src/hooks/useMultipleUpload.ts`
**Linha de integração:** Após a linha 128 (após incrementar contador de uso)

**Mudanças:**
- Importar `useAdvancedBadges`
- Chamar `checkBadgesForActivity('upload')` após upload bem-sucedido

### 4. `src/hooks/useAdvancedBadges.ts`
**Melhorias na lógica de métricas:**

**Problema atual:** A métrica `summaries_count` busca resumos pelo `upload_id` incorretamente (linha 137)

**Correção:**
- Modificar a query para buscar resumos corretamente pelo `user_id`
- Adicionar verificação de badges de tempo (early_study, night_study) baseada na hora atual

---

## Fluxo de Integração

```text
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE QUIZ ENEM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Usuário finaliza quiz                                         │
│          │                                                      │
│          ▼                                                      │
│   finishQuiz() calcula:                                         │
│   - correctCount                                                │
│   - timeElapsed                                                 │
│   - percentage (100% = perfeito)                                │
│          │                                                      │
│          ▼                                                      │
│   checkBadgesForActivity('quiz', {                              │
│     isCompleted: true,                                          │
│     isPerfect: percentage === 100,                              │
│     isFast: timeElapsed < 120 // menos de 2 min                 │
│   })                                                            │
│          │                                                      │
│          ▼                                                      │
│   Badges possíveis:                                             │
│   - first_quiz (primeiro quiz)                                  │
│   - speedster (quiz rápido)                                     │
│   - sharpshooter (quiz perfeito)                                │
│   - studious (25 quizzes)                                       │
│   - quiz_master (100 quizzes)                                   │
│   - early_bird/night_owl (horário)                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE RESUMO                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   summaryGenerationService.generateSummary()                    │
│          │                                                      │
│          ▼                                                      │
│   Resumo salvo no banco                                         │
│          │                                                      │
│          ▼                                                      │
│   useSummary.generateSummary() retorna                          │
│          │                                                      │
│          ▼                                                      │
│   checkBadgesForActivity('summary')                             │
│          │                                                      │
│          ▼                                                      │
│   Badges possíveis:                                             │
│   - first_summary (primeiro resumo)                             │
│   - early_bird/night_owl (horário)                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE UPLOAD                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   useMultipleUpload.uploadMultipleImages()                      │
│          │                                                      │
│          ▼                                                      │
│   Imagens processadas e salvas                                  │
│          │                                                      │
│          ▼                                                      │
│   incrementUsage('uploads')                                     │
│          │                                                      │
│          ▼                                                      │
│   checkBadgesForActivity('upload')                              │
│          │                                                      │
│          ▼                                                      │
│   Badges possíveis:                                             │
│   - first_upload (primeiro upload)                              │
│   - early_bird/night_owl (horário)                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detalhes Técnicos

### 1. Modificação no EnemQuizPlayer.tsx

```typescript
// Adicionar import
import { useAdvancedBadges } from '@/hooks/useAdvancedBadges';

// Dentro do componente
const { checkBadgesForActivity } = useAdvancedBadges();

// Em finishQuiz(), após salvar a sessão:
await checkBadgesForActivity('quiz', {
  isPerfect: percentage === 100,
  isFast: timeElapsed < 120
});
```

### 2. Modificação no useSummary.ts

```typescript
// Adicionar import
import { useAdvancedBadges } from '@/hooks/useAdvancedBadges';

// Dentro do hook
const { checkBadgesForActivity } = useAdvancedBadges();

// Após incrementUsage('summaries'):
await checkBadgesForActivity('summary');
```

### 3. Modificação no useMultipleUpload.ts

```typescript
// Adicionar import
import { useAdvancedBadges } from '@/hooks/useAdvancedBadges';

// Dentro do hook
const { checkBadgesForActivity } = useAdvancedBadges();

// Após incrementUsage('uploads'):
await checkBadgesForActivity('upload');
```

### 4. Correção no useAdvancedBadges.ts

```typescript
// Linha 137 - Corrigir query de resumos
// DE:
const resumosData = await supabase.from('resumos').select('id, upload_id').eq('upload_id', user.id);

// PARA:
const resumosData = await supabase.from('resumos').select('id').eq('user_id', user.id);
```

---

## Badges que Serão Verificados por Fluxo

| Fluxo | Badges Verificados |
|-------|-------------------|
| **Upload** | first_upload, early_bird, night_owl |
| **Resumo** | first_summary, early_bird, night_owl |
| **Quiz** | first_quiz, speedster, sharpshooter, studious, quiz_master, early_bird, night_owl |
| **Flashcard** | first_flashcard, elephant_memory, perfect_accuracy, voracious_reader, early_bird, night_owl |
| **Login/Streak** | first_week, eternal_fire, diamond, level_5/10/25, xp_1000/10000 |

---

## Comportamento Esperado

1. **Usuário faz primeiro upload** → Recebe badge "Primeiro Upload" 🌱
2. **Usuário gera primeiro resumo** → Recebe badge "Primeiro Resumo" 📝
3. **Usuário completa primeiro quiz** → Recebe badge "Primeiro Quiz" 🧠
4. **Usuário completa quiz em menos de 2 min** → Recebe badge "Velocista" ⚡
5. **Usuário gabarita quiz** → Progresso para "Atirador Certeiro" 🎯
6. **Usuário estuda após 22h** → Recebe badge "Coruja" 🌙

Cada badge desbloqueado mostrará:
- Toast de celebração com nome e descrição kid-friendly
- Animação overlay com confetti (BadgeUnlockAnimation)
- Atualização automática nas vitrines do Dashboard e Progresso

---

## Resultado Final

Após esta integração:
- **100% dos fluxos de atividade** verificarão badges automaticamente
- Sistema de gamificação **completamente funcional**
- Usuários receberão feedback imediato de conquistas
- Motivação aumentada para continuar estudando

