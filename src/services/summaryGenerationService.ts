
import { supabase } from '@/integrations/supabase/client';
import { edgeFunctionInvoker } from '@/services/edgeFunctionInvoker';
import { createSummaryPrompt } from '@/utils/improvedPrompts';

export const summaryGenerationService = {
  async generateSummary(uploadId: string, textoExtraido: string, maxRetries = 3, schoolYear?: string) {
    console.log('🚀 Iniciando geração de resumo para:', uploadId);
    console.log('📊 Tamanho do texto:', textoExtraido.length, 'caracteres');
    console.log('🎓 Nível escolar:', schoolYear || 'Não informado');

    // Validações iniciais
    if (!uploadId || !textoExtraido) {
      throw new Error('Upload ID e texto extraído são obrigatórios');
    }

    if (!textoExtraido.trim()) {
      throw new Error('Nenhum texto foi extraído para gerar o resumo');
    }

    if (textoExtraido.length > 50000) {
      throw new Error('Texto muito grande para processar. Use uma imagem com menos texto.');
    }

    if (textoExtraido.length < 10) {
      throw new Error('Texto muito pequeno para gerar um resumo útil. Verifique se a imagem tem texto claro.');
    }

    // Obter usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Buscar informações do usuário para personalizar o prompt
    let userSchoolYear = schoolYear;
    try {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('school_year')
        .eq('user_id', user.id)
        .single();
      
      userSchoolYear = schoolYear || userProfile?.school_year || 'Ensino Médio';
    } catch (error) {
      console.warn('⚠️ Não foi possível obter nível escolar, usando padrão');
      userSchoolYear = 'Ensino Médio';
    }

    let lastError = null;
    
    // Implementar retry logic com backoff exponencial
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt}/${maxRetries} - Gerando resumo...`);
        
        // Criar prompt personalizado focado no ENEM e Ari de Sá
        const improvedPrompt = createSummaryPrompt(textoExtraido, userSchoolYear);
        
        // Usar o invoker com Authorization header explícito
        const { data, error } = await edgeFunctionInvoker.invoke('generate-summary', {
          uploadId,
          textoExtraido,
          userId: user.id,
          customPrompt: improvedPrompt,
          schoolYear: userSchoolYear
        });

        if (error) {
          console.error(`❌ Erro na tentativa ${attempt}:`, error);
          lastError = error;
          
          // Verificar se é erro temporário que vale a pena retry
          const isRetryableError = (
            error.message?.includes('fetch') || 
            error.message?.includes('network') ||
            error.message?.includes('timeout') ||
            error.message?.includes('Failed to send a request') ||
            error.message?.includes('503') ||
            error.message?.includes('temporarily') ||
            error.message?.includes('temporariamente') ||
            error.message?.includes('rate') ||
            error.message?.includes('limit')
          );
          
          if (attempt < maxRetries && isRetryableError) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Backoff exponencial, max 10s
            console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          throw error;
        }

        if (!data) {
          lastError = new Error('Nenhum dado retornado da função');
          if (attempt < maxRetries) {
            const delay = Math.min(2000 * attempt, 8000);
            console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw lastError;
        }

        if (!data.success) {
          console.error('❌ Função retornou erro:', data.error);
          
          // Se há uma mensagem de fallback, use ela
          if (data.fallbackMessage) {
            throw new Error(data.fallbackMessage);
          }
          
          const errorMsg = data.error || 'Erro desconhecido na geração de resumo';
          
          // Verificar se vale a pena retry
          const isRetryableError = (
            errorMsg.includes('temporariamente') ||
            errorMsg.includes('timeout') ||
            errorMsg.includes('temporarily') ||
            errorMsg.includes('rate limit') ||
            errorMsg.includes('503')
          );
          
          if (attempt < maxRetries && isRetryableError) {
            const delay = Math.min(3000 * attempt, 12000);
            console.log(`⏳ Erro temporário, aguardando ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          throw new Error(errorMsg);
        }

        console.log('✅ Resumo gerado com sucesso:', data.stats);
        console.log('🎓 Nível educacional aplicado:', userSchoolYear);
        
        return data.resumo;

      } catch (attemptError) {
        console.error(`❌ Erro na tentativa ${attempt}:`, attemptError);
        lastError = attemptError;
        
        // Se não é o último retry e é um erro temporário, continua
        const isRetryableError = (
          attemptError.message?.includes('fetch') || 
          attemptError.message?.includes('network') ||
          attemptError.message?.includes('timeout') ||
          attemptError.message?.includes('Failed to send a request') ||
          attemptError.message?.includes('503') ||
          attemptError.message?.includes('temporarily') ||
          attemptError.message?.includes('temporariamente') ||
          attemptError.message?.includes('rate') ||
          attemptError.message?.includes('limit')
        );
        
        if (attempt < maxRetries && isRetryableError) {
          const delay = Math.min(2000 * Math.pow(2, attempt - 1), 15000);
          console.log(`⏳ Erro temporário, aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Se é um erro definitivo, para de tentar
        break;
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    console.error('❌ Todas as tentativas de geração falharam');
    throw lastError || new Error('Falha em todas as tentativas de geração de resumo');
  },

  getErrorMessage(error: any): string {
    let userMessage = "Erro ao gerar resumo.";
    
    if (error?.message) {
      const message = error.message.toLowerCase();
      
      // Mensagens específicas e amigáveis
      if (message.includes('temporariamente indisponível') || message.includes('tente novamente')) {
        userMessage = "Serviço temporariamente indisponível. Tente novamente em alguns minutos.";
      } else if (message.includes('anthropic_api_key') || message.includes('configuração')) {
        userMessage = "Problema de configuração do sistema. Contate o suporte.";
      } else if (message.includes('rate') || message.includes('limit')) {
        userMessage = "Muitas solicitações simultâneas. Aguarde alguns minutos e tente novamente.";
      } else if (message.includes('api anthropic') || message.includes('ia') || message.includes('ai')) {
        userMessage = "Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos.";
      } else if (message.includes('banco') || message.includes('database')) {
        userMessage = "Erro ao salvar o resumo. Tente novamente.";
      } else if (message.includes('muito grande')) {
        userMessage = "Texto muito grande para processar. Use uma imagem com menos texto.";
      } else if (message.includes('muito pequeno')) {
        userMessage = "Texto muito pequeno para gerar resumo. Verifique se a imagem tem texto claro.";
      } else if (message.includes('failed to send') || message.includes('fetch') || message.includes('network')) {
        userMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (message.includes('timeout')) {
        userMessage = "Tempo limite excedido. Tente novamente com uma imagem menor.";
      } else if (message.includes('nenhum texto')) {
        userMessage = "Nenhum texto foi extraído da imagem. Use uma imagem mais clara.";
      } else if (message.includes('usuário não autenticado')) {
        userMessage = "Sessão expirada. Faça login novamente.";
      } else if (message.includes('limite') && message.includes('atingido')) {
        userMessage = error.message; // Manter mensagem original dos limites
      } else {
        userMessage = `Erro na geração: ${error.message}`;
      }
    }
    
    return userMessage;
  }
};
