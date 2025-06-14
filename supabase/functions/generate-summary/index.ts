
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { uploadId, textoExtraido } = await req.json();
    
    if (!uploadId || !textoExtraido) {
      throw new Error('Upload ID e texto extraído são obrigatórios');
    }

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY não encontrada nas variáveis de ambiente');
      throw new Error('ANTHROPIC_API_KEY não configurada');
    }

    console.log('Gerando resumo para upload:', uploadId);
    console.log('Tamanho do texto a ser processado:', textoExtraido.length, 'caracteres');
    console.log('Modelo utilizado: claude-sonnet-4-20250514');

    // Prompt otimizado para gerar resumos didáticos
    const prompt = `Você é um professor experiente que precisa criar um resumo didático para ajudar um aluno a se preparar para uma prova.

Baseado no seguinte texto extraído de material de estudo, crie um resumo seguindo estas diretrizes:

1. Use linguagem simples e objetiva
2. Organize em tópicos curtos e fáceis de memorizar
3. Inclua exemplos simples quando possível
4. Destaque conceitos principais com bullet points
5. Mantenha um tom professoral e didático
6. Estruture o conteúdo de forma hierárquica (títulos, subtítulos, pontos principais)

Texto do material de estudo:
${textoExtraido}

Gere um resumo estruturado que seja fácil de estudar e revisar:`;

    console.log('Iniciando chamada para API da Anthropic...');
    const startTime = Date.now();

    // Chamar API da Anthropic com o modelo mais recente
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', // Modelo mais recente
        max_tokens: 3000, // Aumentado para resumos mais detalhados
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Ligeiramente mais criativo mas ainda consistente
        top_p: 0.9
      })
    });

    const endTime = Date.now();
    console.log(`Tempo de resposta da API Anthropic: ${endTime - startTime}ms`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro da API Anthropic:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      });
      
      // Mensagens de erro mais específicas
      if (response.status === 400) {
        throw new Error('Dados inválidos enviados para a API Anthropic');
      } else if (response.status === 401) {
        throw new Error('Chave da API Anthropic inválida ou expirada');
      } else if (response.status === 403) {
        throw new Error('Acesso negado pela API Anthropic');
      } else if (response.status === 404) {
        throw new Error('Modelo da API Anthropic não encontrado');
      } else if (response.status === 429) {
        throw new Error('Limite de rate da API Anthropic excedido. Tente novamente em alguns minutos');
      } else {
        throw new Error(`Erro ao gerar resumo: ${response.status} - ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Estrutura de resposta inesperada da API:', data);
      throw new Error('Resposta inválida da API Anthropic');
    }

    const resumoGerado = data.content[0].text;
    console.log('Resumo gerado com sucesso. Tamanho:', resumoGerado.length, 'caracteres');

    console.log('Salvando resumo no banco de dados...');

    // Salvar resumo no banco de dados
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Configurações do Supabase não encontradas');
      throw new Error('Configuração do banco de dados inválida');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: resumoData, error: resumoError } = await supabase
      .from('resumos')
      .insert({
        upload_id: uploadId,
        resumo_gerado: resumoGerado
      })
      .select()
      .single();

    if (resumoError) {
      console.error('Erro ao salvar resumo no banco:', resumoError);
      throw new Error(`Erro ao salvar resumo no banco de dados: ${resumoError.message}`);
    }

    console.log('Resumo salvo com sucesso no banco. ID:', resumoData.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        resumo: resumoData,
        stats: {
          caracteres_entrada: textoExtraido.length,
          caracteres_resumo: resumoGerado.length,
          tempo_processamento: `${endTime - startTime}ms`
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro na função generate-summary:', error);
    
    // Log mais detalhado do erro
    console.error('Stack trace:', error.stack);
    console.error('Tipo do erro:', typeof error);
    console.error('Propriedades do erro:', Object.getOwnPropertyNames(error));
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erro interno do servidor',
        details: 'Verifique os logs da função para mais detalhes'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
