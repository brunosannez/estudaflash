
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumoId, textoResumo } = await req.json();
    
    if (!resumoId || !textoResumo) {
      throw new Error('ID do resumo e texto são obrigatórios');
    }

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY não configurada');
    }

    console.log('Gerando flashcards automaticamente para resumo:', resumoId);
    console.log('Tamanho do texto:', textoResumo.length, 'caracteres');

    // Prompt otimizado para gerar flashcards educativos
    const prompt = `Você é um especialista em técnicas de estudo que cria flashcards eficazes para memorização.

Baseado no seguinte resumo de estudo, crie 8-12 flashcards seguindo estas diretrizes:

1. Faça perguntas diretas e objetivas
2. As respostas devem ser concisas mas completas
3. Inclua exemplos práticos quando possível
4. Varie o tipo de pergunta (conceito, aplicação, exemplo)
5. Foque nos pontos mais importantes do conteúdo
6. Use linguagem clara e didática

Texto do resumo:
${textoResumo}

Retorne APENAS um array JSON no seguinte formato:
[
  {
    "pergunta": "Pergunta clara e objetiva...",
    "resposta": "Resposta concisa e completa...",
    "exemplo": "Exemplo prático (opcional, use null se não aplicável)"
  }
]

Não inclua texto adicional, apenas o array JSON:`;

    console.log('Iniciando chamada para API da Anthropic...');
    const startTime = Date.now();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        top_p: 0.9
      })
    });

    const endTime = Date.now();
    console.log(`Tempo de resposta da API Anthropic: ${endTime - startTime}ms`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro da API Anthropic:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      });
      throw new Error(`Erro ao gerar flashcards: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Estrutura de resposta inesperada da API:', data);
      throw new Error('Resposta inválida da API Anthropic');
    }

    let flashcardsText = data.content[0].text.trim();
    
    // Remover possível formatação markdown
    if (flashcardsText.startsWith('```json')) {
      flashcardsText = flashcardsText.replace(/^```json\s*/, '').replace(/```$/, '');
    } else if (flashcardsText.startsWith('```')) {
      flashcardsText = flashcardsText.replace(/^```\w*\s*/, '').replace(/```$/, '');
    }

    console.log('Processando flashcards gerados...');

    let flashcards;
    try {
      flashcards = JSON.parse(flashcardsText);
    } catch (e) {
      console.error('Erro ao parsear JSON dos flashcards:', e);
      throw new Error('Erro ao processar flashcards gerados pela IA');
    }

    if (!Array.isArray(flashcards)) {
      throw new Error('Formato inválido de flashcards retornado pela IA');
    }

    console.log(`${flashcards.length} flashcards gerados com sucesso`);

    // Salvar flashcards no banco de dados
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const flashcardsToInsert = flashcards.map((card: any) => ({
      resumo_id: resumoId,
      pergunta: card.pergunta,
      resposta: card.resposta,
      exemplo: card.exemplo || null
    }));

    const { data: savedFlashcards, error: flashcardError } = await supabase
      .from('flashcards')
      .insert(flashcardsToInsert)
      .select();

    if (flashcardError) {
      console.error('Erro ao salvar flashcards no banco:', flashcardError);
      throw new Error(`Erro ao salvar flashcards: ${flashcardError.message}`);
    }

    console.log(`${savedFlashcards.length} flashcards salvos com sucesso no banco`);

    return new Response(
      JSON.stringify({ 
        success: true,
        flashcards: savedFlashcards,
        stats: {
          total_gerado: flashcards.length,
          tempo_processamento: `${endTime - startTime}ms`
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro na função generate-flashcards:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erro interno do servidor'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
