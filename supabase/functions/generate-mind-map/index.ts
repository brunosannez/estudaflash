import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MindMapNode {
  id: string;
  text: string;
  level: number;
  color: string;
  children?: string[];
}

interface MindMapData {
  title: string;
  nodes: MindMapNode[];
}

// Helper function to verify JWT and get user
async function verifyAuth(req: Request, supabase: any): Promise<{ userId: string | null; error: string | null }> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { userId: null, error: 'Token de autenticação não fornecido' };
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { userId: null, error: 'Token inválido ou expirado' };
    }
    
    return { userId: user.id, error: null };
  } catch (error) {
    console.error('❌ Erro ao verificar autenticação:', error);
    return { userId: null, error: 'Erro ao verificar autenticação' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração do servidor incompleta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // SECURITY: Verify authentication
    const { userId: authUserId, error: authError } = await verifyAuth(req, supabase);
    
    if (authError || !authUserId) {
      console.error('❌ Falha na autenticação:', authError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: authError || 'Não autorizado'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { content, resumoId, userId } = await req.json();

    // SECURITY: Verify userId matches authenticated user (if provided)
    if (userId && userId !== authUserId) {
      console.error('❌ userId não corresponde ao usuário autenticado');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Acesso negado'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY não configurada');
    }

    // 💰 Consume credits before proceeding
    console.log('💰 Consuming credits for mind map generation...');
    const { data: creditResult, error: creditError } = await supabase.rpc('consume_credits', {
      target_user_id: authUserId,
      action_type: 'mind_map'
    });

    if (creditError) {
      console.error('❌ Credit consumption error:', creditError);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao verificar créditos' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const creditData = creditResult?.[0];
    if (!creditData?.success) {
      console.error('❌ Insufficient credits:', creditData);
      return new Response(
        JSON.stringify({ success: false, error: creditData?.message || 'Créditos insuficientes para gerar mapa mental' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Credits consumed: ${creditData.credits_consumed}, remaining: ${creditData.credits_remaining}`);

    console.log('🧠 Generating mind map for resumo:', resumoId);

    // Usar Anthropic Claude para gerar um mapa mental estruturado
    const prompt = `
Crie um mapa mental estruturado baseado no seguinte conteúdo:

${content}

Retorne APENAS um JSON válido no seguinte formato exato:
{
  "title": "Título principal do conteúdo",
  "nodes": [
    {
      "id": "central",
      "text": "Conceito Central",
      "level": 0,
      "color": "#3B82F6",
      "children": ["topic1", "topic2"]
    },
    {
      "id": "topic1",
      "text": "Tópico Principal 1",
      "level": 1,
      "color": "#10B981",
      "children": ["sub1_1", "sub1_2"]
    },
    {
      "id": "sub1_1",
      "text": "Subtópico 1.1",
      "level": 2,
      "color": "#F59E0B",
      "children": []
    }
  ]
}

Regras:
- Máximo 15 nós total
- Use cores diferentes para cada nível
- Nível 0: conceito central (1 nó)
- Nível 1: tópicos principais (3-5 nós)
- Nível 2: subtópicos (máximo 2-3 por tópico principal)
- Texto conciso (máximo 50 caracteres por nó)
- IDs únicos e descritivos
- Cores em formato hex

Não inclua explicações, apenas o JSON válido.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Anthropic API error:', errorText);
      throw new Error(`Erro da API Anthropic: ${response.status}`);
    }

    const data = await response.json();
    const mindMapText = data.content[0].text;

    // 📊 Track API usage for cost monitoring
    try {
      const inputTokens = data.usage?.input_tokens || 0;
      const outputTokens = data.usage?.output_tokens || 0;
      const totalTokens = inputTokens + outputTokens;
      
      // Claude Haiku: $0.25/1M input, $1.25/1M output
      const inputCost = (inputTokens * 0.00025) / 1000;
      const outputCost = (outputTokens * 0.00125) / 1000;
      const estimatedCost = inputCost + outputCost;
      
      await supabase
        .from('api_usage_tracking')
        .insert({
          user_id: authUserId,
          api_provider: 'anthropic',
          action_type: 'mind_map',
          tokens_used: totalTokens,
          estimated_cost_usd: estimatedCost,
          model_used: 'claude-3-haiku-20240307',
          success: true,
          timestamp: new Date().toISOString()
        });
      
      console.log(`📊 API tracked: ${totalTokens} tokens, $${estimatedCost.toFixed(6)}`);
    } catch (trackError) {
      console.warn('⚠️ Failed to track API usage:', trackError);
    }

    // Tentar fazer parse do JSON retornado pelo Claude
    let mindMapData: MindMapData;
    try {
      mindMapData = JSON.parse(mindMapText);
    } catch (parseError) {
      console.error('❌ Error parsing Claude response:', parseError);
      console.log('Raw response:', mindMapText);
      
      // Fallback: criar mapa mental básico
      mindMapData = generateBasicMindMap(content);
    }

    // Validar estrutura do mapa mental
    if (!mindMapData.title || !mindMapData.nodes || !Array.isArray(mindMapData.nodes)) {
      console.warn('⚠️ Invalid mind map structure, using fallback');
      mindMapData = generateBasicMindMap(content);
    }

    console.log('✅ Mind map generated successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      mindMap: mindMapData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error generating mind map:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateBasicMindMap(content: string): MindMapData {
  console.log('🔧 Generating basic fallback mind map');
  
  // Extrair título do conteúdo
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  const title = lines[0]?.substring(0, 50) || 'Resumo';
  
  // Cores para os níveis
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  
  const nodes: MindMapNode[] = [];
  
  // Nó central
  const centralNode: MindMapNode = {
    id: 'central',
    text: title,
    level: 0,
    color: colors[0],
    children: []
  };
  nodes.push(centralNode);
  
  // Dividir conteúdo em seções
  const sections = content.split(/\n\s*\n/).filter(section => section.trim().length > 20);
  
  // Criar tópicos principais (máximo 4)
  const maxTopics = Math.min(4, sections.length);
  for (let i = 0; i < maxTopics; i++) {
    const section = sections[i];
    const sentences = section.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length > 0) {
      const topicId = `topic_${i}`;
      const topicText = sentences[0].trim().substring(0, 40);
      
      const topicNode: MindMapNode = {
        id: topicId,
        text: topicText,
        level: 1,
        color: colors[(i + 1) % colors.length],
        children: []
      };
      
      nodes.push(topicNode);
      centralNode.children!.push(topicId);
      
      // Criar subtópicos (máximo 2 por tópico)
      const maxSubtopics = Math.min(2, sentences.length - 1);
      for (let j = 1; j <= maxSubtopics; j++) {
        if (sentences[j]) {
          const subtopicId = `sub_${i}_${j}`;
          const subtopicText = sentences[j].trim().substring(0, 30);
          
          const subtopicNode: MindMapNode = {
            id: subtopicId,
            text: subtopicText,
            level: 2,
            color: colors[(i + j + 2) % colors.length],
            children: []
          };
          
          nodes.push(subtopicNode);
          topicNode.children!.push(subtopicId);
        }
      }
    }
  }
  
  return {
    title,
    nodes
  };
}
