import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting ENEM quiz generation function...');
    
    // Check if OpenAI API key is configured
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not found');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'OpenAI API key not configured'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('✅ OpenAI API key found');

    const requestBody = await req.json();
    console.log('📨 Request received:', { 
      hasResumoId: !!requestBody.resumoId,
      hasUserId: !!requestBody.userId,
      contentLength: requestBody.resumoContent?.length || 0
    });

    const { resumoId, resumoContent, userId } = requestBody;

    if (!resumoId || !resumoContent || !userId) {
      console.error('❌ Missing required parameters');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required parameters: resumoId, resumoContent, or userId'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client initialized');

    // Simple theme detection
    const detectTheme = (content: string): string => {
      const contentLower = content.toLowerCase();
      if (contentLower.includes('história') || contentLower.includes('histórico')) return 'história';
      if (contentLower.includes('matemática') || contentLower.includes('equação')) return 'matemática';
      if (contentLower.includes('português') || contentLower.includes('literatura')) return 'português';
      return 'conhecimentos gerais';
    };

    const tema = detectTheme(resumoContent);
    console.log('📚 Theme detected:', tema);

    // Simplified prompt for testing
    const promptText = `Crie um quiz ENEM simples baseado no seguinte resumo:

RESUMO:
${resumoContent.substring(0, 1500)}

Crie apenas 3 questões: 2 objetivas e 1 verdadeiro/falso.

Formato JSON (responda APENAS o JSON):
{
  "meta": {"tema": "${tema}", "idade_usuario": 17, "word_count": ${resumoContent.split(' ').length}, "macrothemes": ["tema1"], "targets": {"objetivas": 2, "vf_sequenciais": 1}, "generated": {"objetivas": 2, "vf_sequenciais": 1}},
  "coverage_map": [{"macrotema": "principal", "objetivas": 2, "vf_sequenciais": 1}],
  "quiz": {
    "objetivas": [
      {
        "enunciado": "Contexto da questão baseado no resumo",
        "stem": "Pergunta sobre o conteúdo?", 
        "options": ["A) opção 1", "B) opção 2", "C) opção 3", "D) opção 4", "E) opção 5"],
        "correct_index": 0,
        "difficulty": "medium",
        "cognitive_level": "understand",
        "evidence": "evidência do texto"
      },
      {
        "enunciado": "Outra questão baseada no resumo",
        "stem": "Segunda pergunta?",
        "options": ["A) alt 1", "B) alt 2", "C) alt 3", "D) alt 4", "E) alt 5"], 
        "correct_index": 1,
        "difficulty": "medium",
        "cognitive_level": "analyze",
        "evidence": "outra evidência"
      }
    ],
    "vf_sequenciais": [
      {
        "enunciado": "Contexto para V/F",
        "statements": ["I. afirmação 1", "II. afirmação 2", "III. afirmação 3", "IV. afirmação 4"],
        "options": ["A) V V F F", "B) V F V F", "C) F V F V", "D) F F V V", "E) V V V F"],
        "correct_index": 0,
        "difficulty": "medium", 
        "cognitive_level": "analyze",
        "evidence": "evidência V/F"
      }
    ]
  },
  "quality_checks": {"all_from_summary": true, "age_adapted": true, "balanced_difficulty": true, "balanced_cognitive_levels": true, "coverage_complete": true, "no_duplicates": true}
}`;

    console.log('🤖 Calling OpenAI API...');
    console.log('📝 Prompt length:', promptText.length);

    // Test OpenAI API call with simpler model
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',  // Using simpler, more stable model
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em elaboração de provas ENEM. Responda APENAS com JSON válido, sem comentários.'
          },
          {
            role: 'user',
            content: promptText
          }
        ],
        max_tokens: 3000,
        temperature: 0.3
      }),
    });

    console.log('📡 OpenAI Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', errorText);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: `OpenAI API error: ${response.status} - ${errorText}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    const openAIResponse = await response.json();
    console.log('🤖 OpenAI Response received');

    if (!openAIResponse.choices?.[0]?.message?.content) {
      console.error('❌ Invalid OpenAI response structure');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid response from OpenAI'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    let content = openAIResponse.choices[0].message.content.trim();
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
          error: 'Failed to parse OpenAI response as JSON'
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
      // Save metadata
      const { data: metadataRecord, error: metadataError } = await supabase
        .from('enem_quiz_metadata')
        .insert({
          resumo_id: resumoId,
          tema: quizData.meta.tema,
          idade_usuario: quizData.meta.idade_usuario,
          word_count: quizData.meta.word_count,
          macrothemes: quizData.meta.macrothemes || [],
          targets: quizData.meta.targets || {objetivas: 2, vf_sequenciais: 1},
          generated: quizData.meta.generated || {objetivas: 2, vf_sequenciais: 1},
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
      if (quizData.quiz.objetivas) {
        for (const question of quizData.quiz.objetivas) {
          questionsToInsert.push({
            quiz_metadata_id: metadataRecord.id,
            tipo: 'objetiva',
            enunciado: question.enunciado,
            stem: question.stem,
            statements: null,
            options: question.options,
            correct_index: question.correct_index,
            difficulty: question.difficulty,
            cognitive_level: question.cognitive_level,
            evidence: question.evidence
          });
        }
      }

      // Add V/F sequential questions
      if (quizData.quiz.vf_sequenciais) {
        for (const question of quizData.quiz.vf_sequenciais) {
          questionsToInsert.push({
            quiz_metadata_id: metadataRecord.id,
            tipo: 'vf_sequencial',
            enunciado: question.enunciado,
            stem: null,
            statements: question.statements,
            options: question.options,
            correct_index: question.correct_index,
            difficulty: question.difficulty,
            cognitive_level: question.cognitive_level,
            evidence: question.evidence
          });
        }
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
            objetivas: quizData.quiz.objetivas?.length || 0,
            vf_sequenciais: quizData.quiz.vf_sequenciais?.length || 0
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