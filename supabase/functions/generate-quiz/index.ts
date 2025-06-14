
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
    console.log("Iniciando geração de quiz...");
    
    const { resumo_id, texto_resumo } = await req.json();
    
    if (!resumo_id || !texto_resumo) {
      console.error("Parâmetros faltando:", { resumo_id: !!resumo_id, texto_resumo: !!texto_resumo });
      throw new Error("Missing params: resumo_id and texto_resumo are required");
    }

    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY não configurada");
      throw new Error("OpenAI API key not configured");
    }

    console.log("Parâmetros recebidos:", { resumo_id, texto_length: texto_resumo.length });

    // PROMPT para IA gerar as questões
    const openaiPrompt = `
Você é um gerador de quizzes educativos para crianças. Crie 5 perguntas de múltipla escolha baseadas no resumo abaixo, cada uma com 4 alternativas únicas. As perguntas devem ser adequadas para crianças de 10 anos, usando linguagem simples e divertida.

Marque explicitamente qual é a alternativa correta (por índice). Para cada pergunta gere também uma explicação curta e didática para ser mostrada caso o usuário erre.

Formato de resposta esperado (JSON válido):
[
  {
    "pergunta": "Texto da pergunta...",
    "alternativas": ["A", "B", "C", "D"],
    "correta": 2,
    "explicacao": "Explicação resumida..."
  }
]

Resumo:
${texto_resumo}`;

    console.log("Fazendo chamada para OpenAI...");

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Responda APENAS com JSON válido no formato solicitado. Nada além disso." },
          { role: "user", content: openaiPrompt },
        ],
        max_tokens: 2500,
        temperature: 0.3,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("Erro da OpenAI:", openaiResponse.status, errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
    }

    const result = await openaiResponse.json();
    console.log("Resposta da OpenAI recebida");

    let content: string;
    try {
      content = result.choices?.[0]?.message?.content || result.choices?.[0]?.text || "";
    } catch (e) {
      console.error("Erro ao extrair conteúdo:", e);
      throw new Error("Erro ao extrair resposta da IA");
    }

    // tentar extrair array de questões JSON
    let questions;
    try {
      content = content.trim();
      if (content.startsWith("```json")) {
        content = content.replace(/^```json\s*/, "").replace(/```$/, "");
      } else if (content.startsWith("```")) {
        content = content.replace(/^```\w*\s*/, "").replace(/```$/, "");
      }
      
      console.log("Tentando fazer parse do JSON:", content.substring(0, 200) + "...");
      questions = JSON.parse(content);
      
      if (!Array.isArray(questions)) {
        throw new Error("Resposta não é um array");
      }
      
      console.log("JSON parseado com sucesso:", questions.length, "questões");
    } catch (e) {
      console.error("Erro ao parsear JSON:", e.message);
      console.error("Conteúdo recebido:", content);
      throw new Error("Erro ao parsear JSON das perguntas: " + e.message);
    }

    // Validar estrutura das questões
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.pergunta || !Array.isArray(q.alternativas) || typeof q.correta !== 'number' || !q.explicacao) {
        console.error("Questão inválida:", q);
        throw new Error(`Questão ${i + 1} tem estrutura inválida`);
      }
      if (q.alternativas.length !== 4) {
        throw new Error(`Questão ${i + 1} deve ter exatamente 4 alternativas`);
      }
      if (q.correta < 0 || q.correta >= 4) {
        throw new Error(`Questão ${i + 1} tem índice de resposta correta inválido`);
      }
    }

    // Salvando no Supabase
    console.log("Salvando questões no Supabase...");
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    let savedQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      console.log(`Salvando questão ${i + 1}:`, q.pergunta.substring(0, 50) + "...");
      
      const { error, data } = await supabaseAdmin.from('quizzes').insert([{
        resumo_id,
        pergunta: q.pergunta,
        alternativas: q.alternativas,
        correta: q.correta,
        explicacao: q.explicacao,
      }]).select().single();
      
      if (error) {
        console.error(`Erro ao salvar questão ${i + 1}:`, error);
        throw new Error(`Erro ao salvar questão ${i + 1}: ${error.message}`);
      }
      
      savedQuestions.push(data);
      console.log(`Questão ${i + 1} salva com sucesso`);
    }

    console.log("Quiz gerado com sucesso:", savedQuestions.length, "questões salvas");

    return new Response(JSON.stringify({ 
      success: true, 
      quizzes: savedQuestions,
      message: `Quiz gerado com ${savedQuestions.length} questões`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Erro na função generate-quiz:", e);
    return new Response(JSON.stringify({ 
      success: false,
      error: e.message || "Erro desconhecido",
      details: "Verifique os logs para mais detalhes"
    }), {
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
