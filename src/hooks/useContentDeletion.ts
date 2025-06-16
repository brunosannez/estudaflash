
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useContentDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteResumo = async (resumoId: string) => {
    try {
      setIsDeleting(true);
      
      // Deletar flashcards relacionados
      await supabase
        .from('flashcards')
        .delete()
        .eq('resumo_id', resumoId);

      // Deletar quizzes relacionados
      await supabase
        .from('quizzes')
        .delete()
        .eq('resumo_id', resumoId);

      // Deletar o resumo
      const { error } = await supabase
        .from('resumos')
        .delete()
        .eq('id', resumoId);

      if (error) throw error;

      toast({
        title: "Resumo excluído",
        description: "O resumo e todo o conteúdo relacionado foram excluídos com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Erro ao excluir resumo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o resumo. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteFlashcard = async (flashcardId: string) => {
    try {
      setIsDeleting(true);

      // Deletar reviews relacionados
      await supabase
        .from('flashcard_reviews')
        .delete()
        .eq('flashcard_id', flashcardId);

      // Deletar o flashcard
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', flashcardId);

      if (error) throw error;

      toast({
        title: "Flashcard excluído",
        description: "O flashcard foi excluído com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Erro ao excluir flashcard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o flashcard. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteQuiz = async (quizId: string) => {
    try {
      setIsDeleting(true);

      // Deletar respostas relacionadas
      await supabase
        .from('quiz_respostas')
        .delete()
        .eq('quiz_id', quizId);

      // Deletar o quiz
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;

      toast({
        title: "Quiz excluído",
        description: "O quiz foi excluído com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Erro ao excluir quiz:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o quiz. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteMultipleFlashcards = async (flashcardIds: string[]) => {
    try {
      setIsDeleting(true);

      // Deletar reviews relacionados
      await supabase
        .from('flashcard_reviews')
        .delete()
        .in('flashcard_id', flashcardIds);

      // Deletar os flashcards
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .in('id', flashcardIds);

      if (error) throw error;

      toast({
        title: "Flashcards excluídos",
        description: `${flashcardIds.length} flashcards foram excluídos com sucesso.`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao excluir flashcards:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir os flashcards. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    deleteResumo,
    deleteFlashcard,
    deleteQuiz,
    deleteMultipleFlashcards
  };
};
