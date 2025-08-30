
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== 🔍 OCR FUNCTION STARTED ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    const body = await req.json()
    const { imageUrl, userId } = body
    
    console.log('Request body received:', { imageUrl: imageUrl?.substring(0, 100) + '...', userId });
    
    if (!imageUrl) {
      console.error('❌ No image URL provided');
      throw new Error('URL da imagem é obrigatória');
    }
    
    // Verificar se a chave da API do Google Vision existe
    const googleVisionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY')
    
    if (!googleVisionApiKey) {
      console.error('❌ Google Vision API key not configured')
      throw new Error('Chave da API do Google Vision não configurada. Configure GOOGLE_VISION_API_KEY nos secrets do Supabase.')
    }
    
    console.log('✅ Google Vision API key found');

    // NOVO: Consumir créditos para OCR se userId fornecido
    if (userId) {
      console.log('💳 Starting credit consumption for user:', userId);
      // Inicializar Supabase para consumir créditos
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Supabase credentials missing:', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
        throw new Error('Configuração do Supabase incompleta');
      }
      
      console.log('✅ Supabase credentials found, initializing client...');
      
      if (supabaseUrl && supabaseKey) {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.0');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        console.log('📞 Calling consume_credits function...');
        const { data: creditResult, error: creditError } = await supabase.rpc('consume_credits', {
          target_user_id: userId,
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
      }
    } else {
      console.log('⚠️ No userId provided, skipping credit consumption');
    }

    console.log('🌐 Starting image download from:', imageUrl.substring(0, 100) + '...');
    
    // Baixar a imagem para converter para base64
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text()
      console.error(`❌ Failed to download image: ${imageResponse.status} - ${errorText}`)
      throw new Error(`Falha ao baixar imagem: ${imageResponse.status}`)
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

    console.log('Calling Google Vision API...')
    
    // Chamar Google Vision OCR API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${googleVisionApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      }
    )

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text()
      console.error(`Google Vision API error: ${visionResponse.status} - ${errorText}`)
      throw new Error(`Erro na API do Google Vision: ${visionResponse.status}`)
    }

    const visionData = await visionResponse.json()
    console.log('Google Vision API response received')
    
    if (visionData.error) {
      console.error('Google Vision API returned error:', visionData.error)
      throw new Error(`Erro da API do Google Vision: ${visionData.error.message}`)
    }

    // Extrair o texto detectado
    const textAnnotations = visionData.responses?.[0]?.textAnnotations
    const extractedText = textAnnotations && textAnnotations.length > 0 
      ? textAnnotations[0].description 
      : ''

    console.log('Text extraction completed, length:', extractedText.length)

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
    console.error('Error in OCR function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro desconhecido na extração de texto',
        success: false 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
