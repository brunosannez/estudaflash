import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Intelligent theme detection
const detectTheme = (content: string): string => {
  const keywords = {
    'História': ['história', 'guerra', 'revolução', 'século', 'brasil', 'império', 'república', 'colonização', 'independência'],
    'Matemática': ['matemática', 'equação', 'função', 'número', 'cálculo', 'geometria', 'álgebra', 'estatística'],
    'Física': ['física', 'força', 'energia', 'movimento', 'velocidade', 'massa', 'mecânica', 'termodinâmica'],
    'Química': ['química', 'elemento', 'reação', 'molécula', 'átomo', 'tabela periódica', 'ligação'],
    'Biologia': ['biologia', 'célula', 'dna', 'evolução', 'ecossistema', 'genética', 'organismo'],
    'Geografia': ['geografia', 'clima', 'relevo', 'população', 'território', 'região', 'ambiente'],
    'Literatura': ['literatura', 'poesia', 'romance', 'autor', 'obra', 'estilo', 'movimento literário'],
    'Português': ['português', 'gramática', 'sintaxe', 'morfologia', 'semântica', 'texto', 'linguagem'],
  }
  
  const contentLower = content.toLowerCase()
  let maxScore = 0
  let detectedTheme = 'Geral'
  
  Object.entries(keywords).forEach(([theme, words]) => {
    const score = words.reduce((count, word) => {
      return count + (contentLower.includes(word) ? 1 : 0)
    }, 0)
    
    if (score > maxScore) {
      maxScore = score
      detectedTheme = theme
    }
  })
  
  return detectedTheme
}

// Calculate age for difficulty adjustment
const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 17 // Default
  const birth = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return Math.max(10, Math.min(25, age)) // Clamp between 10-25
}

// Count words for intelligent question calculation
const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumoContent, resumoId, userId, analysis } = await req.json()
    
    if (!resumoContent || !resumoId) {
      throw new Error('Conteúdo do resumo e ID são obrigatórios')
    }

    console.log('🚀 Generating ENEM-style quiz with structured prompt for resumo:', resumoId)
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Consume credits before generating quiz
    if (userId) {
      const { data: creditResult, error: creditError } = await supabase.rpc('consume_credits', {
        target_user_id: userId,
        action_type: 'quiz'
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

      console.log(`💳 Créditos consumidos para quiz: ${creditResult[0].credits_consumed}. Restam: ${creditResult[0].credits_remaining}`);
    }

    // Get user profile for age
    let userProfile = null
    if (userId) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('school_year, date_of_birth')
        .eq('user_id', userId)
        .single()
      userProfile = profile
      console.log('👤 User profile found:', userProfile)
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Intelligent content analysis
    const tema = analysis?.theme || detectTheme(resumoContent)
    const idade_usuario = userProfile?.date_of_birth ? calculateAge(userProfile.date_of_birth) : 17
    const word_count = countWords(resumoContent)
    
    // Intelligent question calculation based on word count
    let objetivasCount, vfSequenciaisCount
    if (word_count <= 300) {
      objetivasCount = 3; vfSequenciaisCount = 2 // 6-8 total
    } else if (word_count <= 600) {
      objetivasCount = 5; vfSequenciaisCount = 4 // 10-14 total
    } else if (word_count <= 900) {
      objetivasCount = 7; vfSequenciaisCount = 6 // 14-18 total  
    } else {
      objetivasCount = 9; vfSequenciaisCount = 8 // 18-24 total
    }
    
    // Identify macrothemes automatically
    const macrothemes = [tema] // Could be enhanced with more sophisticated analysis
    
    console.log(`📊 Análise inteligente: ${word_count} palavras, Tema: ${tema}, Idade: ${idade_usuario}`)
    console.log(`🎯 Targets calculados: ${objetivasCount} objetivas, ${vfSequenciaisCount} V/F sequenciais`)

    // STRUCTURED ENEM PROMPT - exactly as provided by user
    const structuredPrompt = `Você é um elaborador de provas no estilo ENEM e vestibulares (Ari de Sá, Farias Brito). Sua missão é transformar o RESUMO abaixo em um QUIZ completo, coerente e proporcional ao conteúdo, SEM adicionar informações externas.

=== PARÂMETROS ===
- Idade do estudante: ${idade_usuario}
- Tema: ${tema}

=== RESUMO (fonte única de verdade) ===
"""
${resumoContent}
"""

=== REGRAS OBRIGATÓRIAS ===
1) USO EXCLUSIVO DO RESUMO: só utilize informações do texto. Nada além dele.
2) COBERTURA TOTAL: cada macrotema do resumo deve gerar pelo menos 1 questão objetiva + 1 questão V/F sequencial.
3) QUANTIDADE OBRIGATÓRIA: Você DEVE gerar EXATAMENTE as quantidades especificadas nos "targets":
   - ${objetivasCount} questões objetivas (OBRIGATÓRIO)
   - ${vfSequenciaisCount} questões V/F sequenciais (OBRIGATÓRIO)
   - TOTAL: ${objetivasCount + vfSequenciaisCount} questões
   ⚠️ IMPORTANTE: NÃO calcule quantidade própria. Use APENAS os valores fornecidos nos targets.
4) QUESTÕES OBJETIVAS:
   - Estilo ENEM, contextualizadas.
   - 5 alternativas (A–E), UMA correta e 4 plausíveis.
   - Distratores verossímeis, não absurdos.
   - Proibido "todas as anteriores/nenhuma das anteriores".
   - Alternativas equilibradas em tamanho e estilo.
5) QUESTÕES V/F COM SEQUÊNCIA:
   - Cada item deve ter:
     • Enunciado contextualizado.
     • 4 afirmações numeradas (I, II, III, IV).
     • Alternativas de resposta A–E representando combinações possíveis de V/F (ex.: A) V V F F, B) V F V F...).
     • UMA sequência correta.
6) EVIDENCE: em TODAS as questões, inclua um campo "evidence" com trecho literal (≤200 caracteres) do resumo que sustenta a resposta.
7) DIFICULDADE E COGNITIVO:
   - Varie entre "easy", "medium", "hard".
   - Varie nível cognitivo: "remember", "understand", "apply", "analyze".
8) ADAPTAÇÃO DE IDADE: use vocabulário adequado à idade ${idade_usuario} sem perder rigor.

=== FORMATO DE SAÍDA (JSON ÚNICO VÁLIDO) ===
{
  "meta": {
    "tema": "${tema}",
    "idade_usuario": ${idade_usuario},
    "word_count": ${word_count},
    "macrothemes": ${JSON.stringify(macrothemes)},
    "targets": {
      "objetivas": ${objetivasCount},
      "vf_sequenciais": ${vfSequenciaisCount}
    },
    "generated": {
      "objetivas": ${objetivasCount},
      "vf_sequenciais": ${vfSequenciaisCount}
    }
  },
  "coverage_map": [
    { "macrotema": "nome", "objetivas": 1, "vf_sequenciais": 1 }
  ],
  "quiz": {
    "objetivas": [
      {
        "context": "até 2 frases opcionais",
        "stem": "pergunta clara estilo ENEM",
        "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
        "correct_index": 0,
        "difficulty": "easy|medium|hard",
        "cognitive_level": "remember|understand|apply|analyze",
        "evidence": "trecho literal do resumo (<=200)"
      }
    ],
    "vf_sequenciais": [
      {
        "context": "até 2 frases opcionais",
        "enunciado": "pergunta clara baseada no resumo",
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
- Conferir que a quantidade de questões segue a faixa proporcional ao word_count.
- Garantir ao menos 1 objetiva + 1 V/F sequencial por macrotema.
- Garantir sempre 5 alternativas em todas as questões.
- Responder SOMENTE com o JSON final.`

    // Call OpenAI API with GPT-5 and structured prompt
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07', // Updated to newest model
        messages: [
          {
            role: 'system',
            content: 'Você é um elaborador de provas ENEM especialista. Siga RIGOROSAMENTE o formato JSON solicitado. Use EXCLUSIVAMENTE as informações do resumo fornecido. NUNCA invente dados. Responda APENAS com JSON válido.'
          },
          {
            role: 'user',
            content: structuredPrompt
          }
        ],
        max_completion_tokens: 8500, // Increased for GPT-5 to handle 17+ questions
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0].message.content

    console.log('📝 Structured ENEM quiz response received:', content.substring(0, 200) + '...')

    // Parse and validate structured JSON response
    let quizData
    try {
      quizData = JSON.parse(content)
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      console.error('Content that failed to parse:', content.substring(0, 1000))
      throw new Error('Failed to parse structured quiz data from AI response')
    }

    // Validate structured format
    if (!quizData.meta || !quizData.quiz || !quizData.quality_checks) {
      console.error('❌ Invalid structured format:', Object.keys(quizData))
      throw new Error('AI response missing required structured format (meta, quiz, quality_checks)')
    }

    if (!quizData.quiz.objetivas || !quizData.quiz.vf_sequenciais) {
      console.error('❌ Missing quiz sections:', Object.keys(quizData.quiz))
      throw new Error('AI response missing objetivas or vf_sequenciais sections')
    }

    console.log('✅ Structured format validated successfully')
    console.log(`📊 Metadata: ${JSON.stringify(quizData.meta)}`)
    console.log(`🔍 Quality checks: ${JSON.stringify(quizData.quality_checks)}`)

    // Process and validate questions
    const validQuestions = []
    
    // Process objetivas (multiple choice)
    for (const q of quizData.quiz.objetivas) {
      if (q.stem && q.options && Array.isArray(q.options) && q.options.length === 5 && 
          typeof q.correct_index === 'number' && q.evidence && q.difficulty && q.cognitive_level) {
        
        validQuestions.push({
          question_type: 'objetiva',
          pergunta: q.stem,
          alternativas: q.options,
          correta: q.correct_index,
          explicacao: `Evidence: ${q.evidence}`,
          context: q.context,
          difficulty: q.difficulty,
          cognitive_level: q.cognitive_level,
          evidence: q.evidence
        })
      } else {
        console.warn('⚠️ Invalid objetiva question skipped:', Object.keys(q))
      }
    }

    // Process vf_sequenciais (sequential true/false with A-E options)
    for (const q of quizData.quiz.vf_sequenciais) {
      if (q.enunciado && q.statements && Array.isArray(q.statements) && q.statements.length === 4 &&
          q.options && Array.isArray(q.options) && q.options.length === 5 &&
          typeof q.correct_index === 'number' && q.evidence && q.difficulty && q.cognitive_level) {
        
        validQuestions.push({
          question_type: 'verdadeiro_falso_combinacoes',
          pergunta: q.enunciado,
          statements: q.statements,
          alternativas: q.options, // A-E format for sequential V/F
          correta: q.correct_index,
          explicacao: `Evidence: ${q.evidence}`,
          context: q.context,
          difficulty: q.difficulty,
          cognitive_level: q.cognitive_level,
          evidence: q.evidence
        })
      } else {
        console.warn('⚠️ Invalid vf_sequenciais question skipped:', Object.keys(q))
      }
    }

    if (validQuestions.length === 0) {
      throw new Error('No valid questions generated - all questions failed structured validation')
    }

    // CRITICAL VALIDATION: Check if AI generated the exact number specified in targets
    const generatedObjetivas = quizData.quiz.objetivas.length
    const generatedVfSequenciais = quizData.quiz.vf_sequenciais.length
    
    console.log(`🎯 Target vs Generated - Objetivas: ${objetivasCount} vs ${generatedObjetivas}, V/F: ${vfSequenciaisCount} vs ${generatedVfSequenciais}`)
    
    if (generatedObjetivas < objetivasCount || generatedVfSequenciais < vfSequenciaisCount) {
      const deficit = (objetivasCount - generatedObjetivas) + (vfSequenciaisCount - generatedVfSequenciais)
      console.error(`❌ AI generated insufficient questions: ${deficit} questões faltando`)
      throw new Error(`AI não gerou quantidade suficiente. Esperado: ${objetivasCount} objetivas + ${vfSequenciaisCount} V/F, mas gerou: ${generatedObjetivas} + ${generatedVfSequenciais}`)
    }

    console.log(`✅ Structured validation: ${validQuestions.length}/${quizData.quiz.objetivas.length + quizData.quiz.vf_sequenciais.length} questões aprovadas`)
    
    // Save enhanced metadata with structured format
    const { data: metadataInserted, error: metadataError } = await supabase
      .from('quiz_metadata')
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
      .single()

    if (metadataError) {
      console.error('Metadata insert error:', metadataError)
      console.log('Continuing without metadata...')
    }

    // Save questions to database
    const questionsToInsert = validQuestions.map(q => ({
      resumo_id: resumoId,
      question_type: q.question_type,
      pergunta: q.pergunta,
      alternativas: q.alternativas || null,
      correta: q.correta !== undefined ? q.correta : null,
      explicacao: q.explicacao,
      tipo: q.question_type === 'objetiva' ? 'multipla_escolha' : 'verdadeiro_falso',
      context: q.context,
      difficulty: q.difficulty,
      cognitive_level: q.cognitive_level,
      evidence: q.evidence,
      statements: q.statements || null,
      answer: q.answer !== undefined ? q.answer : null
    }))

    const { data: insertedQuestions, error: insertError } = await supabase
      .from('quizzes')
      .insert(questionsToInsert)
      .select()

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw new Error(`Failed to save questions: ${insertError.message}`)
    }

    console.log(`💾 Saved ${insertedQuestions.length} intelligent questions to database`)

    return new Response(
      JSON.stringify({
        success: true,
        questoes: insertedQuestions,
        metadata: metadataInserted,
        message: `Quiz ENEM estruturado gerado: ${insertedQuestions.length} questões (${quizData.meta.tema})`,
        stats: quizData.meta,
        coverage_map: quizData.coverage_map,
        quality_checks: quizData.quality_checks
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('❌ Intelligent quiz generation error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})