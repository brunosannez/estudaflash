
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import PageLayout from '@/components/navigation/PageLayout';
import QuizHistoryViewHeader from '@/components/quiz-history/QuizHistoryViewHeader';
import QuizHistoryViewLoading from '@/components/quiz-history/QuizHistoryViewLoading';
import QuizHistoryViewEmpty from '@/components/quiz-history/QuizHistoryViewEmpty';
import QuizHistoryViewSummary from '@/components/quiz-history/QuizHistoryViewSummary';
import QuizHistoryViewQuestions from '@/components/quiz-history/QuizHistoryViewQuestions';

interface QuizQuestion {
  pergunta: string;
  alternativas: string[];
  resposta_correta: number;
  explicacao: string;
  resposta_usuario?: number;
  acertou: boolean;
}

interface QuizSessionData {
  id: string;
  quiz_title: string;
  total_questions: number;
  correct_answers: number;
  completion_time_seconds: number;
  created_at: string;
  questions_data: QuizQuestion[];
  resumo_titulo?: string;
}

const QuizHistoryView = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState<QuizSessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      toast.error('ID da sessão não fornecido');
      navigate('/quiz-history');
      return;
    }

    fetchQuizSession();
  }, [sessionId]);

  const fetchQuizSession = async () => {
    try {
      console.log('🔍 Fetching quiz session:', sessionId);
      
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select(`
          *,
          resumos!inner(
            custom_name,
            uploads!inner(
              arquivo_original_nome
            )
          )
        `)
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('❌ Error fetching quiz session:', error);
        throw error;
      }

      if (!data) {
        toast.error('Sessão de quiz não encontrada');
        navigate('/quiz-history');
        return;
      }

      const resumoTitulo = data.resumos?.custom_name || 
                          data.resumos?.uploads?.arquivo_original_nome || 
                          'Resumo sem título';

      // Parse questions_data safely with proper type handling
      let questionsData: QuizQuestion[] = [];
      try {
        if (typeof data.questions_data === 'string') {
          questionsData = JSON.parse(data.questions_data);
        } else if (Array.isArray(data.questions_data)) {
          // Convert from Json type to QuizQuestion[] through unknown
          questionsData = (data.questions_data as unknown) as QuizQuestion[];
        } else {
          console.warn('Invalid questions_data format:', data.questions_data);
          questionsData = [];
        }
      } catch (parseError) {
        console.error('Error parsing questions_data:', parseError);
        questionsData = [];
      }

      const sessionData: QuizSessionData = {
        id: data.id,
        quiz_title: data.quiz_title,
        total_questions: data.total_questions,
        correct_answers: data.correct_answers,
        completion_time_seconds: data.completion_time_seconds || 0,
        created_at: data.created_at,
        questions_data: questionsData,
        resumo_titulo: resumoTitulo
      };

      setQuizData(sessionData);
      console.log('✅ Quiz session loaded:', sessionData);
    } catch (error) {
      console.error('❌ Error loading quiz session:', error);
      toast.error('Erro ao carregar dados do quiz');
      navigate('/quiz-history');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => navigate('/quiz-history');

  if (loading) {
    return <QuizHistoryViewLoading />;
  }

  if (!quizData) {
    return <QuizHistoryViewEmpty />;
  }

  const percentage = Math.round((quizData.correct_answers / quizData.total_questions) * 100);

  return (
    <PageLayout>
      <div className="space-y-6">
        <QuizHistoryViewHeader onBack={handleGoBack} />

        <QuizHistoryViewSummary
          quizTitle={quizData.quiz_title}
          correctAnswers={quizData.correct_answers}
          totalQuestions={quizData.total_questions}
          percentage={percentage}
          completionTime={quizData.completion_time_seconds}
          createdAt={quizData.created_at}
          resumoTitulo={quizData.resumo_titulo || ''}
        />

        <QuizHistoryViewQuestions questions={quizData.questions_data} />
      </div>
    </PageLayout>
  );
};

export default QuizHistoryView;
