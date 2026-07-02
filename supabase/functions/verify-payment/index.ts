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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Get checkout session details
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === "paid") {
      const userId = session.metadata?.user_id;
      const planId = session.metadata?.plan_id;
      
      if (!userId || !planId) {
        throw new Error("Missing user or plan information");
      }

      // Idempotência: refresh em /payment-success reinvoca esta função com a
      // mesma sessão; não recriar assinatura já processada
      const { data: existingSubscription } = await supabaseClient
        .from('subscriptions')
        .select('id')
        .eq('stripe_session_id', sessionId)
        .maybeSingle();

      if (existingSubscription) {
        console.log(`Session ${sessionId} already processed, skipping`);
        return new Response(JSON.stringify({
          success: true,
          planUpdated: true,
          alreadyProcessed: true
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Buscar o nome do plano para manter a coluna legada 'plano' em sincronia:
      // getUserPlan/reset_monthly_credits leem 'plano', não 'plan_id'
      const { data: planData, error: planError } = await supabaseClient
        .from('plans')
        .select('name')
        .eq('id', planId)
        .single();

      if (planError || !planData) {
        console.error("Error fetching plan:", planError);
        throw new Error("Plan not found");
      }

      // Update user's plan (mesmo par de colunas que o RPC user_select_plan)
      const { error: updateError } = await supabaseClient
        .from('uso_usuarios')
        .update({
          plan_id: planId,
          plano: planData.name.toLowerCase(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error("Error updating user plan:", updateError);
        throw new Error("Failed to update user plan");
      }

      // Create subscription record
      const { error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          amount_paid_brl: session.amount_total ? session.amount_total / 100 : 0,
          status: 'active',
          start_date: new Date().toISOString(),
          stripe_session_id: sessionId,
          // Necessário para cancelar a assinatura via API depois
          stripe_subscription_id: typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id ?? null,
        });

      if (subscriptionError) {
        console.error("Error creating subscription record:", subscriptionError);
      }

      console.log(`Payment verified and plan updated for user ${userId}`);

      return new Response(JSON.stringify({ 
        success: true, 
        planUpdated: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      message: "Payment not completed" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Internal server error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});