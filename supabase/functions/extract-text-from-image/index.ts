import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to convert ArrayBuffer to base64 string safely
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192; // Process in chunks to avoid stack overflow
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
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
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 OCR Function Started - ', new Date().toISOString());
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase credentials missing');
      throw new Error('Configuração do Supabase incompleta');
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
    
    let body;
    try {
      body = await req.json();
      console.log('📥 Request received:', { 
        hasImageUrl: !!body.imageUrl, 
        hasUserId: !!body.userId,
        imageUrlLength: body.imageUrl?.length || 0
      });
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      throw new Error('Invalid JSON in request body');
    }
    
    const { imageUrl, userId } = body;

    // SECURITY: Verify userId matches authenticated user
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

    const effectiveUserId = userId || authUserId;
    
    if (!imageUrl) {
      console.error('❌ No image URL provided');
      throw new Error('URL da imagem é obrigatória');
    }
    
    // Verificar se a chave da API do Google Vision existe
    const googleVisionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
    
    if (!googleVisionApiKey) {
      console.error('❌ Google Vision API key not configured');
      console.error('Available env vars:', Object.keys(Deno.env.toObject()).filter(key => 
        key.includes('GOOGLE') || key.includes('VISION') || key.includes('API')
      ));
      throw new Error('Chave da API do Google Vision não configurada. Configure GOOGLE_VISION_API_KEY nos secrets do Supabase.');
    }
    
    console.log('✅ Google Vision API key found, length:', googleVisionApiKey.length);

    // Consume credits for OCR
    console.log('💳 Starting credit consumption for user:', effectiveUserId);
    
    console.log('📞 Calling consume_credits function...');
    const { data: creditResult, error: creditError } = await supabase.rpc('consume_credits', {
      target_user_id: effectiveUserId,
      action_type: 'ocr'
    });

    console.log('💳 Credit consumption result:', { creditResult, creditError });

    if (creditError) {
      console.error('❌ Erro RPC consume_credits:', creditError);
      throw new Error('Erro interno ao consumir créditos. Tente novamente.');
    }

    if (!creditResult || creditResult.length === 0) {
      console.error('❌ Resposta vazia da função consume_credits');
      throw new Error('Erro interno ao verificar créditos. Tente novamente.');
    }

    const result = creditResult[0];
    console.log('💳 Credit result details:', result);
    
    if (!result?.success) {
      const message = result?.message || 'Créditos insuficientes';
      console.error('❌ Falha ao consumir créditos:', message);
      throw new Error(message.includes('insuficientes') 
        ? 'Você não tem créditos suficientes. Faça upgrade do seu plano.'
        : 'Erro ao processar créditos. Tente novamente.'
      );
    }

    console.log(`✅ Créditos consumidos para OCR: ${result.credits_consumed}. Restam: ${result.credits_remaining}`);

    console.log('🌐 Starting image download from:', imageUrl.substring(0, 100) + '...');
    
    // Baixar a imagem para converter para base64
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Supabase-Edge-Function/1.0'
      },
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });
    
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error(`❌ Failed to download image: ${imageResponse.status} - ${errorText}`);
      console.error('Response headers:', Object.fromEntries(imageResponse.headers.entries()));
      throw new Error(`Falha ao baixar imagem (${imageResponse.status}): ${errorText || imageResponse.statusText}`);
    }
    
    console.log('✅ Image downloaded successfully, converting to buffer...');
    const imageBuffer = await imageResponse.arrayBuffer()
    const imageSizeInMB = imageBuffer.byteLength / (1024 * 1024)
    
    console.log(`📏 Image downloaded, size: ${imageSizeInMB.toFixed(2)}MB`);
    
    // Check if image is too large (limit to 10MB for OCR processing)
    if (imageSizeInMB > 10) {
      console.error(`Image too large: ${imageSizeInMB.toFixed(2)}MB`)
      throw new Error(`Imagem muito grande (${imageSizeInMB.toFixed(2)}MB). Limite máximo: 10MB`)
    }
    
    // Convert to base64 using the safe method
    const base64Image = arrayBufferToBase64(imageBuffer)
    console.log(`Image converted to base64, length: ${base64Image.length}`)

    console.log('🔍 Calling Google Vision API...');
    console.log('API endpoint: https://vision.googleapis.com/v1/images:annotate');
    
    // Chamar Google Vision OCR API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${googleVisionApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0'
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(60000) // 60 second timeout for Vision API
      }
    );

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error(`❌ Google Vision API error: ${visionResponse.status} - ${errorText}`);
      console.error('Response headers:', Object.fromEntries(visionResponse.headers.entries()));
      
      if (visionResponse.status === 400) {
        throw new Error('Formato de imagem inválido ou imagem corrompida.');
      } else if (visionResponse.status === 403) {
        throw new Error('Chave da API do Google Vision inválida ou limite excedido.');
      } else if (visionResponse.status >= 500) {
        throw new Error('Serviço de OCR temporariamente indisponível. Tente novamente em alguns minutos.');
      }
      
      throw new Error(`Erro na API do Google Vision (${visionResponse.status}): ${errorText || visionResponse.statusText}`)
    }

    const visionData = await visionResponse.json();
    console.log('✅ Google Vision API response received');
    console.log('Response keys:', Object.keys(visionData));
    
    if (visionData.error) {
      console.error('❌ Google Vision API returned error:', visionData.error);
      throw new Error(`Erro da API do Google Vision: ${visionData.error.message}`);
    }

    if (!visionData.responses || !Array.isArray(visionData.responses)) {
      console.error('❌ Invalid response structure from Google Vision API:', visionData);
      throw new Error('Resposta inválida da API do Google Vision.');
    }

    // Extrair o texto detectado
    const response = visionData.responses[0];
    const textAnnotations = response?.textAnnotations;
    const extractedText = textAnnotations && textAnnotations.length > 0 
      ? textAnnotations[0].description 
      : '';

    console.log('✅ Text extraction completed');
    console.log('- Text length:', extractedText.length);
    console.log('- Annotations found:', textAnnotations?.length || 0);
    
    if (extractedText.length === 0) {
      console.log('⚠️ No text found in image - this is normal for images without text');
    } else {
      console.log('- Text preview:', extractedText.substring(0, 100) + '...');
    }

    return new Response(
      JSON.stringify({ 
        extractedText,
        success: true 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('=== ❌ OCR FUNCTION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Timestamp:', new Date().toISOString());
    
    let errorMessage = 'Erro desconhecido na extração de texto';
    let statusCode = 500;
    
    if (error.message) {
      errorMessage = error.message;
      
      // Set appropriate status codes
      if (error.message.includes('timeout') || error.message.includes('AbortError')) {
        statusCode = 408;
        errorMessage = 'Tempo limite excedido. Tente com uma imagem menor.';
      } else if (error.message.includes('inválida') || error.message.includes('invalid')) {
        statusCode = 400;
      } else if (error.message.includes('não configurada') || error.message.includes('not configured')) {
        statusCode = 503;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false,
        timestamp: new Date().toISOString()
      }),
      { 
        status: statusCode,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
