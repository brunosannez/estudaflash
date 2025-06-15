
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QuizQuestion, QuizSessionResult } from '@/types/quizGame';

export const useQuizDatabase = () => {
  const { toast } = useToast();

  const loadQuestions = async (resumoId: string): Promise<QuizQuestion[]> => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('resumo_id', resumoId)
        .order('data_criacao', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map(quiz => ({
          id: quiz.id,
          pergunta: quiz.pergunta,
          alternativas: quiz.alternativas as string[],
          correta: quiz.correta,
          explicacao: quiz.explicacao,
        }));
      }

      return [];
    } catch (error) {
      console.error('Erro ao carregar quiz:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar as perguntas do quiz',
        variant: 'destructive',
      });
      return [];
    }
  };

  const saveQuizAnswer = async (questionId: string, selectedAnswer: number, isCorrect: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('quiz_respostas').insert({
        user_id: user.id,
        quiz_id: questionId,
        resposta_selecionada: selectedAnswer,
        acertou: isCorrect,
      });
    } catch (error) {
      console.error('Erro ao registrar resposta:', error);
    }
  };

  const analyzePerformance = (questions: QuizQuestion[], userAnswers: (number | null)[]) => {
    const wrongAnswers = questions.filter((q, index) => 
      userAnswers[index] !== null && userAnswers[index] !== q.correta
    ).map((q, index) => ({
      pergunta: q.pergunta,
      alternativa_correta: q.alternativas[q.correta],
      resposta_usuario: userAnswers[index] !== null ? q.alternativas[userAnswers[index]!] : 'Não respondida'
    }));

    const weakTopics = wrongAnswers;
    
    const suggestions = [
      'Revise os conceitos que você errou',
      'Pratique mais exercícios similares',
      'Releia o resumo com atenção nos pontos destacados'
    ];

    return {
      wrongAnswers,
      suggestions,
      weakTopics
    };
  };

  const saveQuizSession = async (
    resumoId: string,
    questions: QuizQuestion[],
    userAnswers: (number | null)[],
    score: number,
    completionTime: number
  ): Promise<QuizSessionResult | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const quizTitle = `Quiz - ${questions.length} perguntas`;
      const questionsData = questions.map((q, index) => ({
        id: q.id,
        pergunta: q.pergunta,
        alternativas: q.alternativas,
        correta: q.correta,
        explicacao: q.explicacao,
        resposta_usuario: userAnswers[index],
        acertou: userAnswers[index] === q.correta
      }));

      const { data: sessionData, error } = await supabase.from('quiz_sessions').insert({
        user_id: user.id,
        resumo_id: resumoId,
        quiz_title: quizTitle,
        total_questions: questions.length,
        correct_answers: score,
        completion_time_seconds: completionTime,
        questions_data: {
          questions: questions.map(q => ({
            id: q.id,
            pergunta: q.pergunta,
            alternativas: q.alternativas,
            correta: q.correta,
            explicacao: q.explicacao
          })),
          userAnswers,
        },
      }).select().single();

      if (error) throw error;

      const accuracy = (score / questions.length) * 100;
      const performance = analyzePerformance(questions, userAnswers);
      
      return {
        id: sessionData.id,
        quizTitle,
        totalQuestions: questions.length,
        correctAnswers: score,
        accuracy: Math.round(accuracy),
        completionTime,
        bonusXP: 0, // Will be calculated by scoring hook
        totalXP: 0, // Will be calculated by scoring hook
        questions,
        userAnswers,
        performance,
        questionsData
      };
    } catch (error) {
      console.error('Erro ao salvar sessão do quiz:', error);
      return null;
    }
  };

  return {
    loadQuestions,
    saveQuizAnswer,
    saveQuizSession,
  };
};
