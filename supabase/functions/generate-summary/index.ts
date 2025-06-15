
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para obter configuração do modelo baseada no plano
function getModelConfigForPlan(plan: string) {
  switch (plan) {
    case 'free':
    case 'pro':
    case 'edu':
      return {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022'
      };
    default:
      return {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022'
      };
  }
}

async function getUserPlan(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('uso_usuarios')
      .select('plano')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Erro ao buscar plano do usuário:', error);
      return 'free'; // Fallback para plano free
    }
    
    return data?.plano || 'free';
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    return 'free';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Função generate-summary iniciada');
    
    // Verificar configuração inicial
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('🔧 Verificando configurações...');
    console.log('- ANTHROPIC_API_KEY:', anthropicApiKey ? '✅ Configurada' : '❌ Não encontrada');
    console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Não encontrada');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Configurada' : '❌ Não encontrada');

    if (!anthropicApiKey) {
      console.error('❌ ANTHROPIC_API_KEY não encontrada nas variáveis de ambiente');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Configuração da API Anthropic não encontrada. Contate o administrador.',
          details: 'ANTHROPIC_API_KEY não está configurada no Supabase'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Configurações do Supabase não encontradas');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Configuração do banco de dados inválida',
          details: 'Configurações do Supabase não encontradas'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse do request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('📥 Request recebido:', { 
        uploadId: requestBody?.uploadId, 
        textoLength: requestBody?.textoExtraido?.length,
        userId: requestBody?.userId 
      });
    } catch (error) {
      console.error('❌ Erro ao fazer parse do JSON:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Dados de entrada inválidos',
          details: 'Erro ao processar JSON do request'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { uploadId, textoExtraido, userId } = requestBody;
    
    if (!uploadId || !textoExtraido) {
      console.error('❌ Parâmetros obrigatórios ausentes:', { uploadId: !!uploadId, textoExtraido: !!textoExtraido });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Upload ID e texto extraído são obrigatórios',
          details: 'Parâmetros necessários não foram fornecidos'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Inicializar Supabase para buscar plano do usuário
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Buscar plano do usuário
    const userPlan = await getUserPlan(supabase, userId);
    const modelConfig = getModelConfigForPlan(userPlan);
    
    console.log('👤 Plano do usuário:', userPlan);
    console.log('🤖 Modelo selecionado:', modelConfig);

    console.log('✅ Parâmetros validados com sucesso');
    console.log('📊 Estatísticas do texto:', {
      caracteres: textoExtraido.length,
      palavras: textoExtraido.split(' ').length,
      uploadId,
      userPlan,
      modelUsed: modelConfig.model
    });

    // Verificar se o texto não é muito grande
    if (textoExtraido.length > 50000) {
      console.error('❌ Texto muito grande:', textoExtraido.length, 'caracteres');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Texto muito grande para processar. Use uma imagem com menos texto.',
          details: `Texto tem ${textoExtraido.length} caracteres, máximo permitido: 50000`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

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

    console.log('🤖 Iniciando chamada para API da Anthropic...');
    console.log('📝 Modelo utilizado:', modelConfig.model);
    
    const startTime = Date.now();

    let response;
    try {
      // Chamar API da Anthropic
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: modelConfig.model,
          max_tokens: 3000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          top_p: 0.9
        })
      });
    } catch (error) {
      console.error('❌ Erro na conexão com a API Anthropic:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos.',
          details: `Erro de rede: ${error.message}`,
          fallbackMessage: 'Nossa IA está temporariamente indisponível. Por favor, tente novamente mais tarde.'
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const endTime = Date.now();
    console.log(`⏱️ Tempo de resposta da API Anthropic: ${endTime - startTime}ms`);
    console.log('📡 Status da resposta:', response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.text();
        console.error('❌ Erro da API Anthropic:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData
        });
      } catch (e) {
        console.error('❌ Erro ao ler resposta de erro da API:', e);
        errorData = 'Não foi possível ler a resposta de erro';
      }
      
      // Mensagens de erro mais específicas baseadas no status
      let userMessage = 'Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos.';
      
      if (response.status === 400) {
        userMessage = 'Dados inválidos enviados para a API. Verifique o texto extraído.';
      } else if (response.status === 401) {
        userMessage = 'Problema de autenticação com o serviço de IA. Contate o administrador.';
      } else if (response.status === 403) {
        userMessage = 'Acesso negado pela API. Verifique as permissões.';
      } else if (response.status === 429) {
        userMessage = 'Limite de uso da API excedido. Tente novamente em alguns minutos.';
      } else if (response.status >= 500) {
        userMessage = 'Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos.';
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: userMessage,
          details: `API retornou status ${response.status}: ${response.statusText}`,
          fallbackMessage: 'Nossa IA está temporariamente indisponível. Por favor, tente novamente mais tarde.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let data;
    try {
      data = await response.json();
      console.log('✅ Resposta da API parseada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao fazer parse da resposta da API:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Resposta inválida da API de IA',
          details: 'Erro ao processar resposta da Anthropic',
          fallbackMessage: 'Houve um problema ao processar a resposta da IA. Tente novamente.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('❌ Estrutura de resposta inesperada da API:', data);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Resposta inválida da API Anthropic',
          details: 'Estrutura de dados inesperada na resposta',
          fallbackMessage: 'Recebemos uma resposta inesperada da IA. Tente novamente.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const resumoGerado = data.content[0].text;
    console.log('✅ Resumo gerado com sucesso');
    console.log('📊 Estatísticas do resumo:', {
      caracteres: resumoGerado.length,
      palavras: resumoGerado.split(' ').length,
      tempoProcessamento: `${endTime - startTime}ms`
    });

    console.log('💾 Salvando resumo no banco de dados...');

    let resumoData;
    try {
      const { data: insertData, error: resumoError } = await supabase
        .from('resumos')
        .insert({
          upload_id: uploadId,
          resumo_gerado: resumoGerado
        })
        .select()
        .single();

      if (resumoError) {
        console.error('❌ Erro ao salvar resumo no banco:', resumoError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Erro ao salvar resumo no banco de dados',
            details: `Erro do banco: ${resumoError.message}`
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      resumoData = insertData;
      console.log('✅ Resumo salvo com sucesso no banco. ID:', resumoData.id);
      
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar no banco:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Erro inesperado ao salvar no banco de dados',
          details: error.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('🎉 Processo concluído com sucesso!');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        resumo: resumoData,
        stats: {
          caracteres_entrada: textoExtraido.length,
          caracteres_resumo: resumoGerado.length,
          tempo_processamento: `${endTime - startTime}ms`,
          modelo_usado: modelConfig.model,
          plano_usuario: userPlan
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erro geral na função generate-summary:', error);
    console.error('📋 Stack trace:', error.stack);
    console.error('🔍 Tipo do erro:', typeof error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erro interno do servidor',
        details: `Erro não tratado: ${error.message}`,
        fallbackMessage: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
