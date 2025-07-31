// Compatibility hook - redirects to useAllFlashcards for now
// This maintains backward compatibility while we migrate to the enhanced system

import { useState } from "react";
import { useAllFlashcards } from "@/hooks/useAllFlashcards";
import { useToast } from "@/hooks/use-toast";
import { useGameification } from "@/hooks/useGameification";
import { supabase } from "@/integrations/supabase/client";

export interface Flashcard {
  id: string;
  pergunta: string;
  resposta: string;
  exemplo?: string | null;
  data_criacao: string;
}

export const useFlashcards = (resumoId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const { toast } = useToast();
  const { addXP } = useGameification();

  // Busca flashcards desse resumo
  const fetchFlashcards = async () => {
    if (!resumoId) return;
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("resumo_id", resumoId)
        .order("data_criacao", { ascending: true });
        
      if (error) {
        throw error;
      }
      
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar flashcards",
        variant: "destructive",
      });
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  // Busca todos os flashcards do usuário
  const getAllFlashcards = async () => {
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
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching all flashcards:', error);
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

  // Cria novo flashcard
  const createFlashcard = async (pergunta: string, resposta: string, exemplo?: string) => {
    if (!resumoId) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("flashcards")
        .insert({ resumo_id: resumoId, pergunta, resposta, exemplo })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast({ title: "Flashcard adicionado!" });
      setCards((prev) => [...prev, data]);
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Remove um flashcard
  const deleteFlashcard = async (flashcardId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("flashcards")
        .delete()
        .eq("id", flashcardId);
        
      if (error) {
        throw error;
      }
      
      setCards((prev) => prev.filter((f) => f.id !== flashcardId));
      toast({ title: "Removido!" });
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Marcar flashcard como revisado e dar XP
  const reviewFlashcard = async (flashcardId: string, lembrou: boolean = true) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Registrar a revisão
      const { error: reviewError } = await supabase
        .from("flashcard_reviews")
        .insert({
          user_id: user.id,
          flashcard_id: flashcardId,
          lembrou
        });

      if (reviewError) {
        console.error("Erro ao registrar revisão:", reviewError);
      }

      // Adicionar XP
      await addXP(5, 'flashcard');
      
      toast({
        title: "🎉 +5 XP",
        description: "Flashcard revisado com sucesso!",
        duration: 3000,
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao registrar revisão:", error);
      return false;
    }
  };

  return {
    loading,
    cards,
    fetchFlashcards,
    getAllFlashcards,
    createFlashcard,
    deleteFlashcard,
    reviewFlashcard,
    setCards,
  };
};