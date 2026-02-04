import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to verify JWT and get user
async function verifyAuth(req: Request, supabase: any): Promise<{ userId: string | null; error: string | null }> {
  const authHeader = req.headers.get('Authorization');
  
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

// Calcular quantidade ideal de cards baseada no tamanho
function calculateTargetCards(wordCount: number): number {
  if (wordCount <= 300) return Math.min(10, Math.max(8, Math.floor(wordCount / 30)));
  if (wordCount <= 600) return Math.min(15, Math.max(12, Math.floor(wordCount / 40)));
  if (wordCount <= 900) return Math.min(20, Math.max(15, Math.floor(wordCount / 45)));
  return Math.min(20, Math.max(18, Math.floor(wordCount / 50)));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

    console.log('Gerando flashcards automaticamente para resumo:', resumoId);
    console.log('Tamanho do texto:', textoResumo.length, 'caracteres');

    // Advanced flashcard generation with dynamic variables
    const theme = detectTheme(textoResumo);
    const wordCount = textoResumo.split(/\s+/).length;
    const targetCards = calculateTargetCards(wordCount);

    console.log(`📊 Análise do conteúdo: ${wordCount} palavras → ${targetCards} flashcards`);
    console.log(`🎯 Tema detectado: ${theme}`);

    const prompt = `Você é um elaborador de materiais didáticos no estilo Anki. Sua missão é gerar flashcards eficientes e claros apenas com base no RESUMO abaixo. Proibido inserir dados externos.

— REGRAS:
1) Use somente o conteúdo do resumo.
2) Para cada macrotema, crie pelo menos 1–2 cards que cubram diferentes aspectos (definição, causa, consequência, exemplo, verdadeiro/falso).
3) Linguagem adaptada para um estudante de ensino médio (15-17 anos).
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
${textoResumo.substring(0, 6000)}
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
      "front": "Pergunta clara sobre o conteúdo?",
      "back": "Resposta concisa de 1-2 frases.",
      "explanation": "Contexto adicional para entender melhor.",
      "type": "definicao",
      "difficulty": "medium",
      "tags": ["${theme}"],
      "evidence": "trecho do resumo"
    }
  ]
}

Responda APENAS com o JSON válido, sem texto adicional.`;

    console.log('🤖 Iniciando chamada para API Anthropic Claude Haiku...');
    const startTime = Date.now();

    // Use Claude 3 Haiku for flashcards (cost-effective)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
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

    // 📊 Track API usage for cost monitoring
    try {
      const inputTokens = data.usage?.input_tokens || 0;
      const outputTokens = data.usage?.output_tokens || 0;
      const totalTokens = inputTokens + outputTokens;
      
      // Claude Haiku: $0.25/1M input, $1.25/1M output
      const inputCost = (inputTokens * 0.00025) / 1000;
      const outputCost = (outputTokens * 0.00125) / 1000;
      const estimatedCost = inputCost + outputCost;
      
      await supabase
        .from('api_usage_tracking')
        .insert({
          user_id: effectiveUserId,
          api_provider: 'anthropic',
          action_type: 'flashcard',
          tokens_used: totalTokens,
          estimated_cost_usd: estimatedCost,
          model_used: 'claude-3-haiku-20240307',
          success: true,
          timestamp: new Date().toISOString()
        });
      
      console.log(`📊 API tracked: ${totalTokens} tokens, $${estimatedCost.toFixed(6)}`);
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
      console.error('❌ Erro ao parsear JSON dos flashcards:', e);
      console.error('Texto recebido:', jsonText.substring(0, 500));
      throw new Error('Erro ao processar flashcards gerados pela IA');
    }

    const flashcards = flashcardsData.flashcards || flashcardsData;
    
    if (!Array.isArray(flashcards)) {
      throw new Error('Formato inválido de flashcards retornado pela IA');
    }

    console.log(`${flashcards.length} flashcards gerados com sucesso`);

    // Validate flashcards for content fidelity
    const validatedFlashcards = flashcards.filter((card: any) => {
      const question = card.front || card.pergunta;
      const answer = card.back || card.resposta;
      
      if (!question || !answer || question.length < 10 || answer.length < 5) {
        console.warn('❌ Flashcard rejeitado: estrutura inválida');
        return false;
      }

      // Check for keyword overlap with original content
      const contentWords = textoResumo.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const responseWords = answer.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const commonWords = responseWords.filter(word => contentWords.includes(word));
      
      const overlapRatio = responseWords.length > 0 ? commonWords.length / responseWords.length : 0;
      if (overlapRatio < 0.15) {
        console.warn('❌ Flashcard rejeitado: baixa fidelidade ao conteúdo', {
          pergunta: question.substring(0, 50),
          overlap: overlapRatio
        });
        return false;
      }

      return true;
    });

    if (validatedFlashcards.length < Math.ceil(targetCards * 0.5)) {
      console.error('❌ Muitos flashcards rejeitados na validação');
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
      category: Array.isArray(card.tags) ? card.tags[0] || theme : theme
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
          total_gerado: validatedFlashcards.length,
          total_aprovado: validatedFlashcards.length,
          total_rejeitado: flashcards.length - validatedFlashcards.length,
          tempo_processamento: `${endTime - startTime}ms`,
          modelo_usado: 'claude-3-haiku-20240307',
          palavras_analisadas: wordCount,
          cobertura_qualidade: Math.round((validatedFlashcards.length / targetCards) * 100)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erro na função generate-flashcards:', error);
    
    let errorMessage = 'Erro ao gerar flashcards';
    let fallbackMessage = 'Erro inesperado. Tente novamente.';
    
    if (error.message?.includes('API')) {
      fallbackMessage = 'Serviço de IA temporariamente indisponível.';
    } else if (error.message?.includes('créditos')) {
      fallbackMessage = error.message;
    } else if (error.message?.includes('Qualidade')) {
      fallbackMessage = 'Conteúdo muito curto ou genérico. Tente com mais detalhes.';
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
