
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, XCircle } from 'lucide-react';
import { useQuiz } from '@/hooks/useQuiz';
import { useSummary } from '@/hooks/useSummary';
import { toast } from 'sonner';
import PageLayout from '@/components/navigation/PageLayout';
import QuizPlay from '@/components/QuizPlay';

const Quiz = () => {
  const { resumoId } = useParams<{ resumoId: string }>();
  const navigate = useNavigate();
  const [hasQuiz, setHasQuiz] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumo, setResumo] = useState<any>(null);

  const {
    quizzes,
    loading,
    fetchQuizzes,
    generateQuiz
  } = useQuiz(resumoId || '');

  const { getResumoById } = useSummary();

  // Buscar resumo primeiro
  useEffect(() => {
    if (resumoId) {
      const loadResumo = async () => {
        try {
          const resumoData = await getResumoById(resumoId);
          setResumo(resumoData);
        } catch (error) {
          console.error('Erro ao carregar resumo:', error);
          toast.error('Erro ao carregar resumo');
        }
      };
      loadResumo();
    }
  }, [resumoId, getResumoById]);

  // Generate or fetch quiz on component mount
  useEffect(() => {
    if (resumoId && resumo) {
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
            setIsGenerating(true);
            
            // Usar o conteúdo real do resumo
            const success = await generateQuiz(resumo.resumo_gerado);
            
            if (success) {
              // Recarregar quizzes após gerar
              const newQuizzes = await fetchQuizzes();
              if (newQuizzes && newQuizzes.length > 0) {
                setQuizData({
                  resumo_id: resumoId,
                  questoes: newQuizzes
                });
                setHasQuiz(true);
                toast.success('Quiz gerado com sucesso!');
              }
            } else {
              toast.error('Erro ao gerar quiz. Tente novamente.');
            }
            setIsGenerating(false);
          }
        } catch (error) {
          console.error('❌ Error loading/generating quiz:', error);
          toast.error('Erro ao carregar quiz');
          setIsGenerating(false);
        }
      };

      loadOrGenerateQuiz();
    }
  }, [resumoId, resumo, fetchQuizzes, generateQuiz]);

  const handleQuizComplete = (sessionResult: any) => {
    console.log('🏆 Quiz completed with result:', sessionResult);
    toast.success('Quiz concluído com sucesso!');
  };

  if (loading || isGenerating) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>{isGenerating ? 'Gerando quiz estilo ENEM/Ari de Sá...' : 'Carregando quiz...'}</p>
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
              <div className="space-y-2">
                <Button 
                  onClick={async () => {
                    if (resumo) {
                      setIsGenerating(true);
                      try {
                        const success = await generateQuiz(resumo.resumo_gerado);
                        if (success) {
                          const newQuizzes = await fetchQuizzes();
                          if (newQuizzes && newQuizzes.length > 0) {
                            setQuizData({
                              resumo_id: resumoId,
                              questoes: newQuizzes
                            });
                            setHasQuiz(true);
                            toast.success('Quiz gerado com sucesso!');
                          }
                        }
                      } catch (error) {
                        console.error('Erro ao gerar quiz:', error);
                        toast.error('Erro ao gerar quiz');
                      }
                      setIsGenerating(false);
                    }
                  }}
                  className="w-full mb-2"
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Gerando...' : 'Tentar Gerar Quiz Novamente'}
                </Button>
                <Button onClick={() => navigate('/my-summaries')} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar aos Resumos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return <QuizPlay quiz={quizData} onComplete={handleQuizComplete} />;
};

export default Quiz;
