
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
    const { resumo_id, texto_resumo } = await req.json();
    if (!resumo_id || !texto_resumo) throw new Error("Missing params");
    // PROMPT para IA gerar as questões
    const openaiPrompt = `
Você é um gerador de quizzes. Crie 5 perguntas de múltipla escolha, baseadas no resumo abaixo, cada uma com 4 alternativas únicas. Marque explicitamente qual é a alternativa correta (por índice). Para cada pergunta gere também uma explicação curta e didática para ser mostrada caso o usuário erre.
Formato de resposta esperado:
[
  {
    "pergunta": "Texto da pergunta...",
    "alternativas": ["A", "B", "C", "D"],
    "correta": 2, // índice da alternativa correta
    "explicacao": "Explicação resumida..."
  },
  ...
]
Resumo:
${texto_resumo}`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Responda APENAS com JSON no formato solicitado. Nada além disso." },
          { role: "user", content: openaiPrompt },
        ],
        max_tokens: 2500,
        temperature: 0.3,
      }),
    });

    const result = await openaiResponse.json();
    let content: string | undefined;
    try {
      content =
        result.choices?.[0]?.message?.content || result.choices?.[0]?.text || "";
    } catch (_) {
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
      questions = JSON.parse(content);
    } catch (e) {
      throw new Error("Erro ao parsear JSON das perguntas: " + e.message);
    }

    // Salvando no Supabase
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    let ok = true;
    let saved = [];
    for (const q of questions) {
      const { error, data } = await supabaseAdmin.from('quizzes').insert([{
        resumo_id,
        pergunta: q.pergunta,
        alternativas: q.alternativas,
        correta: q.correta,
        explicacao: q.explicacao,
      }]).select().single();
      if (error) {
        ok = false;
        break;
      }
      saved.push(data);
    }
    if (ok) {
      return new Response(JSON.stringify({ success: true, quizzes: saved }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Erro ao salvar quizzes" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || "Erro" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
