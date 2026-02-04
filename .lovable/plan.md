
# Plano: Correção Completa do Painel Administrativo

## Problemas Identificados

Após análise detalhada do banco de dados e código, identifiquei 4 problemas principais:

### 1. Erro ao Carregar Usuários
**Causa**: A política RLS da tabela `admin_users` tem **recursão infinita**:
```sql
-- A política verifica se o usuário é admin consultando admin_users
-- Isso causa loop infinito quando tentamos acessar admin_users
EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
```

### 2. APIs com Custo Zero
**Causa**: A tabela `api_usage_tracking` está **completamente vazia**. As edge functions não estão registrando o uso de tokens e custos das APIs (OpenAI, Anthropic, etc).

### 3. Analytics sem Dados Reais  
**Causa**: A função `get_usage_analytics` lê da tabela `usage_logs` que está vazia, mas os dados reais de créditos estão em `credits_usage_log` (com 10+ registros).

### 4. Assinaturas Vazias
**Causa**: A tabela `subscriptions` não tem dados. Isso é esperado se ainda não há pagamentos processados, mas o sistema deveria ter um fallback.

---

## Plano de Correção

### Fase 1: Corrigir RLS da Tabela admin_users

**Problema**: Recursão infinita na política RLS
**Solução**: Recriar a política RLS usando `uso_usuarios.is_admin` ao invés de consultar `admin_users`

```sql
-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Admins can manage admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admins can view all admin_users" ON admin_users;

-- Criar nova política sem recursão
CREATE POLICY "Admin users only" ON admin_users
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM uso_usuarios 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);
```

---

### Fase 2: Registrar Uso de API nas Edge Functions

**Problema**: Edge functions não registram tokens/custos
**Solução**: Adicionar logging de API após cada chamada bem-sucedida

Arquivos a modificar:
- `supabase/functions/generate-summary/index.ts`
- `supabase/functions/generate-flashcards/index.ts`
- `supabase/functions/generate-quiz/index.ts`
- `supabase/functions/generate-mind-map/index.ts`

Código a adicionar após cada chamada de API:
```typescript
// Após response.json() bem-sucedido
const tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens || 0;
const estimatedCost = calculateCost(modelConfig.model, tokensUsed);

await supabase
  .from('api_usage_tracking')
  .insert({
    user_id: userId,
    api_provider: 'anthropic',
    action_type: 'summary', // ou 'flashcard', 'quiz', etc
    tokens_used: tokensUsed,
    estimated_cost_usd: estimatedCost,
    model_used: modelConfig.model,
    success: true
  });
```

Função auxiliar para calcular custo:
```typescript
function calculateCost(model: string, tokens: number): number {
  const costs: Record<string, number> = {
    'claude-sonnet-4-20250514': 0.003 / 1000, // $3 per 1M tokens (input)
    'gpt-4o': 0.005 / 1000,
    'gpt-4o-mini': 0.00015 / 1000
  };
  return tokens * (costs[model] || 0.003 / 1000);
}
```

---

### Fase 3: Corrigir Analytics para Usar Dados Reais

**Problema**: `get_usage_analytics` lê de `usage_logs` (vazia) ao invés de `credits_usage_log`
**Solução**: Atualizar a função para usar a tabela correta

```sql
CREATE OR REPLACE FUNCTION get_usage_analytics(...)
RETURNS TABLE (...)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cul.action_type,
    cul.created_at::DATE as usage_date,
    COUNT(*) as total_actions,
    COUNT(DISTINCT cul.user_id) as unique_users,
    SUM(cul.credits_consumed) as total_credits
  FROM public.credits_usage_log cul  -- Tabela correta!
  WHERE cul.created_at::DATE >= start_date 
    AND cul.created_at::DATE <= end_date
  GROUP BY cul.action_type, cul.created_at::DATE
  ORDER BY usage_date DESC;
END;
$$;
```

---

### Fase 4: Adicionar Fallback para Assinaturas Vazias

**Problema**: UI quebra quando não há assinaturas
**Solução**: Atualizar `SubscriptionManagement.tsx` para mostrar estado vazio amigável

```typescript
// Se não há assinaturas, mostrar mensagem informativa
if (subscriptions.length === 0) {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3>Nenhuma assinatura encontrada</h3>
        <p>As assinaturas aparecerão aqui quando usuários fizerem upgrade.</p>
      </CardContent>
    </Card>
  );
}
```

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| Nova migration SQL | Corrigir RLS admin_users, atualizar get_usage_analytics |
| `generate-summary/index.ts` | Adicionar logging de API |
| `generate-flashcards/index.ts` | Adicionar logging de API |
| `generate-quiz/index.ts` | Adicionar logging de API |
| `generate-mind-map/index.ts` | Adicionar logging de API |
| `SubscriptionManagement.tsx` | Melhorar estado vazio |
| `ApiUsageMonitoring.tsx` | Adicionar fallback quando sem dados |

---

## Resultado Esperado

Após as correções:

1. **Usuários**: Lista carrega normalmente mostrando todos os usuários
2. **APIs**: Gráficos mostram tokens consumidos e custos reais por provedor
3. **Analytics**: Dados reais de uso (flashcards, resumos, quizzes) aparecem nos gráficos
4. **Assinaturas**: Mensagem amigável quando não há assinaturas

---

## Dados Já Existentes no Banco

A tabela `credits_usage_log` JÁ TEM dados reais:
- 10+ registros de uso de flashcards
- Usuário: cfef2417-fa37-4b91-a351-6c8fde933658
- Créditos consumidos: 3 por ação
- Datas: agosto 2025 - fevereiro 2026

Após a correção, esses dados aparecerão automaticamente no painel de Analytics.
