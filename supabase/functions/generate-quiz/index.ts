
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função para detectar tema automaticamente
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

// Função para calcular idade do usuário
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

// Função para contar palavras
const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

// Função para calcular quantidades automáticas
const calculateTargets = (wordCount: number, macrothemes: string[]) => {
  const themeCount = macrothemes.length
  
  if (wordCount <= 300) {
    return { objetivas: Math.max(6, themeCount), vf_simples: 2, vf_combinacoes: 0 }
  } else if (wordCount <= 600) {
    return { objetivas: Math.max(8, themeCount), vf_simples: 3, vf_combinacoes: 1 }
  } else if (wordCount <= 900) {
    return { objetivas: Math.max(10, themeCount), vf_simples: 4, vf_combinacoes: 2 }
  } else {
    return { objetivas: Math.max(12, themeCount), vf_simples: 5, vf_combinacoes: 3 }
  }
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

    console.log('🚀 Generating ENEM-style quiz for resumo:', resumoId)
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Consumir créditos antes de gerar quiz
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

    // Análise dinâmica do conteúdo
    const tema = detectTheme(resumoContent)
    const idade_usuario = userProfile?.date_of_birth ? calculateAge(userProfile.date_of_birth) : 17
    const word_count = countWords(resumoContent)
    
    console.log(`📊 Análise: ${word_count} palavras, Tema: ${tema}, Idade: ${idade_usuario}`)

    // Simulated macrotheme detection (would be enhanced with AI)
    const macrothemes = [tema, 'Conceitos fundamentais', 'Aplicações práticas']
    const targets = calculateTargets(word_count, macrothemes)

    console.log(`🎯 Targets: ${targets.objetivas} objetivas, ${targets.vf_simples} V/F simples, ${targets.vf_combinacoes} V/F combinações`)

    // Construir prompt ENEM avançado com variáveis dinâmicas
    const enemPrompt = `Você é um elaborador de provas no estilo ENEM. Sua missão é transformar o RESUMO criado em um QUIZ coerente, completo e adequado à idade do estudante, SEM adicionar informações externas.

=== PARÂMETROS ===
- Idade do estudante: ${idade_usuario}
- Tema: ${tema}
- Quantidades desejadas:
  - Objetivas (5 alternativas A–E): ${targets.objetivas}
  - Verdadeiro/Falso simples: ${targets.vf_simples}
  - Verdadeiro/Falso com combinações: ${targets.vf_combinacoes}

=== RESUMO (fonte única de verdade) ===
"""
${resumoContent}
"""

=== REGRAS PEDAGÓGICAS OBRIGATÓRIAS ===
1) USO EXCLUSIVO DO RESUMO: não invente fatos, datas, termos ou exemplos fora do texto.
2) LINGUAGEM POR IDADE: adapte vocabulário, período frasal e clareza para ${idade_usuario} anos.
3) ENUNCIADOS CLAROS: evite negações confusas ("NÃO é") e absolutos ("sempre/nunca"), a menos que o resumo seja taxativo.
4) CONTEXTUALIZAÇÃO: cada questão pode ter um breve contexto (até 2 frases) antes da pergunta.
5) NÍVEL COGNITIVO: varie entre lembrar, entender, aplicar e analisar (Taxonomia de Bloom).
6) ALTERNATIVAS:
   - Objetivas: 5 alternativas (A–E), UMA correta; 4 distratores plausíveis e alinhados ao texto.
   - Proibido usar "todas as anteriores"/"nenhuma das anteriores".
   - Alternativas com tamanho semelhante e concordância gramatical com o enunciado.
   - Embaralhe a posição da correta (não padronize).
7) EVIDENCE OBRIGATÓRIO: em TODAS as questões inclua um campo "evidence" com um trecho literal (≤ 200 caracteres) do resumo que sustente a resposta correta.
8) COBERTURA: identifique macrotemas do resumo e distribua as questões para cobrir todos. Evite repetição de perguntas.

=== FORMATO DE SAÍDA (JSON ÚNICO VÁLIDO) ===
{
  "meta": {
    "tema": "${tema}",
    "idade_usuario": ${idade_usuario},
    "word_count": ${word_count},
    "macrothemes": ${JSON.stringify(macrothemes)},
    "targets": ${JSON.stringify(targets)},
    "generated": {
      "objetivas": 0,
      "vf_simples": 0,
      "vf_combinacoes": 0
    }
  },
  "quiz": {
    "objetivas": [
      {
        "context": "até 2 frases opcionais",
        "stem": "pergunta clara, direta e contextualizada ao resumo",
        "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
        "correct_index": 0,
        "difficulty": "easy|medium|hard",
        "cognitive_level": "remember|understand|apply|analyze",
        "evidence": "trecho literal do resumo (<=200)"
      }
    ],
    "verdadeiro_falso_simples": [
      {
        "statement": "afirmação checável no resumo",
        "answer": true,
        "difficulty": "easy|medium|hard", 
        "cognitive_level": "remember|understand|apply|analyze",
        "evidence": "trecho literal do resumo (<=200)"
      }
    ],
    "verdadeiro_falso_combinacoes": [
      {
        "statements": [
          "I. afirmação 1 baseada no resumo",
          "II. afirmação 2 baseada no resumo", 
          "III. afirmação 3 baseada no resumo",
          "IV. afirmação 4 baseada no resumo"
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
        "evidence": "trecho(s) literal(is) do resumo (<=200)"
      }
    ]
  },
  "quality_checks": {
    "all_from_summary": true,
    "language_adapted_to_age": true,
    "balanced_difficulties": true,
    "balanced_cognitive_levels": true,
    "no_repeated_questions": true,
    "full_coverage": true,
    "uncovered_macrothemes": []
  }
}

VALIDAÇÕES FINAIS: Responder SOMENTE com o JSON final. Conferir que TODAS as questões possuem "evidence" retirado do resumo.`

    // Call OpenAI API with ENEM prompt
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
            content: 'Você é um elaborador de provas no estilo ENEM. Retorne APENAS JSON válido seguindo a estrutura especificada.'
          },
          {
            role: 'user',
            content: enemPrompt
          }
        ],
        temperature: 0.2, // Lower for more consistent structure
        max_tokens: 6000,
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0].message.content

    console.log('📝 Raw OpenAI ENEM response:', content.substring(0, 500) + '...')

    // Parse ENEM format JSON
    let enemData
    try {
      enemData = JSON.parse(content)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Content that failed to parse:', content)
      throw new Error('Failed to parse ENEM quiz data from AI response')
    }

    if (!enemData.meta || !enemData.quiz) {
      throw new Error('Invalid ENEM quiz format from AI')
    }

    // Process new ENEM format questions
    const allQuestions = []
    
    // Process objetivas
    if (enemData.quiz.objetivas) {
      enemData.quiz.objetivas.forEach((q, i) => {
        if (q.stem && q.options && Array.isArray(q.options) && q.options.length === 5) {
          allQuestions.push({
            question_type: 'objetiva',
            pergunta: q.stem,
            alternativas: q.options,
            correta: q.correct_index || 0,
            explicacao: q.evidence || 'Evidência não disponível',
            context: q.context || null,
            difficulty: q.difficulty || 'medium',
            cognitive_level: q.cognitive_level || 'understand',
            evidence: q.evidence || null
          })
        }
      })
    }
    
    // Process verdadeiro_falso_simples
    if (enemData.quiz.verdadeiro_falso_simples) {
      enemData.quiz.verdadeiro_falso_simples.forEach((q, i) => {
        if (q.statement) {
          allQuestions.push({
            question_type: 'verdadeiro_falso_simples',
            pergunta: q.statement,
            alternativas: ['Verdadeiro', 'Falso'],
            correta: q.answer === true ? 0 : 1,
            explicacao: q.evidence || 'Evidência não disponível',
            answer: q.answer,
            difficulty: q.difficulty || 'medium',
            cognitive_level: q.cognitive_level || 'understand',
            evidence: q.evidence || null
          })
        }
      })
    }
    
    // Process verdadeiro_falso_combinacoes
    if (enemData.quiz.verdadeiro_falso_combinacoes) {
      enemData.quiz.verdadeiro_falso_combinacoes.forEach((q, i) => {
        if (q.statements && q.options && Array.isArray(q.options) && q.options.length === 5) {
          allQuestions.push({
            question_type: 'verdadeiro_falso_combinacoes',
            pergunta: 'Analise as afirmações abaixo:',
            alternativas: q.options,
            correta: q.correct_index || 0,
            explicacao: q.evidence || 'Evidência não disponível',
            statements: q.statements,
            difficulty: q.difficulty || 'hard',
            cognitive_level: q.cognitive_level || 'analyze',
            evidence: q.evidence || null
          })
        }
      })
    }

    if (allQuestions.length === 0) {
      throw new Error('No valid ENEM questions generated')
    }

    console.log(`✅ Generated ${allQuestions.length} ENEM-style questions`)

    // Save metadata first
    const { data: metadataInserted, error: metadataError } = await supabase
      .from('quiz_metadata')
      .insert({
        resumo_id: resumoId,
        tema: tema,
        idade_usuario: idade_usuario,
        word_count: word_count,
        macrothemes: macrothemes,
        targets: targets,
        generated: {
          objetivas: enemData.quiz.objetivas?.length || 0,
          vf_simples: enemData.quiz.verdadeiro_falso_simples?.length || 0,
          vf_combinacoes: enemData.quiz.verdadeiro_falso_combinacoes?.length || 0
        },
        coverage_map: enemData.coverage_map || [],
        quality_checks: enemData.quality_checks || {}
      })
      .select()
      .single()

    if (metadataError) {
      console.error('Metadata insert error:', metadataError)
      console.log('Continuing without metadata...')
    }

    // Save questions with new fields
    const questionsToInsert = allQuestions.map(q => ({
      resumo_id: resumoId,
      question_type: q.question_type,
      pergunta: q.pergunta,
      alternativas: q.alternativas,
      correta: q.correta,
      explicacao: q.explicacao,
      tipo: q.question_type === 'objetiva' ? 'multipla_escolha' : 'verdadeiro_falso',
      context: q.context,
      difficulty: q.difficulty,
      cognitive_level: q.cognitive_level,
      evidence: q.evidence,
      statements: q.statements,
      answer: q.answer
    }))

    const { data: insertedQuestions, error: insertError } = await supabase
      .from('quizzes')
      .insert(questionsToInsert)
      .select()

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw new Error(`Failed to save ENEM questions: ${insertError.message}`)
    }

    console.log(`💾 Saved ${insertedQuestions.length} ENEM questions to database`)

    return new Response(
      JSON.stringify({
        success: true,
        questoes: insertedQuestions,
        metadata: metadataInserted,
        message: `Quiz ENEM gerado com ${insertedQuestions.length} questões inteligentes`,
        stats: {
          word_count,
          tema,
          idade_usuario,
          targets,
          generated: {
            objetivas: enemData.quiz.objetivas?.length || 0,
            vf_simples: enemData.quiz.verdadeiro_falso_simples?.length || 0,
            vf_combinacoes: enemData.quiz.verdadeiro_falso_combinacoes?.length || 0
          }
        }
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
