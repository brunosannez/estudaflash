
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting usage counter reset process...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Chamar a função de reset que criamos no SQL
    const { data, error } = await supabaseClient.rpc('reset_monthly_usage');

    if (error) {
      console.error('❌ Error calling reset function:', error);
      throw error;
    }

    // Buscar quantos usuários foram resetados
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: usersToReset, error: countError } = await supabaseClient
      .from('uso_usuarios')
      .select('id, user_id')
      .lte('data_ultimo_reset', thirtyDaysAgo.toISOString().split('T')[0]);

    const resetCount = usersToReset?.length || 0;

    console.log(`✅ Usage reset completed. ${resetCount} users reset.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Usage counters reset for ${resetCount} users`,
        resetCount,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error in reset-usage-counters function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
