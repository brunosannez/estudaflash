
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseQuizAnswerSaverProps {
  sessionId: string | null;
  correctAnswers: number;
  onCorrectAnswersUpdate: (newCount: number) => void;
}

export const useQuizAnswerSaver = ({ 
  sessionId, 
  correctAnswers, 
  onCorrectAnswersUpdate 
}: UseQuizAnswerSaverProps) => {

  const saveAnswer = useCallback(async (questionIndex: number, selectedAnswer: number, isCorrect: boolean) => {
    if (!sessionId) return false;

    try {
      console.log('💾 Saving answer:', { questionIndex, selectedAnswer, isCorrect });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const newCorrectAnswers = isCorrect ? correctAnswers + 1 : correctAnswers;

      // Just update correct answers count, don't advance question
      const { error: updateError } = await supabase
        .from('quiz_sessions')
        .update({
          correct_answers: newCorrectAnswers,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      // Update local state
      onCorrectAnswersUpdate(newCorrectAnswers);

      console.log('✅ Answer saved successfully');
      return true;
    } catch (err) {
      console.error('❌ Save answer error:', err);
      toast.error('Erro ao salvar resposta');
      return false;
    }
  }, [sessionId, correctAnswers, onCorrectAnswersUpdate]);

  return { saveAnswer };
};
