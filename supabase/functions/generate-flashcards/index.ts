
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
        provider: 'huggingface',
        model: 'deepseek-ai/DeepSeek-V2-Chat'
      };
    default:
      return {
        provider: 'huggingface',
        model: 'deepseek-ai/DeepSeek-V2-Chat'
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

async function generateWithHuggingFace(apiKey: string, model: string, prompt: string) {
  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 2000,
        temperature: 0.4,
        top_p: 0.9,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('HuggingFace API error:', response.status, errorText);
    throw new Error(`Erro na API HuggingFace: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  
  // HuggingFace retorna um array, pegamos o primeiro resultado
  if (Array.isArray(result) && result.length > 0) {
    return result[0].generated_text || result[0].text || '';
  }
  
  throw new Error('Resposta inválida da API HuggingFace');
}

async function generateWithAnthropic(apiKey: string, model: string, prompt: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      top_p: 0.9
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Anthropic API error:', response.status, errorData);
    throw new Error(`Erro na API Anthropic: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('Resposta inválida da API Anthropic');
  }

  return data.content[0].text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumoId, textoResumo, userId } = await req.json();
    
    if (!resumoId || !textoResumo) {
      throw new Error('ID do resumo e texto são obrigatórios');
    }

    // Verificar APIs disponíveis
    const huggingfaceApiKey = Deno.env.get('HUGGINGFACE_API_KEY');
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Configurações disponíveis:');
    console.log('- HUGGINGFACE_API_KEY:', huggingfaceApiKey ? '✅' : '❌');
    console.log('- ANTHROPIC_API_KEY:', anthropicApiKey ? '✅' : '❌');

    // Inicializar Supabase
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    
    // NOVO: Consumir créditos antes de gerar flashcards
    if (userId) {
      const { data: creditResult, error: creditError } = await supabase.rpc('consume_credits', {
        target_user_id: userId,
        action_type: 'flashcards'
      });

      if (creditError || !creditResult || !creditResult[0]?.success) {
        console.error('❌ Erro ao consumir créditos:', creditError);
        const message = creditResult?.[0]?.message || 'Créditos insuficientes';
        return new Response(
          JSON.stringify({ 
            success: false,
            error: message,
            fallbackMessage: message.includes('insuficientes') 
              ? 'Você não tem créditos suficientes. Faça upgrade do seu plano.'
              : 'Erro ao processar créditos. Tente novamente.'
          }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log(`💳 Créditos consumidos para flashcards: ${creditResult[0].credits_consumed}. Restam: ${creditResult[0].credits_remaining}`);
    }
    
    // Buscar plano do usuário
    const userPlan = await getUserPlan(supabase, userId);
    const modelConfig = getModelConfigForPlan(userPlan);

    console.log('👤 Plano do usuário:', userPlan);
    console.log('🤖 Modelo selecionado:', modelConfig);
    console.log('Gerando flashcards automaticamente para resumo:', resumoId);
    console.log('Tamanho do texto:', textoResumo.length, 'caracteres');

    // SISTEMA AVANÇADO DE GERAÇÃO DE FLASHCARDS
    // Calcular quantidade ideal baseada no conteúdo
    const wordCount = textoResumo.split(' ').length;
    const idealFlashcardCount = Math.max(6, Math.min(20, Math.ceil(wordCount / 175)));
    
    console.log(`📊 Análise do conteúdo: ${wordCount} palavras → ${idealFlashcardCount} flashcards`);

    const prompt = `INSTRUÇÕES CRÍTICAS - VOCÊ É UM ANALISADOR DE CONTEÚDO ULTRA-PRECISO:

🎯 OBJETIVO: Criar exatamente ${idealFlashcardCount} flashcards baseados EXCLUSIVAMENTE no conteúdo fornecido.

📋 REGRAS ABSOLUTAS:
1. JAMAIS invente informações que não estão no texto
2. CADA flashcard deve ter base textual comprovável no resumo
3. CUBRA 100% dos conceitos principais do conteúdo
4. Use APENAS informações, dados, nomes, datas e exemplos do próprio resumo
5. Se não há exemplo no texto, use "null" - NUNCA invente

🔍 PROCESSO OBRIGATÓRIO:
ETAPA 1: Identifique TODOS os conceitos-chave do resumo
ETAPA 2: Mapeie informações factuais (datas, nomes, números, processos)
ETAPA 3: Crie flashcards que cubram cada seção importante
ETAPA 4: Varie tipos: conceituais, factuais, comparativas, de aplicação

📝 TIPOS DE FLASHCARDS A CRIAR:
- Conceitos fundamentais (O que é...?)
- Dados específicos (Quando? Quanto? Quem?)
- Processos e causas (Como funciona? Por que?)
- Comparações (Qual a diferença entre...?)
- Aplicações práticas (Como se aplica...?)

CONTEÚDO DO RESUMO:
${textoResumo}

⚠️ VALIDAÇÃO FINAL: 
- Verifique se CADA flashcard tem base no texto original
- Confirme cobertura completa dos tópicos principais
- Elimine qualquer informação externa ou inventada

RETORNE EXATAMENTE ${idealFlashcardCount} FLASHCARDS no formato JSON:
[
  {
    "pergunta": "Pergunta baseada exclusivamente no resumo...",
    "resposta": "Resposta fiel ao conteúdo original...",
    "exemplo": "Exemplo extraído do texto ou null"
  }
]

IMPORTANTE: Não adicione texto explicativo, apenas o array JSON puro.`;

    console.log('Iniciando chamada para API...', modelConfig.provider);
    const startTime = Date.now();

    let flashcardsText = '';
    
    try {
      if (modelConfig.provider === 'huggingface' && huggingfaceApiKey) {
        flashcardsText = await generateWithHuggingFace(huggingfaceApiKey, modelConfig.model, prompt);
      } else if (modelConfig.provider === 'anthropic' && anthropicApiKey) {
        flashcardsText = await generateWithAnthropic(anthropicApiKey, modelConfig.model, prompt);
      } else {
        // Fallback: tentar Anthropic se disponível, senão HuggingFace
        if (anthropicApiKey) {
          console.log('🔄 Usando Anthropic como fallback');
          flashcardsText = await generateWithAnthropic(anthropicApiKey, 'claude-3-5-sonnet-20241022', prompt);
        } else if (huggingfaceApiKey) {
          console.log('🔄 Usando HuggingFace como fallback');
          flashcardsText = await generateWithHuggingFace(huggingfaceApiKey, 'deepseek-ai/DeepSeek-V2-Chat', prompt);
        } else {
          throw new Error('Nenhuma API de IA está configurada. Contate o administrador.');
        }
      }
    } catch (error) {
      console.error('Erro na API principal, tentando fallback:', error.message);
      
      // Tentativa de fallback
      try {
        if (modelConfig.provider === 'huggingface' && anthropicApiKey) {
          console.log('🔄 Fallback: Usando Anthropic');
          flashcardsText = await generateWithAnthropic(anthropicApiKey, 'claude-3-5-sonnet-20241022', prompt);
        } else if (modelConfig.provider === 'anthropic' && huggingfaceApiKey) {
          console.log('🔄 Fallback: Usando HuggingFace');
          flashcardsText = await generateWithHuggingFace(huggingfaceApiKey, 'deepseek-ai/DeepSeek-V2-Chat', prompt);
        } else {
          throw error; // Re-throw se não há fallback disponível
        }
      } catch (fallbackError) {
        console.error('Fallback também falhou:', fallbackError.message);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Serviços de IA temporariamente indisponíveis. Tente novamente em alguns minutos.',
            fallbackMessage: 'Nossos serviços de IA estão temporariamente indisponíveis. Por favor, tente novamente mais tarde.'
          }),
          {
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    const endTime = Date.now();
    console.log(`Tempo de resposta da API: ${endTime - startTime}ms`);

    // Remover possível formatação markdown
    if (flashcardsText.startsWith('```json')) {
      flashcardsText = flashcardsText.replace(/^```json\s*/, '').replace(/```$/, '');
    } else if (flashcardsText.startsWith('```')) {
      flashcardsText = flashcardsText.replace(/^```\w*\s*/, '').replace(/```$/, '');
    }

    // Tentar extrair JSON do texto
    const jsonStart = flashcardsText.indexOf('[');
    const jsonEnd = flashcardsText.lastIndexOf(']');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      flashcardsText = flashcardsText.substring(jsonStart, jsonEnd + 1);
    }

    console.log('Processando flashcards gerados...');

    let flashcards;
    try {
      flashcards = JSON.parse(flashcardsText);
    } catch (e) {
      console.error('Erro ao parsear JSON dos flashcards:', e);
      console.error('Texto recebido:', flashcardsText.substring(0, 500));
      throw new Error('Erro ao processar flashcards gerados pela IA');
    }

    if (!Array.isArray(flashcards)) {
      throw new Error('Formato inválido de flashcards retornado pela IA');
    }

    console.log(`${flashcards.length} flashcards gerados com sucesso`);

    // VALIDAÇÃO DE FIDELIDADE AO CONTEÚDO
    const validatedFlashcards = flashcards.filter((card: any) => {
      // Verificações básicas de estrutura
      if (!card.pergunta || !card.resposta || card.pergunta.length < 10 || card.resposta.length < 5) {
        console.warn('❌ Flashcard rejeitado: estrutura inválida', card);
        return false;
      }

      // Verificar se há palavras-chave do conteúdo original na resposta
      const contentWords = textoResumo.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const responseWords = card.resposta.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const commonWords = responseWords.filter(word => contentWords.includes(word));
      
      // Deve ter pelo menos 20% de overlap de palavras significativas
      const overlapRatio = commonWords.length / responseWords.length;
      if (overlapRatio < 0.2) {
        console.warn('❌ Flashcard rejeitado: baixa fidelidade ao conteúdo', {
          pergunta: card.pergunta,
          overlap: overlapRatio
        });
        return false;
      }

      return true;
    });

    if (validatedFlashcards.length < Math.ceil(idealFlashcardCount * 0.6)) {
      console.error('❌ Muitos flashcards rejeitados na validação');
      throw new Error('Qualidade insuficiente dos flashcards gerados. Tente novamente.');
    }

    console.log(`✅ ${validatedFlashcards.length}/${flashcards.length} flashcards aprovados na validação`);

    // Salvar flashcards no banco de dados
    const flashcardsToInsert = validatedFlashcards.map((card: any) => ({
      resumo_id: resumoId,
      pergunta: card.pergunta,
      resposta: card.resposta,
      exemplo: card.exemplo || null
    }));

    const { data: savedFlashcards, error: flashcardError } = await supabase
      .from('flashcards')
      .insert(flashcardsToInsert)
      .select();

    if (flashcardError) {
      console.error('Erro ao salvar flashcards no banco:', flashcardError);
      throw new Error(`Erro ao salvar flashcards: ${flashcardError.message}`);
    }

    console.log(`${savedFlashcards.length} flashcards salvos com sucesso no banco`);

    return new Response(
      JSON.stringify({ 
        success: true,
        flashcards: savedFlashcards,
        stats: {
          total_gerado: validatedFlashcards.length,
          total_aprovado: validatedFlashcards.length,
          total_rejeitado: flashcards.length - validatedFlashcards.length,
          tempo_processamento: `${endTime - startTime}ms`,
          modelo_usado: modelConfig.model,
          plano_usuario: userPlan,
          palavras_analisadas: wordCount,
          cobertura_qualidade: Math.round((validatedFlashcards.length / idealFlashcardCount) * 100)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro na função generate-flashcards:', error);
    
    let userMessage = 'Erro ao gerar flashcards';
    let fallbackMessage = 'Houve um problema ao gerar os flashcards. Tente novamente mais tarde.';
    
    if (error.message.includes('API')) {
      userMessage = 'Serviço de IA temporariamente indisponível';
      fallbackMessage = 'Nosso serviço de IA está temporariamente indisponível. Por favor, tente novamente em alguns minutos.';
    } else if (error.message.includes('configurada')) {
      userMessage = 'Configuração de IA necessária. Contate o administrador.';
      fallbackMessage = 'O serviço precisa ser configurado. Entre em contato com o administrador.';
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: userMessage,
        fallbackMessage: fallbackMessage,
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
