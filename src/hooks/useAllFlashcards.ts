
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FlashcardWithResumo {
  id: string;
  pergunta: string;
  resposta: string;
  exemplo?: string | null;
  data_criacao: string;
  resumo_id: string;
  resumos?: {
    custom_name?: string;
    data_criacao: string;
  };
}

export const useAllFlashcards = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getAllFlashcards = async (): Promise<FlashcardWithResumo[]> => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('flashcards')
        .select(`
          *,
          resumos!inner(
            custom_name,
            data_criacao,
            uploads!inner(user_id)
          )
        `)
        .eq('resumos.uploads.user_id', user.id)
        .order('data_criacao', { ascending: false });

      if (error) {
        console.error('Erro ao buscar flashcards:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar flashcards",
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar flashcards:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar flashcards",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    getAllFlashcards,
    loading
  };
};
