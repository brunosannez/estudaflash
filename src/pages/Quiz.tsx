
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useQuiz } from '@/hooks/useQuiz';
import { useSummary } from '@/hooks/useSummary';
import { toast } from 'sonner';
import PageLayout from '@/components/navigation/PageLayout';
import QuizPlay from '@/components/QuizPlay';

const Quiz = () => {
  const { resumoId } = useParams<{ resumoId: string }>();
  const navigate = useNavigate();
  const [resumo, setResumo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);

  const { getResumoById } = useSummary();
  const { fetchQuizzes, generateQuiz } = useQuiz(resumoId || '');

  // Carregar resumo
  useEffect(() => {
    const loadResumo = async () => {
      if (!resumoId) {
        console.error('❌ ID do resumo não fornecido');
        navigate('/my-summaries');
        return;
      }

      try {
        console.log('🔍 Carregando resumo:', resumoId);
        const resumoData = await getResumoById(resumoId);
        
        if (!resumoData) {
          console.error('❌ Resumo não encontrado');
          toast.error('Resumo não encontrado');
          navigate('/my-summaries');
          return;
        }
        
        console.log('📄 Resumo carregado:', resumoData);
        setResumo(resumoData);
      } catch (error) {
        console.error('❌ Erro ao carregar resumo:', error);
        toast.error('Erro ao carregar resumo');
        navigate('/my-summaries');
      }
    };

    loadResumo();
  }, [resumoId, getResumoById, navigate]);

  // Verificar quiz existente após carregar resumo
  useEffect(() => {
    const checkQuiz = async () => {
      if (!resumo || !resumoId) {
        return;
      }

      try {
        console.log('🎯 Verificando quiz para resumo:', resumoId);
        const quizzes = await fetchQuizzes();
        
        if (quizzes && quizzes.length > 0) {
          console.log('✅ Quiz encontrado com', quizzes.length, 'questões');
          setQuizData({
            resumo_id: resumoId,
            questoes: quizzes,
            titulo: `Quiz - ${quizzes.length} questões`
          });
        } else {
          console.log('❌ Nenhum quiz encontrado');
          setQuizData(null);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar quiz:', error);
        setQuizData(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkQuiz();
  }, [resumo, resumoId, fetchQuizzes]);

  const handleGenerateQuiz = async () => {
    if (!resumo) {
      toast.error('Resumo não carregado');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🚀 Gerando quiz...');
      const success = await generateQuiz(resumo.resumo_gerado);
      
      if (success) {
        console.log('✅ Quiz gerado, recarregando...');
        
        // Aguardar e recarregar
        setTimeout(async () => {
          const newQuizzes = await fetchQuizzes();
          console.log('🔄 Quizzes recarregados:', newQuizzes);
          
          if (newQuizzes && newQuizzes.length > 0) {
            setQuizData({
              resumo_id: resumoId,
              questoes: newQuizzes,
              titulo: `Quiz - ${newQuizzes.length} questões`
            });
            toast.success('Quiz gerado com sucesso!');
          } else {
            toast.error('Erro ao carregar quiz gerado');
          }
        }, 1000);
      } else {
        toast.error('Erro ao gerar quiz');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar quiz:', error);
      toast.error('Erro ao gerar quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuizComplete = (result: any) => {
    console.log('🏆 Quiz completado:', result);
    toast.success('Quiz concluído!');
  };

  // Loading
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                🔍 Carregando...
              </p>
              <p className="text-sm text-gray-500">
                Verificando quiz disponível
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Generating
  if (isGenerating) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                🧠 Gerando quiz...
              </p>
              <p className="text-sm text-gray-500">
                Criando questões personalizadas
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Show quiz if available
  if (quizData && quizData.questoes && quizData.questoes.length > 0) {
    return (
      <PageLayout>
        <QuizPlay quiz={quizData} onComplete={handleQuizComplete} />
      </PageLayout>
    );
  }

  // No quiz - show generation option
  return (
    <PageLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-xl font-bold mb-2 text-gray-800">Nenhum quiz encontrado</h2>
            <p className="text-gray-600 mb-6">
              Este resumo ainda não possui um quiz. Vamos criar questões de múltipla escolha!
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleGenerateQuiz}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
                disabled={isGenerating}
              >
                ✨ Gerar Quiz
              </Button>
              <Button 
                onClick={() => navigate('/my-summaries')} 
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Resumos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Quiz;
