
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
    const { resumoContent, resumoId } = await req.json()
    
    if (!resumoContent || !resumoId) {
      throw new Error('Conteúdo do resumo e ID são obrigatórios')
    }

    console.log('🚀 Generating quiz for resumo:', resumoId)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Enhanced prompt for consistent quiz generation
    const prompt = `
Você é um especialista em criação de questões para vestibulares brasileiros, especialmente ENEM e Colégio Ari de Sá.

Baseado no conteúdo abaixo, crie exatamente 10 questões de múltipla escolha seguindo estes padrões OBRIGATÓRIOS:

ESTRUTURA CRÍTICA:
1. Questões contextualizadas com situações reais
2. Exatamente 5 alternativas por questão (A, B, C, D, E)
3. Resposta correta deve ser um número inteiro de 0 a 4 (0=A, 1=B, 2=C, 3=D, 4=E)
4. Explicações detalhadas e precisas
5. Linguagem formal e acadêmica

CONTEÚDO DO RESUMO:
${resumoContent}

IMPORTANTE: Retorne APENAS um JSON válido com exatamente esta estrutura:

{
  "questoes": [
    {
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
    }
  ]
}

VALIDAÇÃO CRÍTICA:
- Campo "correta" deve ser SEMPRE um número inteiro de 0 a 4
- Exatamente 5 alternativas por questão
- Explicação deve referenciar a alternativa correta
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

      if (questao.alternativas.length !== 5) {
        console.warn(`Question ${i} doesn't have exactly 5 alternatives:`, questao)
        continue
      }

      // Critical: Ensure correct answer is valid integer
      let correctAnswer = questao.correta
      if (typeof correctAnswer === 'string') {
        correctAnswer = parseInt(correctAnswer)
      }
      
      if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer > 4) {
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
        explicacao: (questao.explicacao || 'Explicação não disponível').trim()
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
      correta: questao.correta, // Guaranteed to be integer 0-4
      explicacao: questao.explicacao
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
