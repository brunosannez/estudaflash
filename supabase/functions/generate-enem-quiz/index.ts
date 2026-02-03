import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

// CORS headers completos para garantir que Authorization seja aceito
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Helper function to verify JWT and get user
async function verifyAuth(req: Request, supabase: any): Promise<{ userId: string | null; error: string | null }> {
  // Tentar ambos os casos de header (case-insensitive na prática, mas para robustez)
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  
  console.log('🔐 Verificando Authorization header...');
  console.log('📋 Header presente:', !!authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('❌ Token não fornecido ou formato inválido');
    return { userId: null, error: 'Token de autenticação não fornecido' };
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('🔑 Token length:', token.length);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('❌ Token inválido:', error?.message);
      return { userId: null, error: 'Token inválido ou expirado' };
    }
    
    console.log('✅ Usuário autenticado:', user.id);
    return { userId: user.id, error: null };
  } catch (error) {
    console.error('❌ Erro ao verificar autenticação:', error);
    return { userId: null, error: 'Erro ao verificar autenticação' };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting ENEM quiz generation function...');
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // SECURITY: Verify authentication
    const { userId: authUserId, error: authError } = await verifyAuth(req, supabase);
    
    if (authError || !authUserId) {
      console.error('❌ Falha na autenticação:', authError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: authError || 'Não autorizado'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if Anthropic API key is configured
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      console.error('❌ ANTHROPIC_API_KEY not found');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ANTHROPIC_API_KEY not configured'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('✅ ANTHROPIC_API_KEY found');

    const requestBody = await req.json();
    console.log('📨 Request received:', { 
      hasResumoId: !!requestBody.resumoId,
      hasUserId: !!requestBody.userId,
      contentLength: requestBody.resumoContent?.length || 0
    });

    const { resumoId, resumoContent, userId } = requestBody;

    // SECURITY: Verify userId matches authenticated user
    if (userId && userId !== authUserId) {
      console.error('❌ userId não corresponde ao usuário autenticado');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Acesso negado'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const effectiveUserId = userId || authUserId;

    if (!resumoId || !resumoContent) {
      console.error('❌ Missing required parameters');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required parameters: resumoId or resumoContent'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('✅ Supabase client initialized');

    // Simple theme detection
    const detectTheme = (content: string): string => {
      const contentLower = content.toLowerCase();
      if (contentLower.includes('história') || contentLower.includes('histórico') || contentLower.includes('guerra') || contentLower.includes('revolução')) return 'história';
      if (contentLower.includes('matemática') || contentLower.includes('equação') || contentLower.includes('função') || contentLower.includes('cálculo')) return 'matemática';
      if (contentLower.includes('português') || contentLower.includes('literatura') || contentLower.includes('gramática')) return 'português';
      if (contentLower.includes('biologia') || contentLower.includes('célula') || contentLower.includes('genética')) return 'biologia';
      if (contentLower.includes('física') || contentLower.includes('força') || contentLower.includes('energia')) return 'física';
      if (contentLower.includes('química') || contentLower.includes('átomo') || contentLower.includes('molécula')) return 'química';
      if (contentLower.includes('geografia') || contentLower.includes('clima') || contentLower.includes('território')) return 'geografia';
      return 'conhecimentos gerais';
    };

    const tema = detectTheme(resumoContent);
    const wordCount = resumoContent.split(/\s+/).length;
    console.log('📚 Theme detected:', tema);
    console.log('📝 Word count:', wordCount);

    // Calculate number of questions based on content length
    const numObjetivas = Math.min(5, Math.max(2, Math.floor(wordCount / 150)));
    const numVF = Math.min(3, Math.max(1, Math.floor(wordCount / 250)));

    // ENEM-style prompt using Claude for better reasoning
    const promptText = `Você é um especialista em elaboração de provas ENEM. Crie um quiz baseado EXCLUSIVAMENTE no resumo abaixo.

RESUMO PARA BASE DAS QUESTÕES:
"""
${resumoContent.substring(0, 4000)}
"""

REGRAS OBRIGATÓRIAS:
1. Todas as questões DEVEM ser baseadas APENAS no conteúdo do resumo acima
2. NÃO invente informações que não estão no resumo
3. Cada questão deve ter uma "evidence" - trecho literal do resumo que comprova a resposta
4. Linguagem adaptada para estudante de ensino médio (15-17 anos)
5. Questões devem avaliar compreensão, não apenas memorização

FORMATO DE SAÍDA (JSON válido):
{
  "meta": {
    "tema": "${tema}",
    "idade_usuario": 17,
    "word_count": ${wordCount},
    "macrothemes": ["tema principal extraído do resumo"],
    "targets": {"objetivas": ${numObjetivas}, "vf_sequenciais": ${numVF}},
    "generated": {"objetivas": ${numObjetivas}, "vf_sequenciais": ${numVF}}
  },
  "coverage_map": [{"macrotema": "${tema}", "objetivas": ${numObjetivas}, "vf_sequenciais": ${numVF}}],
  "quiz": {
    "objetivas": [
      {
        "enunciado": "Texto-base contextualizando a questão baseado no resumo",
        "stem": "Pergunta clara e objetiva sobre o conteúdo?",
        "options": ["A) primeira alternativa", "B) segunda alternativa", "C) terceira alternativa", "D) quarta alternativa", "E) quinta alternativa"],
        "correct_index": 0,
        "difficulty": "medium",
        "cognitive_level": "understand",
        "evidence": "trecho literal do resumo que comprova a resposta correta"
      }
    ],
    "vf_sequenciais": [
      {
        "enunciado": "Contexto para análise de afirmações",
        "statements": ["I. Primeira afirmação baseada no resumo", "II. Segunda afirmação", "III. Terceira afirmação", "IV. Quarta afirmação"],
        "options": ["A) V, V, F, F", "B) V, F, V, F", "C) F, V, F, V", "D) F, F, V, V", "E) V, V, V, F"],
        "correct_index": 0,
        "difficulty": "medium",
        "cognitive_level": "analyze",
        "evidence": "trecho do resumo que valida a resposta"
      }
    ]
  },
  "quality_checks": {
    "all_from_summary": true,
    "age_adapted": true,
    "balanced_difficulty": true,
    "balanced_cognitive_levels": true,
    "coverage_complete": true,
    "no_duplicates": true
  }
}

Gere ${numObjetivas} questões objetivas e ${numVF} questões V/F sequenciais.
Responda APENAS com o JSON válido, sem explicações adicionais.`;

    console.log('🤖 Calling Anthropic Claude API...');
    console.log('📝 Prompt length:', promptText.length);

    // Use Anthropic Claude Sonnet 4 (latest) for quiz generation
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: promptText
          }
        ],
        temperature: 0.3
      }),
    });

    console.log('📡 Anthropic Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Anthropic API error:', errorText);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: `Anthropic API error: ${response.status} - ${errorText}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    const anthropicResponse = await response.json();
    console.log('🤖 Anthropic Response received');

    if (!anthropicResponse.content?.[0]?.text) {
      console.error('❌ Invalid Anthropic response structure');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid response from Anthropic'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    let content = anthropicResponse.content[0].text.trim();
    console.log('📝 Raw content length:', content.length);
    
    // Clean and parse JSON
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let quizData;
    try {
      quizData = JSON.parse(content);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('❌ Content that failed to parse:', content.substring(0, 500));
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to parse Anthropic response as JSON'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Save to database
    console.log('💾 Saving quiz to database...');

    try {
      // Save metadata - allow multiple quizzes per resumo
      const { data: metadataRecord, error: metadataError } = await supabase
        .from('enem_quiz_metadata')
        .insert({
          resumo_id: resumoId,
          tema: quizData.meta?.tema || tema,
          idade_usuario: quizData.meta?.idade_usuario || 17,
          word_count: quizData.meta?.word_count || wordCount,
          macrothemes: quizData.meta?.macrothemes || [tema],
          targets: quizData.meta?.targets || { objetivas: numObjetivas, vf_sequenciais: numVF },
          generated: quizData.meta?.generated || { objetivas: numObjetivas, vf_sequenciais: numVF },
          coverage_map: quizData.coverage_map || [],
          quality_checks: quizData.quality_checks || {}
        })
        .select()
        .single();

      if (metadataError) {
        console.error('❌ Metadata error:', metadataError);
        throw new Error(`Failed to save metadata: ${metadataError.message}`);
      }

      console.log('✅ Metadata saved with ID:', metadataRecord.id);

      // Save questions
      const questionsToInsert = [];

      // Add objective questions
      if (quizData.quiz?.objetivas && Array.isArray(quizData.quiz.objetivas)) {
        for (const question of quizData.quiz.objetivas) {
          questionsToInsert.push({
            quiz_metadata_id: metadataRecord.id,
            tipo: 'objetiva',
            enunciado: question.enunciado || '',
            stem: question.stem || '',
            statements: null,
            options: question.options || [],
            correct_index: question.correct_index || 0,
            difficulty: question.difficulty || 'medium',
            cognitive_level: question.cognitive_level || 'understand',
            evidence: question.evidence || ''
          });
        }
      }

      // Add V/F sequential questions
      if (quizData.quiz?.vf_sequenciais && Array.isArray(quizData.quiz.vf_sequenciais)) {
        for (const question of quizData.quiz.vf_sequenciais) {
          questionsToInsert.push({
            quiz_metadata_id: metadataRecord.id,
            tipo: 'vf_sequencial',
            enunciado: question.enunciado || '',
            stem: null,
            statements: question.statements || [],
            options: question.options || [],
            correct_index: question.correct_index || 0,
            difficulty: question.difficulty || 'medium',
            cognitive_level: question.cognitive_level || 'analyze',
            evidence: question.evidence || ''
          });
        }
      }

      if (questionsToInsert.length === 0) {
        console.error('❌ No questions generated');
        throw new Error('No questions were generated from the content');
      }

      const { error: questionsError } = await supabase
        .from('enem_questions')
        .insert(questionsToInsert);

      if (questionsError) {
        console.error('❌ Questions error:', questionsError);
        throw new Error(`Failed to save questions: ${questionsError.message}`);
      }

      console.log(`✅ Saved ${questionsToInsert.length} questions`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'ENEM quiz generated successfully',
          quizMetadataId: metadataRecord.id,
          totalQuestions: questionsToInsert.length,
          breakdown: {
            objetivas: quizData.quiz?.objetivas?.length || 0,
            vf_sequenciais: quizData.quiz?.vf_sequenciais?.length || 0
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Database error: ${dbError.message}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

  } catch (error) {
    console.error('❌ Unexpected error in generate-enem-quiz:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Unexpected error: ${error.message}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
