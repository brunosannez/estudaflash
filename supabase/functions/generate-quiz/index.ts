
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🎯 Iniciando geração de quiz...");
    
    const { resumo_id, texto_resumo } = await req.json();
    
    if (!resumo_id || !texto_resumo) {
      console.error("❌ Parâmetros faltando:", { resumo_id: !!resumo_id, texto_resumo: !!texto_resumo });
      throw new Error("Parâmetros obrigatórios não fornecidos: resumo_id e texto_resumo são necessários");
    }

    if (!OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY não configurada");
      throw new Error("Chave da API OpenAI não configurada. Entre em contato com o administrador.");
    }

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

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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

    console.log("📡 Status da resposta OpenAI:", openaiResponse.status);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("❌ Erro da OpenAI:", openaiResponse.status, errorText);
      
      if (openaiResponse.status === 429) {
        throw new Error("Limite de uso da API OpenAI atingido. Aguarde alguns minutos ou verifique seus créditos.");
      } else if (openaiResponse.status === 401) {
        throw new Error("Chave da API OpenAI inválida. Verifique a configuração.");
      } else {
        throw new Error(`Erro na API OpenAI (${openaiResponse.status}): ${errorText}`);
      }
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
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
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
      message: `🎉 Quiz criado com sucesso! ${savedQuestions.length} perguntas prontas para você!`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("💥 Erro na função generate-quiz:", e);
    
    let userMessage = "Erro inesperado ao gerar o quiz";
    if (e.message.includes("Limite de uso")) {
      userMessage = "Limite da API atingido. Aguarde alguns minutos e tente novamente.";
    } else if (e.message.includes("Chave da API")) {
      userMessage = "Problema com a configuração da API. Entre em contato com o administrador.";
    } else if (e.message.includes("obrigatórios")) {
      userMessage = "Dados do resumo não encontrados. Tente novamente.";
    } else if (e.message) {
      userMessage = e.message;
    }
    
    return new Response(JSON.stringify({ 
      success: false,
      error: userMessage,
      details: "Verifique se há créditos na API OpenAI e tente novamente"
    }), {
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
