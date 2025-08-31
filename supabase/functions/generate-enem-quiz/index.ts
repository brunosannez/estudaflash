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
    const { resumoId, resumoContent, userId } = await req.json();

    if (!resumoId || !resumoContent || !userId) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user profile for age
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('date_of_birth')
      .eq('user_id', userId)
      .single();

    const calculateAge = (dateOfBirth: string): number => {
      const birth = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return Math.max(10, Math.min(25, age));
    };

    const userAge = profile?.date_of_birth ? calculateAge(profile.date_of_birth) : 17;

    // Detect theme from content
    const detectTheme = (content: string): string => {
      const themes = {
        'matemática': ['matemática', 'equação', 'função', 'geometria', 'álgebra', 'cálculo'],
        'português': ['português', 'literatura', 'gramática', 'texto', 'redação', 'linguagem'],
        'história': ['história', 'histórico', 'século', 'período', 'guerra', 'império'],
        'geografia': ['geografia', 'território', 'clima', 'população', 'região', 'espaço'],
        'física': ['física', 'energia', 'força', 'movimento', 'ondas', 'eletricidade'],
        'química': ['química', 'elemento', 'reação', 'molécula', 'átomo', 'substância'],
        'biologia': ['biologia', 'célula', 'organismo', 'evolução', 'genética', 'ecologia'],
        'filosofia': ['filosofia', 'ética', 'moral', 'conhecimento', 'razão', 'verdade'],
        'sociologia': ['sociedade', 'social', 'cultura', 'grupo', 'classe', 'instituição']
      };

      const contentLower = content.toLowerCase();
      for (const [theme, keywords] of Object.entries(themes)) {
        if (keywords.some(keyword => contentLower.includes(keyword))) {
          return theme;
        }
      }
      return 'conhecimentos gerais';
    };

    const tema = detectTheme(resumoContent);

    // Create the exact prompt from user requirements
    // Optimized prompt with reduced token count
    const promptText = `Você é um especialista em elaboração de provas ENEM. Transforme o RESUMO em um QUIZ completo usando APENAS as informações do texto.

PARÂMETROS:
- Idade: ${userAge}
- Tema: ${tema}

RESUMO:
"""
${resumoContent}
"""

REGRAS:
1) USO EXCLUSIVO DO RESUMO - não adicione informações externas
2) QUANTIDADE por tamanho:
   - ≤300 palavras → 6-8 questões
   - 301-600 → 8-12 questões  
   - 601-900 → 12-16 questões
   - >900 → 16-20 questões
   Metade objetivas (A-E) e metade V/F sequenciais
3) QUESTÕES OBJETIVAS:
   - Enunciado contextualizado 60-120 palavras
   - Pergunta "Com base no texto..." 
   - 5 alternativas A-E, apenas 1 correta
   - Distratores plausíveis
4) QUESTÕES V/F:
   - Enunciado 2-3 frases
   - 4 afirmações (I,II,III,IV)
   - 5 alternativas A-E com combinações V/F
5) Varie dificuldade: easy/medium/hard
6) Evidence: trecho do resumo ≤150 caracteres

JSON FORMATO:
{
  "meta": {"tema": "${tema}", "idade_usuario": ${userAge}, "word_count": <int>, "macrothemes": ["..."], "targets": {"objetivas": <int>, "vf_sequenciais": <int>}, "generated": {"objetivas": <int>, "vf_sequenciais": <int>}},
  "coverage_map": [{"macrotema": "nome", "objetivas": <int>, "vf_sequenciais": <int>}],
  "quiz": {
    "objetivas": [{"enunciado": "contexto", "stem": "pergunta", "options": ["A)...", "B)...", "C)...", "D)...", "E)..."], "correct_index": 0, "difficulty": "easy", "cognitive_level": "understand", "evidence": "trecho"}],
    "vf_sequenciais": [{"enunciado": "contexto", "statements": ["I...", "II...", "III...", "IV..."], "options": ["A) V V F F", "B) V F V F", "C) F V F V", "D) F F V V", "E) V V V F"], "correct_index": 2, "difficulty": "medium", "cognitive_level": "analyze", "evidence": "trecho"}]
  },
  "quality_checks": {"all_from_summary": true, "age_adapted": true, "balanced_difficulty": true, "balanced_cognitive_levels": true, "coverage_complete": true, "no_duplicates": true}
}

Responda APENAS com o JSON.`;

    console.log('📝 Starting ENEM quiz generation...');
    console.log('📊 Content length:', resumoContent.length, 'characters');
    console.log('👤 User age:', userAge);
    console.log('📚 Detected theme:', tema);

    // Call OpenAI API with improved retry logic and exponential backoff
    let attempts = 0;
    const maxAttempts = 2; // Reduced from 3 to 2
    let quizData = null;

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    while (attempts < maxAttempts && !quizData) {
      attempts++;
      console.log(`🔄 Attempt ${attempts}/${maxAttempts}`);

      try {
        // Use exponential backoff for delays
        if (attempts > 1) {
          const delay = Math.pow(2, attempts - 1) * 2000; // 2s, 4s, 8s...
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14', // Updated to more stable model
            messages: [
              {
                role: 'system',
                content: 'Você é um especialista em elaboração de provas ENEM. Siga exatamente as instruções fornecidas e responda APENAS com o JSON solicitado, sem comentários ou explicações.'
              },
              {
                role: 'user',
                content: promptText
              }
            ],
            max_completion_tokens: 15000, // Updated parameter name and reduced size
            // temperature removed - not supported in newer models
          }),
        });

        console.log(`📡 OpenAI Response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ OpenAI API error details:`, errorText);
          
          if (response.status === 429) {
            throw new Error('Rate limit exceeded - too many requests');
          } else if (response.status === 400) {
            throw new Error(`Bad request to OpenAI API: ${errorText}`);
          } else if (response.status === 401) {
            throw new Error('Invalid OpenAI API key');
          } else {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
          }
        }

        const openAIResponse = await response.json();
        console.log('🤖 OpenAI Response received');

        if (!openAIResponse.choices?.[0]?.message?.content) {
          throw new Error('Invalid OpenAI response structure');
        }

        let content = openAIResponse.choices[0].message.content.trim();
        
        // Clean content - remove markdown code blocks if present
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Find JSON object - more robust extraction
        let startIndex = content.indexOf('{');
        let braceCount = 0;
        let endIndex = -1;
        
        if (startIndex === -1) {
          throw new Error('No JSON object found in OpenAI response');
        }
        
        for (let i = startIndex; i < content.length; i++) {
          if (content[i] === '{') braceCount++;
          if (content[i] === '}') braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
        
        if (endIndex === -1) {
          throw new Error('Incomplete JSON object in OpenAI response');
        }
        
        const jsonString = content.substring(startIndex, endIndex + 1);
        console.log('🔍 Extracted JSON length:', jsonString.length);
        
        quizData = JSON.parse(jsonString);
        console.log('📋 Quiz data parsed successfully');

        // Validate minimum question count
        const wordCount = quizData.meta?.word_count || resumoContent.split(' ').length;
        let expectedMin = 6;
        if (wordCount <= 300) expectedMin = 6;
        else if (wordCount <= 600) expectedMin = 8;
        else if (wordCount <= 900) expectedMin = 12;
        else expectedMin = 16;
        
        const totalGenerated = (quizData.quiz?.objetivas?.length || 0) + (quizData.quiz?.vf_sequenciais?.length || 0);

        console.log(`📊 Generated ${totalGenerated} questions, expected minimum: ${expectedMin}`);
        console.log(`📝 Word count: ${wordCount}`);

        if (totalGenerated < expectedMin) {
          console.log(`⚠️ Insufficient questions generated (${totalGenerated}/${expectedMin}), retrying...`);
          quizData = null;
          continue;
        }

        // Validate required fields
        if (!quizData.quiz?.objetivas && !quizData.quiz?.vf_sequenciais) {
          throw new Error('No questions generated');
        }

        if (!quizData.meta || !quizData.coverage_map) {
          throw new Error('Invalid quiz structure - missing metadata');
        }

        console.log('✅ Quiz validation passed');
        break;

      } catch (error) {
        console.error(`❌ Attempt ${attempts} failed:`, error);
        if (attempts === maxAttempts) {
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!quizData) {
      throw new Error('Failed to generate quiz after all attempts');
    }

    // Save to database
    console.log('💾 Saving quiz to database...');

    // Save metadata
    const { data: metadataRecord, error: metadataError } = await supabase
      .from('enem_quiz_metadata')
      .insert({
        resumo_id: resumoId,
        tema: quizData.meta.tema,
        idade_usuario: quizData.meta.idade_usuario,
        word_count: quizData.meta.word_count,
        macrothemes: quizData.meta.macrothemes,
        targets: quizData.meta.targets,
        generated: quizData.meta.generated,
        coverage_map: quizData.coverage_map,
        quality_checks: quizData.quality_checks
      })
      .select()
      .single();

    if (metadataError) {
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

  } catch (error) {
    console.error('❌ Error in generate-enem-quiz:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});