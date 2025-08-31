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

    // Calculate expected questions based on content size
    const expectedQuestions = Math.max(10, Math.floor(word_count/150)) // More aggressive ratio
    
    console.log(`🎯 Content analysis: ${word_count} words → expecting ${expectedQuestions}+ questions`)

    // OPTIMIZED ENEM PROMPT - FOCUSED AND DIRECT
    const ENEMPrompt = `MISSÃO: Gerar quiz ENEM completo para resumo de ${word_count} palavras.

QUANTIDADE OBRIGATÓRIA: Para ${word_count} palavras → MÍNIMO ${expectedQuestions} questões (50% objetivas, 50% V/F).

RESUMO BASE:
"""
${resumoContent}
"""

QUESTÕES OBJETIVAS (formato ENEM):
- Enunciado contextual: 80-150 palavras do resumo
- Pergunta clara após contexto
- 5 alternativas (A-E), apenas 1 correta
- Campo evidence: trecho literal do resumo

QUESTÕES V/F SEQUENCIAIS:
- Contexto: 2-4 frases do resumo  
- 4 afirmativas (I,II,III,IV)
- Alternativas A-E com combinações V/F
- Campo evidence: trecho literal do resumo

FORMATO JSON OBRIGATÓRIO:
{
  "meta": {
    "tema": "${tema}",
    "idade_usuario": ${idade_usuario},
    "word_count": ${word_count},
    "expected_questions": ${expectedQuestions}
  },
  "quiz": {
    "objetivas": [
      {
        "enunciado": "CONTEXTO LONGO 80-150 PALAVRAS AQUI",
        "stem": "Com base no contexto, pergunta?",
        "options": ["A) alternativa", "B) alternativa", "C) alternativa", "D) alternativa", "E) alternativa"],
        "correct_index": 0,
        "difficulty": "medium",
        "evidence": "trecho literal do resumo"
      }
    ],
    "vf_sequenciais": [
      {
        "enunciado": "Contexto de 2-4 frases do resumo",
        "statements": ["I. afirmação", "II. afirmação", "III. afirmação", "IV. afirmação"],
        "options": ["A) V V F F", "B) V F V F", "C) F F V V", "D) V V V F", "E) F V V V"],
        "correct_index": 2,
        "difficulty": "medium", 
        "evidence": "trecho literal do resumo"
      }
    ]
  }
}

GERE EXATAMENTE ${expectedQuestions}+ questões. Use APENAS informações do resumo.`

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
            content: `Você é um gerador de quiz ENEM. REGRA CRÍTICA: Para ${word_count} palavras, gere EXATAMENTE ${expectedQuestions} ou mais questões. Metade objetivas (com contextos de 80-150 palavras), metade V/F sequenciais. Use APENAS o resumo fornecido. Responda SOMENTE JSON válido. NUNCA menos que ${expectedQuestions} questões.`
          },
          {
            role: 'user', 
            content: ENEMPrompt
          }
        ],
        max_completion_tokens: 25000, // Increased for larger responses
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0].message.content

    console.log('📝 Quiz response received, length:', content.length)
    console.log('📝 Full AI Response:', content) // Log full response for debugging
    
    // Parse and validate JSON response
    let quizData
    try {
      // Clean the response if needed
      const cleanedContent = content.trim().replace(/```json\n?|```\n?/g, '')
      quizData = JSON.parse(cleanedContent)
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      console.error('Raw content:', content)
      throw new Error('Failed to parse quiz JSON from AI response')
    }

    // Flexible validation - only check essential structure
    if (!quizData.quiz) {
      console.error('❌ Missing quiz section:', Object.keys(quizData))
      throw new Error('AI response missing quiz section')
    }

    const objetivasCount = quizData.quiz.objetivas?.length || 0
    const vfCount = quizData.quiz.vf_sequenciais?.length || 0
    const totalGenerated = objetivasCount + vfCount
    
    console.log(`📊 Generated: ${objetivasCount} objetivas + ${vfCount} V/F = ${totalGenerated} total`)
    console.log(`🎯 Expected: ${expectedQuestions} minimum`)

    // RETRY LOGIC if insufficient questions
    if (totalGenerated < Math.max(5, expectedQuestions * 0.7)) {
      console.log('⚠️ Insufficient questions, retrying with stricter prompt...')
      
      const retryPrompt = `URGENTE: Gere EXATAMENTE ${expectedQuestions} questões para este resumo de ${word_count} palavras.

${resumoContent}

Distribua: ${Math.ceil(expectedQuestions/2)} objetivas + ${Math.floor(expectedQuestions/2)} V/F sequenciais.

JSON obrigatório:
{
  "quiz": {
    "objetivas": [{"enunciado": "contexto 80-150 palavras", "stem": "pergunta?", "options": ["A)...", "B)...", "C)...", "D)...", "E)..."], "correct_index": 0, "evidence": "trecho resumo"}],
    "vf_sequenciais": [{"enunciado": "contexto", "statements": ["I.", "II.", "III.", "IV."], "options": ["A) V V F F", "B) V F V F", "C) F F V V", "D) V V V F", "E) F V V V"], "correct_index": 0, "evidence": "trecho resumo"}]
  }
}`

      const retryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-2025-08-07',
          messages: [
            { role: 'system', content: `Gere EXATAMENTE ${expectedQuestions} questões. Não aceito menos.` },
            { role: 'user', content: retryPrompt }
          ],
          max_completion_tokens: 25000,
        }),
      })

      if (retryResponse.ok) {
        const retryData = await retryResponse.json()
        const retryContent = retryData.choices[0].message.content
        console.log('🔄 Retry response:', retryContent.substring(0, 500))
        
        try {
          const cleanedRetry = retryContent.trim().replace(/```json\n?|```\n?/g, '')
          const retryQuizData = JSON.parse(cleanedRetry)
          if (retryQuizData.quiz && 
              ((retryQuizData.quiz.objetivas?.length || 0) + (retryQuizData.quiz.vf_sequenciais?.length || 0)) > totalGenerated) {
            quizData = retryQuizData
            console.log('✅ Retry successful, using improved response')
          }
        } catch (retryError) {
          console.log('⚠️ Retry failed, using original response')
        }
      }
    }

    // Process and validate questions with FLEXIBLE validation
    const validQuestions = []
    
    // Process objetivas (multiple choice) with ENEM-style formatting
    if (quizData.quiz.objetivas && Array.isArray(quizData.quiz.objetivas)) {
      console.log(`📝 Processing ${quizData.quiz.objetivas.length} objetivas...`)
      
      for (const [index, q] of quizData.quiz.objetivas.entries()) {
        try {
          // More flexible validation - only require essential fields
          if (q.enunciado && q.options && Array.isArray(q.options) && q.options.length >= 4 && 
              typeof q.correct_index === 'number') {
            
            // Build question text - combine enunciado with stem if present
            const questionText = q.stem ? `${q.enunciado}\n\n${q.stem}` : q.enunciado
            
            validQuestions.push({
              question_type: 'objetiva',
              pergunta: questionText,
              alternativas: q.options,
              correta: q.correct_index,
              explicacao: q.evidence ? `Evidence: ${q.evidence}` : 'Baseado no resumo fornecido',
              context: q.enunciado, // ENEM context
              difficulty: q.difficulty || 'medium',
              cognitive_level: q.cognitive_level || 'understand', 
              evidence: q.evidence || 'Conteúdo do resumo'
            })
            
            console.log(`✅ Objetiva ${index + 1} processed: ${questionText.substring(0, 100)}...`)
          } else {
            console.warn(`⚠️ Objetiva ${index + 1} missing required fields:`, Object.keys(q))
          }
        } catch (error) {
          console.error(`❌ Error processing objetiva ${index + 1}:`, error)
        }
      }
    }

    // Process V/F sequenciais with flexible validation
    if (quizData.quiz.vf_sequenciais && Array.isArray(quizData.quiz.vf_sequenciais)) {
      console.log(`📝 Processing ${quizData.quiz.vf_sequenciais.length} V/F sequenciais...`)
      
      for (const [index, q] of quizData.quiz.vf_sequenciais.entries()) {
        try {
          if (q.enunciado && q.statements && Array.isArray(q.statements) && 
              q.options && Array.isArray(q.options) && typeof q.correct_index === 'number') {
            
            validQuestions.push({
              question_type: 'verdadeiro_falso_combinacoes',
              pergunta: q.enunciado,
              statements: q.statements,
              alternativas: q.options,
              correta: q.correct_index,
              explicacao: q.evidence ? `Evidence: ${q.evidence}` : 'Baseado no resumo fornecido',
              context: q.enunciado,
              difficulty: q.difficulty || 'medium',
              cognitive_level: q.cognitive_level || 'analyze',
              evidence: q.evidence || 'Conteúdo do resumo'
            })
            
            console.log(`✅ V/F ${index + 1} processed: ${q.enunciado.substring(0, 100)}...`)
          } else {
            console.warn(`⚠️ V/F ${index + 1} missing required fields:`, Object.keys(q))
          }
        } catch (error) {
          console.error(`❌ Error processing V/F ${index + 1}:`, error)
        }
      }
    }

    console.log(`🎯 Final count: ${validQuestions.length} valid questions (expected: ${expectedQuestions})`)

    if (validQuestions.length === 0) {
      throw new Error('No valid questions generated - all questions failed validation')
    }

    // More lenient validation - warn but don't fail if slightly under
    if (validQuestions.length < Math.max(5, expectedQuestions * 0.5)) {
      console.error(`❌ CRITICALLY LOW: Generated only ${validQuestions.length} questions for ${word_count} words`)
      throw new Error(`Quantidade insuficiente: ${validQuestions.length} questões geradas (esperado: pelo menos ${expectedQuestions})`)
    } else if (validQuestions.length < expectedQuestions) {
      console.warn(`⚠️ Below target: Generated ${validQuestions.length}, expected ${expectedQuestions}`)
    }

    console.log(`✅ Successfully generated ${validQuestions.length} ENEM-style questions`)
    
    // Save enhanced metadata
    const { data: metadataInserted, error: metadataError } = await supabase
      .from('quiz_metadata')
      .insert({
        resumo_id: resumoId,
        tema: quizData.meta?.tema || tema,
        idade_usuario: quizData.meta?.idade_usuario || idade_usuario,
        word_count: quizData.meta?.word_count || word_count,
        macrothemes: quizData.meta?.macrothemes || [],
        targets: quizData.meta?.targets || {},
        generated: quizData.meta?.generated || { objetivas: objetivasCount, vf_sequenciais: vfCount },
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
        message: `Quiz ENEM completo gerado: ${insertedQuestions.length} questões (${tema}) - Proporcional a ${word_count} palavras`,
        stats: {
          tema,
          idade_usuario,
          word_count,
          expected_questions: expectedQuestions,
          questoes_geradas: insertedQuestions.length
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