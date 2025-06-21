
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, resumoId } = await req.json();
    
    if (!content || !resumoId) {
      return new Response(
        JSON.stringify({ error: 'Content e resumoId são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🧠 Gerando mapa mental para resumo:', resumoId);

    const prompt = `
Você é um especialista em mapas mentais. Crie um mapa mental organizado baseado no seguinte conteúdo de resumo:

${content}

Retorne APENAS um JSON válido com a seguinte estrutura:
{
  "title": "Título do mapa mental",
  "nodes": [
    {
      "id": "1",
      "text": "Tópico principal",
      "level": 0,
      "color": "#3B82F6",
      "children": ["2", "3"]
    },
    {
      "id": "2", 
      "text": "Subtópico 1",
      "level": 1,
      "color": "#10B981",
      "children": ["4"]
    }
  ]
}

Organize os conceitos hierarquicamente:
- Level 0: Conceito central
- Level 1: Tópicos principais  
- Level 2: Subtópicos
- Level 3: Detalhes específicos

Use cores diferentes para cada nível:
- Level 0: #3B82F6 (azul)
- Level 1: #10B981 (verde)
- Level 2: #F59E0B (amarelo) 
- Level 3: #EF4444 (vermelho)

Máximo 15 nós. Seja conciso e organize logicamente.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em criar mapas mentais organizados e visuais.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro OpenAI:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const mindMapContent = data.choices[0].message.content;

    let mindMapData;
    try {
      mindMapData = JSON.parse(mindMapContent);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError);
      throw new Error('Resposta da IA não é um JSON válido');
    }

    console.log('✅ Mapa mental gerado com sucesso');

    return new Response(
      JSON.stringify({ mindMap: mindMapData }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro ao gerar mapa mental:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao gerar mapa mental',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
