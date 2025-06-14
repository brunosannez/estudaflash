
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
      console.log('Tamanho do texto:', textoExtraido.length, 'caracteres');

      const { data, error } = await supabase.functions
        .invoke('generate-summary', {
          body: { 
            uploadId,
            textoExtraido 
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
        throw new Error(data.error || 'Erro ao gerar resumo');
      }

      console.log('Resumo gerado com sucesso:', data.stats);

      toast({
        title: "Sucesso!",
        description: "Resumo gerado com sucesso.",
      });

      return data.resumo;

    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      
      // Mensagens de erro mais específicas para o usuário
      let userMessage = "Erro ao gerar resumo.";
      
      if (error.message) {
        if (error.message.includes('ANTHROPIC_API_KEY')) {
          userMessage = "Configuração da API Anthropic necessária. Contate o administrador.";
        } else if (error.message.includes('rate')) {
          userMessage = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
        } else if (error.message.includes('API Anthropic')) {
          userMessage = "Serviço de IA temporariamente indisponível. Tente novamente.";
        } else if (error.message.includes('banco')) {
          userMessage = "Erro ao salvar o resumo. Tente novamente.";
        } else if (error.message.includes('muito grande')) {
          userMessage = "Texto muito grande para processar. Use uma imagem menor.";
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

  return {
    generateSummary,
    getResumo,
    getResumoById,
    isGenerating
  };
};
