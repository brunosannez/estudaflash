
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumoContent, resumoId, userId } = await req.json()
    
    if (!resumoContent || !resumoId) {
      throw new Error('Conteúdo do resumo e ID são obrigatórios')
    }

    console.log('🚀 Generating quiz for resumo:', resumoId)

    // Get user profile for difficulty adaptation
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Get difficulty level based on user profile
    const getDifficultyPrompt = () => {
      if (!userProfile?.school_year) return "nível médio (ENEM)"
      
      const year = userProfile.school_year.toLowerCase()
      if (year.includes('fundamental')) return "nível fundamental (8º-9º ano)"
      if (year.includes('1º') || year.includes('primeiro')) return "nível 1º ano do ensino médio"
      if (year.includes('2º') || year.includes('segundo')) return "nível 2º ano do ensino médio" 
      if (year.includes('3º') || year.includes('terceiro')) return "nível 3º ano do ensino médio (ENEM)"
      return "nível médio (ENEM)"
    }

    // Enhanced prompt for consistent quiz generation
    const prompt = `
Você é um especialista em criação de questões para vestibulares brasileiros, especialmente ENEM e Colégio Ari de Sá.

Baseado no conteúdo abaixo, crie exatamente 8 questões seguindo estes padrões OBRIGATÓRIOS:

NÍVEL DE DIFICULDADE: ${getDifficultyPrompt()}
TIPOS DE QUESTÃO: 6 questões de múltipla escolha + 2 questões verdadeiro/falso

ESTRUTURA CRÍTICA:
1. Questões contextualizadas com situações reais
2. Para múltipla escolha: exatamente 5 alternativas (A, B, C, D, E)
3. Para V/F: exatamente 2 alternativas ("Verdadeiro", "Falso")
4. Resposta correta como número inteiro (0-4 para múltipla escolha, 0-1 para V/F)
5. Explicações detalhadas e precisas
6. Linguagem apropriada para ${getDifficultyPrompt()}

CONTEÚDO DO RESUMO:
${resumoContent}

IMPORTANTE: Retorne APENAS um JSON válido com exatamente esta estrutura:

{
  "questoes": [
    {
      "tipo": "multipla_escolha",
      "pergunta": "Contexto + pergunta específica",
      "alternativas": [
        "Alternativa A completa",
        "Alternativa B completa", 
        "Alternativa C completa",
        "Alternativa D completa",
        "Alternativa E completa"
      ],
      "correta": 0,
      "explicacao": "Explicação detalhada sobre por que a alternativa A (índice 0) é a correta."
    },
    {
      "tipo": "verdadeiro_falso",
      "pergunta": "Afirmação para avaliar se é verdadeira ou falsa",
      "alternativas": ["Verdadeiro", "Falso"],
      "correta": 0,
      "explicacao": "Explicação detalhada sobre por que a afirmação é verdadeira (índice 0) ou falsa (índice 1)."
    }
  ]
}

VALIDAÇÃO CRÍTICA:
- Campo "correta" deve ser SEMPRE um número inteiro (0-4 para múltipla escolha, 0-1 para V/F)
- Múltipla escolha: exatamente 5 alternativas
- Verdadeiro/Falso: exatamente 2 alternativas ("Verdadeiro", "Falso")
- Explicação deve referenciar a alternativa correta
- Campo "tipo" obrigatório ("multipla_escolha" ou "verdadeiro_falso")
`

    // Call OpenAI API with enhanced parameters
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
            content: 'Você é um especialista em criação de questões para vestibulares brasileiros. Retorne APENAS JSON válido com estrutura consistente.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Reduced for more consistent output
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

    console.log('📝 Raw OpenAI response:', content)

    // Enhanced JSON parsing with validation
    let quizData
    try {
      quizData = JSON.parse(content)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Content that failed to parse:', content)
      throw new Error('Failed to parse quiz data from AI response')
    }

    if (!quizData.questoes || !Array.isArray(quizData.questoes)) {
      throw new Error('Invalid quiz format from AI')
    }

    // Rigorous validation and cleaning
    const validQuestions = []
    for (let i = 0; i < quizData.questoes.length; i++) {
      const questao = quizData.questoes[i]
      
      // Validate question structure
      if (!questao.pergunta || typeof questao.pergunta !== 'string') {
        console.warn(`Question ${i} has invalid pergunta:`, questao)
        continue
      }

      if (!questao.alternativas || !Array.isArray(questao.alternativas)) {
        console.warn(`Question ${i} has invalid alternativas:`, questao)
        continue
      }

      // Validate question type and alternatives count
      const questionType = questao.tipo || 'multipla_escolha'
      const expectedAlternatives = questionType === 'verdadeiro_falso' ? 2 : 5
      
      if (questao.alternativas.length !== expectedAlternatives) {
        console.warn(`Question ${i} doesn't have exactly ${expectedAlternatives} alternatives for type ${questionType}:`, questao)
        continue
      }

      // Critical: Ensure correct answer is valid integer
      let correctAnswer = questao.correta
      if (typeof correctAnswer === 'string') {
        correctAnswer = parseInt(correctAnswer)
      }
      
      const maxCorrectAnswer = expectedAlternatives - 1
      if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer > maxCorrectAnswer) {
        console.warn(`Question ${i} has invalid correct answer:`, questao.correta)
        correctAnswer = 0 // Default to first alternative
      }

      // Validate alternatives are strings
      const cleanAlternatives = questao.alternativas.map((alt, idx) => {
        if (typeof alt !== 'string') {
          console.warn(`Question ${i}, alternative ${idx} is not a string:`, alt)
          return `Alternativa ${String.fromCharCode(65 + idx)}`
        }
        return alt.trim()
      })

      validQuestions.push({
        pergunta: questao.pergunta.trim(),
        alternativas: cleanAlternatives,
        correta: correctAnswer,
        explicacao: (questao.explicacao || 'Explicação não disponível').trim(),
        tipo: questionType
      })
    }

    if (validQuestions.length === 0) {
      throw new Error('No valid questions generated')
    }

    console.log(`✅ Generated ${validQuestions.length} valid questions with consistent structure`)

    // Save questions to database with enhanced validation
    const questionsToInsert = validQuestions.map(questao => ({
      resumo_id: resumoId,
      pergunta: questao.pergunta,
      alternativas: questao.alternativas,
      correta: questao.correta, // Guaranteed to be integer
      explicacao: questao.explicacao,
      tipo: questao.tipo || 'multipla_escolha'
    }))

    const { data: insertedQuestions, error: insertError } = await supabase
      .from('quizzes')
      .insert(questionsToInsert)
      .select()

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw new Error(`Failed to save questions: ${insertError.message}`)
    }

    console.log(`💾 Saved ${insertedQuestions.length} questions to database with consistent format`)

    return new Response(
      JSON.stringify({
        success: true,
        questoes: insertedQuestions,
        message: `Quiz gerado com ${insertedQuestions.length} questões consistentes`
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
