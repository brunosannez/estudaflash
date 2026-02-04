

# Plano: Auditoria e Aprimoramento do Painel Administrativo

## Status Atual - Análise Completa

### Funcionalidades Existentes

| Área | Status | Observações |
|------|--------|-------------|
| **Dashboard Geral** | Parcial | AdminDashboard.tsx passa valores fixos (0) para AdminStatsGrid |
| **Gerenciamento de Usuários** | Funcional | Lista usuários, filtra por plano, busca por email |
| **Ações de Usuário** | Parcial | Toggle status usa `is_admin` ao invés de campo de status real |
| **Gerenciamento de Planos** | Funcional | CRUD completo, edição inline, ativar/desativar |
| **Monitoramento de APIs** | Funcional | Gráficos, custos, tokens por provedor |
| **Analytics de Uso** | Funcional | Uso diário, exportação CSV, filtros por data |
| **Gerenciamento de Dados** | Funcional | Storage, real-time, limpeza |
| **Auditoria de Acesso** | Funcional | Logs de acesso a dados sensíveis (CPF) |
| **Segurança** | Funcional | Rotação de chaves, rate limiting |
| **Assinaturas** | Não existe | Tabela existe mas sem componente |
| **Bloqueio por Inadimplência** | Não existe | Falta campo e lógica |
| **Alterar Plano do Usuário** | Parcial | Falta UI no UserManagement |

---

## Problemas Identificados

### 1. AdminDashboard não carrega dados reais

```typescript
// AdminDashboard.tsx (linha 7-10)
<AdminStatsGrid 
  totalUsers={0}        // ← Valor fixo!
  totalStorageMB={0}    // ← Valor fixo!
  activeUsers7Days={0}  // ← Valor fixo!
/>
```

**Problema**: AdminDashboard não usa o AdminStatsService para carregar dados, passa sempre 0.

**Solução**: O AdminStatsGrid já carrega dados internamente via `fetchStats()`, mas os props não são usados quando os dados são carregados. A lógica está correta, apenas os props iniciais são confusos.

### 2. Toggle de Status do Usuário Incorreto

```typescript
// UserManagement.tsx (linha 259-273)
<Button onClick={() => handleToggleUserStatus(user.user_id, !user.is_admin)}>
  {user.is_admin ? 'Desativar' : 'Ativar'}
</Button>
```

**Problema**: O botão "Ativar/Desativar" usa `is_admin` ao invés de um campo `is_active`. A função `admin_toggle_user_status` espera um campo de status, não admin.

**Solução**: Criar campo `is_active` na tabela `uso_usuarios` ou ajustar a lógica para usar corretamente.

### 3. Falta Gerenciamento de Assinaturas

A tabela `subscriptions` existe no banco mas não há componente para visualizá-la.

**Tabela existente:**
- user_id, plan_id, amount_paid_brl, start_date, renewal_date, status, payment_method

### 4. Falta Função de Bloqueio por Inadimplência

Não existe campo nem lógica para bloquear usuário por falta de pagamento.

### 5. Falta Opção de Alterar Plano Diretamente no UserManagement

A tabela de usuários mostra o plano atual mas não permite alterá-lo inline.

### 6. Falta Real-Time no Painel Admin

Os componentes usam `refetchInterval` (polling) ao invés de real-time do Supabase.

---

## Plano de Implementação

### Fase 1: Corrigir Problemas Existentes

#### 1.1 Adicionar campo `is_active` e lógica de bloqueio

**Arquivo:** Nova migration SQL

```sql
-- Adicionar campo de status ativo
ALTER TABLE uso_usuarios ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE uso_usuarios ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
ALTER TABLE uso_usuarios ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE;
```

#### 1.2 Corrigir UserManagement.tsx

- Adicionar coluna "Status" na tabela
- Corrigir botão Ativar/Desativar para usar `is_active`
- Adicionar botão "Bloquear" com motivo (inadimplência, etc)
- Adicionar dropdown para alterar plano do usuário
- Adicionar botão "Ver Detalhes" que abre o modal existente

#### 1.3 Corrigir AdminDashboard.tsx

- Remover props hardcoded
- Deixar AdminStatsGrid buscar dados sozinho (já faz isso)

---

### Fase 2: Adicionar Gerenciamento de Assinaturas

#### 2.1 Criar SubscriptionManagement.tsx

Novo componente com:
- Lista de assinaturas ativas
- Filtros por status (active, canceled, pending)
- Valor total de receita
- Próximas renovações
- Ações: cancelar, estender, alterar plano

#### 2.2 Adicionar aba "Assinaturas" no AdminPanel

```typescript
<TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
<TabsContent value="subscriptions">
  <SubscriptionManagement />
</TabsContent>
```

---

### Fase 3: Implementar Real-Time para Admin

#### 3.1 Criar useAdminRealTime.ts

Hook centralizado para monitorar mudanças em:
- uso_usuarios (novos usuários, alterações)
- subscriptions (novas assinaturas, cancelamentos)
- api_usage_tracking (uso de API)
- uploads (novos uploads)

#### 3.2 Integrar no AdminDashboard

Callbacks para atualizar estatísticas automaticamente.

---

### Fase 4: Funcionalidades Adicionais

#### 4.1 Exportação de Dados

- Exportar lista de usuários (CSV)
- Exportar relatório de receita (CSV)
- Exportar logs de API (CSV)

#### 4.2 Alertas e Notificações

- Alerta quando usuário está próximo do limite
- Alerta de renovação de assinatura
- Alerta de uso anormal de API

#### 4.3 Gráficos de Receita

- MRR (Monthly Recurring Revenue)
- Crescimento de usuários
- Churn rate

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/components/admin/SubscriptionManagement.tsx` | Gerenciar assinaturas |
| `src/components/admin/UserBlockModal.tsx` | Modal para bloquear usuário |
| `src/components/admin/ChangePlanModal.tsx` | Modal para alterar plano |
| `src/components/admin/AdminRevenueStats.tsx` | Estatísticas de receita |
| `src/hooks/admin/useAdminRealTime.ts` | Real-time para admin |
| `src/services/subscriptionService.ts` | Serviço de assinaturas |

---

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/pages/AdminPanel.tsx` | Adicionar aba Assinaturas, reorganizar tabs |
| `src/components/admin/AdminDashboard.tsx` | Adicionar cards de receita, real-time |
| `src/components/admin/UserManagement.tsx` | Botão bloquear, alterar plano, status correto |
| `src/services/adminUserService.ts` | Adicionar métodos blockUser, unblockUser |
| `supabase/migrations/` | Nova migration para campos de bloqueio |

---

## Detalhes Técnicos

### Nova Estrutura do UserManagement

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Gerenciamento de Usuários                              [🔍 Buscar] [Filtro] │
├─────────────────────────────────────────────────────────────────────────────┤
│ Usuário          │ Plano │ Status   │ Uploads │ Criado em │ Ações          │
├──────────────────┼───────┼──────────┼─────────┼───────────┼────────────────┤
│ user@email.com   │ Pro   │ ✅ Ativo │   15    │ 01/01/25  │ [▼ Ações]      │
│  └ Admin         │       │          │         │           │  ├ Ver detalhes│
│                  │       │          │         │           │  ├ Alterar plano│
│                  │       │          │         │           │  ├ Resetar uso │
│                  │       │          │         │           │  ├ Bloquear    │
│                  │       │          │         │           │  └ Excluir dados│
├──────────────────┼───────┼──────────┼─────────┼───────────┼────────────────┤
│ outro@email.com  │ Free  │ ⛔ Bloq. │    3    │ 15/01/25  │ [▼ Ações]      │
│                  │       │ (pag.)   │         │           │  ├ Desbloquear │
│                  │       │          │         │           │  ├ ...         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Componente SubscriptionManagement

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Assinaturas                                [Ativas ▼] [Este Mês ▼]          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Ativas     │  │ Receita    │  │ Canceladas │  │ MRR        │            │
│  │    24      │  │ R$ 1.250   │  │     3      │  │ R$ 890     │            │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘            │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ Usuário        │ Plano    │ Valor    │ Início   │ Renovação  │ Status     │
├────────────────┼──────────┼──────────┼──────────┼────────────┼────────────┤
│ user@email.com │ Pro      │ R$ 29,90 │ 01/01/25 │ 01/02/25   │ ✅ Ativo   │
│ test@email.com │ Edu      │ R$ 59,90 │ 15/01/25 │ 15/02/25   │ ✅ Ativo   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Resultado Final

Após implementação, o painel administrativo terá:

1. **Dashboard Completo** - Estatísticas em tempo real, receita, crescimento
2. **Gerenciamento de Usuários Avançado** - Bloquear, alterar plano, ver detalhes
3. **Gerenciamento de Assinaturas** - Visualizar, cancelar, estender
4. **Bloqueio por Inadimplência** - Campo e UI para bloquear/desbloquear
5. **Real-Time** - Atualizações instantâneas sem refresh
6. **Exportação** - CSV de usuários, receita, logs
7. **Alertas** - Notificações de eventos importantes

---

## Ordem de Implementação

1. Criar migration para campos `is_active`, `blocked_reason`, `blocked_at`
2. Atualizar `get_all_users_admin` para retornar novos campos
3. Corrigir UserManagement.tsx (toggle status, dropdown plano)
4. Criar SubscriptionManagement.tsx
5. Adicionar aba Assinaturas no AdminPanel
6. Criar useAdminRealTime.ts
7. Integrar real-time nos componentes
8. Adicionar exportação CSV
9. Adicionar cards de receita no Dashboard

