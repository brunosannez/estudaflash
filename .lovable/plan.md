
# Correcao Completa do Painel Administrativo

## Problema Raiz Identificado

A analise dos logs do banco de dados revelou o erro exato:

**"structure of query does not match function result type"**

Isso significa que a funcao `get_all_users_admin()` retorna tipos de dados que nao correspondem exatamente ao que esta declarado no `RETURNS TABLE(...)`. Especificamente:

- O campo `email` em `auth.users` e do tipo `character varying` (varchar)
- A funcao declara `email text` no `RETURNS TABLE`
- PostgreSQL e estrito nessa comparacao e rejeita a execucao

## Solucao

### 1. Corrigir a funcao SQL `get_all_users_admin` (Migracao)

Recriar a funcao com casts explicitos `::text` em todos os campos que podem ter tipos ambiguos (especialmente `au.email`). Isso garante que cada coluna do SELECT corresponda exatamente ao tipo declarado no `RETURNS TABLE`.

Campos que precisam de cast explicito:
- `COALESCE(au.email, u.user_id::text)::text` - forcar para `text`
- `COALESCE(u.plano, 'free')::text` - garantir `text`
- `u.blocked_reason::text` - garantir `text`

### 2. Melhorar o tratamento de erro no frontend

**Arquivo**: `src/components/admin/UserManagement.tsx`

A tela de erro atual mostra apenas "Erro ao carregar usuarios." sem detalhes. Adicionar:
- Mensagem de erro detalhada vinda do servidor
- Botao "Tentar novamente" para recarregar
- Log do erro no console para depuracao

### 3. Adicionar botao de alterar plano na tabela de usuarios

**Arquivo**: `src/components/admin/UserManagement.tsx`

Atualmente a tabela mostra o plano mas nao permite alterar diretamente. Adicionar no dropdown de acoes:
- Opcao "Alterar Plano" que abre um selector para Free/Pro/EDU
- Usar a funcao `admin_change_user_plan_new` que ja existe no banco

---

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| Nova migracao SQL | Recriar `get_all_users_admin` com casts explicitos |
| `src/components/admin/UserManagement.tsx` | Melhorar erro + adicionar troca de plano |

## Detalhes Tecnicos

### SQL - Funcao Corrigida

```text
CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS TABLE(
  user_id uuid, 
  email text, 
  plano text, 
  uploads_realizados integer, 
  flashcards_gerados integer, 
  quizzes_realizados integer, 
  storage_mb numeric, 
  created_at timestamp with time zone, 
  is_admin boolean, 
  is_active boolean, 
  blocked_reason text, 
  blocked_at timestamp with time zone
)

SELECT:
  - u.user_id
  - COALESCE(au.email::text, u.user_id::text) AS email  -- cast explicito
  - COALESCE(u.plano, 'free')::text AS plano
  - COALESCE(u.uploads_realizados, 0)
  - COALESCE(u.flashcards_gerados, 0)
  - COALESCE(u.quizzes_realizados, 0)
  - COALESCE(subquery_storage, 0)::numeric
  - u.created_at
  - COALESCE(u.is_admin, false)
  - COALESCE(u.is_active, true)
  - u.blocked_reason::text  -- cast explicito
  - u.blocked_at

Owner: postgres (para acesso ao schema auth)
```

### UserManagement.tsx - Melhorias

1. **Tela de erro melhorada**: Mostrar mensagem do erro + botao "Tentar novamente" que chama `refetch()`
2. **Troca de plano inline**: No dropdown de acoes, adicionar item "Alterar Plano" com sub-opcoes Free/Pro/EDU. Usar `AdminUserService.changeUserPlan()` (que chama `admin_change_user_plan_new`). Precisa buscar os planos disponiveis via `usePlans` ou `supabase.from('plans').select()`.
