
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para obter configuração do modelo baseada no plano - CORRIGIDA
function getModelConfigForPlan(plan: string) {
  switch (plan) {
    case 'free':
      return {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 4000
      };
    case 'pro':
    case 'edu':
      return {
        provider: 'anthropic', 
        model: 'claude-3-5-sonnet-20241022', // Usar modelo estável para todos os planos
        maxTokens: 8000 // Mais tokens para planos pagos
      };
    default:
      return {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 4000
      };
  }
}

async function getUserPlan(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('uso_usuarios')
      .select('plano')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Erro ao buscar plano do usuário:', error);
      return 'free'; // Fallback para plano free
    }
    
    return data?.plano || 'free';
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    return 'free';
  }
}

// Sistema inteligente de detecção de conteúdo
function detectContentIntelligence(texto: string) {
  const lowerTexto = texto.toLowerCase();
  
  // Detectar disciplina
  let disciplina = 'geral';
  if (lowerTexto.match(/(história|histórico|século|guerra|revolução|império|república|colonização|período|época)/)) disciplina = 'história';
  else if (lowerTexto.match(/(geografia|clima|relevo|população|território|região|estado|país|urbano|rural)/)) disciplina = 'geografia';
  else if (lowerTexto.match(/(biologia|célula|dna|proteína|genética|evolução|ecossistema|organismo|vírus|bactéria)/)) disciplina = 'biologia';
  else if (lowerTexto.match(/(química|átomo|molécula|reação|elemento|composto|solução|ácido|base)/)) disciplina = 'química';
  else if (lowerTexto.match(/(física|força|energia|movimento|velocidade|aceleração|onda|luz|som)/)) disciplina = 'física';
  else if (lowerTexto.match(/(matemática|equação|função|gráfico|área|volume|estatística|probabilidade|cálculo)/)) disciplina = 'matemática';
  else if (lowerTexto.match(/(literatura|linguagem|texto|poesia|romance|autor|obra|estilo|português)/)) disciplina = 'português';
  else if (lowerTexto.match(/(filosofia|ética|conhecimento|verdade|ser|existência|pensamento|teoria)/)) disciplina = 'filosofia';
  else if (lowerTexto.match(/(sociologia|sociedade|cultura|grupo|instituição|mudança social|classe)/)) disciplina = 'sociologia';
  
  // Detectar tipo de material
  let tipoMaterial = 'conteúdo';
  if (lowerTexto.match(/(exercício|questão|problema|resolva|calcule|determine|resposta)/)) tipoMaterial = 'exercícios';
  else if (lowerTexto.match(/(slide|apresentação|tópico|sumário|índice)/)) tipoMaterial = 'slides';
  else if (lowerTexto.match(/(resumo|síntese|esquema|mapa|conceitual)/)) tipoMaterial = 'resumo';
  
  // Detectar se tem múltiplas páginas
  const hasMultiplePages = texto.includes('=== PÁGINA') && texto.split('=== PÁGINA').length > 2;
  const totalPaginas = hasMultiplePages ? texto.split('=== PÁGINA').length - 1 : 1;
  
  return { disciplina, tipoMaterial, hasMultiplePages, totalPaginas };
}

// Criar prompt didático usando as instruções pedagógicas fornecidas
function createOptimizedPrompt(texto: string, schoolYear: string) {
  const { disciplina, tipoMaterial, hasMultiplePages, totalPaginas } = detectContentIntelligence(texto);
  
  const pageInstruction = hasMultiplePages 
    ? `\n📖 **MATERIAL MULTIPÁGINA:** ${totalPaginas} páginas sequenciais detectadas. Mantenha ordem lógica e fluxo contínuo.\n`
    : '';
    
  // Converter idade escolar para idade aproximada
  const getIdadeAproximada = (nivel: string) => {
    switch (nivel?.toLowerCase()) {
      case 'fundamental i': return '8-10';
      case 'fundamental ii': return '11-14';
      case 'ensino médio': return '15-17';
      case 'superior': return '18+';
      default: return '15-17';
    }
  };
  
  const idadeUsuario = getIdadeAproximada(schoolYear);
  
  return `=== INSTRUÇÕES ===

Você é um professor didático e paciente. Sua missão é transformar conteúdos escolares brutos (extraídos de imagem, PDF ou arquivo de estudo) em **resumos claros, completos e explicativos**.${pageInstruction}

📊 **ANÁLISE DO CONTEÚDO:**
- Disciplina: ${disciplina.toUpperCase()}
- Material: ${tipoMaterial}
- Nível: ${schoolYear}
- Idade do usuário: ${idadeUsuario} anos
- Páginas: ${totalPaginas}

**INSTRUÇÕES DETALHADAS:**

1. **Compreensão do texto**  
   - Leia atentamente o conteúdo fornecido abaixo (extraído por OCR).  
   - Identifique os principais tópicos e ideias centrais.  

2. **Método SQ3R**  
   - SURVEY: observe títulos, subtítulos ou trechos-chave.  
   - QUESTION: transforme-os em perguntas que guiem o entendimento.  
   - READ: encontre as respostas no texto.  
   - RECITE: reescreva com suas próprias palavras.  
   - REVIEW: revise para manter clareza e lógica.  

3. **Técnica de Feynman**  
   - Explique como se estivesse ensinando a uma criança.  
   - Simplifique termos difíceis.  
   - Se necessário, use comparações ou exemplos fáceis de entender.  

4. **Formato do resumo**  
   - Crie um **texto corrido**, em parágrafos bem organizados, como um capítulo de livro resumo.  
   - NÃO use listas ou tópicos isolados.  
   - As ideias devem se conectar de forma lógica, com começo, meio e fim.  

5. **Linguagem**  
   - Adapte a explicação para a idade aproximada do estudante: **${idadeUsuario} anos**.  
   - Use frases curtas, claras e simples, mas mantendo todas as informações importantes.  
   - O aluno deve ser capaz de entender todo o conteúdo apenas lendo o resumo.  

6. **Completude**  
   - O resumo deve cobrir todas as informações necessárias do texto original.  
   - NÃO invente informações externas. Use somente o material fornecido.  

=== CONTEÚDO A RESUMIR ===
"""
${texto}
"""

=== SAÍDA ESPERADA ===
Um **resumo corrido, explicativo e bem estruturado**, semelhante a um texto de livro didático.  
O texto deve:  
- Conter todas as informações essenciais.  
- Ser organizado em parágrafos.  
- Ter clareza e didática, adequado para a idade de ${idadeUsuario} anos.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Integrar com sistema de créditos na geração de resumo
  try {
    console.log('🚀 Função generate-summary iniciada');
    
    // Verificar configurações
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!anthropicApiKey) {
      console.error('❌ ANTHROPIC_API_KEY não encontrada');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Configuração da API Anthropic não encontrada',
          fallbackMessage: 'Serviço temporariamente indisponível. Tente novamente mais tarde.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Configurações do Supabase não encontradas');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Configuração do banco de dados inválida',
          fallbackMessage: 'Erro de configuração. Contate o suporte.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse do request
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('❌ Erro ao fazer parse do JSON:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Dados de entrada inválidos',
          fallbackMessage: 'Erro nos dados enviados. Tente novamente.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { uploadId, textoExtraido, userId, schoolYear, isCombiningBatches = false, totalBatches = 1, totalImages = 1, extractedText, metadata } = requestBody;
    
    // Support both old format (textoExtraido) and new format (extractedText)
    const textContent = extractedText || textoExtraido;
    
    // Validações básicas
    if (!userId || !textContent) {
      console.error('❌ Parâmetros obrigatórios ausentes - userId:', !!userId, 'textContent:', !!textContent);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Parâmetros obrigatórios ausentes',
          fallbackMessage: 'Dados incompletos. Tente fazer upload novamente.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // For new enhanced upload, don't require uploadId - we'll create it if needed
    const needsUploadRecord = !uploadId && !isCombiningBatches;

    if (textContent.length > 100000) { // Increased limit for batch combinations
      console.error('❌ Texto muito grande:', textContent.length);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Texto muito grande para processar',
          fallbackMessage: isCombiningBatches 
            ? 'Conteúdo combinado muito extenso. Tente processar em lotes menores.'
            : 'Imagem com muito texto. Use uma imagem menor ou divida o conteúdo.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (textContent.length < 10) {
      console.error('❌ Texto muito pequeno:', textContent.length);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Texto muito pequeno para resumir',
          fallbackMessage: 'Muito pouco texto para gerar resumo.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Inicializar Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // NOVO: Consumir créditos apenas para resumos normais (não para combinações)
    if (!isCombiningBatches) {
      const { data: creditResult, error: creditError } = await supabase.rpc('consume_credits', {
        target_user_id: userId,
        action_type: 'summary'
      });

      if (creditError || !creditResult || !creditResult[0]?.success) {
        console.error('❌ Erro ao consumir créditos:', creditError);
        const message = creditResult?.[0]?.message || 'Créditos insuficientes';
        return new Response(
          JSON.stringify({ 
            success: false,
            error: message,
            fallbackMessage: message.includes('insuficientes') 
              ? 'Você não tem créditos suficientes. Faça upgrade do seu plano.'
              : 'Erro ao processar créditos. Tente novamente.'
          }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log(`💳 Créditos consumidos: ${creditResult[0].credits_consumed}. Restam: ${creditResult[0].credits_remaining}`);
    } else {
      console.log('🔄 Combinação de lotes - não consome créditos adicionais');
    }
    // Buscar plano do usuário para configuração do modelo
    const userPlan = await getUserPlan(supabase, userId);
    const modelConfig = getModelConfigForPlan(userPlan);
    
    console.log('👤 Usuário:', userId);
    console.log('📊 Plano:', userPlan);
    console.log('🎓 Nível escolar:', schoolYear || 'Não informado');
    console.log('📝 Tamanho do texto:', textContent.length, 'caracteres');
    console.log('🔄 Modo combinação:', isCombiningBatches ? `Sim (${totalBatches} lotes, ${totalImages} imagens)` : 'Não');

    // Criar prompt: usar texto direto para combinações ou criar prompt otimizado para resumos normais
    const optimizedPrompt = isCombiningBatches ? 
      textContent : // Para combinações, o texto já contém as instruções
      createOptimizedPrompt(textContent, schoolYear || 'Ensino Médio');
    
    console.log('🤖 Iniciando chamada para API da Anthropic...');
    const startTime = Date.now();

    let response;
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: modelConfig.model,
          max_tokens: isCombiningBatches ? modelConfig.maxTokens + 2000 : modelConfig.maxTokens,
          messages: [
            {
              role: 'user',
              content: optimizedPrompt
            }
          ],
          temperature: 0.2,
          top_p: 0.9
        })
      });
    } catch (error) {
      console.error('❌ Erro na conexão com a API:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Erro de conexão com o serviço de IA',
          fallbackMessage: 'Problema de conexão. Verifique sua internet e tente novamente.'
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const endTime = Date.now();
    console.log(`⏱️ Tempo da API: ${endTime - startTime}ms`);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.text();
      } catch (e) {
        errorData = 'Não foi possível ler erro';
      }
      
      console.error('❌ Erro da API:', response.status, errorData);
      
      let userMessage = 'Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos.';
      
      if (response.status === 429) {
        userMessage = 'Muitas solicitações. Aguarde alguns minutos e tente novamente.';
      } else if (response.status >= 500) {
        userMessage = 'Serviço temporariamente fora do ar. Tente novamente em alguns minutos.';
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: userMessage,
          fallbackMessage: userMessage
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error('❌ Erro ao processar resposta:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Resposta inválida da IA',
          fallbackMessage: 'Problema ao processar resposta. Tente novamente.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('❌ Estrutura de resposta inválida:', data);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Resposta inesperada da IA',
          fallbackMessage: 'Resposta inesperada. Tente novamente.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const resumoGerado = data.content[0].text;
    console.log('✅ Resumo gerado:', resumoGerado.length, 'caracteres');

    // Para combinações de lotes, retornar apenas o resumo sem salvar
    if (isCombiningBatches) {
      console.log('🔄 Combinação concluída - retornando resumo sem salvar');
      return new Response(
        JSON.stringify({ 
          success: true,
          summary: resumoGerado,
          mode: 'batch_combination',
          stats: {
            caracteres_entrada: textContent.length,
            caracteres_resumo: resumoGerado.length,
            tempo_processamento: `${endTime - startTime}ms`,
            modelo_usado: modelConfig.model,
            total_lotes: totalBatches,
            total_imagens: totalImages
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Salvar no banco - criar upload record se necessário
    try {
      let finalUploadId = uploadId;
      
      // Se não temos uploadId, criar um registro de upload
      if (needsUploadRecord) {
        console.log('📁 Criando registro de upload...');
        const { data: uploadData, error: uploadError } = await supabase
          .from('uploads')
          .insert({
            user_id: userId,
            arquivo_original_nome: `Enhanced_Upload_${totalImages || 1}_images.json`,
            texto_extraido: textContent,
            file_size: textContent.length,
            imagem_url: metadata?.sourceType || '',
            data_upload: new Date().toISOString()
          })
          .select()
          .single();

        if (uploadError) {
          console.error('❌ Erro ao criar upload:', uploadError);
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'Erro ao criar registro de upload',
              fallbackMessage: 'Erro ao salvar dados. Tente novamente.'
            }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        finalUploadId = uploadData.id;
        console.log('✅ Upload record criado:', finalUploadId);
      }

      const { data: insertData, error: resumoError } = await supabase
        .from('resumos')
        .insert({
          upload_id: finalUploadId,
          resumo_gerado: resumoGerado,
          custom_name: `Resumo - ${totalImages || 1} páginas`,
          data_criacao: new Date().toISOString()
        })
        .select()
        .single();

      if (resumoError) {
        console.error('❌ Erro ao salvar:', resumoError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Erro ao salvar resumo',
            fallbackMessage: 'Resumo gerado mas não foi possível salvar. Tente novamente.'
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('✅ Resumo salvo com ID:', insertData.id);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          resumo: insertData,
          stats: {
            caracteres_entrada: textContent.length,
            caracteres_resumo: resumoGerado.length,
            tempo_processamento: `${endTime - startTime}ms`,
            modelo_usado: modelConfig.model,
            plano_usuario: userPlan,
            nivel_escolar: schoolYear || 'Ensino Médio'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (error) {
      console.error('❌ Erro inesperado ao salvar:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Erro inesperado ao salvar',
          fallbackMessage: 'Erro interno. Tente novamente.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erro interno do servidor',
        fallbackMessage: 'Erro inesperado. Tente novamente mais tarde.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
