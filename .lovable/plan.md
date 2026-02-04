

# Plano: Consolidação Real-Time e Status do Aplicativo

## Status Atual do Aplicativo

### ✅ Funcionalidades Completas
1. **Sistema de Badges** - 22 conquistas com verificação automática
2. **Gamificação** - XP, níveis, streaks funcionando
3. **Missões Diárias** - Dashboard com missões de flashcards e quizzes
4. **Integração de Badges** - Quiz, Resumo, Upload e Flashcards conectados
5. **Animação de Conquistas** - BadgeUnlockAnimation com confetti
6. **Vitrines de Badges** - Dashboard e página de Progresso

### ⚠️ Real-Time Parcialmente Implementado

O projeto já possui infraestrutura de real-time, mas nem todas as tabelas estão sendo monitoradas:

**Tabelas COM real-time:**
- `user_progress` (useProgressSubscriptions)
- `daily_activities` (useProgressSubscriptions)
- `quiz_sessions` (useRealTimeSubscriptions)
- `flashcard_reviews` (useRealTimeSubscriptions)
- `resumos` (useRealTimeSubscriptions - sem filtro de usuário)

**Tabelas SEM real-time:**
- `user_badges` - Badges não atualizam automaticamente
- `uso_usuarios` - Contadores de uso não atualizam em tempo real
- `enem_quiz_sessions` - Quiz ENEM não monitora mudanças
- `uploads` - Uploads não disparam atualização

---

## Problema Principal

Quando o usuário ganha um badge ou completa uma atividade, os componentes que mostram essas informações não atualizam automaticamente. É preciso recarregar a página para ver as mudanças.

---

## Solução: Hook Centralizado de Real-Time

Criar um hook unificado que monitore TODAS as tabelas relevantes e dispare callbacks apropriados para cada tipo de dado.

---

## Arquivos a Criar/Modificar

### 1. NOVO: Hook Unificado de Real-Time
**Arquivo:** `src/hooks/realtime/useUnifiedRealTime.ts`

Centraliza todas as subscrições em um único hook:
- Monitora `user_badges` para atualizar vitrines
- Monitora `uso_usuarios` para atualizar estatísticas
- Monitora `enem_quiz_sessions` para quiz ENEM
- Reutiliza lógica existente de progress/activities

### 2. MODIFICAR: Hook de Badges
**Arquivo:** `src/hooks/useAdvancedBadges.ts`

Adicionar subscrição real-time para `user_badges`:
- Quando um badge é inserido, atualizar lista local
- Disparar animação automaticamente

### 3. MODIFICAR: Hook de Uso
**Arquivo:** `src/hooks/useUsageData.ts`

Adicionar subscrição real-time para `uso_usuarios`:
- Quando contadores mudam, atualizar UI automaticamente
- Útil para quando múltiplas abas estão abertas

### 4. MODIFICAR: Dashboard Principal
**Arquivo:** `src/pages/Index.tsx`

Integrar hook unificado para garantir que todos os componentes recebam atualizações.

---

## Arquitetura do Real-Time

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                     useUnifiedRealTime (NOVO)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │   user_badges       │  │   uso_usuarios      │  │  enem_quiz_sessions │  │
│  │   INSERT → animate  │  │   UPDATE → refresh  │  │   INSERT → refresh  │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
│                                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │   user_progress     │  │   daily_activities  │  │   flashcard_reviews │  │
│  │   * → refresh       │  │   * → refresh       │  │   * → refresh       │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │        Callbacks              │
                    │  - onBadgeEarned()            │
                    │  - onUsageChanged()           │
                    │  - onProgressChanged()        │
                    │  - onQuizCompleted()          │
                    └───────────────────────────────┘
```

---

## Código do Hook Unificado

```typescript
// src/hooks/realtime/useUnifiedRealTime.ts

interface RealTimeCallbacks {
  onBadgeEarned?: () => void;
  onUsageChanged?: () => void;
  onProgressChanged?: () => void;
  onActivityChanged?: () => void;
}

export const useUnifiedRealTime = (callbacks: RealTimeCallbacks) => {
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`unified-realtime-${user.id}`)
        // Badges
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${user.id}`
        }, () => {
          console.log('🏆 New badge earned!');
          callbacks.onBadgeEarned?.();
        })
        // Usage
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'uso_usuarios',
          filter: `user_id=eq.${user.id}`
        }, () => {
          console.log('📊 Usage updated');
          callbacks.onUsageChanged?.();
        })
        // Progress
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${user.id}`
        }, () => {
          callbacks.onProgressChanged?.();
        })
        // Daily activities
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'daily_activities',
          filter: `user_id=eq.${user.id}`
        }, () => {
          callbacks.onActivityChanged?.();
        })
        .subscribe();
    };

    setup();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [callbacks]);
};
```

---

## Modificações no useAdvancedBadges

Adicionar subscrição para atualizar badges automaticamente:

```typescript
// Dentro do useAdvancedBadges

useEffect(() => {
  if (!user) return;
  
  const channel = supabase
    .channel(`badges-${user.id}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'user_badges',
      filter: `user_id=eq.${user.id}`
    }, (payload) => {
      console.log('🏆 Real-time: New badge detected');
      loadUserBadges(); // Refresh badges list
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user, loadUserBadges]);
```

---

## Modificações no useUsageData

Adicionar subscrição para atualizar contadores:

```typescript
// Dentro do useUsageData

useEffect(() => {
  if (!user) return;
  
  const channel = supabase
    .channel(`usage-${user.id}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'uso_usuarios',
      filter: `user_id=eq.${user.id}`
    }, () => {
      console.log('📊 Real-time: Usage updated');
      fetchUsageData();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user, fetchUsageData]);
```

---

## Resultado Final

Após implementação:

1. **Badges em tempo real** - Vitrine atualiza automaticamente ao ganhar conquista
2. **Contadores em tempo real** - Dashboard mostra números atualizados
3. **Progresso sincronizado** - XP, nível e streak atualizam imediatamente
4. **Missões dinâmicas** - Progresso das missões atualiza conforme atividade
5. **Multi-tab sync** - Múltiplas abas do navegador ficam sincronizadas

---

## O Aplicativo Já Está Funcional?

**SIM**, o aplicativo já está funcional! As funcionalidades principais estão implementadas:

- Upload de materiais
- Geração de resumos com AI
- Criação de flashcards automáticos
- Quiz ENEM com questões inteligentes
- Sistema de gamificação completo
- Badges e conquistas

**O que falta é refinamento:**
1. Real-time para badges e contadores (este plano)
2. Mais tipos de questão no Quiz (drag-and-drop, associação)
3. Modo simulado ENEM com timer
4. Algoritmo SM-2 completo nos flashcards
5. Breadcrumbs de navegação

---

## Ordem de Implementação

1. Criar `useUnifiedRealTime.ts`
2. Adicionar real-time ao `useAdvancedBadges.ts`
3. Adicionar real-time ao `useUsageData.ts`
4. Testar sincronização em tempo real
5. Remover hooks duplicados (cleanup)

