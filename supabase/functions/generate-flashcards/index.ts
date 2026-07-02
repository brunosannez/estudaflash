import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Helper function to verify JWT and get user
async function verifyAuth(req: Request, supabase: any): Promise<{ userId: string | null; error: string | null }> {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { userId: null, error: 'Token de autenticação não fornecido' };
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { userId: null, error: 'Token inválido ou expirado' };
    }
    
    return { userId: user.id, error: null };
  } catch (error) {
    console.error('❌ Erro ao verificar autenticação:', error);
    return { userId: null, error: 'Erro ao verificar autenticação' };
  }
}

// Estornar créditos quando a geração falha após o consumo
async function refundCredits(supabase: any, userId: string, credits: number) {
  if (!credits || credits <= 0) return;
  try {
    const { data, error } = await supabase
      .from('uso_usuarios')
      .select('credits_remaining, credits_used_this_month')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('❌ Estorno: não foi possível ler créditos do usuário', error);
      return;
    }

    await supabase
      .from('uso_usuarios')
      .update({
        credits_remaining: data.credits_remaining + credits,
        credits_used_this_month: Math.max(0, data.credits_used_this_month - credits),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    console.log(`💳 ${credits} crédito(s) estornado(s) após falha na geração`);
  } catch (e) {
    console.error('❌ Falha ao estornar créditos:', e);
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

// Calcular quantidade ideal de cards baseada no tamanho - OTIMIZADO
function calculateTargetCards(wordCount: number): number {
  if (wordCount <= 300) return Math.min(8, Math.max(5, Math.floor(wordCount / 40)));
  if (wordCount <= 600) return Math.min(10, Math.max(8, Math.floor(wordCount / 60)));
  if (wordCount <= 900) return Math.min(12, Math.max(10, Math.floor(wordCount / 75)));
  return 12; // Máximo absoluto de 12 cards
}

// Tentar recuperar flashcards de um JSON truncado
function tryRepairTruncatedJSON(text: string): any | null {
  console.log('🔧 Tentando recuperar JSON truncado...');
  
  // Estratégia 1: Encontrar o último objeto completo no array "flashcards"
  const flashcardsStart = text.indexOf('"flashcards"');
  if (flashcardsStart === -1) return null;
  
  const arrayStart = text.indexOf('[', flashcardsStart);
  if (arrayStart === -1) return null;
  
  // Encontrar todos os objetos completos dentro do array
  let depth = 0;
  let lastCompleteObjectEnd = -1;
  let inString = false;
  let escapeNext = false;
  
  for (let i = arrayStart + 1; i < text.length; i++) {
    const char = text[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      continue;
    }
    
    if (inString) continue;
    
    if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        lastCompleteObjectEnd = i;
      }
    }
  }
  
  if (lastCompleteObjectEnd === -1) return null;
  
  // Construir JSON reparado
  const repairedText = text.substring(0, lastCompleteObjectEnd + 1) + ']}';
  
  // Encontrar o início do objeto JSON principal
  const mainObjectStart = text.lastIndexOf('{', flashcardsStart);
  if (mainObjectStart === -1) return null;
  
  const finalJSON = text.substring(mainObjectStart, lastCompleteObjectEnd + 1) + ']}';
  
  try {
    const parsed = JSON.parse(finalJSON);
    const cards = parsed.flashcards;
    if (Array.isArray(cards) && cards.length >= 3) {
      console.log(`✅ JSON recuperado com sucesso: ${cards.length} cards salvos de truncamento`);
      return parsed;
    }
  } catch (e) {
    console.log('❌ Estratégia 1 falhou:', e.message);
  }
  
  // Estratégia 2: Regex para extrair objetos individuais completos
  try {
    const objectRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
    const arrayContent = text.substring(arrayStart);
    const matches = arrayContent.match(objectRegex);
    
    if (matches && matches.length >= 3) {
      const validCards = [];
      for (const match of matches) {
        try {
          const card = JSON.parse(match);
          if (card.front && card.back) {
            validCards.push(card);
          }
        } catch (e) {
          // Skip invalid individual cards
        }
      }
      
      if (validCards.length >= 3) {
        console.log(`✅ Recuperados ${validCards.length} cards via regex`);
        return { flashcards: validCards };
      }
    }
  } catch (e) {
    console.log('❌ Estratégia 2 falhou:', e.message);
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Preenchido após o consumo de créditos, para estornar em caso de falha
  let refund: (() => Promise<void>) | null = null;

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração do servidor incompleta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // SECURITY: Verify authentication
    const { userId: authUserId, error: authError } = await verifyAuth(req, supabase);
    
    if (authError || !authUserId) {
      console.error('❌ Falha na autenticação:', authError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: authError || 'Não autorizado',
          fallbackMessage: 'Você precisa estar logado para gerar flashcards.'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { resumoId, textoResumo, userId } = await req.json();
    
    // SECURITY: Verify userId matches authenticated user
    if (userId && userId !== authUserId) {
      console.error('❌ userId não corresponde ao usuário autenticado');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Acesso negado',
          fallbackMessage: 'Você só pode gerar flashcards para sua própria conta.'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const effectiveUserId = userId || authUserId;
    
    if (!resumoId || !textoResumo) {
      throw new Error('ID do resumo e texto são obrigatórios');
    }

    // Verify Anthropic API key is available
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

    console.log('🔑 Configurações disponíveis:');
    console.log('- ANTHROPIC_API_KEY:', anthropicApiKey ? '✅' : '❌');

    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'ANTHROPIC_API_KEY não configurada',
          fallbackMessage: 'Serviço de IA não configurado. Contate o administrador.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Consume credits before generating flashcards
    const { data: creditResult, error: creditError } = await supabase.rpc('consume_credits', {
      target_user_id: effectiveUserId,
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

    const consumedCredits = creditResult[0].credits_consumed;
    refund = () => refundCredits(supabase, effectiveUserId, consumedCredits);

    console.log('Gerando flashcards automaticamente para resumo:', resumoId);
    console.log('Tamanho do texto:', textoResumo.length, 'caracteres');

    // Advanced flashcard generation with dynamic variables
    const theme = detectTheme(textoResumo);
    const wordCount = textoResumo.split(/\s+/).length;
    const targetCards = calculateTargetCards(wordCount);

    console.log(`📊 Análise do conteúdo: ${wordCount} palavras → ${targetCards} flashcards`);
    console.log(`🎯 Tema detectado: ${theme}`);

    // Prompt OTIMIZADO: menos campos por card = menos tokens de saída
    const prompt = `Você é um elaborador de materiais didáticos no estilo Anki. Gere flashcards eficientes baseados APENAS no resumo abaixo.

REGRAS:
1) Use somente o conteúdo do resumo. NUNCA invente dados externos.
2) Cubra todos os pontos principais: definições, causas, consequências e exemplos.
3) Linguagem clara para estudante de ensino médio (15-17 anos).
4) Cada card tem EXATAMENTE 5 campos:
   - front: pergunta clara (1 ideia por card)
   - back: resposta concisa de 1-2 frases
   - explanation: até 2 frases de contexto adicional
   - type: "definicao" | "causa_efeito" | "exemplo" | "verdadeiro_falso"
   - difficulty: "easy" | "medium" | "hard"
5) Gere exatamente ${targetCards} flashcards.
6) Sem perguntas repetidas ou muito similares.

RESUMO:
"""
${textoResumo.substring(0, 5000)}
"""

SAÍDA (JSON válido, sem texto antes ou depois):
{
  "flashcards": [
    {
      "front": "Pergunta clara?",
      "back": "Resposta concisa.",
      "explanation": "Contexto adicional.",
      "type": "definicao",
      "difficulty": "medium"
    }
  ]
}`;

    console.log('🤖 Iniciando chamada para API Anthropic Claude Haiku 4.5...');
    const startTime = Date.now();

    // Claude Haiku 4.5: modelo rápido e custo-efetivo atual
    // (claude-3-haiku-20240307 foi aposentado em abr/2026 e retorna 404)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 6000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4
      })
    });

    const endTime = Date.now();
    console.log(`⏱️ Tempo de resposta da API: ${endTime - startTime}ms`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Anthropic API error:', response.status, errorData);

      await refund?.();
      refund = null;

      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Erro na API Anthropic: ${response.status}`,
          fallbackMessage: 'Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos.'
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error('Resposta inválida da API Anthropic');
    }

    // Check if response was truncated
    const stopReason = data.stop_reason;
    const wasTruncated = stopReason === 'max_tokens';
    if (wasTruncated) {
      console.warn('⚠️ Resposta da API foi TRUNCADA (stop_reason: max_tokens). Tentando recuperar...');
    }

    // 📊 Track API usage for cost monitoring
    try {
      const inputTokens = data.usage?.input_tokens || 0;
      const outputTokens = data.usage?.output_tokens || 0;
      const totalTokens = inputTokens + outputTokens;
      
      // Claude Haiku 4.5: $1.00/1M input, $5.00/1M output
      const inputCost = (inputTokens * 0.001) / 1000;
      const outputCost = (outputTokens * 0.005) / 1000;
      const estimatedCost = inputCost + outputCost;

      await supabase
        .from('api_usage_tracking')
        .insert({
          user_id: effectiveUserId,
          api_provider: 'anthropic',
          action_type: 'flashcard',
          tokens_used: totalTokens,
          estimated_cost_usd: estimatedCost,
          model_used: 'claude-haiku-4-5',
          success: true,
          timestamp: new Date().toISOString()
        });
      
      console.log(`📊 API tracked: ${totalTokens} tokens (in: ${inputTokens}, out: ${outputTokens}), $${estimatedCost.toFixed(6)}`);
    } catch (trackError) {
      console.warn('⚠️ Failed to track API usage:', trackError);
    }

    let flashcardsText = data.content[0].text.trim();

    // Remove markdown formatting
    if (flashcardsText.startsWith('```json')) {
      flashcardsText = flashcardsText.replace(/^```json\s*/, '').replace(/```$/, '');
    } else if (flashcardsText.startsWith('```')) {
      flashcardsText = flashcardsText.replace(/^```\w*\s*/, '').replace(/```$/, '');
    }

    // Try to extract JSON
    let jsonText = flashcardsText;
    const objectMatch = flashcardsText.match(/\{[\s\S]*"flashcards"\s*:\s*\[[\s\S]*\]\s*[\s\S]*\}/);
    if (objectMatch) {
      jsonText = objectMatch[0];
    } else {
      const jsonStart = flashcardsText.indexOf('[');
      const jsonEnd = flashcardsText.lastIndexOf(']');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonText = `{"flashcards": ${flashcardsText.substring(jsonStart, jsonEnd + 1)}}`;
      }
    }

    console.log('📝 Processando flashcards gerados...');

    let flashcardsData;
    try {
      flashcardsData = JSON.parse(jsonText);
    } catch (e) {
      console.error('❌ Erro ao parsear JSON dos flashcards:', e.message);
      console.log('📏 Tamanho do texto recebido:', flashcardsText.length);
      
      // RECUPERAÇÃO: Tentar reparar JSON truncado
      if (wasTruncated) {
        console.log('🔧 Resposta truncada detectada, tentando recuperação...');
        const repaired = tryRepairTruncatedJSON(flashcardsText);
        if (repaired) {
          flashcardsData = repaired;
          console.log(`✅ Recuperação bem-sucedida: ${repaired.flashcards?.length || 0} cards`);
        } else {
          console.error('❌ Não foi possível recuperar o JSON truncado');
          throw new Error('Erro ao processar flashcards: resposta da IA foi truncada. Tente novamente.');
        }
      } else {
        // Tentar recuperação mesmo sem truncamento (pode ser formato inesperado)
        const repaired = tryRepairTruncatedJSON(flashcardsText);
        if (repaired) {
          flashcardsData = repaired;
        } else {
          throw new Error('Erro ao processar flashcards gerados pela IA');
        }
      }
    }

    const flashcards = flashcardsData.flashcards || flashcardsData;
    
    if (!Array.isArray(flashcards)) {
      throw new Error('Formato inválido de flashcards retornado pela IA');
    }

    console.log(`${flashcards.length} flashcards gerados com sucesso`);

    // Validate flashcards - SUAVIZADO para aceitar reformulações
    const validatedFlashcards = flashcards.filter((card: any) => {
      const question = card.front || card.pergunta;
      const answer = card.back || card.resposta;
      
      if (!question || !answer || question.length < 10 || answer.length < 5) {
        console.warn('❌ Flashcard rejeitado: estrutura inválida');
        return false;
      }

      // Validação suavizada: aceitar cards que tenham pelo menos ALGUMA relação com o conteúdo
      const contentWords = textoResumo.toLowerCase().split(/\s+/).filter((w: string) => w.length > 4);
      const cardText = `${question} ${answer}`.toLowerCase();
      const cardWords = cardText.split(/\s+/).filter((w: string) => w.length > 4);
      const commonWords = cardWords.filter((word: string) => contentWords.includes(word));
      
      const overlapRatio = cardWords.length > 0 ? commonWords.length / cardWords.length : 0;
      if (overlapRatio < 0.05) {
        console.warn('❌ Flashcard rejeitado: sem relação com conteúdo', {
          pergunta: question.substring(0, 50),
          overlap: overlapRatio.toFixed(3)
        });
        return false;
      }

      return true;
    });

    // Aceitar resultado se tiver pelo menos 3 cards válidos
    if (validatedFlashcards.length < 3) {
      console.error(`❌ Apenas ${validatedFlashcards.length} flashcards válidos (mínimo: 3)`);
      throw new Error('Qualidade insuficiente dos flashcards gerados. Tente novamente.');
    }

    console.log(`✅ ${validatedFlashcards.length}/${flashcards.length} flashcards aprovados na validação`);

    // Save flashcards to database
    const flashcardsToInsert = validatedFlashcards.map((card: any) => ({
      resumo_id: resumoId,
      pergunta: card.front || card.pergunta,
      resposta: card.back || card.resposta,
      exemplo: card.explanation || card.exemplo || null,
      card_type: card.type || 'definicao',
      difficulty: card.difficulty === 'easy' ? 1 : card.difficulty === 'medium' ? 2 : 3,
      category: theme
    }));

    const { data: savedFlashcards, error: flashcardError } = await supabase
      .from('flashcards')
      .insert(flashcardsToInsert)
      .select();

    if (flashcardError) {
      console.error('❌ Erro ao salvar flashcards no banco:', flashcardError);
      throw new Error(`Erro ao salvar flashcards: ${flashcardError.message}`);
    }

    console.log(`✅ ${savedFlashcards.length} flashcards salvos com sucesso no banco`);

    return new Response(
      JSON.stringify({ 
        success: true,
        flashcards: savedFlashcards,
        stats: {
          total_gerado: flashcards.length,
          total_aprovado: validatedFlashcards.length,
          total_rejeitado: flashcards.length - validatedFlashcards.length,
          tempo_processamento: `${endTime - startTime}ms`,
          modelo_usado: 'claude-haiku-4-5',
          palavras_analisadas: wordCount,
          cobertura_qualidade: Math.round((validatedFlashcards.length / targetCards) * 100),
          foi_truncado: wasTruncated
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erro na função generate-flashcards:', error);

    // Geração falhou depois do consumo: devolve os créditos
    if (refund) {
      await refund();
    }

    let errorMessage = 'Erro ao gerar flashcards';
    let fallbackMessage = 'Erro inesperado. Tente novamente.';
    
    if (error.message?.includes('API')) {
      fallbackMessage = 'Serviço de IA temporariamente indisponível.';
    } else if (error.message?.includes('créditos')) {
      fallbackMessage = error.message;
    } else if (error.message?.includes('Qualidade')) {
      fallbackMessage = 'Conteúdo muito curto ou genérico. Tente com mais detalhes.';
    } else if (error.message?.includes('truncada')) {
      fallbackMessage = 'O conteúdo gerou uma resposta muito longa. Tente novamente.';
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || errorMessage,
        fallbackMessage: fallbackMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});