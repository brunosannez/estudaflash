import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Autentica o usuário pelo token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Busca a assinatura ativa mais recente do próprio usuário
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("id, stripe_subscription_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError || !subscription) {
      return new Response(
        JSON.stringify({ error: "Nenhuma assinatura ativa encontrada" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Cancela no Stripe ao fim do período já pago (não corta acesso imediato)
    if (subscription.stripe_subscription_id) {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) {
        return new Response(
          JSON.stringify({ error: "Stripe não configurado" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
    }

    // Marca como cancelada no banco (acesso segue até o fim do período,
    // pois o plano do usuário só muda quando a cobrança para)
    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("id", subscription.id);

    if (updateError) {
      console.error("Erro ao atualizar assinatura:", updateError);
      throw new Error("Falha ao registrar cancelamento");
    }

    console.log(`Assinatura ${subscription.id} cancelada para usuário ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Assinatura cancelada. Você mantém o acesso até o fim do período já pago.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Erro ao cancelar assinatura:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
