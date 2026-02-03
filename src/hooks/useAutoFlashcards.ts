
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { edgeFunctionInvoker } from '@/services/edgeFunctionInvoker';
import { useToast } from '@/hooks/use-toast';
import { useUsageLimit } from '@/hooks/useUsageLimit';

export const useAutoFlashcards = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { checkCanProceed, incrementUsage } = useUsageLimit();

  const generateAutoFlashcards = async (resumoId: string, textoResumo: string) => {
    try {
      setIsGenerating(true);
      
      console.log('Iniciando geração automática de flashcards para:', resumoId);

      // Verificar limite de uso ANTES de gerar flashcards
      const canProceed = await checkCanProceed('flashcards');
      if (!canProceed) {
        console.log('❌ Geração de flashcards bloqueada por limite de uso');
        return null;
      }

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Usar o invoker com Authorization header explícito
      const { data, error } = await edgeFunctionInvoker.invoke('generate-flashcards', {
        resumoId,
        textoResumo,
        userId: user.id
      });

      if (error) {
        console.error('Erro na invocação da função:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Nenhum dado retornado da função');
      }

      if (!data.success) {
        console.error('Função retornou erro:', data.error);
        
        // Se há uma mensagem de fallback, exibe ela
        if (data.fallbackMessage) {
          throw new Error(data.fallbackMessage);
        }
        
        throw new Error(data.error || 'Erro ao gerar flashcards');
      }

      console.log('Flashcards gerados com sucesso:', data.stats);

      // Incrementar contador de uso APENAS após sucesso
      await incrementUsage('flashcards');
      console.log('✅ Usage counter incremented for flashcards');

      toast({
        title: "🎉 Sucesso!",
        description: `${data.stats.total_gerado} flashcards gerados automaticamente!`,
      });

      return data.flashcards;

    } catch (error) {
      console.error('Erro ao gerar flashcards:', error);
      
      let userMessage = "Erro ao gerar flashcards automaticamente.";
      
      if (error.message) {
        // Se já há uma mensagem de fallback da API, usa ela
        if (error.message.includes('temporariamente indisponível') || 
            error.message.includes('Tente novamente')) {
          userMessage = error.message;
        } else if (error.message.includes('ANTHROPIC_API_KEY') || error.message.includes('HUGGINGFACE_API_KEY')) {
          userMessage = "Configuração da API necessária. Contate o administrador.";
        } else if (error.message.includes('rate')) {
          userMessage = "Muitas tentativas. Aguarde alguns minutos.";
        } else if (error.message.includes('API') && error.message.includes('indisponível')) {
          userMessage = "Serviços de IA temporariamente indisponíveis.";
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

  return {
    generateAutoFlashcards,
    isGenerating
  };
};
