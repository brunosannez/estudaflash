
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuizDeleteHandlerProps {
  quizId: string;
  onSuccess?: () => void;
}

export const useQuizDelete = () => {
  const deleteQuiz = async (quizId: string, onSuccess?: () => void) => {
    if (!confirm('Tem certeza que deseja excluir este quiz do histórico? Esta ação também atualizará seus contadores de uso.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting quiz session:', quizId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar resumo_id da sessão para deletar quizzes relacionados
      const { data: sessionData } = await supabase
        .from('quiz_sessions')
        .select('resumo_id')
        .eq('id', quizId)
        .single();

      // Deletar a sessão do quiz
      const { error: deleteSessionError } = await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', quizId);

      if (deleteSessionError) {
        console.error('❌ Error deleting quiz session:', deleteSessionError);
        throw deleteSessionError;
      }

      // Se encontrou resumo_id, deletar também as questões do quiz
      if (sessionData?.resumo_id) {
        console.log('🗑️ Deleting quiz questions for resumo_id:', sessionData.resumo_id);
        
        const { error: deleteQuestionsError } = await supabase
          .from('quizzes')
          .delete()
          .eq('resumo_id', sessionData.resumo_id);

        if (deleteQuestionsError) {
          console.error('❌ Error deleting quiz questions:', deleteQuestionsError);
          // Não falhar a operação principal se a deleção das questões falhar
        } else {
          console.log('✅ Quiz questions deleted successfully');
        }
      }

      console.log('✅ Quiz session deleted successfully');

      // Decrementar contador de uso
      try {
        // Buscar dados atuais do usuário
        const { data: userData, error: userError } = await supabase
          .from('uso_usuarios')
          .select('quizzes_realizados')
          .eq('user_id', user.id)
          .single();

        if (userError) {
          console.error('❌ Error fetching user data:', userError);
          throw userError;
        }

        // Decrementar contador (mas não deixar ficar negativo)
        const newCount = Math.max(0, (userData?.quizzes_realizados || 1) - 1);
        
        const { error: updateError } = await supabase
          .from('uso_usuarios')
          .update({ 
            quizzes_realizados: newCount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('❌ Error updating usage counter:', updateError);
          throw updateError;
        }

        console.log('✅ Usage counter decremented successfully');
      } catch (usageError) {
        console.error('⚠️ Warning: Failed to update usage counter:', usageError);
        // Não falhar a operação principal se o decremento falhar
      }

      toast.success('Quiz excluído do histórico com sucesso!');
      
      // Chamar callback se fornecido
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ Error deleting quiz:', error);
      toast.error('Erro ao excluir quiz do histórico');
    }
  };

  return { deleteQuiz };
};
