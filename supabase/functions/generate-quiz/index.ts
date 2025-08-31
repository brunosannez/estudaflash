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

    console.log('🚀 Generating ENEM-style quiz with unlimited questions for resumo:', resumoId)
    
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
    
    console.log(`📊 Análise inteligente: ${word_count} palavras, Tema: ${tema}, Idade: ${idade_usuario}`)

    // PROMPT EXATO ESTILO ENEM COM ÊNFASE EM QUANTIDADE PROPORCIONAL
    const structuredPrompt = `Você é um elaborador de provas no estilo ENEM e vestibulares (Ari de Sá, Farias Brito). Sua missão é transformar o RESUMO abaixo em um QUIZ completo, proporcional ao tamanho do conteúdo e adequado à idade do estudante, SEM adicionar informações externas.

=== PARÂMETROS ===
- Idade do estudante: ${idade_usuario}   (ex.: 10, 14, 17)
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
   ⚠️ ÊNFASE CRÍTICA: Mínimo 10 questões. Sem limite máximo. Gere quantas forem necessárias para treinar e fixar TODO o conteúdo. Para conteúdos grandes (>900 palavras), gere pelo menos 18-24 questões.
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
6) ADAPTAÇÃO POR IDADE: use linguagem e clareza adequadas à idade ${idade_usuario}, sem perder o rigor conceitual.
7) EVIDENCE: em TODAS as questões inclua o campo "evidence" com trecho literal (≤200 caracteres) do resumo que sustenta a resposta correta.
8) DIFICULDADE E COGNITIVO:
   - Varie dificuldade: easy, medium, hard.
   - Varie níveis cognitivos: remember, understand, apply, analyze.

=== FORMATO DE SAÍDA (JSON ÚNICO VÁLIDO) ===
{
  "meta": {
    "tema": "${tema}",
    "idade_usuario": ${idade_usuario},
    "word_count": ${word_count},
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
- Responda SOMENTE com o JSON final.
⚠️ IMPORTANTE: Para ${word_count} palavras, você DEVE gerar pelo menos ${Math.max(10, Math.floor(word_count/200))} questões totais.`

    // Call OpenAI API with enhanced tokens for unlimited questions
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `Você é um elaborador de provas ENEM especialista. CRÍTICO: Você DEVE gerar quantidade proporcional ao conteúdo - mínimo 10 questões, sem limite máximo. Para conteúdos grandes (>900 palavras), gere 18-24+ questões. Siga RIGOROSAMENTE o formato JSON solicitado. Use EXCLUSIVAMENTE as informações do resumo fornecido. NUNCA invente dados. Responda APENAS com JSON válido. GERE TODAS AS QUESTÕES NECESSÁRIAS PARA COBRIR TODO O CONTEÚDO.`
          },
          {
            role: 'user',
            content: structuredPrompt
          }
        ],
        max_completion_tokens: 15000, // Aumentado significativamente para permitir mais questões
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0].message.content

    console.log('📝 ENEM quiz response received, length:', content.length)
    console.log('📝 First 300 chars:', content.substring(0, 300))

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

    // Process and validate questions - FLEXÍVEL para aceitar mais questões
    const validQuestions = []
    
    // Process objetivas (multiple choice) - with ENEM-style long enunciados
    if (quizData.quiz.objetivas && Array.isArray(quizData.quiz.objetivas)) {
      for (const q of quizData.quiz.objetivas) {
        if (q.enunciado && q.stem && q.options && Array.isArray(q.options) && q.options.length === 5 && 
            typeof q.correct_index === 'number' && q.evidence && q.difficulty && q.cognitive_level) {
          
          validQuestions.push({
            question_type: 'objetiva',
            pergunta: `${q.enunciado}\n\n${q.stem}`, // Combine long contextual enunciado with stem
            alternativas: q.options,
            correta: q.correct_index,
            explicacao: `Evidence: ${q.evidence}`,
            context: q.enunciado, // Store the long contextual statement
            difficulty: q.difficulty,
            cognitive_level: q.cognitive_level,
            evidence: q.evidence
          })
        } else {
          console.warn('⚠️ Invalid objetiva question skipped:', Object.keys(q))
        }
      }
    }

    // Process vf_sequenciais (sequential true/false with A-E options)
    if (quizData.quiz.vf_sequenciais && Array.isArray(quizData.quiz.vf_sequenciais)) {
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
            context: q.enunciado,
            difficulty: q.difficulty,
            cognitive_level: q.cognitive_level,
            evidence: q.evidence
          })
        } else {
          console.warn('⚠️ Invalid vf_sequenciais question skipped:', Object.keys(q))
        }
      }
    }

    if (validQuestions.length === 0) {
      throw new Error('No valid questions generated - all questions failed validation')
    }

    // VALIDAÇÃO CRÍTICA: Garantir quantidade mínima baseada no conteúdo
    const minimumExpected = Math.max(10, Math.floor(word_count/200))
    console.log(`🎯 Generated ${validQuestions.length} questions, minimum expected: ${minimumExpected}`)
    
    if (validQuestions.length < 10) {
      console.error(`❌ INSUFFICIENT QUESTIONS: Generated ${validQuestions.length}, minimum required: 10`)
      throw new Error(`AI não gerou quantidade suficiente. Gerou apenas ${validQuestions.length} questões, mínimo: 10. Para ${word_count} palavras, esperado: pelo menos ${minimumExpected} questões.`)
    }

    console.log(`✅ Successfully generated ${validQuestions.length} ENEM-style questions`)
    
    // Save enhanced metadata
    const { data: metadataInserted, error: metadataError } = await supabase
      .from('quiz_metadata')
      .insert({
        resumo_id: resumoId,
        tema: quizData.meta.tema,
        idade_usuario: quizData.meta.idade_usuario,
        word_count: quizData.meta.word_count,
        macrothemes: quizData.meta.macrothemes || [],
        targets: quizData.meta.targets || {},
        generated: quizData.meta.generated || {},
        coverage_map: quizData.coverage_map || [],
        quality_checks: quizData.quality_checks || {}
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

    console.log(`💾 Saved ${insertedQuestions.length} ENEM-style questions to database`)

    return new Response(
      JSON.stringify({
        success: true,
        questoes: insertedQuestions,
        metadata: metadataInserted,
        message: `Quiz ENEM completo gerado: ${insertedQuestions.length} questões (${quizData.meta.tema}) - Proporcional a ${word_count} palavras`,
        stats: {
          ...quizData.meta,
          questoes_geradas: insertedQuestions.length,
          word_count: word_count
        },
        coverage_map: quizData.coverage_map || [],
        quality_checks: quizData.quality_checks || {}
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('❌ Quiz generation error:', error)
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