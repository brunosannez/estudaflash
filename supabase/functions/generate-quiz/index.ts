
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Quiz {
  pergunta: string;
  alternativas: string[];
  correta: number;
  explicacao: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumo_id, texto_resumo, userId } = await req.json();

    console.log('🎯 Generating ENEM/Ari de Sá style quiz for resumo:', resumo_id);

    // Usar OpenAI para gerar quiz no estilo ENEM/Ari de Sá
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const quizzes = await generateQuizWithOpenAI(texto_resumo, openaiKey);

    if (!quizzes || quizzes.length === 0) {
      throw new Error('Nenhum quiz foi gerado');
    }

    // Salvar no Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const quizData = quizzes.map(quiz => ({
      resumo_id,
      pergunta: quiz.pergunta,
      alternativas: quiz.alternativas,
      correta: quiz.correta,
      explicacao: quiz.explicacao
    }));

    const { data, error } = await supabase
      .from('quizzes')
      .insert(quizData)
      .select();

    if (error) {
      console.error('Error saving to database:', error);
      throw error;
    }

    console.log('✅ Quiz saved successfully, generated', data.length, 'questions');

    return new Response(JSON.stringify({ 
      success: true, 
      quizzes: data 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error generating quiz:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateQuizWithOpenAI(content: string, apiKey: string): Promise<Quiz[]> {
  const prompt = `
Você é um especialista em criar questões de vestibular no estilo ENEM e colégio Ari de Sá. 

Baseado no seguinte conteúdo, crie exatamente 5 questões de múltipla escolha que sigam estas características:

ESTILO ENEM/ARI DE SÁ:
- Questões contextualizadas com situações reais
- Texto base seguido de pergunta objetiva
- 5 alternativas (A, B, C, D, E)
- Foco na interpretação e aplicação do conhecimento
- Interdisciplinaridade quando possível
- Linguagem clara e precisa
- Explicação detalhada da resposta correta

CONTEÚDO PARA BASE:
${content}

FORMATO DE RESPOSTA (JSON):
[
  {
    "pergunta": "Texto contextualizador + pergunta objetiva",
    "alternativas": ["A) primeira alternativa", "B) segunda alternativa", "C) terceira alternativa", "D) quarta alternativa", "E) quinta alternativa"],
    "correta": 2,
    "explicacao": "Explicação detalhada de por que a alternativa C está correta e por que as outras estão incorretas"
  }
]

IMPORTANTE:
- Use situações do cotidiano, notícias, ou casos práticos
- Faça perguntas que exijam análise, não apenas memorização
- Todas as alternativas devem ser plausíveis
- A explicação deve ser educativa e completa
- Numere as alternativas como A), B), C), D), E)
- O índice "correta" deve ser 0 para A, 1 para B, 2 para C, etc.

Responda APENAS com o JSON válido, sem texto adicional.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em educação que cria questões de vestibular no estilo ENEM e Ari de Sá. Sempre responda com JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const generatedContent = data.choices[0].message.content;

  try {
    // Tentar parsear o JSON
    let jsonContent = generatedContent.trim();
    
    // Remover possíveis caracteres de markdown
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/, '').replace(/```\n?$/, '');
    }
    
    const quizzes = JSON.parse(jsonContent);
    
    // Validar estrutura
    if (!Array.isArray(quizzes)) {
      throw new Error('Response is not an array');
    }
    
    // Validar cada quiz
    const validQuizzes = quizzes.filter(quiz => 
      quiz.pergunta && 
      Array.isArray(quiz.alternativas) && 
      quiz.alternativas.length === 5 &&
      typeof quiz.correta === 'number' &&
      quiz.correta >= 0 && quiz.correta < 5 &&
      quiz.explicacao
    );
    
    console.log('✅ Generated', validQuizzes.length, 'valid quizzes');
    return validQuizzes;
    
  } catch (parseError) {
    console.error('Error parsing OpenAI response:', parseError);
    console.error('Raw response:', generatedContent);
    throw new Error('Failed to parse quiz generation response');
  }
}
