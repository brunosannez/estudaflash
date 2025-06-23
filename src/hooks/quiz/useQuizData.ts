
// Este arquivo não é mais necessário - funcionalidade movida para useQuiz.ts
// Mantendo por compatibilidade, mas redirecionando para o hook principal

import { useQuiz } from '@/hooks/useQuiz';
import { useSummary } from '@/hooks/useSummary';
import { useNavigate } from 'react-router-dom';

export const useQuizData = (resumoId: string | undefined) => {
  const navigate = useNavigate();
  const { getResumoById } = useSummary();
  const quiz = useQuiz(resumoId || '');

  // Compatibilidade com a interface anterior
  return {
    resumo: null,
    quizData: quiz.quizzes.length > 0 ? {
      resumo_id: resumoId,
      questoes: quiz.quizzes,
      titulo: `Quiz - ${quiz.quizzes.length} questões`
    } : null,
    isLoading: quiz.loading,
    isGenerating: quiz.loading,
    handleGenerateQuiz: async () => {
      if (!resumoId) return;
      const resumoData = await getResumoById(resumoId);
      if (resumoData?.resumo_gerado) {
        return await quiz.generateQuiz(resumoData.resumo_gerado);
      }
      return false;
    },
    handleQuizComplete: (result: any) => {
      console.log('🏆 Quiz completado:', result);
    }
  };
};
