
# Plano: Correcao de Problemas Encontrados no Teste End-to-End

## Problemas Identificados

### 1. Login redireciona para `/dashboard` em vez de `/`

**Onde**: `src/pages/Login.tsx` linha 57

**Problema**: Apos login bem-sucedido, o `navigate('/dashboard')` redireciona para `/dashboard`, que apenas mostra o dashboard se o usuario estiver autenticado. Embora funcione (existe redirect em App.tsx), isso causa uma navegacao desnecessaria: Login -> /dashboard -> /. O padrao correto e redirecionar direto para `/`.

**Solucao**: Alterar `navigate('/dashboard')` para `navigate('/', { replace: true })`.

---

### 2. URL de redirecionamento de email hardcoded incorretamente no `useAuth`

**Onde**: `src/hooks/useAuth.tsx` linha 119

**Problema**: O `emailRedirectTo` esta definido como `https://estudaflash.com/` (dominio que nao existe/nao e o correto). A URL publicada real e `https://estudaflash.lovable.app`. Em contraste, o `useSignupForm.ts` usa corretamente `window.location.origin`.

**Impacto**: Ao usar a funcao `signUp` diretamente pelo hook `useAuth` (nao pelo formulario de signup), o email de confirmacao redireciona para um dominio errado.

**Solucao**: Substituir a URL hardcoded por `${window.location.origin}/` no `useAuth.tsx`.

---

### 3. Signup permite submeter sem selecionar plano (non-minor users)

**Onde**: `src/components/signup/NewSignupForm.tsx` linhas 43-48 e `src/hooks/useSignupForm.ts` linhas 83-88

**Problema**: Para usuarios que nao sao menores de idade, `totalSteps` e 3. A selecao de plano aparece no passo 3. Porem, a funcao `canProceed()` no `NewSignupForm` no caso 3 para nao-menores retorna `true` incondicionalmente, sem verificar se um plano foi selecionado. Isso permite clicar em "Criar Conta" sem ter selecionado nenhum plano.

**Solucao**: Atualizar o case 3 em `canProceed()` para tambem verificar `formData.selectedPlanId` quando nao e menor de idade:

```typescript
case 3:
  if (formData.profile.is_minor) {
    return formData.guardian?.full_name && formData.guardian?.email && 
           formData.guardian?.phone && formData.guardian?.relation_to_student;
  }
  return !!formData.selectedPlanId;
```

A mesma correcao deve ser feita em `useSignupForm.ts` na funcao `validateStep`.

---

### 4. Upload usa `window.location.href` em vez de React Router navigation

**Onde**: `src/components/upload/EnhancedUpload.tsx` linhas 92 e 100

**Problema**: Apos o upload ser concluido, os botoes "Ver Resumo Completo" e "Meus Resumos" usam `window.location.href = ...`, o que causa uma recarga completa da pagina (full page reload). Isso perde todo o estado da aplicacao, as subscricoes Supabase, e causa um novo ciclo de autenticacao e seeding desnecessario.

**Solucao**: Usar `useNavigate()` do React Router em vez de `window.location.href`.

---

### 5. Console logs excessivos em producao

**Onde**: Multiplos arquivos (Login.tsx, Home.tsx, Index.tsx, useAuth.tsx, etc.)

**Problema**: O console log esta cheio de mensagens de debug que reduzem a performance e expoe informacoes internas. Nos logs do browser, cada navegacao produz dezenas de logs como "useAuth - Setting up auth state", "Home page rendering", "HomeHeader rendering".

**Impacto**: Poluicao de console, potencial vazamento de informacoes em producao, ligeira degradacao de performance.

**Solucao**: Nao bloquear esta correcao agora, mas recomenda-se criar um wrapper de log que so exibe logs em desenvolvimento.

---

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Login.tsx` | Alterar `navigate('/dashboard')` para `navigate('/', { replace: true })` |
| `src/hooks/useAuth.tsx` | Substituir URL hardcoded `estudaflash.com` por `window.location.origin` |
| `src/components/signup/NewSignupForm.tsx` | Corrigir `canProceed()` case 3 para verificar `selectedPlanId` |
| `src/hooks/useSignupForm.ts` | Corrigir `validateStep()` case 3 para verificar `selectedPlanId` |
| `src/components/upload/EnhancedUpload.tsx` | Substituir `window.location.href` por `useNavigate()` |

---

## Detalhes Tecnicos

### Mudanca 1: Login.tsx (linha 57)
```typescript
// ANTES
navigate('/dashboard');

// DEPOIS
navigate('/', { replace: true });
```

### Mudanca 2: useAuth.tsx (linha 119)
```typescript
// ANTES
emailRedirectTo: `https://estudaflash.com/`,

// DEPOIS
emailRedirectTo: `${window.location.origin}/`,
```

### Mudanca 3: NewSignupForm.tsx (case 3 na funcao canProceed)
```typescript
// ANTES
case 3:
  if (formData.profile.is_minor) {
    return formData.guardian?.full_name && ...;
  }
  return true;

// DEPOIS
case 3:
  if (formData.profile.is_minor) {
    return formData.guardian?.full_name && ...;
  }
  return !!formData.selectedPlanId;
```

### Mudanca 4: useSignupForm.ts (case 3 na funcao validateStep)
```typescript
// ANTES
case 3:
  if (formData.profile.is_minor) {
    return !!(formData.guardian?.full_name && ...);
  }
  return true;

// DEPOIS
case 3:
  if (formData.profile.is_minor) {
    return !!(formData.guardian?.full_name && ...);
  }
  return !!formData.selectedPlanId;
```

### Mudanca 5: EnhancedUpload.tsx
```typescript
// Adicionar useNavigate no topo
import { useNavigate } from 'react-router-dom';

// No componente
const navigate = useNavigate();

// ANTES
onClick={() => window.location.href = `/resumo/${results.summaryId}`}
onClick={() => window.location.href = '/my-summaries'}

// DEPOIS
onClick={() => navigate(`/resumo/${results.summaryId}`)}
onClick={() => navigate('/my-summaries')}
```

---

## Resultado Esperado

1. Login redireciona corretamente para a raiz sem bounce desnecessario
2. Email de confirmacao aponta para o dominio correto
3. Signup exige selecao de plano antes de permitir criacao de conta
4. Upload mantém estado do app ao navegar para o resumo gerado
5. Navegacao mais rapida e fluida em toda a aplicacao
