
# Plano de Correcoes: Admin, 404, e Acesso ao Plano

## Problemas Identificados

### Problema 1: Erro 404 em algumas paginas (publicado)
A pagina 404 aparece no site publicado (`estudaflash.lovable.app`) ao acessar rotas diretamente (por exemplo, `/my-summaries`). Isso e um problema classico de SPAs (Single Page Applications): o servidor tenta buscar um arquivo fisico para a rota, mas como tudo e gerenciado pelo React Router no navegador, ele retorna 404. No ambiente de preview do Lovable isso ja e tratado automaticamente, mas no site publicado pode ocorrer se o service worker (`sw.js`) estiver cacheando respostas incorretas ou se a navegacao nao estiver usando o React Router corretamente.

**Causa raiz**: O service worker (`sw.js`) nao tem logica de fallback para rotas SPA. Quando o usuario acessa uma rota como `/my-summaries` diretamente, o SW tenta buscar no cache ou na rede, e se nao encontrar, nao redireciona para `index.html`.

**Solucao**: Atualizar o service worker para incluir um fallback de navegacao que retorna `/index.html` para requisicoes de navegacao (tipo `navigate`). Isso garante que o React Router assuma o controle.

### Problema 2: Painel Admin nao carrega usuarios ("Erro ao carregar usuarios")
A funcao RPC `get_all_users_admin` esta corretamente configurada como `SECURITY DEFINER` e verifica se o usuario e admin via `is_current_user_admin()`. A funcao existe e a logica esta correta.

**Causa provavel**: O usuario admin (`cfef2417-fa37-4b91-a351-6c8fde933658` / `brunosannez@hotmail.com`) tem `is_admin = true` no banco. A funcao `is_current_user_admin` verifica esse campo. O erro pode estar vindo de:
- A funcao `get_all_users_admin` faz `LEFT JOIN auth.users` que requer privilegios especiais. Embora seja `SECURITY DEFINER`, o owner da funcao precisa ter acesso a `auth.users`.
- Possivel problema de tipagem entre o que a funcao retorna e o que o TypeScript espera.

**Solucao**: Recriar a funcao `get_all_users_admin` garantindo que o owner seja o `postgres` (superuser) para poder acessar `auth.users`. Tambem adicionar melhor tratamento de erro no frontend com logs mais detalhados.

### Problema 3: Usuario Free nao ve opcao de trocar/assinar plano
Atualmente, nao existe NENHUM link ou botao para `/choose-plan` acessivel no app para usuarios ja logados. A unica forma de chegar la e:
- Via redirect do Google OAuth (novo cadastro)
- Digitando a URL manualmente

O dashboard mostra o plano atual ("Free") mas nao oferece acao para mudar.

**Solucao**: Adicionar multiplos pontos de acesso a pagina `/choose-plan`:
1. No menu lateral (navegacao principal), adicionar item "Meu Plano"
2. No card de plano do dashboard (que mostra "Free"), tornar clicavel com botao "Fazer Upgrade"
3. No `UpgradeModal`, adicionar opcao de navegar para `/choose-plan` alem do Stripe checkout

---

## Mudancas Planejadas

### 1. Corrigir Service Worker para SPA routing

**Arquivo**: `public/sw.js`

Adicionar logica de navigation fallback: quando o SW intercepta uma requisicao do tipo `navigate` (o usuario digitou uma URL ou atualizou a pagina), retornar o `index.html` do cache em vez de tentar buscar o arquivo da rota.

### 2. Recriar funcao admin com melhor tratamento de erro

**Migracao SQL**: Recriar `get_all_users_admin` com `SET search_path = public` e garantir ownership correto. Adicionar tratamento para caso o JOIN com `auth.users` falhe.

### 3. Adicionar link "Meu Plano" na navegacao

**Arquivo**: `src/components/navigation/MainNavigation.tsx`

Adicionar item de navegacao "Meu Plano" com icone `Crown` que aponta para `/choose-plan`. Ficara visivel para todos os usuarios logados.

### 4. Tornar card de plano do dashboard clicavel

**Arquivo**: `src/components/dashboard/DashboardUsageOverview.tsx`

No card que mostra o plano atual ("Free"), adicionar botao/link "Fazer Upgrade" ou "Mudar Plano" que navega para `/choose-plan`.

### 5. Atualizar UpgradeModal com opcao de ver planos

**Arquivo**: `src/components/usage/UpgradeModal.tsx`

Adicionar botao "Ver todos os planos" que navega para `/choose-plan`, como alternativa ao checkout direto do Stripe.

### 6. Melhorar pagina ChoosePlan para usuarios existentes

**Arquivo**: `src/pages/ChoosePlan.tsx`

Adicionar indicacao visual do plano atual do usuario (buscar via `useUserPlan`) e destacar o plano que ele ja possui.

---

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `public/sw.js` | Adicionar navigation fallback para SPA |
| `src/components/navigation/MainNavigation.tsx` | Adicionar link "Meu Plano" no menu |
| `src/components/dashboard/DashboardUsageOverview.tsx` | Botao de upgrade no card de plano |
| `src/components/usage/UpgradeModal.tsx` | Link para ver todos os planos |
| `src/pages/ChoosePlan.tsx` | Mostrar plano atual do usuario |

## Migracao SQL

Recriar a funcao `get_all_users_admin` com tratamento de erro melhorado e garantir que ela tem as permissoes corretas para acessar `auth.users`.

---

## Detalhes Tecnicos

### sw.js - Navigation Fallback

Adicionar no handler de `fetch` uma verificacao para requests de tipo `navigate`. Quando detectado, retornar o `index.html` cacheado:

```javascript
// Na secao fetch do service worker
if (event.request.mode === 'navigate') {
  event.respondWith(
    fetch(event.request).catch(() => caches.match('/index.html'))
  );
  return;
}
```

### MainNavigation.tsx - Novo Item

Adicionar entre "Social" e "Admin" (se admin):

```typescript
{ href: '/choose-plan', icon: Crown, label: 'Meu Plano' },
```

### DashboardUsageOverview.tsx - Card Clicavel

Transformar o card de plano existente para incluir um botao de acao:

```typescript
<Card className="..." onClick={() => navigate('/choose-plan')}>
  <CardContent className="p-4 text-center">
    <Trophy className="w-6 h-6 mx-auto mb-2 text-orange-600" />
    <div className="text-2xl font-bold text-orange-600">
      {usageData?.plano === 'free' ? 'Free' : usageData?.plan_name || 'Free'}
    </div>
    <div className="text-sm text-gray-600">Plano</div>
    <Button variant="link" size="sm" className="mt-1 text-xs text-violet-600">
      Mudar Plano
    </Button>
  </CardContent>
</Card>
```

### ChoosePlan.tsx - Plano Atual

Buscar o plano atual do usuario e mostrar badge "Plano Atual" no card correspondente:

```typescript
const { userPlan, loading: userPlanLoading } = useUserPlan(user?.id);
// No PlanCardChoose, verificar se plan.name.toLowerCase() === userPlan?.plan_name?.toLowerCase()
```

### SQL - Funcao Admin Robusta

```sql
CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS TABLE(...)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  
  RETURN QUERY
  SELECT ... FROM uso_usuarios u
  LEFT JOIN auth.users au ON u.user_id = au.id
  ORDER BY u.created_at DESC;
END;
$$;
```
