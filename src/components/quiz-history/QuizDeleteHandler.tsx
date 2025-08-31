import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useQuizDeleteHandler = () => {
  const { user } = useAuth();

  const deleteQuizSession = async (sessionId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      console.log('🗑️ Deleting ENEM quiz session:', sessionId);

      // Delete the ENEM quiz session
      const { error: deleteError } = await supabase
        .from('enem_quiz_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id); // Ensure user can only delete their own sessions

      if (deleteError) {
        console.error('❌ Error deleting ENEM quiz session:', deleteError);
        throw deleteError;
      }

      console.log('✅ ENEM quiz session deleted successfully');
      toast.success('Quiz deletado com sucesso');
      return true;

    } catch (error) {
      console.error('❌ Error in deleteQuizSession:', error);
      toast.error('Erro ao deletar quiz');
      return false;
    }
  };

  return { deleteQuizSession };
};