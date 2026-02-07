
# Funcionalidade: Exportar Resumo em PDF + Controle de Creditos Visivel para o Usuario

## Resumo das Mudancas

Duas funcionalidades principais serao implementadas:

1. **Exportar/Imprimir Resumo em PDF** - Botao na pagina do resumo para salvar ou imprimir como PDF
2. **Painel de Creditos Visivel** - O usuario vera seus creditos em tempo real no dashboard e antes de cada acao, com debito automatico integrado ao banco de dados

---

## 1. Exportar Resumo em PDF

### Abordagem
Usar a API nativa do navegador `window.print()` com CSS de impressao otimizado. Isso permite ao usuario tanto imprimir quanto salvar como PDF (via "Salvar como PDF" na janela de impressao), sem necessidade de bibliotecas externas.

### Mudancas

**Arquivo: `src/pages/Resumo.tsx`**
- Adicionar botao "Salvar PDF / Imprimir" na area de acoes rapidas
- Implementar funcao `handlePrintResumo()` que:
  - Cria uma janela de impressao com o conteudo formatado do resumo
  - Aplica estilos de impressao para manter a formatacao bonita
  - Inclui titulo, data de criacao e rodape com marca "Estuda Flash"

**Arquivo: `src/components/ResumoContent.tsx`**
- Adicionar `id="resumo-content-print"` ao container principal para referencia no print

**Novo arquivo: `src/utils/printResumo.ts`**
- Funcao utilitaria `printResumo(title, content, date)` que:
  - Abre uma nova janela com o conteudo formatado
  - Aplica CSS de impressao (fonte legivel, margens, quebras de pagina)
  - Chama `window.print()` automaticamente
  - Inclui cabecalho com titulo e data
  - Inclui rodape com "Gerado por Estuda Flash"

---

## 2. Painel de Creditos Visivel para o Usuario

### Estado Atual
- O `CreditsIndicator` ja existe em `src/components/usage/CreditsIndicator.tsx` com informacoes completas
- O `CreditsHistoryModal` ja existe em `src/components/usage/CreditsHistoryModal.tsx`
- As Edge Functions (`generate-summary`, `generate-flashcards`, `generate-quiz`, `extract-text-from-image`) ja consomem creditos via `consume_credits` RPC
- **Problema encontrado**: A edge function `generate-enem-quiz` NAO consome creditos (bug)
- Os custos por acao estao configurados no banco: OCR=1, Flashcards=3, Quiz=5, Resumo=8

### Mudancas

#### A. Adicionar Indicador de Creditos no Dashboard e Header

**Arquivo: `src/pages/Index.tsx`**
- Importar e adicionar o `CreditsIndicator` no dashboard principal, abaixo da saudacao
- Adicionar `CreditsHistoryModal` com toggle de abertura

**Arquivo: `src/components/Header.tsx`**
- Adicionar um badge compacto com creditos restantes ao lado do nome do usuario
- Mostrar icone de moeda + numero de creditos
- Clicar abre o historico de creditos

#### B. Mostrar Custo ANTES de Cada Acao

**Arquivo: `src/pages/Resumo.tsx`**
- Nos botoes de acao (Quiz ENEM, Flashcards, Mapa Mental), mostrar o custo em creditos
- Exemplo: "Quiz ENEM (5 creditos)" em vez de apenas "Quiz ENEM"
- Ao clicar, mostrar confirmacao: "Esta acao custara X creditos. Voce tem Y restantes. Continuar?"

**Novo componente: `src/components/usage/CreditsCostBadge.tsx`**
- Badge compacto que mostra o custo de uma acao: icone moeda + "X creditos"
- Recebe `actionType` como prop e busca o custo da configuracao
- Cor verde se tem creditos suficientes, vermelho se nao

**Novo componente: `src/components/usage/CreditsConfirmDialog.tsx`**
- Dialog de confirmacao antes de executar acao
- Mostra: acao, custo, creditos disponiveis, creditos restantes apos
- Botoes: "Cancelar" e "Confirmar"

#### C. Integrar Consumo de Creditos nos Hooks

**Arquivo: `src/hooks/useEnemQuiz.ts`**
- Adicionar verificacao de creditos ANTES de gerar quiz (usar `CreditsService.checkCreditsForAction`)
- Nao sera necessario consumir no frontend pois a edge function `generate-quiz` ja faz isso
- Para `generate-enem-quiz`, adicionar consumo de creditos na edge function

**Arquivo: `supabase/functions/generate-enem-quiz/index.ts`**
- Adicionar consumo de creditos via `consume_credits` RPC (igual as outras edge functions)
- Retornar erro 402 se creditos insuficientes

**Arquivo: `src/hooks/useMindMap.ts`**
- Adicionar verificacao de creditos antes de gerar mapa mental
- Nota: A edge function `generate-mind-map` pode nao estar consumindo creditos tambem - sera verificado e corrigido

#### D. Atualizar Creditos em Tempo Real

O sistema ja usa `useUnifiedRealTime` para monitorar mudancas na tabela `uso_usuarios`. Quando a edge function consome creditos (atualizando `credits_remaining`), o frontend ja recebe a notificacao e atualiza automaticamente. Nenhuma mudanca adicional necessaria aqui.

#### E. Dados no Painel Administrativo

O painel admin ja recebe os dados de `credits_remaining` e `credits_used_this_month` via `get_all_users_admin()`. O `credits_usage_log` ja registra cada consumo. Nenhuma mudanca adicional necessaria no admin.

---

## Tabela de Custos por Acao (configuracao atual no banco)

| Acao | Custo | Descricao |
|------|-------|-----------|
| OCR (imagem) | 1 credito | Processamento de cada imagem |
| Flashcards | 3 creditos | Geracao de flashcards por IA |
| Quiz | 5 creditos | Geracao de quiz por IA |
| Resumo | 8 creditos | Geracao de resumo por IA |

---

## Arquivos a Criar/Modificar

| Arquivo | Tipo | Mudanca |
|---------|------|---------|
| `src/utils/printResumo.ts` | Novo | Funcao de impressao/PDF |
| `src/components/usage/CreditsCostBadge.tsx` | Novo | Badge de custo por acao |
| `src/components/usage/CreditsConfirmDialog.tsx` | Novo | Dialog de confirmacao |
| `src/pages/Resumo.tsx` | Editar | Botao PDF + custos nos botoes |
| `src/pages/Index.tsx` | Editar | Adicionar CreditsIndicator |
| `src/components/Header.tsx` | Editar | Badge de creditos compacto |
| `src/hooks/useEnemQuiz.ts` | Editar | Verificacao pre-creditos |
| `src/hooks/useMindMap.ts` | Editar | Verificacao pre-creditos |
| `supabase/functions/generate-enem-quiz/index.ts` | Editar | Adicionar consume_credits |
| `src/components/ResumoContent.tsx` | Editar | Adicionar ID para print |

## Detalhes Tecnicos

### printResumo.ts

```text
export function printResumo(title: string, content: string, date: string) {
  - Cria nova janela do navegador
  - Injeta HTML formatado com:
    - CSS de impressao (font-family, margens, cores)
    - Cabecalho: logo + titulo + data
    - Conteudo: HTML do resumo (convertido de markdown)
    - Rodape: "Gerado por Estuda Flash - estudaflash.lovable.app"
  - Chama window.print()
  - Fecha janela apos impressao
}
```

### CreditsCostBadge.tsx

```text
Props: { actionType: string; className?: string }
- Usa useCreditsSystem().getActionCreditsCost(actionType)
- Renderiza: [icone moeda] X creditos
- Cor: verde se userCredits.remaining >= custo, vermelho caso contrario
```

### CreditsConfirmDialog.tsx

```text
Props: { 
  isOpen, onClose, onConfirm,
  actionType, actionName,
  creditsCost, creditsAvailable 
}
- Mostra titulo: "Confirmar {actionName}"
- Mostra custo e saldo
- Mostra saldo apos operacao
- Botoes: Cancelar / Confirmar
```

### generate-enem-quiz - Adicionar consumo de creditos

```text
// Apos validacao de auth e antes de chamar a API Anthropic:
const { data: creditResult, error: creditError } = await supabase.rpc('consume_credits', {
  target_user_id: effectiveUserId,
  action_type: 'quiz'
});

if (creditError || !creditResult || !creditResult[0]?.success) {
  return Response(JSON.stringify({ 
    success: false, error: 'Creditos insuficientes' 
  }), { status: 402 });
}
```
