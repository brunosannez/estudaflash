
# Correcao: Erro no Processamento de Arquivos

## Causa Raiz Identificada

A investigacao revelou que **todas as 9 imagens foram uploadadas com sucesso** ao storage (confirmado no banco), mas a Edge Function `extract-text-from-image` retorna **500 em TODAS as chamadas** com tempo de execucao muito curto (~200ms).

A causa raiz e: **o usuario tem 0 creditos**.

### Por que 0 creditos?

Quando um novo usuario e criado (via `useSyncManager.ts` ou `usageDataService.ts`), o campo `credits_remaining` **nao e definido** no INSERT, ficando com o valor padrao 0. O plano Free deveria dar 50 creditos/mes, mas a funcao `reset_monthly_credits` so executa apos 30 dias do ultimo reset. Resultado: usuario recem-criado nunca recebe creditos iniciais.

```text
Dados do usuario no banco:
- plano: free
- plan_id: c3449c9b (Free, 50 creditos/mes)
- credits_remaining: 0      <-- PROBLEMA
- credits_used_this_month: 0
- last_credits_reset: 2026-02-06
```

### Fluxo do erro:

```text
1. Usuario seleciona 9 imagens (OK)
2. Upload das imagens ao storage (OK - 9 arquivos no bucket)
3. Edge Function extract-text-from-image e chamada
4. Funcao chama consume_credits(user_id, 'ocr')
5. consume_credits ve credits_remaining = 0 -> retorna success=false
6. Edge function lanca erro "Creditos insuficientes" -> retorna 500
7. useSequentialOCR captura o erro, marca imagem como failed
8. Apos todas falharem: "Nenhuma imagem foi processada com sucesso"
```

### Bugs secundarios encontrados:

1. **Caminho duplicado no storage**: `useSequentialOCR.ts` adiciona prefixo `study-images/` ao path ao fazer upload para o bucket `study-images`, criando `study-images/study-images/userId/...`. Funciona mas desperdia espaco com caminhos desnecessarios.

2. **Mensagem de erro generica**: O erro especifico ("Creditos insuficientes") e engolido e substituido por "Nenhuma imagem foi processada com sucesso", sem informar o usuario do real problema.

---

## Mudancas Planejadas

### 1. Migracao SQL: Corrigir creditos dos usuarios existentes + trigger para novos

- Atualizar usuarios com `credits_remaining = 0` e `credits_used_this_month = 0` para receber os creditos do plano
- Criar trigger `on INSERT` na tabela `uso_usuarios` que automaticamente define `credits_remaining` baseado no `plan_id`
- Isso garante que todo usuario novo receba creditos imediatamente

### 2. Corrigir inicializacao de creditos no frontend

**Arquivos**: `src/hooks/useSyncManager.ts` e `src/services/usageDataService.ts`

Ao criar registro de novo usuario, incluir `credits_remaining` com o valor de `credits_per_month` do plano Free.

### 3. Corrigir caminho duplicado no storage

**Arquivo**: `src/hooks/useSequentialOCR.ts`

Remover o prefixo `study-images/` da linha 69:
- De: `study-images/${fileName}` 
- Para: `${fileName}`

### 4. Melhorar mensagens de erro

**Arquivo**: `src/hooks/useSequentialOCR.ts`

Quando todas as imagens falham, exibir o erro especifico da primeira imagem (ex: "Creditos insuficientes") em vez da mensagem generica.

### 5. Verificacao pre-processamento de creditos

**Arquivo**: `src/hooks/useEnhancedUpload.ts`

Antes de iniciar o processamento, verificar se o usuario tem creditos suficientes para TODAS as imagens (1 credito x N imagens) e mostrar aviso claro se nao tiver.

### 6. Reimplantar a Edge Function

Reimplantar `extract-text-from-image` para garantir que o codigo mais recente esta ativo.

---

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| Nova migracao SQL | Corrigir creditos existentes + trigger |
| `src/hooks/useSyncManager.ts` | Incluir `credits_remaining` no INSERT |
| `src/services/usageDataService.ts` | Incluir `credits_remaining` no INSERT |
| `src/hooks/useSequentialOCR.ts` | Corrigir path duplicado + melhorar erros |
| `src/hooks/useEnhancedUpload.ts` | Verificacao pre-processamento de creditos |
| `supabase/functions/extract-text-from-image/index.ts` | Reimplantar (sem mudancas de codigo) |

## Detalhes Tecnicos

### SQL Migration

```text
-- 1. Corrigir usuarios existentes com 0 creditos
UPDATE uso_usuarios uu
SET credits_remaining = p.credits_per_month
FROM plans p
WHERE uu.plan_id = p.id
  AND uu.credits_remaining = 0
  AND uu.credits_used_this_month = 0;

-- 2. Trigger para inicializar creditos em novos usuarios
CREATE FUNCTION initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  SELECT credits_per_month INTO NEW.credits_remaining
  FROM plans WHERE id = NEW.plan_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_initialize_credits
BEFORE INSERT ON uso_usuarios
FOR EACH ROW
WHEN (NEW.credits_remaining IS NULL OR NEW.credits_remaining = 0)
EXECUTE FUNCTION initialize_user_credits();
```

### useSyncManager.ts - Incluir creditos

```text
Ao fazer INSERT em uso_usuarios, buscar credits_per_month
do plano Free e incluir:
  credits_remaining: freePlan.credits_per_month
```

### useSequentialOCR.ts - Correcoes

```text
Linha 69 - Corrigir path:
  De: const filePath = `study-images/${fileName}`;
  Para: const filePath = fileName;

Linha 209-211 - Melhorar erro:
  Coletar o erro especifico da primeira imagem com falha
  e incluir na mensagem de erro final.
```

### useEnhancedUpload.ts - Verificacao de creditos

```text
Antes de chamar processImages(), verificar creditos:
  const creditCheck = await CreditsService.checkCreditsForAction(user.id, 'ocr');
  const totalCreditsNeeded = files.length * creditCheck.creditsRequired;
  
  if (creditCheck.creditsAvailable < totalCreditsNeeded) {
    toast.error('Creditos insuficientes', {
      description: `Voce precisa de ${totalCreditsNeeded} creditos 
                    mas tem apenas ${creditCheck.creditsAvailable}.`
    });
    return;
  }
```
