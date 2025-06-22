
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, XCircle } from 'lucide-react';
import { useQuiz } from '@/hooks/useQuiz';
import { toast } from 'sonner';
import PageLayout from '@/components/navigation/PageLayout';
import QuizPlay from '@/components/QuizPlay';

const Quiz = () => {
  const { resumoId } = useParams<{ resumoId: string }>();
  const navigate = useNavigate();
  const [hasQuiz, setHasQuiz] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);

  const {
    quizzes,
    loading,
    fetchQuizzes,
    generateQuiz
  } = useQuiz(resumoId || '');

  // Generate or fetch quiz on component mount
  useEffect(() => {
    if (resumoId) {
      const loadOrGenerateQuiz = async () => {
        try {
          console.log('🎯 Loading quiz for resumo:', resumoId);
          const existingQuizzes = await fetchQuizzes();
          
          if (existingQuizzes && existingQuizzes.length > 0) {
            console.log('✅ Found existing quiz with', existingQuizzes.length, 'questions');
            setQuizData({
              resumo_id: resumoId,
              questoes: existingQuizzes
            });
            setHasQuiz(true);
          } else {
            console.log('🔄 No existing quiz found, generating new one...');
            // Buscar o conteúdo do resumo para gerar o quiz
            const success = await generateQuiz("Conteúdo do resumo - será usado pela edge function");
            if (success) {
              // Recarregar quizzes após gerar
              const newQuizzes = await fetchQuizzes();
              if (newQuizzes && newQuizzes.length > 0) {
                setQuizData({
                  resumo_id: resumoId,
                  questoes: newQuizzes
                });
                setHasQuiz(true);
              }
            }
          }
        } catch (error) {
          console.error('❌ Error loading/generating quiz:', error);
          toast.error('Erro ao carregar quiz');
        }
      };

      loadOrGenerateQuiz();
    }
  }, [resumoId]);

  const handleQuizComplete = (sessionResult: any) => {
    console.log('🏆 Quiz completed with result:', sessionResult);
    toast.success('Quiz concluído com sucesso!');
    // Navegar para uma página de resultado ou histórico se desejar
    // navigate('/quiz-history');
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Gerando quiz estilo ENEM/Ari de Sá...</p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (!hasQuiz || !quizData) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="py-8 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Erro ao carregar quiz</h2>
              <p className="text-gray-600 mb-4">
                Não foi possível gerar o quiz para este resumo.
              </p>
              <Button onClick={() => navigate('/my-summaries')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Resumos
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Usar o componente QuizPlay que já tem gamificação implementada
  return <QuizPlay quiz={quizData} onComplete={handleQuizComplete} />;
};

export default Quiz;
