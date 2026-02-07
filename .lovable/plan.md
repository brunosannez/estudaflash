

# Correcao: Erro na Pagina do Resumo e Estabilidade do App

## Problema Identificado

A pagina do Resumo (e potencialmente o Dashboard) esta crashando com o ErrorBoundary ("Oops! Algo deu errado"). A investigacao revelou os seguintes problemas:

### 1. Excesso de instancias do hook `useCreditsSystem`
O componente `CreditsCostBadge` cria sua propria instancia de `useCreditsSystem()` internamente. Na pagina do Resumo, existem 3 badges + o proprio Resumo + o PageLayout, resultando em **5+ instancias** do hook, cada uma disparando 3 chamadas API ao banco (config, creditos, historico). Isso cria **15+ chamadas paralelas** ao montar a pagina, podendo causar race conditions e erros.

### 2. CreditsCostBadge deve receber custo como prop
Em vez de cada badge buscar o custo do banco independentemente, o componente pai (Resumo) ja tem acesso ao `useCreditsSystem` e pode passar o custo diretamente.

### 3. Header.tsx modificado mas nao utilizado
O arquivo `Header.tsx` foi modificado para incluir `useCreditsSystem`, mas nao e importado em nenhum lugar do app (o `MainNavigation` e usado no lugar). As mudancas no Header sao codigo morto.

### 4. Falta de protecao contra erros de render no Resumo
Se qualquer componente filho do Resumo crashar, o ErrorBoundary global captura e derruba o app inteiro. Um ErrorBoundary local no Resumo protegeria melhor.

---

## Mudancas Planejadas

### 1. Refatorar CreditsCostBadge para receber custo como prop

**Arquivo**: `src/components/usage/CreditsCostBadge.tsx`

Remover a dependencia interna de `useCreditsSystem`. O componente passara a receber `cost` e `hasEnough` como props opcionais, com fallback para buscar do hook apenas se nao forem fornecidos.

### 2. Passar custos como props no Resumo

**Arquivo**: `src/pages/Resumo.tsx`

O componente Resumo ja tem `useCreditsSystem` - ele passara os valores de custo e saldo para cada `CreditsCostBadge`, eliminando 3 instancias desnecessarias do hook.

### 3. Reverter Header.tsx (remover codigo morto)

**Arquivo**: `src/components/Header.tsx`

Remover as importacoes e uso de `useCreditsSystem` e `Coins` do Header, ja que este componente nao e utilizado no app. Isso elimina uma instancia desnecessaria do hook.

### 4. Adicionar protecao de erro no CreditsIndicator do Dashboard

**Arquivo**: `src/pages/Index.tsx`

Envolver o `CreditsIndicator` em um try-catch no render ou usar o padrao de fallback para evitar que um erro no carregamento de creditos derrube o dashboard inteiro.

### 5. Tornar useCreditsSystem mais defensivo

**Arquivo**: `src/hooks/useCreditsSystem.ts`

Adicionar verificacoes para evitar chamadas desnecessarias quando o usuario ainda nao esta carregado, e garantir que erros em qualquer chamada nao propaguem.

---

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/usage/CreditsCostBadge.tsx` | Aceitar cost/hasEnough como props opcionais |
| `src/pages/Resumo.tsx` | Passar custos como props para CreditsCostBadge |
| `src/components/Header.tsx` | Remover useCreditsSystem (codigo morto) |
| `src/pages/Index.tsx` | Proteger CreditsIndicator contra erros |
| `src/hooks/useCreditsSystem.ts` | Tornar mais defensivo contra erros |

## Detalhes Tecnicos

### CreditsCostBadge - Nova interface

```text
Props atuais: { actionType: string; className?: string }
Novas props: { actionType: string; className?: string; cost?: number; hasEnough?: boolean }

Se cost for fornecido, usa direto. Se nao, faz fallback para useCreditsSystem.
Isso permite uso sem hook em contextos onde o pai ja tem os dados.
```

### Resumo.tsx - Passar custos

```text
const quizCost = getActionCreditsCost('quiz');
const flashcardsCost = getActionCreditsCost('flashcards');
const mindMapCost = getActionCreditsCost('mind_map');
const hasEnough = (cost: number) => (userCredits?.remaining ?? 0) >= cost;

<CreditsCostBadge actionType="quiz" cost={quizCost} hasEnough={hasEnough(quizCost)} />
<CreditsCostBadge actionType="flashcards" cost={flashcardsCost} hasEnough={hasEnough(flashcardsCost)} />
<CreditsCostBadge actionType="mind_map" cost={mindMapCost} hasEnough={hasEnough(mindMapCost)} />
```

### Header.tsx - Limpar codigo morto

```text
Remover:
- import { useCreditsSystem } from '@/hooks/useCreditsSystem'
- import { Coins } from 'lucide-react' (se nao usado em outro lugar)
- const { userCredits } = useCreditsSystem()
- O bloco {userCredits && (...)}
```

### Index.tsx - Protecao do CreditsIndicator

```text
Envolver CreditsIndicator em um wrapper com ErrorBoundary local:
- Se falhar, mostra mensagem simples em vez de derrubar o dashboard
```

