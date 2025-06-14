
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('OCR function called');
    
    const body = await req.json()
    const { imageUrl } = body
    
    console.log('Processing image:', imageUrl)
    
    if (!imageUrl) {
      console.error('No image URL provided');
      throw new Error('URL da imagem é obrigatória');
    }
    
    // Verificar se a chave da API do Google Vision existe
    const googleVisionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY')
    
    if (!googleVisionApiKey) {
      console.error('Google Vision API key not configured')
      throw new Error('Chave da API do Google Vision não configurada. Configure GOOGLE_VISION_API_KEY nos secrets do Supabase.')
    }

    console.log('Google Vision API key found, downloading image...')
    
    // Baixar a imagem para converter para base64
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text()
      console.error(`Failed to download image: ${imageResponse.status} - ${errorText}`)
      throw new Error(`Falha ao baixar imagem: ${imageResponse.status}`)
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))

    console.log('Image downloaded and converted to base64, calling Google Vision API...')
    
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
