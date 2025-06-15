
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

      const { data, error } = await supabase.functions
        .invoke('generate-flashcards', {
          body: { 
            resumoId,
            textoResumo 
          }
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
        if (error.message.includes('ANTHROPIC_API_KEY')) {
          userMessage = "Configuração da API necessária. Contate o administrador.";
        } else if (error.message.includes('rate')) {
          userMessage = "Muitas tentativas. Aguarde alguns minutos.";
        } else if (error.message.includes('API Anthropic')) {
          userMessage = "Serviço de IA temporariamente indisponível.";
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
