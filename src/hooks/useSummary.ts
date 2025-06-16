
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { summaryGenerationService } from '@/services/summaryGenerationService';
import { summaryDataService } from '@/services/summaryDataService';

export const useSummary = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateSummary = async (uploadId: string, textoExtraido: string, maxRetries = 3) => {
    try {
      setIsGenerating(true);
      
      const result = await summaryGenerationService.generateSummary(uploadId, textoExtraido, maxRetries);

      toast({
        title: "Sucesso!",
        description: "Resumo gerado com sucesso.",
      });

      return result;

    } catch (error) {
      console.error('❌ Erro final ao gerar resumo:', error);
      
      const userMessage = summaryGenerationService.getErrorMessage(error);
      
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
    return summaryDataService.getResumo(uploadId);
  };

  const getResumoById = async (resumoId: string) => {
    return summaryDataService.getResumoById(resumoId);
  };

  const getAllResumos = async () => {
    return summaryDataService.getAllResumos();
  };

  const updateResumoName = async (resumoId: string, customName: string) => {
    return summaryDataService.updateResumoName(resumoId, customName);
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
