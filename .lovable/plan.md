

# Plano: Sistema de Badges e Conquistas

## Visão Geral

Implementar um sistema completo de badges/conquistas visuais que motive estudantes de 8-20 anos através de recompensas tangíveis por marcos de estudo.

## Arquitetura Existente

O projeto já possui:
- Tabela `user_badges` no Supabase
- Hook `useAdvancedBadges.ts` com lógica básica de premiação
- Componente `BadgeShowcaseEnhanced.tsx` (usado na página Social)
- Algumas verificações de badges por nível/streak/XP

## O Que Falta Implementar

1. **Badges para Atividades Específicas** - Primeiro resumo, primeiro quiz, etc.
2. **Verificação Automática** - Integrar com fluxos de criação/completar tarefas
3. **Exibição no Dashboard** - Mostrar badges recentes e próximas
4. **Vitrine na Página de Progresso** - Coleção completa do usuário
5. **Animações de Conquista** - Celebração visual ao ganhar badge

---

## Definição de Badges (20 Conquistas)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ CATEGORIA: PRIMEIROS PASSOS (Common)                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🌱 Primeiro Upload    │ Fez seu primeiro upload de material                │
│ 📝 Primeiro Resumo    │ Gerou seu primeiro resumo de estudos               │
│ 🧠 Primeiro Quiz      │ Completou seu primeiro quiz ENEM                   │
│ 💡 Primeiro Flash     │ Revisou seu primeiro flashcard                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ CATEGORIA: MEMÓRIA DE ELEFANTE - Flashcards (Rare)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🐘 Memória de Elefante│ 100 flashcards corretos                            │
│ 🎯 Precisão Total     │ 10 sessões de flashcard com 100% de acerto         │
│ 📚 Leitor Voraz       │ 500 flashcards revisados no total                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ CATEGORIA: MESTRE DO QUIZ (Rare/Epic)                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ ⚡ Velocista          │ Quiz completo em menos de 2 minutos                │
│ 🎯 Atirador Certeiro  │ 100% de acerto em 5 quizzes                        │
│ 📖 Estudioso          │ 25 quizzes completados                             │
│ 🏆 Mestre do Quiz     │ 100 quizzes completados                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ CATEGORIA: STREAK E CONSTÂNCIA (Epic/Legendary)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ ✨ Primeira Semana    │ 7 dias de streak                                   │
│ 🔥 Fogo Eterno        │ 30 dias de streak consecutivos                     │
│ 💎 Diamante           │ 100 dias de streak consecutivos                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ CATEGORIA: XP E NÍVEIS (Common/Rare/Epic/Legendary)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ ⭐ Estudante Dedicado │ Alcançou nível 5                                   │
│ 🎓 Acadêmico          │ Alcançou nível 10                                  │
│ 👑 Mestre dos Estudos │ Alcançou nível 25                                  │
│ 💰 Colecionador XP    │ 1.000 XP acumulados                                │
│ 💯 Especialista       │ 10.000 XP acumulados                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ CATEGORIA: HORÁRIOS ESPECIAIS (Seasonal)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ ☀️ Madrugador         │ Estudou antes das 7h da manhã                       │
│ 🌙 Coruja             │ Estudou depois das 22h                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Arquivos a Criar/Modificar

### 1. NOVO: Catálogo de Badges
**Arquivo:** `src/data/badgesCatalog.ts`

Define todos os badges disponíveis com suas condições e metadados.

### 2. NOVO: Componente de Vitrine de Badges para Progresso
**Arquivo:** `src/components/progress/ProgressBadgesCard.tsx`

Card compacto mostrando:
- Badges recentes conquistadas
- Próximo badge a conquistar
- Link para vitrine completa

### 3. NOVO: Componente de Animação de Badge
**Arquivo:** `src/components/badges/BadgeUnlockAnimation.tsx`

Modal/overlay com animação quando o usuário conquista um badge.

### 4. MODIFICAR: Hook de Badges
**Arquivo:** `src/hooks/useAdvancedBadges.ts`

Adicionar:
- Todos os 20 badges definidos
- Verificações específicas (flashcards, quizzes, horários)
- Função para buscar próximo badge disponível
- Integração com dados de resumos e uploads

### 5. MODIFICAR: Página de Progresso
**Arquivo:** `src/pages/MyProgress.tsx`

Adicionar seção de badges conquistadas.

### 6. MODIFICAR: Dashboard Principal
**Arquivo:** `src/pages/Index.tsx`

Adicionar mini-vitrine de badges recentes.

### 7. MODIFICAR: Fluxos de Atividade
**Arquivos:**
- `src/hooks/flashcard-study/useFlashcardActions.ts` - Verificar badges de flashcard
- `src/hooks/useEnemQuiz.ts` - Verificar badges de quiz
- `src/services/summaryGenerationService.ts` - Verificar badge de primeiro resumo

---

## Fluxo de Verificação de Badges

```text
Usuário completa atividade
         │
         ▼
┌─────────────────────────────┐
│  Ação concluída:            │
│  - Flashcard revisado       │
│  - Quiz completado          │
│  - Resumo gerado            │
│  - Login (verificar streak) │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  checkBadgesForActivity()   │
│  - Verifica condições       │
│  - Busca badges não ganhos  │
│  - Compara com requisitos   │
└─────────────────────────────┘
         │
         ▼
   ┌─────┴─────┐
   │           │
 Qualifica  Não qualifica
   │           │
   ▼           ▼
┌────────┐  [Retorna]
│ Award  │
│ Badge  │
└────────┘
   │
   ▼
┌─────────────────────────────┐
│  Mostrar Animação           │
│  + Toast de celebração      │
│  + Som (opcional)           │
└─────────────────────────────┘
```

---

## Detalhes de Implementação

### 1. Catálogo de Badges (`src/data/badgesCatalog.ts`)

```typescript
export interface BadgeDefinition {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'achievement' | 'social' | 'seasonal' | 'collaborative';
  requirement: {
    metric: string;
    value: number;
    comparator: 'gte' | 'eq' | 'lte';
  };
  // Descrição amigável para crianças
  kidFriendlyDescription: string;
}

export const BADGES_CATALOG: BadgeDefinition[] = [
  {
    id: 'first_upload',
    type: 'first_upload',
    name: 'Primeiro Upload',
    description: 'Fez seu primeiro upload de material',
    kidFriendlyDescription: 'Você mandou seu primeiro arquivo! 📄',
    icon: '🌱',
    rarity: 'common',
    category: 'achievement',
    requirement: { metric: 'uploads_count', value: 1, comparator: 'gte' }
  },
  // ... outros 19 badges
];
```

### 2. Componente de Vitrine (`src/components/progress/ProgressBadgesCard.tsx`)

- Grid 3x2 com badges recentes
- Badge "próximo a conquistar" com barra de progresso
- Botão "Ver todas" que abre modal com BadgeShowcaseEnhanced
- Design kid-friendly com cores vibrantes

### 3. Animação de Conquista (`src/components/badges/BadgeUnlockAnimation.tsx`)

- Modal overlay com confetti
- Badge grande no centro
- Animação de "pop" com framer-motion
- Som opcional (toggle nas configurações)
- Auto-dismiss após 3 segundos

### 4. Integração com Atividades

**Em `useFlashcardActions.ts`:**
```typescript
// Após cada resposta correta
if (remembered) {
  await checkBadgesForActivity('flashcard_correct', stats.totalCorrect);
}
```

**Em `useEnemQuiz.ts`:**
```typescript
// Após completar quiz
await checkBadgesForActivity('quiz_complete', {
  total: stats.totalQuizzes,
  perfect: stats.perfectQuizzes,
  duration: elapsedTime
});
```

---

## Design Visual (Kid-Friendly)

### Cores por Raridade

```text
┌────────────┬───────────────────────────────────────┐
│ Raridade   │ Estilo                                │
├────────────┼───────────────────────────────────────┤
│ Common     │ bg-gray-100 border-gray-300           │
│ Rare       │ bg-blue-50 border-blue-400            │
│ Epic       │ bg-purple-50 border-purple-400        │
│ Legendary  │ bg-gradient-to-r from-yellow-100      │
│            │ to-amber-100 border-yellow-400        │
│            │ + glow effect                         │
└────────────┴───────────────────────────────────────┘
```

### Layout do Card de Badge

```text
┌─────────────────────────────────────────────────────┐
│  🏆 Minhas Conquistas                    [Ver mais] │
├─────────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │  🌱  │  │  📝  │  │  ✨  │  │  ⭐  │  │  🔒  │  │
│  │      │  │      │  │      │  │      │  │      │  │
│  │Primei│  │Primei│  │Semana│  │Nível │  │??????│  │
│  │ ro   │  │ro    │  │ de   │  │  5   │  │      │  │
│  │Upload│  │Resumo│  │Fogo  │  │      │  │      │  │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  📍 Próxima conquista:                              │
│  🐘 Memória de Elefante (100 flashcards corretos)  │
│  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 67/100      │
└─────────────────────────────────────────────────────┘
```

---

## Resultado Final

1. **20 badges** organizados por categoria e raridade
2. **Verificação automática** integrada aos fluxos existentes
3. **Exibição no Dashboard** com badges recentes
4. **Seção completa** na página de Progresso
5. **Animação celebrativa** ao conquistar nova badge
6. **Linguagem kid-friendly** em todas as descrições
7. **Design gamificado** com cores por raridade

---

## Ordem de Implementação

1. Criar catálogo de badges (`badgesCatalog.ts`)
2. Expandir hook `useAdvancedBadges.ts` com novas verificações
3. Criar componente `ProgressBadgesCard.tsx`
4. Criar componente `BadgeUnlockAnimation.tsx`
5. Integrar vitrine na página de Progresso
6. Adicionar mini-vitrine no Dashboard
7. Conectar verificações aos fluxos de atividade

