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

    console.log('🚀 Generating intelligent ENEM-style quiz for resumo:', resumoId)
    
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

    // Get user profile for age and difficulty
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
    
    // Use provided analysis or calculate defaults
    const multipleChoiceCount = analysis?.multipleChoiceCount || (word_count > 600 ? 6 : 4)
    const trueFalseCount = analysis?.trueFalseCount || (word_count > 400 ? 3 : 2)
    const difficulty = analysis?.difficulty || (word_count > 600 ? 'hard' : word_count > 300 ? 'medium' : 'easy')
    
    console.log(`📊 Análise: ${word_count} palavras, Tema: ${tema}, Idade: ${idade_usuario}`)
    console.log(`🎯 Targets: ${multipleChoiceCount} múltipla escolha, ${trueFalseCount} verdadeiro/falso`)

    // Enhanced ENEM-style prompt for both question types
    const enemPrompt = `Você deve criar questões de múltipla escolha E verdadeiro/falso no estilo ENEM baseadas EXCLUSIVAMENTE no texto fornecido.

TEXTO BASE OBRIGATÓRIO:
"""
${resumoContent}
"""

REGRAS RÍGIDAS ANTI-ALUCINAÇÃO:
1. Use SOMENTE informações que estão EXPLICITAMENTE no texto acima
2. NUNCA invente dados, datas, nomes ou conceitos que não estão no texto
3. Crie EXATAMENTE ${multipleChoiceCount} questões de múltipla escolha com 5 alternativas (A, B, C, D, E)
4. Crie EXATAMENTE ${trueFalseCount} questões de verdadeiro/falso com 3-4 afirmações cada
5. Perguntas adequadas para estudantes de ${idade_usuario} anos
6. Nível de dificuldade: ${difficulty}
7. Estilo ENEM: enunciados contextualizados e claros

FORMATO JSON EXATO:
{
  "questoes": [
    {
      "question_type": "objetiva",
      "pergunta": "Baseado no texto, [pergunta clara]",
      "alternativas": ["A) opção baseada no texto", "B) opção baseada no texto", "C) opção baseada no texto", "D) opção baseada no texto", "E) opção baseada no texto"],
      "correta": 0,
      "explicacao": "Segundo o texto, [explicação baseada exclusivamente no conteúdo]"
    },
    {
      "question_type": "verdadeiro_falso_simples",
      "pergunta": "Analise as afirmações sobre [tópico do texto] e marque V para verdadeiro ou F para falso:",
      "statements": ["Afirmação 1 baseada no texto", "Afirmação 2 baseada no texto", "Afirmação 3 baseada no texto"],
      "answer": true,
      "explicacao": "As afirmações estão corretas/incorretas porque, segundo o texto, [explicação]"
    }
  ]
}

ATENÇÃO: Responda APENAS com JSON válido. NÃO adicione texto antes ou depois.`

    // Call OpenAI API with enhanced prompt
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em questões ENEM. Crie questões múltipla escolha E verdadeiro/falso EXCLUSIVAMENTE baseadas no texto fornecido. PROIBIDO inventar informações. Responda APENAS com JSON válido sem texto adicional.'
          },
          {
            role: 'user',
            content: enemPrompt
          }
        ],
        temperature: 0.1, // Lower for consistency
        max_tokens: 4000,
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0].message.content

    console.log('📝 Raw OpenAI response:', content.substring(0, 300) + '...')

    // Parse JSON response
    let quizData
    try {
      quizData = JSON.parse(content)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Content that failed to parse:', content)
      throw new Error('Failed to parse quiz data from AI response')
    }

    if (!quizData.questoes || !Array.isArray(quizData.questoes)) {
      throw new Error('Invalid quiz format from AI - missing questoes array')
    }

    // Validate and process questions
    const validQuestions = []
    
    for (const q of quizData.questoes) {
      if (q.question_type === 'objetiva' && q.pergunta && q.alternativas && 
          Array.isArray(q.alternativas) && q.alternativas.length === 5 && 
          typeof q.correta === 'number' && q.explicacao) {
        
        validQuestions.push({
          question_type: 'objetiva',
          pergunta: q.pergunta,
          alternativas: q.alternativas,
          correta: q.correta,
          explicacao: q.explicacao,
          context: null,
          difficulty: difficulty,
          cognitive_level: 'understand',
          evidence: null
        })
      } else if ((q.question_type === 'verdadeiro_falso_simples' || q.question_type === 'verdadeiro_falso_combinacoes') && 
                 q.pergunta && q.statements && Array.isArray(q.statements) && 
                 typeof q.answer === 'boolean' && q.explicacao) {
        
        validQuestions.push({
          question_type: q.question_type,
          pergunta: q.pergunta,
          statements: q.statements,
          answer: q.answer,
          explicacao: q.explicacao,
          context: null,
          difficulty: difficulty,
          cognitive_level: 'analyze'
        })
      }
    }

    if (validQuestions.length === 0) {
      throw new Error('No valid questions generated - all questions failed validation')
    }

    console.log(`✅ ${validQuestions.length}/${quizData.questoes.length} questões aprovadas na validação`)
    
    // Save metadata
    const { data: metadataInserted, error: metadataError } = await supabase
      .from('quiz_metadata')
      .insert({
        resumo_id: resumoId,
        tema: tema,
        idade_usuario: idade_usuario,
        word_count: word_count,
        macrothemes: [tema],
        targets: { 
          multipleChoice: multipleChoiceCount, 
          trueFalse: trueFalseCount 
        },
        generated: { 
          multipleChoice: validQuestions.filter(q => q.question_type === 'objetiva').length,
          trueFalse: validQuestions.filter(q => q.question_type.includes('verdadeiro_falso')).length
        },
        quality_checks: { all_from_summary: true, intelligent_analysis: true }
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
        message: `Quiz inteligente gerado: ${insertedQuestions.length} questões (${tema})`,
        stats: {
          word_count,
          tema,
          idade_usuario,
          difficulty,
          generated: {
            multipleChoice: validQuestions.filter(q => q.question_type === 'objetiva').length,
            trueFalse: validQuestions.filter(q => q.question_type.includes('verdadeiro_falso')).length,
            total: validQuestions.length
          }
        }
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