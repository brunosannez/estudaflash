
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { summaryGenerationService } from '@/services/summaryGenerationService';
import { summaryDataService } from '@/services/summaryDataService';
import { useUsageManager } from '@/hooks/useUsageManager';
import { useAdvancedBadges } from '@/hooks/useAdvancedBadges';

export const useSummary = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { checkCanProceed, incrementUsage } = useUsageManager();
  const { checkBadgesForActivity } = useAdvancedBadges();

  const generateSummary = async (uploadId: string, textoExtraido: string, maxRetries = 3) => {
    console.log('🚀 Iniciando processo de geração de resumo...');
    
    try {
      setIsGenerating(true);
      
      // Verificar limite antes de prosseguir
      console.log('🔍 Verificando limites de uso...');
      const canProceed = await checkCanProceed('summaries');
      
      if (!canProceed) {
        console.log('🚫 Não pode prosseguir devido aos limites');
        throw new Error('Limite de resumos atingido');
      }

      console.log('✅ Pode prosseguir com a geração');
      
      // Mostrar toast de início
      toast({
        title: "Gerando Resumo...",
        description: "Criando um resumo didático personalizado para seus estudos",
      });

      const result = await summaryGenerationService.generateSummary(uploadId, textoExtraido, maxRetries);

      if (result) {
        // Incrementar uso após sucesso
        console.log('📈 Incrementando contador de uso...');
        await incrementUsage('summaries');
        
        // Verificar badges após gerar resumo com sucesso
        console.log('🏆 Verificando badges de resumo...');
        try {
          await checkBadgesForActivity('summary');
        } catch (badgeError) {
          console.error('Error checking summary badges:', badgeError);
        }
        
        toast({
          title: "✅ Sucesso!",
          description: "Resumo gerado com sucesso. Agora você pode criar flashcards e quiz!",
        });

        console.log('🎉 Resumo gerado com sucesso:', result.id);
        return result;
      } else {
        throw new Error('Resultado vazio da geração de resumo');
      }

    } catch (error) {
      console.error('❌ Erro na geração de resumo:', error);
      
      const userMessage = summaryGenerationService.getErrorMessage(error);
      
      toast({
        title: "❌ Erro na Geração",
        description: userMessage,
        variant: "destructive",
        duration: 5000,
      });
      
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const getResumo = async (uploadId: string) => {
    try {
      console.log('📖 Buscando resumo para upload:', uploadId);
      return await summaryDataService.getResumo(uploadId);
    } catch (error) {
      console.error('❌ Erro ao buscar resumo:', error);
      throw error;
    }
  };

  const getResumoById = async (resumoId: string) => {
    try {
      console.log('📖 Buscando resumo por ID:', resumoId);
      return await summaryDataService.getResumoById(resumoId);
    } catch (error) {
      console.error('❌ Erro ao buscar resumo por ID:', error);
      throw error;
    }
  };

  const getAllResumos = async () => {
    try {
      console.log('📚 Buscando todos os resumos...');
      return await summaryDataService.getAllResumos();
    } catch (error) {
      console.error('❌ Erro ao buscar resumos:', error);
      throw error;
    }
  };

  const updateResumoName = async (resumoId: string, customName: string) => {
    try {
      console.log('✏️ Atualizando nome do resumo:', resumoId, customName);
      return await summaryDataService.updateResumoName(resumoId, customName);
    } catch (error) {
      console.error('❌ Erro ao atualizar nome:', error);
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
