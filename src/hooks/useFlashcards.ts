
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGameification } from "@/hooks/useGameification";

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
    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("resumo_id", resumoId)
      .order("data_criacao", { ascending: true });
    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar flashcards",
        variant: "destructive",
      });
      setCards([]);
    } else {
      setCards(data);
    }
    setLoading(false);
  };

  // Cria novo flashcard
  const createFlashcard = async (pergunta: string, resposta: string, exemplo?: string) => {
    if (!resumoId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("flashcards")
      .insert({ resumo_id: resumoId, pergunta, resposta, exemplo })
      .select()
      .single();
    setLoading(false);
    if (error) {
      toast({
        title: "Erro ao adicionar",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
    toast({ title: "Flashcard adicionado!" });
    setCards((prev) => [...prev, data]);
    return data;
  };

  // Remove um flashcard
  const deleteFlashcard = async (flashcardId: string) => {
    setLoading(true);
    const { error } = await supabase.from("flashcards").delete().eq("id", flashcardId);
    setLoading(false);
    if (error) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
    setCards((prev) => prev.filter((f) => f.id !== flashcardId));
    toast({ title: "Removido!" });
    return true;
  };

  // Marcar flashcard como revisado e dar XP
  const reviewFlashcard = async (flashcardId: string, lembrou: boolean = true) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Registrar a revisão na nova tabela
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

      // Adicionar XP através do sistema de gamificação
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
    createFlashcard,
    deleteFlashcard,
    reviewFlashcard,
    setCards,
  };
};
