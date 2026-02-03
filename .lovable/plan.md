
# Plano: Aprimorar Feedback Visual do Quiz ENEM

## Objetivo
Melhorar a experiência do quiz ENEM mostrando feedback visual imediato após cada resposta:
- **Verde** para respostas corretas
- **Vermelho** para respostas incorretas
- Destacar a opção correta quando errar
- Exibir a explicação (`evidence`) da resposta para facilitar o aprendizado

---

## Análise Atual

### Como funciona hoje:
1. Usuário seleciona uma opção (fica com borda azul/primary)
2. Clica em "Próxima" → vai direto para próxima questão
3. **Não há feedback** de certo/errado durante o quiz
4. Só vê resultados ao final (tela de resumo)

### Campos disponíveis nas questões:
- `correct_index`: índice da resposta correta
- `evidence`: trecho do resumo que comprova a resposta (já existe!)
- `difficulty`, `cognitive_level`: metadados adicionais

---

## Solução Proposta

### Fluxo de interação aprimorado:

```text
┌──────────────────────────────────────────────┐
│  QUESTÃO ATUAL                               │
│  ┌─────────────────────────────────────────┐ │
│  │  Enunciado + Stem                       │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  ○ Opção A                                   │  ← Usuário seleciona
│  ○ Opção B                                   │
│  ○ Opção C                                   │
│  ○ Opção D                                   │
│                                              │
│  [ Confirmar Resposta ]                      │  ← Novo botão!
└──────────────────────────────────────────────┘
                    ↓
                    ↓ Clicou em "Confirmar"
                    ↓
┌──────────────────────────────────────────────┐
│  FEEDBACK EXIBIDO                            │
│  ┌─────────────────────────────────────────┐ │
│  │  Enunciado + Stem                       │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  ○ Opção A                                   │
│  ● Opção B ─────────────── ✓ VERDE           │  ← Correta (sempre verde)
│  ○ Opção C                                   │
│  ● Opção D ─────────────── ✗ VERMELHO        │  ← Selecionada (errada)
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │ 💡 EXPLICAÇÃO                           │ │  ← Novo bloco!
│  │ "trecho do resumo que comprova..."      │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  [ Próxima Questão ]                         │
└──────────────────────────────────────────────┘
```

---

## Implementação

### Fase 1: Adicionar estado de "resposta confirmada" no EnemQuizPlayer

**Arquivo:** `src/components/enem/EnemQuizPlayer.tsx`

1. **Novo estado:** `answeredQuestions: boolean[]` para rastrear quais já foram respondidas
2. **Novo estado:** `showFeedback: boolean` para controlar exibição do feedback
3. **Novo botão:** "Confirmar Resposta" antes de mostrar feedback
4. **Lógica:** 
   - Selecionar opção → botão "Confirmar" fica ativo
   - Clicar "Confirmar" → `showFeedback = true`, bloquear alteração
   - Mostrar feedback visual + explicação
   - Botão "Próxima" libera para avançar

### Fase 2: Atualizar componentes de questão para modo "feedback"

**Arquivos:**
- `src/components/enem/EnemObjectiveQuestion.tsx`
- `src/components/enem/EnemVFQuestion.tsx`

1. **Nova prop:** `showFeedback: boolean`
2. **Nova prop:** `correctIndex: number`
3. **Nova prop:** `evidence: string`
4. **Lógica de cores:**
   - Se `showFeedback = false`: comportamento atual (azul para selecionado)
   - Se `showFeedback = true`:
     - Opção correta → **borda verde**, background verde claro
     - Opção selecionada errada → **borda vermelha**, background vermelho claro
     - Outras opções → cinza (desabilitadas)
5. **Bloco de explicação:**
   - Card abaixo das opções com ícone 💡
   - Exibe o campo `evidence`
   - Background de destaque (azul claro/info)

### Fase 3: Melhorar visual dos estados

**Estilos a aplicar:**

| Estado | Borda | Background | Ícone |
|--------|-------|------------|-------|
| Não selecionado | `border-gray-200` | `bg-white` | - |
| Selecionado (antes de confirmar) | `border-primary` | `bg-primary/10` | - |
| Correto (após confirmar) | `border-green-500` | `bg-green-50` | ✓ CheckCircle |
| Errado (após confirmar) | `border-red-500` | `bg-red-50` | ✗ XCircle |
| Opção correta não selecionada | `border-green-500` | `bg-green-50/50` | ✓ |

---

## Arquivos a serem modificados

1. **`src/components/enem/EnemQuizPlayer.tsx`**
   - Adicionar estados `showFeedback` e lógica de confirmação
   - Criar botão "Confirmar Resposta"
   - Passar novas props para componentes de questão
   - Bloquear navegação até confirmar resposta

2. **`src/components/enem/EnemObjectiveQuestion.tsx`**
   - Adicionar props `showFeedback`, `correctIndex`, `evidence`
   - Implementar lógica de cores verde/vermelho
   - Adicionar bloco de explicação com `evidence`
   - Desabilitar cliques quando `showFeedback = true`

3. **`src/components/enem/EnemVFQuestion.tsx`**
   - Mesmas alterações do componente objetiva
   - Adaptar para layout de V/F sequencial

---

## Resultado esperado

### Benefícios para o aprendizado:
- Feedback imediato reforça a fixação do conhecimento
- Ver a resposta correta destacada evita confusão
- Explicação com trecho do resumo conecta teoria e prática
- Experiência mais parecida com simulados reais do ENEM

### Exemplo visual (questão objetiva):

**Acertou:**
```
✓ B) Resposta correta escolhida ───────── [VERDE]
  
💡 Por que está certa?
"A cultura brasileira atual é resultado desse encontro entre povos 
indígenas, europeus e africanos, que deixaram marcas profundas..."
```

**Errou:**
```
✗ D) Sua resposta ────────────────────── [VERMELHO]
✓ B) Esta era a resposta correta ─────── [VERDE]
  
💡 Entenda a resposta:
"A cultura brasileira atual é resultado desse encontro entre povos 
indígenas, europeus e africanos, que deixaram marcas profundas..."
```
