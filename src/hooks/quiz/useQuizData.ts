// This file is deprecated - functionality moved to useQuiz.ts
// Keeping for compatibility only

import { useQuiz } from '@/hooks/useQuiz';
import { useSummary } from '@/hooks/useSummary';

export const useQuizData = (resumoId: string | undefined) => {
  const { getResumoById } = useSummary();
  const quiz = useQuiz(resumoId || '');

  console.log('⚠️ useQuizData is deprecated, use useQuiz directly');

  return {
    resumo: null,
    quizData: quiz.quizzes.length > 0 ? {
      resumo_id: resumoId,
      questoes: quiz.quizzes,
      titulo: `Quiz - ${quiz.quizzes.length} questões`
    } : null,
    isLoading: quiz.loading,
    isGenerating: quiz.generating,
    handleGenerateQuiz: async () => {
      if (!resumoId) return false;
      const resumoData = await getResumoById(resumoId);
      if (resumoData?.resumo_gerado) {
        return await quiz.generateQuiz(resumoData.resumo_gerado);
      }
      return false;
    },
    handleQuizComplete: (result: any) => {
      console.log('🏆 Quiz completed:', result);
    }
  };
};
