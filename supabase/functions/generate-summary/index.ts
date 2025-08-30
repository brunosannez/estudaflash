
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

// Criar prompt otimizado para ENEM e Ari de Sá
function createOptimizedPrompt(texto: string, schoolYear: string) {
  // Detectar se há múltiplas páginas no texto
  const hasMultiplePages = texto.includes('=== PÁGINA') && texto.split('=== PÁGINA').length > 2;
  
  const pageInstruction = hasMultiplePages 
    ? `\n📖 **ATENÇÃO - MÚLTIPLAS PÁGINAS:** O material contém ${texto.split('=== PÁGINA').length - 1} páginas organizadas sequencialmente. Mantenha a ordem lógica e fluxo do conteúdo ao criar o resumo.\n`
    : '';
  
  return `Você é um professor especialista do Colégio Ari de Sá, referência em preparação para ENEM e vestibulares. ${pageInstruction}

Crie um RESUMO DIDÁTICO COMPLETO baseado no texto fornecido, seguindo estas diretrizes específicas:

🎯 **FOCO PEDAGÓGICO:**
- Linguagem clara e acessível para estudantes de ${schoolYear}
- Estrutura didática típica do Ari de Sá
- Preparação específica para ENEM e vestibulares
- Conexões com questões de provas anteriores quando relevante

📚 **ESTRUTURA OBRIGATÓRIA:**
1. **CONCEITOS CENTRAIS** - Defina os pontos principais
2. **TEORIA FUNDAMENTAL** - Explique com exemplos práticos
3. **APLICAÇÕES ENEM** - Como o tema aparece em provas
4. **DICAS ESTRATÉGICAS** - Macetes para resolução rápida
5. **PONTOS DE ATENÇÃO** - Erros comuns e como evitar

✨ **ESTILO ARI DE SÁ:**
- Use bullet points e listas organizadas
- Inclua mnemonicos e associações quando útil
- Destaque fórmulas/conceitos importantes com **negrito**
- Faça conexões interdisciplinares quando possível
- Tom motivacional e confiante

🎓 **ADAPTAÇÃO POR NÍVEL:**
${schoolYear === 'Ensino Fundamental' ? 
  '- Foque em conceitos básicos e fundamentos\n- Use exemplos do cotidiano\n- Explique passo a passo' :
schoolYear === 'Ensino Médio' ?
  '- Nível intermediário com preparo para vestibular\n- Inclua conexões entre matérias\n- Foque em aplicações práticas' :
  '- Nível avançado para competições\n- Aborde aspectos mais complexos\n- Inclua contexto universitário'}

📖 **TEXTO PARA RESUMIR:**
${texto}

Gere um resumo completo, didático e estratégico que ajude o aluno a dominar o conteúdo e se sair bem nas provas!`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Função generate-summary iniciada');
    
    // Verificar configurações
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!anthropicApiKey) {
      console.error('❌ ANTHROPIC_API_KEY não encontrada');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Configuração da API Anthropic não encontrada',
          fallbackMessage: 'Serviço temporariamente indisponível. Tente novamente mais tarde.'
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
          fallbackMessage: 'Erro de configuração. Contate o suporte.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse do request
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('❌ Erro ao fazer parse do JSON:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Dados de entrada inválidos',
          fallbackMessage: 'Erro nos dados enviados. Tente novamente.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { uploadId, textoExtraido, userId, schoolYear } = requestBody;
    
    // Validações
    if (!uploadId || !textoExtraido || !userId) {
      console.error('❌ Parâmetros obrigatórios ausentes');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Parâmetros obrigatórios ausentes',
          fallbackMessage: 'Dados incompletos. Tente fazer upload novamente.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (textoExtraido.length > 50000) {
      console.error('❌ Texto muito grande:', textoExtraido.length);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Texto muito grande para processar',
          fallbackMessage: 'Imagem com muito texto. Use uma imagem menor ou divida o conteúdo.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (textoExtraido.length < 10) {
      console.error('❌ Texto muito pequeno:', textoExtraido.length);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Texto muito pequeno para resumir',
          fallbackMessage: 'Muito pouco texto na imagem. Use uma imagem com mais conteúdo textual.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Inicializar Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Buscar plano do usuário
    const userPlan = await getUserPlan(supabase, userId);
    const modelConfig = getModelConfigForPlan(userPlan);
    
    console.log('👤 Usuário:', userId);
    console.log('📊 Plano:', userPlan);
    console.log('🎓 Nível escolar:', schoolYear || 'Não informado');
    console.log('📝 Tamanho do texto:', textoExtraido.length, 'caracteres');

    // Criar prompt otimizado para Ari de Sá
    const optimizedPrompt = createOptimizedPrompt(textoExtraido, schoolYear || 'Ensino Médio');
    
    console.log('🤖 Iniciando chamada para API da Anthropic...');
    const startTime = Date.now();

    let response;
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: modelConfig.model,
          max_tokens: 4000, // Aumentado para resumos mais completos
          messages: [
            {
              role: 'user',
              content: optimizedPrompt
            }
          ],
          temperature: 0.3,
          top_p: 0.9
        })
      });
    } catch (error) {
      console.error('❌ Erro na conexão com a API:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Erro de conexão com o serviço de IA',
          fallbackMessage: 'Problema de conexão. Verifique sua internet e tente novamente.'
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const endTime = Date.now();
    console.log(`⏱️ Tempo da API: ${endTime - startTime}ms`);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.text();
      } catch (e) {
        errorData = 'Não foi possível ler erro';
      }
      
      console.error('❌ Erro da API:', response.status, errorData);
      
      let userMessage = 'Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos.';
      
      if (response.status === 429) {
        userMessage = 'Muitas solicitações. Aguarde alguns minutos e tente novamente.';
      } else if (response.status >= 500) {
        userMessage = 'Serviço temporariamente fora do ar. Tente novamente em alguns minutos.';
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: userMessage,
          fallbackMessage: userMessage
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
    } catch (error) {
      console.error('❌ Erro ao processar resposta:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Resposta inválida da IA',
          fallbackMessage: 'Problema ao processar resposta. Tente novamente.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('❌ Estrutura de resposta inválida:', data);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Resposta inesperada da IA',
          fallbackMessage: 'Resposta inesperada. Tente novamente.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const resumoGerado = data.content[0].text;
    console.log('✅ Resumo gerado:', resumoGerado.length, 'caracteres');

    // Salvar no banco
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
        console.error('❌ Erro ao salvar:', resumoError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Erro ao salvar resumo',
            fallbackMessage: 'Resumo gerado mas não foi possível salvar. Tente novamente.'
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('✅ Resumo salvo com ID:', insertData.id);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          resumo: insertData,
          stats: {
            caracteres_entrada: textoExtraido.length,
            caracteres_resumo: resumoGerado.length,
            tempo_processamento: `${endTime - startTime}ms`,
            modelo_usado: modelConfig.model,
            plano_usuario: userPlan,
            nivel_escolar: schoolYear || 'Ensino Médio'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (error) {
      console.error('❌ Erro inesperado ao salvar:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Erro inesperado ao salvar',
          fallbackMessage: 'Erro interno. Tente novamente.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erro interno do servidor',
        fallbackMessage: 'Erro inesperado. Tente novamente mais tarde.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
