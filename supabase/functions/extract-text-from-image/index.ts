
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
    const { imageUrl } = await req.json()
    
    console.log('Processing image:', imageUrl)
    
    // Buscar a chave da API do Google Vision nos secrets
    const googleVisionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY')
    
    if (!googleVisionApiKey) {
      console.error('Google Vision API key not configured')
      throw new Error('Google Vision API key not configured. Please add it in Supabase secrets.')
    }

    console.log('Downloading image for OCR processing...')
    
    // Baixar a imagem para converter para base64
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`)
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))

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
      throw new Error(`Google Vision API error: ${visionResponse.status} ${visionResponse.statusText}`)
    }

    const visionData = await visionResponse.json()
    
    if (visionData.error) {
      throw new Error(`Google Vision API error: ${visionData.error.message}`)
    }

    // Extrair o texto detectado
    const textAnnotations = visionData.responses[0]?.textAnnotations
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
    console.error('Error extracting text:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
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
