
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseQuizProgressTrackerProps {
  sessionId: string | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  onQuestionIndexUpdate: (newIndex: number) => void;
}

export const useQuizProgressTracker = ({ 
  sessionId, 
  currentQuestionIndex, 
  totalQuestions,
  onQuestionIndexUpdate 
}: UseQuizProgressTrackerProps) => {

  const advanceToNextQuestion = useCallback(async () => {
    if (!sessionId) return false;

    try {
      console.log('➡️ Advancing to next question');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const newQuestionIndex = currentQuestionIndex + 1;
      const progressPercentage = Math.round((newQuestionIndex / totalQuestions) * 100);

      // Update session progress to next question
      const { error: updateError } = await supabase
        .from('quiz_sessions')
        .update({
          current_question_index: newQuestionIndex,
          progress_percentage: progressPercentage,
          last_activity_at: new Date().toISOString(),
          status: progressPercentage >= 100 ? 'completed' : 'in_progress'
        })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      // Update local state
      onQuestionIndexUpdate(newQuestionIndex);

      console.log('✅ Advanced to next question successfully');
      return true;
    } catch (err) {
      console.error('❌ Advance question error:', err);
      toast.error('Erro ao avançar questão');
      return false;
    }
  }, [sessionId, currentQuestionIndex, totalQuestions, onQuestionIndexUpdate]);

  // Auto-save current progress function
  const saveCurrentProgress = useCallback(async () => {
    if (!sessionId) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      await supabase
        .from('quiz_sessions')
        .update({
          last_activity_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      console.log('💾 Progress auto-saved');
      return true;
    } catch (err) {
      console.error('❌ Auto-save error:', err);
      return false;
    }
  }, [sessionId]);

  return { advanceToNextQuestion, saveCurrentProgress };
};
