

# Pagina de Escolha de Plano

## Resumo

Criar uma pagina dedicada de selecao de plano (`/choose-plan`) que sera usada em dois cenarios:

1. **Apos cadastro com Google**: o usuario que se cadastra via OAuth nao passa pelo fluxo de selecao de plano do signup. Quando o sistema detecta que ele nao tem um plano escolhido (ou esta no plano Free por padrao), ele sera redirecionado para essa pagina.
2. **Na pagina inicial (landing page)**: adicionar uma secao de planos visivel publicamente, onde visitantes podem ver os planos e, ao selecionar um, serem direcionados ao cadastro ja com o plano pre-selecionado.

## Como Funciona Hoje

- Quando um usuario se cadastra via Google, o trigger `handle_new_user_setup` no banco cria automaticamente um registro em `uso_usuarios` com o plano **Free** (pois o metadata do Google nao inclui `plan_id`).
- O fluxo de signup manual ja tem a selecao de plano integrada (passo 3 ou 4 do formulario).
- A tabela `uso_usuarios` tem as colunas `plan_id` (UUID) e `plano` (texto) que controlam o plano do usuario.

## Mudancas Planejadas

### 1. Nova Pagina: `src/pages/ChoosePlan.tsx`

Pagina protegida (requer login) com:
- Titulo e descricao explicativa
- Toggle mensal/anual (reutilizando o padrao do signup)
- Grid de cards de planos (reutilizando `PlanCard` existente)
- Botao "Confirmar Plano" que atualiza o plano do usuario no banco
- Opcao de pular e continuar com o plano Free

### 2. Nova Funcao RPC: `user_select_plan`

Como a funcao `admin_change_user_plan_new` exige ser administrador, sera criada uma nova funcao que permite ao proprio usuario alterar **apenas o seu** plano:

```sql
CREATE OR REPLACE FUNCTION public.user_select_plan(new_plan_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.plans WHERE id = new_plan_id AND is_active = true) THEN
    RAISE EXCEPTION 'Plano nao encontrado ou inativo';
  END IF;

  UPDATE public.uso_usuarios
  SET plan_id = new_plan_id,
      plano = (SELECT LOWER(name) FROM public.plans WHERE id = new_plan_id),
      updated_at = now()
  WHERE user_id = auth.uid();

  RETURN TRUE;
END;
$$;
```

### 3. Nova Secao na Landing Page: `src/components/home/PricingSection.tsx`

Secao publica que mostra os planos disponiveis na pagina inicial, entre `BenefitsSection` e `HomeFooter`. Ao clicar em um plano, o visitante e direcionado para `/new-signup?plan={planId}`.

### 4. Redirecionamento Automatico para Novos Usuarios Google

No `AppRoutes` dentro de `App.tsx`, adicionar logica para detectar usuarios recem-cadastrados via Google que ainda nao escolheram um plano (estao no Free por padrao) e redireciona-los para `/choose-plan`.

Isso sera feito verificando o `uso_usuarios` do usuario logado: se o `plan_id` aponta para o plano Free **e** o usuario acabou de se cadastrar (conta criada nos ultimos 5 minutos), redirecionar para a pagina de escolha de plano.

### 5. Rota `/new-signup` com Plano Pre-Selecionado

Quando o usuario chega via `/new-signup?plan={planId}`, o formulario de signup ja inicia com o plano selecionado automaticamente.

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/ChoosePlan.tsx` | Pagina de selecao de plano para usuarios logados |
| `src/components/home/PricingSection.tsx` | Secao de planos na landing page publica |

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|-----------|
| `src/App.tsx` | Adicionar rota `/choose-plan` protegida |
| `src/pages/Home.tsx` | Incluir `PricingSection` entre Benefits e Footer |
| `src/hooks/useSignupForm.ts` | Ler parametro `plan` da URL para pre-selecionar plano |
| `src/services/plansService.ts` | Adicionar metodo `selectPlan()` que chama a nova RPC |

## Migracao SQL

Criar a funcao `user_select_plan` no Supabase para permitir que o usuario altere seu proprio plano de forma segura.

## Fluxo do Usuario

```text
Cenario 1: Cadastro com Google
  Usuario na landing page
    -> Clica "Entrar com Google"
    -> Google autentica e retorna ao app
    -> Trigger cria conta com plano Free
    -> App detecta usuario novo sem plano escolhido
    -> Redireciona para /choose-plan
    -> Usuario escolhe plano e confirma
    -> Vai para o Dashboard

Cenario 2: Landing page com plano pre-selecionado
  Visitante na landing page
    -> Desce ate secao de Planos
    -> Clica em "Escolher" no plano Pro
    -> Redirecionado para /new-signup?plan={proId}
    -> Formulario ja tem o plano Pro selecionado
    -> Completa o cadastro normalmente

Cenario 3: Usuario logado quer trocar de plano
  Usuario no Dashboard
    -> Navega para /choose-plan (via menu ou settings)
    -> Ve planos disponiveis com o atual destacado
    -> Seleciona novo plano e confirma
    -> Plano atualizado instantaneamente
```

## Detalhes Tecnicos

### ChoosePlan.tsx - Estrutura Principal

```typescript
// Busca planos ativos via useActivePlans()
// Busca plano atual do usuario via query em uso_usuarios
// Permite selecionar e confirmar novo plano
// Chama PlansService.selectPlan() para gravar
// Redireciona para "/" apos confirmacao
```

### PricingSection.tsx - Cards Publicos

Componente que usa `useActivePlans()` para buscar planos do banco e exibi-los em cards visuais. Cada card tem botao "Escolher este plano" que leva a `/new-signup?plan={id}`. Filtra planos internos (como "Admin Unlimited") para nao exibi-los publicamente.

### App.tsx - Nova Rota

```typescript
<Route
  path="/choose-plan"
  element={
    <ProtectedRoute>
      <ChoosePlan />
    </ProtectedRoute>
  }
/>
```

### useSignupForm.ts - Leitura do Query Param

No `useSignupForm`, ao inicializar, verificar se existe `?plan=` na URL e pre-preencher `selectedPlanId`.

### Migracao SQL

```sql
CREATE OR REPLACE FUNCTION public.user_select_plan(new_plan_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.plans
    WHERE id = new_plan_id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Plano nao encontrado ou inativo';
  END IF;

  UPDATE public.uso_usuarios
  SET
    plan_id = new_plan_id,
    plano = (SELECT LOWER(name) FROM public.plans WHERE id = new_plan_id),
    updated_at = now()
  WHERE user_id = auth.uid();

  RETURN TRUE;
END;
$$;
```

### Google OAuth - Redirecionamento

Alterar o `redirectTo` do `signInWithGoogle` para apontar para `/choose-plan` em vez de `/`, garantindo que o usuario passe pela selecao de plano apos o cadastro via Google:

```typescript
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/choose-plan`,
    },
  });
  // ...
};
```

