
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
      throw new Error('ANTHROPIC_API_KEY não configurada');
    }

    console.log('Gerando resumo para upload:', uploadId);

    // Prompt otimizado para gerar resumos didáticos
    const prompt = `Você é um professor experiente que precisa criar um resumo didático para ajudar um aluno a se preparar para uma prova.

Baseado no seguinte texto extraído de material de estudo, crie um resumo seguindo estas diretrizes:

1. Use linguagem simples e objetiva
2. Organize em tópicos curtos e fáceis de memorizar
3. Inclua exemplos simples quando possível
4. Destaque conceitos principais com bullet points
5. Mantenha um tom professoral e didático

Texto do material de estudo:
${textoExtraido}

Gere um resumo estruturado que seja fácil de estudar e revisar:`;

    // Chamar API da Anthropic
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro da API Anthropic:', errorData);
      throw new Error(`Erro ao gerar resumo: ${response.status}`);
    }

    const data = await response.json();
    const resumoGerado = data.content[0].text;

    console.log('Resumo gerado com sucesso, salvando no banco...');

    // Salvar resumo no banco de dados
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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
      console.error('Erro ao salvar resumo:', resumoError);
      throw new Error('Erro ao salvar resumo no banco de dados');
    }

    console.log('Resumo salvo com sucesso:', resumoData.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        resumo: resumoData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro na função generate-summary:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
