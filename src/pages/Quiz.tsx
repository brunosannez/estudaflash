
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
  const [isLoading, setIsLoading] = useState(true);

  const {
    quizzes,
    loading: quizLoading,
    fetchQuizzes,
    generateQuiz
  } = useQuiz(resumoId || '');

  const { getResumoById } = useSummary();

  // Buscar resumo primeiro
  useEffect(() => {
    const loadResumo = async () => {
      if (!resumoId) {
        console.error('❌ ID do resumo não fornecido');
        setIsLoading(false);
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

  // Verificar quiz existente após carregar o resumo
  useEffect(() => {
    const checkExistingQuiz = async () => {
      if (!resumoId || !resumo) {
        return;
      }

      try {
        console.log('🎯 Verificando quiz existente para resumo:', resumoId);
        const existingQuizzes = await fetchQuizzes();
        
        console.log('📊 Resultado da busca de quizzes:', existingQuizzes);
        
        if (existingQuizzes && existingQuizzes.length > 0) {
          console.log('✅ Quiz existente encontrado com', existingQuizzes.length, 'questões');
          setQuizData({
            resumo_id: resumoId,
            questoes: existingQuizzes
          });
          setHasQuiz(true);
        } else {
          console.log('❌ Nenhum quiz encontrado');
          setHasQuiz(false);
          setQuizData(null);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar quiz:', error);
        setHasQuiz(false);
        setQuizData(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingQuiz();
  }, [resumo, resumoId, fetchQuizzes]);

  const handleGenerateQuiz = async () => {
    if (!resumo) {
      toast.error('Resumo não carregado');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🚀 Iniciando geração de quiz...');
      const success = await generateQuiz(resumo.resumo_gerado);
      
      if (success) {
        console.log('✅ Quiz gerado com sucesso, recarregando...');
        
        // Aguardar um pouco para garantir que o quiz foi salvo
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Recarregar os quizzes
        const newQuizzes = await fetchQuizzes();
        console.log('🔄 Quizzes recarregados:', newQuizzes);
        
        if (newQuizzes && newQuizzes.length > 0) {
          setQuizData({
            resumo_id: resumoId,
            questoes: newQuizzes
          });
          setHasQuiz(true);
          toast.success('Quiz gerado com sucesso!');
        } else {
          console.error('❌ Quiz gerado mas não foi possível carregar as questões');
          toast.error('Quiz gerado mas houve problema ao carregar. Tente recarregar a página.');
        }
      } else {
        toast.error('Erro ao gerar quiz. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar quiz:', error);
      toast.error('Erro ao gerar quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuizComplete = (sessionResult: any) => {
    console.log('🏆 Quiz completado com resultado:', sessionResult);
    toast.success('Quiz concluído com sucesso!');
  };

  // Loading state
  if (isLoading || quizLoading || !resumo) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                🔍 Verificando quiz...
              </p>
              <p className="text-sm text-gray-500">
                Aguarde um momento
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Generation state
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
                Criando questões contextualizadas
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Show quiz if available
  if (hasQuiz && quizData) {
    return (
      <PageLayout>
        <QuizPlay quiz={quizData} onComplete={handleQuizComplete} />
      </PageLayout>
    );
  }

  // No quiz found - show generation option
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
