
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Flashcard {
  id: string;
  pergunta: string;
  resposta: string;
  exemplo?: string;
}

export const useFlashcardData = (resumoId: string) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFlashcards = async () => {
    try {
      console.log('🔍 Carregando flashcards para resumo:', resumoId);
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('resumo_id', resumoId)
        .order('data_criacao', { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log('✅ Flashcards carregados:', data.length);
        setFlashcards(data);
      } else {
        console.log('❌ Nenhum flashcard encontrado');
        toast({
          title: "Nenhum flashcard encontrado",
          description: "Este resumo ainda não possui flashcards. Gere alguns primeiro!",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar flashcards:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os flashcards.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [resumoId]);

  const shuffleFlashcards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
  };

  return {
    flashcards,
    loading,
    shuffleFlashcards
  };
};
