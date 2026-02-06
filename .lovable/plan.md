

# Correcao: "useNavigate() may be used only in the context of a Router component"

## Causa Raiz

No arquivo `App.tsx`, os componentes `Toaster` e `Sonner` estao renderizados **fora** do `BrowserRouter`:

```text
ErrorBoundary
  QueryClientProvider
    TooltipProvider
      Toaster        <-- FORA do BrowserRouter
      Sonner         <-- FORA do BrowserRouter
      BrowserRouter
        AppRoutes
```

Quando qualquer componente renderizado pelos toasters (como acoes de toast ou callbacks) tenta acessar hooks do React Router, o erro "useNavigate() may be used only in the context of a Router component" e lancado. Isso pode acontecer durante re-renders parciais do HMR ou quando o React tenta reconciliar a arvore de componentes.

## Solucao

Mover `Toaster` e `Sonner` para **dentro** do `BrowserRouter`, garantindo que todos os componentes tenham acesso ao contexto do Router:

```text
ErrorBoundary
  QueryClientProvider
    TooltipProvider
      BrowserRouter
        Toaster      <-- DENTRO do BrowserRouter
        Sonner       <-- DENTRO do BrowserRouter
        AppRoutes
```

## Arquivo a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/App.tsx` | Mover `Toaster` e `Sonner` para dentro do `BrowserRouter` |

## Detalhe Tecnico

### App.tsx (funcao App, linhas 175-189)

```typescript
// ANTES
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// DEPOIS
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

## Resultado Esperado

1. O erro "useNavigate() may be used only in the context of a Router component" sera eliminado
2. Todos os componentes renderizados por toasts terao acesso ao contexto do Router
3. Re-renders parciais durante HMR nao causarao mais conflitos de contexto
4. A aplicacao abrira normalmente em todos os cenarios

