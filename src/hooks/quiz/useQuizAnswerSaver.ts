
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProgressUpdater } from '@/hooks/progress/useProgressUpdater';

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
  const { updateProgressAfterActivity } = useProgressUpdater();

  const saveAnswer = useCallback(async (questionIndex: number, selectedAnswer: number, isCorrect: boolean) => {
    if (!sessionId) return false;

    try {
      console.log('💾 Saving quiz answer:', { questionIndex, selectedAnswer, isCorrect });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const newCorrectAnswers = isCorrect ? correctAnswers + 1 : correctAnswers;

      // Save individual quiz response
      const { error: responseError } = await supabase
        .from('quiz_respostas')
        .insert({
          user_id: user.id,
          quiz_id: `${sessionId}_${questionIndex}`, // Using session + question as unique ID
          acertou: isCorrect,
          resposta_selecionada: selectedAnswer
        });

      if (responseError) {
        console.error('❌ Error saving quiz response:', responseError);
      } else {
        console.log('✅ Quiz response saved successfully');
      }

      // Save attempt record
      await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          resumo_id: '', // Will be filled by trigger or separate query
          quiz_question_id: `question_${questionIndex}`,
          selected_answer: selectedAnswer,
          is_correct: isCorrect
        });

      // Update session with new correct answers count
      const { error: updateError } = await supabase
        .from('quiz_sessions')
        .update({
          correct_answers: newCorrectAnswers,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      // Update progress system
      const activityType = isCorrect ? 'quiz_correct' : 'quiz_incorrect';
      await updateProgressAfterActivity(activityType);
      console.log('🎯 Progress updated for quiz activity:', activityType);

      // Update local state
      onCorrectAnswersUpdate(newCorrectAnswers);

      console.log('✅ Quiz answer and progress saved successfully');
      return true;
    } catch (err) {
      console.error('❌ Save quiz answer error:', err);
      toast.error('Erro ao salvar resposta');
      return false;
    }
  }, [sessionId, correctAnswers, onCorrectAnswersUpdate, updateProgressAfterActivity]);

  return { saveAnswer };
};
