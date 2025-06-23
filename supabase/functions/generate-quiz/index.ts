
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

    // Create high-quality ENEM/Colégio Ari de Sá style quiz prompt
    const prompt = `
Você é um especialista em criação de questões para vestibulares brasileiros, especialmente ENEM e Colégio Ari de Sá.

Baseado no conteúdo abaixo, crie exatamente 10 questões de múltipla escolha seguindo estes padrões:

PADRÕES OBRIGATÓRIOS:
1. Questões contextualizadas com situações reais
2. 5 alternativas por questão (A, B, C, D, E)
3. Nível de dificuldade médio-alto
4. Linguagem formal e acadêmica
5. Questões que exijam interpretação e análise, não apenas memorização
6. Explicações detalhadas para cada resposta

ESTRUTURA OBRIGATÓRIA para cada questão:
- Contexto introdutório (situação problema)
- Pergunta clara e objetiva
- 5 alternativas plausíveis
- Explicação detalhada da resposta correta

CONTEÚDO DO RESUMO:
${resumoContent}

IMPORTANTE: Retorne apenas um JSON válido com o array de questões, sem texto adicional.

Formato de retorno:
{
  "questoes": [
    {
      "pergunta": "Contexto da situação problema seguido da pergunta específica...",
      "alternativas": [
        "Primeira alternativa completa",
        "Segunda alternativa completa", 
        "Terceira alternativa completa",
        "Quarta alternativa completa",
        "Quinta alternativa completa"
      ],
      "correta": 0,
      "explicacao": "Explicação detalhada sobre por que esta é a resposta correta, incluindo conceitos teóricos e aplicação prática."
    }
  ]
}
`

    // Call OpenAI API
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
            content: 'Você é um especialista em criação de questões para vestibulares brasileiros. Retorne apenas JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
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

    // Parse the JSON response
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

    // Validate and clean the questions
    const validQuestions = []
    for (let i = 0; i < quizData.questoes.length; i++) {
      const questao = quizData.questoes[i]
      
      if (!questao.pergunta || !questao.alternativas || !Array.isArray(questao.alternativas)) {
        console.warn(`Skipping invalid question ${i}:`, questao)
        continue
      }

      if (questao.alternativas.length !== 5) {
        console.warn(`Question ${i} doesn't have exactly 5 alternatives:`, questao)
        continue
      }

      if (questao.correta === undefined || questao.correta < 0 || questao.correta >= 5) {
        console.warn(`Question ${i} has invalid correct answer index:`, questao)
        continue
      }

      validQuestions.push({
        pergunta: questao.pergunta.trim(),
        alternativas: questao.alternativas.map(alt => alt.trim()),
        correta: parseInt(questao.correta),
        explicacao: questao.explicacao?.trim() || 'Explicação não disponível'
      })
    }

    if (validQuestions.length === 0) {
      throw new Error('No valid questions generated')
    }

    console.log(`✅ Generated ${validQuestions.length} valid questions`)

    // Save questions to database
    const { data: insertedQuestions, error: insertError } = await supabase
      .from('quizzes')
      .insert(
        validQuestions.map(questao => ({
          resumo_id: resumoId,
          pergunta: questao.pergunta,
          alternativas: questao.alternativas,
          correta: questao.correta,
          explicacao: questao.explicacao
        }))
      )
      .select()

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw new Error(`Failed to save questions: ${insertError.message}`)
    }

    console.log(`💾 Saved ${insertedQuestions.length} questions to database`)

    return new Response(
      JSON.stringify({
        success: true,
        questoes: insertedQuestions,
        message: `Quiz gerado com ${insertedQuestions.length} questões`
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
