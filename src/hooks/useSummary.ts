
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSummary = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateSummary = async (uploadId: string, textoExtraido: string) => {
    try {
      setIsGenerating(true);
      
      console.log('Iniciando geração de resumo para:', uploadId);

      const { data, error } = await supabase.functions
        .invoke('generate-summary', {
          body: { 
            uploadId,
            textoExtraido 
          }
        });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar resumo');
      }

      toast({
        title: "Sucesso!",
        description: "Resumo gerado com sucesso.",
      });

      return data.resumo;

    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar resumo.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const getResumo = async (uploadId: string) => {
    try {
      const { data, error } = await supabase
        .from('resumos')
        .select('*')
        .eq('upload_id', uploadId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
      return null;
    }
  };

  return {
    generateSummary,
    getResumo,
    isGenerating
  };
};
