
# Plano: Correção do Erro "useLocation() outside Router"

## Problema Identificado

O erro `useLocation() may be used only in the context of a <Router> component` ocorre porque a estrutura atual do `App.tsx` está incorreta:

```text
App.tsx (atual):
┌────────────────────────────────────────────────────────┐
│  useAuth() ← chamado FORA do BrowserRouter             │
│      │                                                 │
│      ▼                                                 │
│  if (loading) → loading spinner                       │
│  else → renderiza                                      │
│            │                                           │
│            ▼                                           │
│      <BrowserRouter>                                   │
│         <Routes>                                       │
│           <Index> ou <Home>                            │
│              │                                         │
│              ▼                                         │
│         MainNavigation → useLocation() ❌ ERRO!        │
│         (chamado fora do contexto esperado)            │
│         </Routes>                                      │
│      </BrowserRouter>                                  │
└────────────────────────────────────────────────────────┘
```

O problema específico é:
1. `App.tsx` chama `useAuth()` na linha 32
2. `PageLayout` usa `MainNavigation` que chama `useLocation()` na linha 46
3. Quando o componente `Index` é renderizado, ele usa `PageLayout` que tenta usar `useLocation()` 
4. Mas o `BrowserRouter` só é adicionado na linha 62, criando uma ordem incorreta

## Solução

Reestruturar `App.tsx` para separar a lógica de autenticação em um componente filho que só é renderizado **dentro** do `BrowserRouter`.

```text
App.tsx (corrigido):
┌────────────────────────────────────────────────────────┐
│  <ErrorBoundary>                                       │
│    <QueryClientProvider>                               │
│      <TooltipProvider>                                 │
│        <Toaster />                                     │
│        <BrowserRouter>   ← Router vem PRIMEIRO         │
│          <AppRoutes />   ← componente separado         │
│        </BrowserRouter>                                │
│      </TooltipProvider>                                │
│    </QueryClientProvider>                              │
│  </ErrorBoundary>                                      │
│                                                        │
│  AppRoutes (novo componente interno):                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  useAuth() ← agora DENTRO do BrowserRouter       │  │
│  │      │                                           │  │
│  │  if (loading) → loading spinner                  │  │
│  │  else → <Routes>                                 │  │
│  │           <Index> → PageLayout → MainNavigation  │  │
│  │                           → useLocation() ✓ OK!  │  │
│  │         </Routes>                                │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

## Arquivo a Modificar

### `src/App.tsx`

**Mudanças:**
1. Mover `BrowserRouter` para o nível mais externo (antes de qualquer uso de hooks de router)
2. Criar componente interno `AppRoutes` que contém a lógica de autenticação
3. Garantir que todos os hooks que dependem do Router estejam dentro do `BrowserRouter`

**Código Proposto:**

```typescript
import React, { Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { DataSeederService } from "@/services/dataSeederService";
// ... outros imports

const queryClient = new QueryClient();

// Componente interno que usa hooks de router
const AppRoutes = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    DataSeederService.seedInitialData();
    if (user?.id) {
      DataSeederService.seedUserInitialData(user.id);
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoading title="Carregando..." />}>
      <Routes>
        <Route path="/" element={user ? <Index /> : <Home />} />
        {/* ... todas as outras rotas ... */}
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>      {/* Router vem PRIMEIRO */}
            <AppRoutes />       {/* Auth check DENTRO do Router */}
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
```

## Por Que Isso Resolve

1. **BrowserRouter primeiro**: O Router é estabelecido antes de qualquer componente que use hooks de router
2. **useAuth dentro do Router**: A verificação de autenticação agora acontece dentro do contexto do Router
3. **useLocation funciona**: Quando `MainNavigation` chama `useLocation()`, o contexto do Router já existe
4. **Hooks de real-time seguros**: Os hooks `useBadgesRealTime` e `useUsageRealTime` que usam `useAuth` agora funcionam corretamente

## Resultado Esperado

- App carrega normalmente sem erros
- Todas as funcionalidades de real-time continuam funcionando
- Navegação e breadcrumbs funcionam corretamente
- Badge animations e toasts aparecem quando conquistas são desbloqueadas
