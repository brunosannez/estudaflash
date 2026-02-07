
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { edgeFunctionInvoker } from '@/services/edgeFunctionInvoker';
import { CreditsService } from '@/services/creditsService';
import { toast } from 'sonner';

export interface MindMapNode {
  id: string;
  text: string;
  level: number;
  color: string;
  children?: string[];
}

export interface MindMapData {
  title: string;
  nodes: MindMapNode[];
}

export interface MindMap {
  id: string;
  resumo_id: string;
  title: string;
  content: MindMapData;
  created_at: string;
  updated_at: string;
}

export const useMindMap = () => {
  const [loading, setLoading] = useState(false);
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);

  const generateMindMap = useCallback(async (resumoId: string, content: string): Promise<MindMap | null> => {
    try {
      setLoading(true);
      console.log('🧠 Iniciando geração de mapa mental...');

      if (!content || content.trim().length < 50) {
        throw new Error('Conteúdo muito curto para gerar mapa mental');
      }

      // Pre-check credits
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Usuário não autenticado');
      }
      
      const creditCheck = await CreditsService.checkCreditsForAction(userData.user.id, 'mind_map');
      if (!creditCheck.canProceed) {
        toast.error('Créditos insuficientes', {
          description: `Você precisa de ${creditCheck.creditsRequired} crédito(s) mas tem ${creditCheck.creditsAvailable}.`
        });
        return null;
      }

      // Usar o invoker com Authorization header explícito
      const { data: generationData, error: generationError } = await edgeFunctionInvoker.invoke(
        'generate-mind-map',
        { content: content.substring(0, 8000), resumoId }
      );

      if (generationError) {
        console.error('❌ Erro ao gerar mapa mental:', generationError);
        throw new Error(`Erro na geração: ${generationError.message}`);
      }

      if (!generationData?.success || !generationData?.mindMap) {
        console.error('❌ Resposta inválida da edge function:', generationData);
        throw new Error('Falha na geração do mapa mental');
      }

      const mindMapData = generationData.mindMap;

      // Validar estrutura básica
      if (!mindMapData.title || !mindMapData.nodes || !Array.isArray(mindMapData.nodes)) {
        throw new Error('Estrutura do mapa mental inválida');
      }

      // Salvar mapa mental no banco (reuse userData from credit check)
      const { data: savedMindMap, error: saveError } = await supabase
        .from('mind_maps')
        .insert({
          resumo_id: resumoId,
          user_id: userData.user.id,
          title: mindMapData.title,
          content: mindMapData
        })
        .select()
        .single();

      if (saveError) {
        console.error('❌ Erro ao salvar mapa mental:', saveError);
        throw new Error('Erro ao salvar no banco de dados');
      }

      console.log('✅ Mapa mental gerado e salvo com sucesso');
      
      return {
        ...savedMindMap,
        content: savedMindMap.content as unknown as MindMapData
      } as MindMap;

    } catch (error: any) {
      console.error('❌ Erro ao gerar mapa mental:', error);
      
      let errorMessage = 'Erro ao gerar mapa mental. Tente novamente.';
      
      if (error.message?.includes('não autenticado')) {
        errorMessage = 'Você precisa estar logado para gerar mapas mentais.';
      } else if (error.message?.includes('muito curto')) {
        errorMessage = 'O conteúdo é muito curto para gerar um mapa mental.';
      } else if (error.message?.includes('ANTHROPIC_API_KEY')) {
        errorMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.';
      }
      
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMindMapByResumoId = useCallback(async (resumoId: string): Promise<MindMap | null> => {
    try {
      console.log('🔍 Buscando mapa mental para resumo:', resumoId);
      
      const { data, error } = await supabase
        .from('mind_maps')
        .select('*')
        .eq('resumo_id', resumoId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar mapa mental:', error);
        return null;
      }

      if (!data) {
        console.log('ℹ️ Nenhum mapa mental encontrado para este resumo');
        return null;
      }

      console.log('✅ Mapa mental encontrado:', data.id);
      return {
        ...data,
        content: data.content as unknown as MindMapData
      } as MindMap;
    } catch (error) {
      console.error('❌ Erro ao buscar mapa mental:', error);
      return null;
    }
  }, []);

  const getMindMapById = useCallback(async (id: string): Promise<MindMap | null> => {
    try {
      const { data, error } = await supabase
        .from('mind_maps')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar mapa mental por ID:', error);
        return null;
      }

      return {
        ...data,
        content: data.content as unknown as MindMapData
      } as MindMap;
    } catch (error) {
      console.error('❌ Erro ao buscar mapa mental por ID:', error);
      return null;
    }
  }, []);

  return {
    loading,
    mindMaps,
    generateMindMap,
    getMindMapByResumoId,
    getMindMapById
  };
};
