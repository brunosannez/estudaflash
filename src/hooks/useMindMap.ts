
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();

  const generateMindMap = async (resumoId: string, content: string): Promise<MindMap | null> => {
    try {
      setLoading(true);
      console.log('🧠 Iniciando geração de mapa mental...');

      // Chamar edge function para gerar mapa mental
      const { data: generationData, error: generationError } = await supabase.functions.invoke(
        'generate-mind-map',
        {
          body: { content, resumoId }
        }
      );

      if (generationError) {
        console.error('❌ Erro ao gerar mapa mental:', generationError);
        throw generationError;
      }

      const mindMapData = generationData.mindMap;

      // Salvar mapa mental no banco
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: savedMindMap, error: saveError } = await supabase
        .from('mind_maps')
        .insert({
          resumo_id: resumoId,
          user_id: user.user.id,
          title: mindMapData.title,
          content: mindMapData
        })
        .select()
        .single();

      if (saveError) {
        console.error('❌ Erro ao salvar mapa mental:', saveError);
        throw saveError;
      }

      console.log('✅ Mapa mental gerado e salvo com sucesso');
      
      toast({
        title: "Sucesso!",
        description: "Mapa mental gerado com sucesso!",
      });

      return {
        ...savedMindMap,
        content: savedMindMap.content as unknown as MindMapData
      } as MindMap;

    } catch (error) {
      console.error('❌ Erro ao gerar mapa mental:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar mapa mental. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getMindMapByResumoId = async (resumoId: string): Promise<MindMap | null> => {
    try {
      const { data, error } = await supabase
        .from('mind_maps')
        .select('*')
        .eq('resumo_id', resumoId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar mapa mental:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        ...data,
        content: data.content as unknown as MindMapData
      } as MindMap;
    } catch (error) {
      console.error('❌ Erro ao buscar mapa mental:', error);
      return null;
    }
  };

  const getMindMapById = async (id: string): Promise<MindMap | null> => {
    try {
      const { data, error } = await supabase
        .from('mind_maps')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar mapa mental:', error);
        return null;
      }

      return {
        ...data,
        content: data.content as unknown as MindMapData
      } as MindMap;
    } catch (error) {
      console.error('❌ Erro ao buscar mapa mental:', error);
      return null;
    }
  };

  return {
    loading,
    mindMaps,
    generateMindMap,
    getMindMapByResumoId,
    getMindMapById
  };
};
