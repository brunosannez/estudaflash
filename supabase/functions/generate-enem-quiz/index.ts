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
    const promptText = `Você é um elaborador de provas no estilo ENEM. Sua missão é transformar o RESUMO criado em um QUIZ completo, proporcional ao tamanho do conteúdo e adequado à idade do estudante, SEM adicionar informações externas.

=== PARÂMETROS ===
- Idade do estudante: ${userAge}
- Tema: ${tema}

=== RESUMO (fonte única de verdade) ===
"""
${resumoContent}
"""

=== REGRAS OBRIGATÓRIAS ===
1) USO EXCLUSIVO DO RESUMO: só utilize informações do texto. Nada além dele.
2) COBERTURA TOTAL: cada macrotema identificado no resumo deve gerar pelo menos 1 questão objetiva e/ou 1 questão de V/F sequencial. Nenhum macrotema pode ficar de fora.
3) QUANTIDADE AUTOMÁTICA: calcule o número de questões de acordo com o tamanho do resumo:
   - ≤300 palavras → 6 a 8 questões totais
   - 301–600 → 10 a 14 questões
   - 601–900 → 14 a 18 questões
   - >900 → 18 a 24 questões
   Aproximadamente metade das questões deve ser de múltipla escolha (objetivas) e metade de V/F sequenciais.
4) QUESTÕES OBJETIVAS (5 alternativas A–E):
   - Estilo ENEM, sempre com enunciado contextualizado.
   - Enunciado longo: 80–150 palavras, com introdução, situação-problema, ou trecho explicativo do resumo.
   - Após o texto-base, apresente a pergunta em forma de "Com base no texto..." ou "Considerando o contexto...".
   - Distratores plausíveis, não absurdos.
   - UMA correta e quatro alternativas incorretas.
   - Proibido "todas as anteriores"/"nenhuma das anteriores".
   - Alternativas equilibradas em tamanho e gramática.
5) QUESTÕES V/F SEQUENCIAIS:
   - Cada item deve ter:
     • Enunciado contextualizado (2–4 frases).
     • 4 afirmações numeradas (I, II, III, IV) com base no resumo.
     • Alternativas de resposta A–E representando combinações possíveis de V/F (ex.: "A) V V F F", "B) V F V F"...).
     • Uma única sequência correta.
6) ADAPTAÇÃO POR IDADE: use linguagem e clareza adequadas à idade ${userAge}, sem perder o rigor conceitual.
7) EVIDENCE: em TODAS as questões inclua o campo "evidence" com trecho literal (≤200 caracteres) do resumo que sustenta a resposta correta.
8) DIFICULDADE E COGNITIVO:
   - Varie dificuldade: easy, medium, hard.
   - Varie níveis cognitivos: remember, understand, apply, analyze.

=== FORMATO DE SAÍDA (JSON ÚNICO VÁLIDO) ===
{
  "meta": {
    "tema": "${tema}",
    "idade_usuario": ${userAge},
    "word_count": <int>,
    "macrothemes": ["..."],
    "targets": {
      "objetivas": <int>,
      "vf_sequenciais": <int>
    },
    "generated": {
      "objetivas": <int>,
      "vf_sequenciais": <int>
    }
  },
  "coverage_map": [
    { "macrotema": "nome", "objetivas": <int>, "vf_sequenciais": <int> }
  ],
  "quiz": {
    "objetivas": [
      {
        "enunciado": "contexto longo estilo ENEM (80–150 palavras)",
        "stem": "pergunta clara baseada no resumo",
        "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
        "correct_index": 0,
        "difficulty": "easy|medium|hard",
        "cognitive_level": "remember|understand|apply|analyze",
        "evidence": "trecho literal do resumo (<=200)"
      }
    ],
    "vf_sequenciais": [
      {
        "enunciado": "contextualização de 2–4 frases baseada no resumo",
        "statements": [
          "I. afirmação 1",
          "II. afirmação 2",
          "III. afirmação 3",
          "IV. afirmação 4"
        ],
        "options": [
          "A) V V F F",
          "B) V F V F",
          "C) V F F V",
          "D) F V V F",
          "E) F F V V"
        ],
        "correct_index": 2,
        "difficulty": "easy|medium|hard",
        "cognitive_level": "understand|analyze",
        "evidence": "trecho literal do resumo (<=200)"
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

=== VALIDAÇÕES ===
- Gere o número de questões dentro da faixa proporcional ao word_count.
- Garanta pelo menos 1 questão por macrotema em "coverage_map".
- Verifique que todos os enunciados objetivos tenham 80–150 palavras e sejam contextualizados.
- Confirme que TODAS as questões contêm evidence do resumo.
- Responda SOMENTE com o JSON final.`;

    console.log('📝 Starting ENEM quiz generation...');
    console.log('📊 Content length:', resumoContent.length, 'characters');
    console.log('👤 User age:', userAge);
    console.log('📚 Detected theme:', tema);

    // Call OpenAI API with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    let quizData = null;

    while (attempts < maxAttempts && !quizData) {
      attempts++;
      console.log(`🔄 Attempt ${attempts}/${maxAttempts}`);

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              {
                role: 'system',
                content: 'Você é um especialista em elaboração de provas ENEM. Siga exatamente as instruções fornecidas e responda APENAS com o JSON solicitado.'
              },
              {
                role: 'user',
                content: promptText
              }
            ],
            max_completion_tokens: 25000,
            temperature: 0.7
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const openAIResponse = await response.json();
        console.log('🤖 OpenAI Response received');

        if (!openAIResponse.choices?.[0]?.message?.content) {
          throw new Error('Invalid OpenAI response structure');
        }

        const content = openAIResponse.choices[0].message.content.trim();
        
        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in OpenAI response');
        }

        quizData = JSON.parse(jsonMatch[0]);
        console.log('📋 Quiz data parsed successfully');

        // Validate minimum question count
        const wordCount = quizData.meta?.word_count || resumoContent.split(' ').length;
        const expectedMin = wordCount <= 300 ? 6 : wordCount <= 600 ? 10 : wordCount <= 900 ? 14 : 18;
        const totalGenerated = (quizData.quiz?.objetivas?.length || 0) + (quizData.quiz?.vf_sequenciais?.length || 0);

        console.log(`📊 Generated ${totalGenerated} questions, expected minimum: ${expectedMin}`);

        if (totalGenerated < expectedMin) {
          console.log(`⚠️ Insufficient questions generated (${totalGenerated}/${expectedMin}), retrying...`);
          quizData = null;
          continue;
        }

        // Validate required fields
        if (!quizData.quiz?.objetivas && !quizData.quiz?.vf_sequenciais) {
          throw new Error('No questions generated');
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