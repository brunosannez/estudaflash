
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Função para obter configuração do modelo baseada no plano
function getModelConfigForPlan(plan: string) {
  switch (plan) {
    case 'free':
      return {
        provider: 'openai',
        model: 'gpt-3.5-turbo'
      };
    case 'pro':
    case 'edu':
      return {
        provider: 'openai',
        model: 'gpt-4o'
      };
    default:
      return {
        provider: 'openai',
        model: 'gpt-3.5-turbo'
      };
  }
}

async function getUserPlan(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('uso_usuarios')
      .select('plano')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Erro ao buscar plano do usuário:', error);
      return 'free'; // Fallback para plano free
    }
    
    return data?.plano || 'free';
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    return 'free';
  }
}

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🎯 Iniciando geração de quiz...");
    
    const { resumo_id, texto_resumo, userId } = await req.json();
    
    if (!resumo_id || !texto_resumo) {
      console.error("❌ Parâmetros faltando:", { resumo_id: !!resumo_id, texto_resumo: !!texto_resumo });
      throw new Error("Parâmetros obrigatórios não fornecidos: resumo_id e texto_resumo são necessários");
    }

    if (!OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY não configurada");
      throw new Error("Chave da API OpenAI não configurada. Entre em contato com o administrador.");
    }

    // Inicializar Supabase para buscar plano do usuário
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Buscar plano do usuário
    const userPlan = await getUserPlan(supabaseAdmin, userId);
    const modelConfig = getModelConfigForPlan(userPlan);
    
    console.log("👤 Plano do usuário:", userPlan);
    console.log("🤖 Modelo selecionado:", modelConfig);
    console.log("✅ Parâmetros recebidos:", { resumo_id, texto_length: texto_resumo.length });

    // PROMPT melhorado para IA gerar as questões
    const openaiPrompt = `
Você é um gerador de quizzes educativos para crianças de 10 anos. Crie EXATAMENTE 5 perguntas de múltipla escolha baseadas no resumo abaixo.

REGRAS IMPORTANTES:
- Cada pergunta deve ter EXATAMENTE 4 alternativas
- Use linguagem simples e divertida para crianças
- Marque qual alternativa é a correta (índice 0, 1, 2 ou 3)
- Crie uma explicação curta e didática para cada pergunta
- Responda APENAS com JSON válido, sem texto adicional

Formato OBRIGATÓRIO (JSON):
[
  {
    "pergunta": "Pergunta clara e simples...",
    "alternativas": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "correta": 0,
    "explicacao": "Explicação simples para crianças..."
  }
]

Resumo:
${texto_resumo}`;

    console.log("🚀 Fazendo chamada para OpenAI...");
    console.log("📝 Modelo utilizado:", modelConfig.model);

    let openaiResponse;
    try {
      openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelConfig.model,
          messages: [
            { 
              role: "system", 
              content: "Você é um especialista em criar quizzes educativos para crianças. Responda SEMPRE com JSON válido no formato exato solicitado." 
            },
            { role: "user", content: openaiPrompt },
          ],
          max_tokens: 3000,
          temperature: 0.7,
        }),
      });
    } catch (error) {
      console.error("❌ Erro de conexão com OpenAI:", error);
      return new Response(JSON.stringify({ 
        success: false,
        error: "Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos.",
        fallbackMessage: "Nosso serviço de IA está temporariamente indisponível. Por favor, tente novamente mais tarde.",
        details: "Erro de conectividade com OpenAI"
      }), {
        status: 503, 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("📡 Status da resposta OpenAI:", openaiResponse.status);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("❌ Erro da OpenAI:", openaiResponse.status, errorText);
      
      let userMessage = "Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos.";
      let fallbackMessage = "Nosso serviço de IA está temporariamente indisponível. Por favor, tente novamente mais tarde.";
      
      if (openaiResponse.status === 429) {
        userMessage = "Limite de uso da API OpenAI atingido. Aguarde alguns minutos ou verifique seus créditos.";
        fallbackMessage = "Muitas solicitações foram feitas. Aguarde alguns minutos e tente novamente.";
      } else if (openaiResponse.status === 401) {
        userMessage = "Problema de autenticação com o serviço de IA. Verifique a configuração.";
        fallbackMessage = "Há um problema de configuração. Entre em contato com o administrador.";
      }
      
      return new Response(JSON.stringify({ 
        success: false,
        error: userMessage,
        fallbackMessage: fallbackMessage,
        details: `Erro na API OpenAI (${openaiResponse.status}): ${errorText}`
      }), {
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await openaiResponse.json();
    console.log("✅ Resposta da OpenAI recebida com sucesso");

    let content: string;
    try {
      content = result.choices?.[0]?.message?.content || "";
      if (!content) {
        throw new Error("Resposta vazia da IA");
      }
    } catch (e) {
      console.error("❌ Erro ao extrair conteúdo:", e);
      throw new Error("Erro ao extrair resposta da IA: " + e.message);
    }

    // Limpar e tentar extrair JSON
    let questions;
    try {
      content = content.trim();
      
      // Remover blocos de código se existirem
      if (content.includes("```json")) {
        content = content.replace(/^.*```json\s*/, "").replace(/```.*$/, "");
      } else if (content.includes("```")) {
        content = content.replace(/^.*```\w*\s*/, "").replace(/```.*$/, "");
      }
      
      // Tentar encontrar o JSON no texto
      const jsonStart = content.indexOf('[');
      const jsonEnd = content.lastIndexOf(']');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        content = content.substring(jsonStart, jsonEnd + 1);
      }
      
      console.log("🔍 Tentando fazer parse do JSON:", content.substring(0, 200) + "...");
      questions = JSON.parse(content);
      
      if (!Array.isArray(questions)) {
        throw new Error("Resposta não é um array de questões");
      }
      
      if (questions.length !== 5) {
        console.warn("⚠️ Número de questões diferente de 5:", questions.length);
      }
      
      console.log("✅ JSON parseado com sucesso:", questions.length, "questões");
    } catch (e) {
      console.error("❌ Erro ao parsear JSON:", e.message);
      console.error("📄 Conteúdo recebido:", content);
      throw new Error("Erro ao processar as perguntas geradas pela IA. Tente novamente.");
    }

    // Validar estrutura das questões
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.pergunta || !Array.isArray(q.alternativas) || typeof q.correta !== 'number' || !q.explicacao) {
        console.error("❌ Questão inválida:", q);
        throw new Error(`Questão ${i + 1} tem estrutura inválida. Tente gerar o quiz novamente.`);
      }
      if (q.alternativas.length !== 4) {
        throw new Error(`Questão ${i + 1} deve ter exatamente 4 alternativas`);
      }
      if (q.correta < 0 || q.correta >= 4) {
        throw new Error(`Questão ${i + 1} tem resposta correta inválida (deve ser 0, 1, 2 ou 3)`);
      }
    }

    // Salvando no Supabase
    console.log("💾 Salvando questões no Supabase...");
    
    let savedQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      console.log(`💾 Salvando questão ${i + 1}:`, q.pergunta.substring(0, 50) + "...");
      
      const { error, data } = await supabaseAdmin.from('quizzes').insert([{
        resumo_id,
        pergunta: q.pergunta,
        alternativas: q.alternativas,
        correta: q.correta,
        explicacao: q.explicacao,
      }]).select().single();
      
      if (error) {
        console.error(`❌ Erro ao salvar questão ${i + 1}:`, error);
        throw new Error(`Erro ao salvar questão ${i + 1}: ${error.message}`);
      }
      
      savedQuestions.push(data);
      console.log(`✅ Questão ${i + 1} salva com sucesso`);
    }

    console.log("🎉 Quiz gerado com sucesso:", savedQuestions.length, "questões salvas");

    return new Response(JSON.stringify({ 
      success: true, 
      quizzes: savedQuestions,
      message: `🎉 Quiz criado com sucesso! ${savedQuestions.length} perguntas prontas para você!`,
      stats: {
        modelo_usado: modelConfig.model,
        plano_usuario: userPlan,
        total_questoes: savedQuestions.length
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("💥 Erro na função generate-quiz:", e);
    
    let userMessage = "Erro inesperado ao gerar o quiz";
    let fallbackMessage = "Houve um problema ao gerar o quiz. Tente novamente mais tarde.";
    
    if (e.message.includes("Limite de uso")) {
      userMessage = "Limite da API atingido. Aguarde alguns minutos e tente novamente.";
      fallbackMessage = "Muitas solicitações foram feitas. Aguarde alguns minutos e tente novamente.";
    } else if (e.message.includes("Chave da API")) {
      userMessage = "Problema com a configuração da API. Entre em contato com o administrador.";
      fallbackMessage = "Há um problema de configuração. Entre em contato com o administrador.";
    } else if (e.message.includes("obrigatórios")) {
      userMessage = "Dados do resumo não encontrados. Tente novamente.";
      fallbackMessage = "Não foi possível encontrar os dados necessários. Tente novamente.";
    } else if (e.message) {
      userMessage = e.message;
    }
    
    return new Response(JSON.stringify({ 
      success: false,
      error: userMessage,
      fallbackMessage: fallbackMessage,
      details: "Verifique se há créditos na API OpenAI e tente novamente"
    }), {
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
