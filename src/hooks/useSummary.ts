import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSummary = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateSummary = async (uploadId: string, textoExtraido: string, maxRetries = 3) => {
    try {
      setIsGenerating(true);
      
      console.log('🚀 Iniciando geração de resumo para:', uploadId);
      console.log('📊 Tamanho do texto:', textoExtraido.length, 'caracteres');

      // Verificar se o texto não está vazio
      if (!textoExtraido || textoExtraido.trim().length === 0) {
        throw new Error('Nenhum texto foi extraído para gerar o resumo');
      }

      // Verificar se o texto não é muito grande
      if (textoExtraido.length > 50000) {
        throw new Error('Texto muito grande para processar. Use uma imagem com menos texto.');
      }

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      let lastError = null;
      
      // Implementar retry logic
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 Tentativa ${attempt}/${maxRetries}`);
          
          const { data, error } = await supabase.functions
            .invoke('generate-summary', {
              body: { 
                uploadId,
                textoExtraido,
                userId: user.id
              }
            });

          if (error) {
            console.error(`❌ Erro na tentativa ${attempt}:`, error);
            lastError = error;
            
            // Se for erro de rede ou timeout, tenta novamente
            if (attempt < maxRetries && (
              error.message?.includes('fetch') || 
              error.message?.includes('network') ||
              error.message?.includes('timeout') ||
              error.message?.includes('Failed to send a request')
            )) {
              console.log(`⏳ Aguardando ${attempt * 2} segundos antes da próxima tentativa...`);
              await new Promise(resolve => setTimeout(resolve, attempt * 2000));
              continue;
            }
            
            throw error;
          }

          if (!data) {
            lastError = new Error('Nenhum dado retornado da função');
            if (attempt < maxRetries) {
              console.log(`⏳ Aguardando ${attempt * 2} segundos antes da próxima tentativa...`);
              await new Promise(resolve => setTimeout(resolve, attempt * 2000));
              continue;
            }
            throw lastError;
          }

          if (!data.success) {
            console.error('❌ Função retornou erro:', data.error);
            
            // Se há uma mensagem de fallback, exibe ela
            if (data.fallbackMessage) {
              throw new Error(data.fallbackMessage);
            }
            
            throw new Error(data.error || 'Erro ao gerar resumo');
          }

          console.log('✅ Resumo gerado com sucesso:', data.stats);

          toast({
            title: "Sucesso!",
            description: "Resumo gerado com sucesso.",
          });

          return data.resumo;

        } catch (attemptError) {
          console.error(`❌ Erro na tentativa ${attempt}:`, attemptError);
          lastError = attemptError;
          
          // Se não é o último retry e é um erro temporário, continua
          if (attempt < maxRetries && (
            attemptError.message?.includes('fetch') || 
            attemptError.message?.includes('network') ||
            attemptError.message?.includes('timeout') ||
            attemptError.message?.includes('Failed to send a request') ||
            attemptError.message?.includes('503') ||
            attemptError.message?.includes('temporarily') ||
            attemptError.message?.includes('temporariamente')
          )) {
            console.log(`⏳ Aguardando ${attempt * 2} segundos antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 2000));
            continue;
          }
          
          // Se é um erro definitivo, para de tentar
          break;
        }
      }

      // Se chegou aqui, todas as tentativas falharam
      throw lastError || new Error('Todas as tentativas falharam');

    } catch (error) {
      console.error('❌ Erro final ao gerar resumo:', error);
      
      // Mensagens de erro mais específicas para o usuário
      let userMessage = "Erro ao gerar resumo.";
      
      if (error.message) {
        // Se já há uma mensagem de fallback da API, usa ela
        if (error.message.includes('temporariamente indisponível') || 
            error.message.includes('Tente novamente')) {
          userMessage = error.message;
        } else if (error.message.includes('ANTHROPIC_API_KEY')) {
          userMessage = "Configuração da API Anthropic necessária. Contate o administrador.";
        } else if (error.message.includes('rate') || error.message.includes('limit')) {
          userMessage = "Limite de uso excedido. Aguarde alguns minutos e tente novamente.";
        } else if (error.message.includes('API Anthropic') || error.message.includes('IA')) {
          userMessage = "Serviço de IA temporariamente indisponível. Tente novamente.";
        } else if (error.message.includes('banco') || error.message.includes('database')) {
          userMessage = "Erro ao salvar o resumo. Tente novamente.";
        } else if (error.message.includes('muito grande')) {
          userMessage = "Texto muito grande para processar. Use uma imagem menor.";
        } else if (error.message.includes('Failed to send a request') || error.message.includes('fetch')) {
          userMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
        } else if (error.message.includes('timeout')) {
          userMessage = "Tempo limite excedido. Tente novamente com uma imagem menor.";
        } else if (error.message.includes('Nenhum texto')) {
          userMessage = "Nenhum texto foi extraído da imagem. Tente com uma imagem mais clara.";
        } else {
          userMessage = error.message;
        }
      }
      
      toast({
        title: "Erro",
        description: userMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const getResumo = async (uploadId: string) => {
    try {
      console.log('Buscando resumo para upload:', uploadId);
      
      const { data, error } = await supabase
        .from('resumos')
        .select('*')
        .eq('upload_id', uploadId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar resumo:', error);
        throw error;
      }

      if (data) {
        console.log('Resumo encontrado:', data.id);
      } else {
        console.log('Nenhum resumo encontrado para este upload');
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
      return null;
    }
  };

  const getResumoById = async (resumoId: string) => {
    try {
      console.log('Buscando resumo por ID:', resumoId);
      
      const { data, error } = await supabase
        .from('resumos')
        .select('*')
        .eq('id', resumoId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar resumo por ID:', error);
        throw error;
      }

      if (data) {
        console.log('Resumo encontrado por ID:', data.id);
      } else {
        console.log('Nenhum resumo encontrado para este ID');
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar resumo por ID:', error);
      return null;
    }
  };

  const getAllResumos = async () => {
    try {
      console.log('Buscando todos os resumos do usuário');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('resumos')
        .select(`
          *,
          uploads!inner(
            id,
            user_id,
            arquivo_original_nome,
            texto_extraido,
            data_upload
          )
        `)
        .eq('uploads.user_id', user.id)
        .order('data_criacao', { ascending: false });

      if (error) {
        console.error('Erro ao buscar resumos:', error);
        throw error;
      }

      console.log('Resumos encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar todos os resumos:', error);
      return [];
    }
  };

  const updateResumoName = async (resumoId: string, customName: string) => {
    try {
      console.log('Atualizando nome do resumo:', resumoId, customName);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('resumos')
        .update({ custom_name: customName })
        .eq('id', resumoId);

      if (error) {
        console.error('Erro ao atualizar nome do resumo:', error);
        throw error;
      }

      console.log('Nome do resumo atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar nome do resumo:', error);
      throw error;
    }
  };

  return {
    generateSummary,
    getResumo,
    getResumoById,
    getAllResumos,
    updateResumoName,
    isGenerating
  };
};
