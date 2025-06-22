
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, resumoId } = await req.json();

    console.log('🧠 Generating mind map for resumo:', resumoId);

    // Extrair conceitos principais e subtópicos do conteúdo
    const mindMapData = generateMindMapFromContent(content);

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

function generateMindMapFromContent(content: string): MindMapData {
  // Dividir o conteúdo em seções
  const sections = content.split(/\n\s*\n/).filter(section => section.trim().length > 0);
  
  // Extrair título principal
  const title = extractMainTitle(content);
  
  const nodes: MindMapNode[] = [];
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
  
  // Nó central
  const centralNode: MindMapNode = {
    id: 'central',
    text: title,
    level: 0,
    color: '#3B82F6',
    children: []
  };
  nodes.push(centralNode);

  // Extrair tópicos principais
  const mainTopics = extractMainTopics(content);
  
  mainTopics.forEach((topic, index) => {
    const topicId = `topic_${index}`;
    const topicNode: MindMapNode = {
      id: topicId,
      text: topic.title,
      level: 1,
      color: colors[index % colors.length],
      children: []
    };
    
    nodes.push(topicNode);
    centralNode.children!.push(topicId);
    
    // Extrair subtópicos
    const subtopics = extractSubtopics(topic.content);
    
    subtopics.forEach((subtopic, subIndex) => {
      const subtopicId = `subtopic_${index}_${subIndex}`;
      const subtopicNode: MindMapNode = {
        id: subtopicId,
        text: subtopic.title,
        level: 2,
        color: colors[(index + subIndex + 2) % colors.length],
        children: []
      };
      
      nodes.push(subtopicNode);
      topicNode.children!.push(subtopicId);
      
      // Extrair detalhes específicos
      const details = extractDetails(subtopic.content);
      
      details.forEach((detail, detailIndex) => {
        const detailId = `detail_${index}_${subIndex}_${detailIndex}`;
        const detailNode: MindMapNode = {
          id: detailId,
          text: detail,
          level: 3,
          color: colors[(index + subIndex + detailIndex + 4) % colors.length]
        };
        
        nodes.push(detailNode);
        subtopicNode.children!.push(detailId);
      });
    });
  });

  return {
    title,
    nodes
  };
}

function extractMainTitle(content: string): string {
  // Procurar por títulos em maiúscula ou formatados
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 5 && trimmed.length < 100) {
      // Se está em maiúscula ou tem formatação de título
      if (trimmed === trimmed.toUpperCase() || 
          trimmed.match(/^[A-Z][^.]*[^.]$/) ||
          trimmed.includes(':') ||
          trimmed.match(/^\d+\.?\s*[A-Z]/)) {
        return trimmed.replace(/^\d+\.?\s*/, '').replace(/[:\-–]/g, '').trim();
      }
    }
  }
  
  // Fallback: usar as primeiras palavras significativas
  const words = content.trim().split(/\s+/).slice(0, 6);
  return words.join(' ') + (words.length === 6 ? '...' : '');
}

function extractMainTopics(content: string): Array<{title: string, content: string}> {
  const topics: Array<{title: string, content: string}> = [];
  const sections = content.split(/\n\s*\n/);
  
  let currentTopic = '';
  let currentContent = '';
  
  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;
    
    // Identificar se é um novo tópico (título)
    const lines = trimmed.split('\n');
    const firstLine = lines[0].trim();
    
    if (isLikelyTitle(firstLine) && trimmed.length < 1000) {
      // Salvar tópico anterior se existir
      if (currentTopic && currentContent) {
        topics.push({
          title: currentTopic,
          content: currentContent
        });
      }
      
      // Iniciar novo tópico
      currentTopic = firstLine.replace(/^\d+\.?\s*/, '').replace(/[:\-–]/g, '').trim();
      currentContent = lines.slice(1).join('\n');
    } else {
      // Adicionar ao conteúdo do tópico atual
      if (currentContent) {
        currentContent += '\n\n' + trimmed;
      } else {
        currentContent = trimmed;
      }
    }
  }
  
  // Adicionar último tópico
  if (currentTopic && currentContent) {
    topics.push({
      title: currentTopic,
      content: currentContent
    });
  }
  
  // Se não encontrou tópicos claros, dividir por conceitos-chave
  if (topics.length === 0) {
    return extractTopicsByKeywords(content);
  }
  
  return topics.slice(0, 8); // Limitar a 8 tópicos principais
}

function extractSubtopics(content: string): Array<{title: string, content: string}> {
  const subtopics: Array<{title: string, content: string}> = [];
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  let currentGroup = '';
  
  for (let i = 0; i < sentences.length; i += 2) {
    const sentence1 = sentences[i]?.trim();
    const sentence2 = sentences[i + 1]?.trim() || '';
    
    if (sentence1) {
      // Extrair conceito principal da frase
      const concept = extractMainConcept(sentence1);
      if (concept.length > 3 && concept.length < 50) {
        subtopics.push({
          title: concept,
          content: sentence1 + (sentence2 ? '. ' + sentence2 : '')
        });
      }
    }
  }
  
  return subtopics.slice(0, 4); // Limitar a 4 subtópicos por tópico
}

function extractDetails(content: string): string[] {
  const details: string[] = [];
  
  // Procurar por listas, exemplos e definições
  const bullets = content.match(/[-•*]\s*([^.\n]+)/g);
  if (bullets) {
    bullets.forEach(bullet => {
      const detail = bullet.replace(/^[-•*]\s*/, '').trim();
      if (detail.length > 5 && detail.length < 80) {
        details.push(detail);
      }
    });
  }
  
  // Procurar por frases entre parênteses ou com dois pontos
  const parentheses = content.match(/\(([^)]+)\)/g);
  if (parentheses) {
    parentheses.forEach(item => {
      const detail = item.replace(/[()]/g, '').trim();
      if (detail.length > 5 && detail.length < 60) {
        details.push(detail);
      }
    });
  }
  
  // Procurar por definições com dois pontos
  const definitions = content.match(/:\s*([^.!\n]+)/g);
  if (definitions) {
    definitions.forEach(def => {
      const detail = def.replace(/^:\s*/, '').trim();
      if (detail.length > 10 && detail.length < 100) {
        details.push(detail);
      }
    });
  }
  
  return details.slice(0, 3); // Limitar a 3 detalhes por subtópico
}

function extractMainConcept(sentence: string): string {
  // Remover artigos e preposições comuns
  const words = sentence.split(/\s+/)
    .filter(word => !['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'da', 'do', 'das', 'dos', 'para', 'por', 'com', 'em', 'na', 'no', 'nas', 'nos'].includes(word.toLowerCase()))
    .slice(0, 4);
  
  return words.join(' ');
}

function isLikelyTitle(text: string): boolean {
  return (
    text.length < 100 &&
    text.length > 5 &&
    (text === text.toUpperCase() || 
     text.match(/^[A-Z][^.]*[^.]$/) ||
     text.includes(':') ||
     text.match(/^\d+\.?\s*[A-Z]/) ||
     text.split(' ').length <= 8)
  );
}

function extractTopicsByKeywords(content: string): Array<{title: string, content: string}> {
  const topics: Array<{title: string, content: string}> = [];
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Agrupar sentenças por conceitos similares
  let currentTopic = '';
  let currentContent = '';
  let sentenceCount = 0;
  
  for (const sentence of sentences) {
    if (sentenceCount === 0) {
      currentTopic = extractMainConcept(sentence);
      currentContent = sentence.trim();
    } else {
      currentContent += '. ' + sentence.trim();
    }
    
    sentenceCount++;
    
    // Criar novo tópico a cada 3-4 sentenças
    if (sentenceCount >= 3) {
      if (currentTopic && currentContent) {
        topics.push({
          title: currentTopic,
          content: currentContent
        });
      }
      sentenceCount = 0;
      currentTopic = '';
      currentContent = '';
    }
  }
  
  // Adicionar último tópico se houver
  if (currentTopic && currentContent) {
    topics.push({
      title: currentTopic,
      content: currentContent
    });
  }
  
  return topics.slice(0, 6);
}
