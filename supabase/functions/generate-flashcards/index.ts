
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

// Detectar tema automático do conteúdo
function detectTheme(content: string): string {
  const keywords: { [key: string]: string[] } = {
    'História': ['guerra', 'século', 'revolução', 'colonização', 'império', 'independência', 'período', 'história'],
    'Matemática': ['equação', 'função', 'cálculo', 'geometria', 'álgebra', 'número', 'fórmula', 'matemática'],
    'Biologia': ['célula', 'DNA', 'evolução', 'organismo', 'genética', 'espécie', 'sistema', 'biologia'],
    'Química': ['átomo', 'molécula', 'reação', 'elemento', 'ligação', 'composto', 'solução', 'química'],
    'Física': ['força', 'energia', 'movimento', 'velocidade', 'massa', 'gravidade', 'onda', 'física'],
    'Geografia': ['clima', 'relevo', 'população', 'território', 'região', 'paisagem', 'urbano', 'geografia'],
    'Literatura': ['obra', 'autor', 'texto', 'narrativa', 'personagem', 'estilo', 'movimento', 'literatura'],
    'Filosofia': ['pensamento', 'filosofia', 'ética', 'moral', 'razão', 'conhecimento', 'verdade']
  };
  
  const contentLower = content.toLowerCase();
  let bestMatch = 'Geral';
  let maxScore = 0;
  
  for (const [subject, words] of Object.entries(keywords)) {
    const score = words.filter(word => contentLower.includes(word)).length;
    if (score > maxScore) {
      maxScore = score;
      bestMatch = subject;
    }
  }
  
  return bestMatch;
}

// Obter idade do usuário (padrão 15 anos se não especificado)
async function getUserAge(supabase: any, userId: string): Promise<number> {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('date_of_birth')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (profile?.date_of_birth) {
      const age = new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear();
      return age;
    }
  } catch (error) {
    console.log('Erro ao obter idade do usuário:', error);
  }
  return 15; // Idade padrão
}

// Calcular quantidade ideal de cards baseada no tamanho
function calculateTargetCards(wordCount: number): number {
  if (wordCount <= 300) return Math.min(10, Math.max(8, Math.floor(wordCount / 30)));
  if (wordCount <= 600) return Math.min(15, Math.max(12, Math.floor(wordCount / 40)));
  if (wordCount <= 900) return Math.min(20, Math.max(15, Math.floor(wordCount / 45)));
  return Math.min(20, Math.max(18, Math.floor(wordCount / 50))); // Máximo 20 cards
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

    // SISTEMA AVANÇADO DE GERAÇÃO DE FLASHCARDS COM VARIÁVEIS DINÂMICAS
    const theme = detectTheme(textoResumo);
    const userAge = await getUserAge(supabase, userId);
    const wordCount = textoResumo.split(/\s+/).length;
    const targetCards = calculateTargetCards(wordCount);

    console.log(`📊 Análise do conteúdo: ${wordCount} palavras → ${targetCards} flashcards`);
    console.log(`🎯 Tema detectado: ${theme}, Idade: ${userAge} anos`);

    const prompt = `Você é um elaborador de materiais didáticos no estilo Anki. Sua missão é gerar flashcards eficientes e claros apenas com base no RESUMO abaixo. Proibido inserir dados externos.

— REGRAS:
1) Use somente o conteúdo do resumo.
2) Para cada macrotema, crie pelo menos 1–2 cards que cubram diferentes aspectos (definição, causa, consequência, exemplo, verdadeiro/falso).
3) Linguagem adaptada para um estudante de ~${userAge} anos.
4) Cada card:
   - front: pergunta clara (1 ideia)
   - back: resposta de 1–2 frases
   - explanation: até 3 frases de contexto
   - type: escolha entre "definicao", "causa_efeito", "exemplo", "verdadeiro_falso"
   - tags: ["${theme}"]
   - difficulty: easy|medium|hard
   - evidence: trecho literal (<=200 caracteres) do resumo que comprove a resposta
5) Gere exatamente ${targetCards} flashcards baseado no tamanho do conteúdo.
6) NUNCA gere mais de 20 cards de uma só vez para não saturar o aluno.
7) Verifique duplicidade de perguntas — não gerar cards repetidos.

— RESUMO:
"""
${textoResumo}
"""

— SAÍDA (JSON válido):
{
  "meta": {
    "word_count": ${wordCount},
    "cards_target": ${targetCards},
    "cards_generated": <número_real_de_cards_criados>
  },
  "flashcards": [
    {
      "front": "...",
      "back": "...",
      "explanation": "...",
      "type": "...",
      "difficulty": "...",
      "tags": ["${theme}"],
      "evidence": "..."
    }
  ]
}

Responda APENAS com o JSON válido, sem texto adicional.`;

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

    // Tentar extrair JSON do texto - buscar objeto com array "flashcards"
    let jsonText = flashcardsText;
    
    // Se há um objeto com propriedade flashcards
    const objectMatch = flashcardsText.match(/\{[\s\S]*"flashcards"\s*:\s*\[[\s\S]*\]\s*[\s\S]*\}/);
    if (objectMatch) {
      jsonText = objectMatch[0];
    } else {
      // Fallback: buscar apenas o array
      const jsonStart = flashcardsText.indexOf('[');
      const jsonEnd = flashcardsText.lastIndexOf(']');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonText = `{"flashcards": ${flashcardsText.substring(jsonStart, jsonEnd + 1)}}`;
      }
    }

    console.log('Processando flashcards gerados...');

    let flashcardsData;
    try {
      flashcardsData = JSON.parse(jsonText);
    } catch (e) {
      console.error('Erro ao parsear JSON dos flashcards:', e);
      console.error('Texto recebido:', jsonText.substring(0, 500));
      throw new Error('Erro ao processar flashcards gerados pela IA');
    }

    const flashcards = flashcardsData.flashcards || flashcardsData;
    
    if (!Array.isArray(flashcards)) {
      throw new Error('Formato inválido de flashcards retornado pela IA');
    }

    console.log(`${flashcards.length} flashcards gerados com sucesso`);

    // VALIDAÇÃO DE FIDELIDADE AO CONTEÚDO
    const validatedFlashcards = flashcards.filter((card: any) => {
      // Verificações básicas de estrutura - nova estrutura com front/back
      const question = card.front || card.pergunta;
      const answer = card.back || card.resposta;
      
      if (!question || !answer || question.length < 10 || answer.length < 5) {
        console.warn('❌ Flashcard rejeitado: estrutura inválida', card);
        return false;
      }

      // Verificar se há palavras-chave do conteúdo original na resposta
      const contentWords = textoResumo.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const responseWords = answer.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const commonWords = responseWords.filter(word => contentWords.includes(word));
      
      // Deve ter pelo menos 20% de overlap de palavras significativas
      const overlapRatio = commonWords.length / responseWords.length;
      if (overlapRatio < 0.2) {
        console.warn('❌ Flashcard rejeitado: baixa fidelidade ao conteúdo', {
          pergunta: question,
          overlap: overlapRatio
        });
        return false;
      }

      return true;
    });

    if (validatedFlashcards.length < Math.ceil(targetCards * 0.6)) {
      console.error('❌ Muitos flashcards rejeitados na validação');
      throw new Error('Qualidade insuficiente dos flashcards gerados. Tente novamente.');
    }

    console.log(`✅ ${validatedFlashcards.length}/${flashcards.length} flashcards aprovados na validação`);

    // Salvar flashcards no banco de dados - mapear nova estrutura para schema existente
    const flashcardsToInsert = validatedFlashcards.map((card: any) => ({
      resumo_id: resumoId,
      pergunta: card.front || card.pergunta,
      resposta: card.back || card.resposta,
      exemplo: card.explanation || card.exemplo || null,
      card_type: card.type || 'definicao', // Novo campo type mapeado
      difficulty: card.difficulty === 'easy' ? 1 : card.difficulty === 'medium' ? 2 : 3,
      category: Array.isArray(card.tags) ? card.tags[0] || theme : theme
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
          cobertura_qualidade: Math.round((validatedFlashcards.length / targetCards) * 100)
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
