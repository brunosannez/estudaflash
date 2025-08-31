import React, { useEffect, Suspense, startTransition } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import PageLayout from '@/components/navigation/PageLayout';
import QuizLoader from '@/components/quiz/QuizLoader';
import QuizGenerator from '@/components/quiz/QuizGenerator';
import QuizSuspenseWrapper from '@/components/quiz/QuizSuspenseWrapper';
import { useQuizPageState } from '@/hooks/quiz/useQuizPageState';
import { useOptimizedQuizDataLoader } from '@/hooks/quiz/useOptimizedQuizDataLoader';
import { Button } from '@/components/ui/button';
import { Settings, BarChart3 } from 'lucide-react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Lazy load components to prevent concurrent loading issues
const SimplifiedQuizPlay = React.lazy(() => import('@/components/quiz/SimplifiedQuizPlay'));

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const {
    resumo,
    quizzes,
    isLoading,
    generating,
    error,
    initialized,
    setResumo,
    setQuizzes,
    setLoading,
    setGenerating,
    setError,
    setInitialized
  } = useQuizPageState();

  const { loadQuizData, generateQuiz, forceRegenerateQuiz } = useOptimizedQuizDataLoader();

  // Check if this is a resume operation or auto-generate
  const sessionId = searchParams.get('session');
  const resumeMode = searchParams.get('resume') === 'true';
  const showDashboard = searchParams.get('dashboard') === 'true';
  const autoGenerate = searchParams.get('autoGenerate') === 'true';

  console.log('📍 Quiz page rendered:', { 
    id, 
    sessionId, 
    resumeMode,
    initialized,
    isLoading
  });

  // Load data once on mount with startTransition to avoid synchronous updates
  useEffect(() => {
    if (!id) {
      console.error('❌ No summary ID provided');
      toast.error('ID do resumo não fornecido');
      navigate('/my-summaries');
      return;
    }

    if (initialized) return;

    const loadData = async () => {
      try {
        startTransition(() => {
          setLoading(true);
          setError(null);
        });
        
        const data = await loadQuizData(id);
        
        startTransition(() => {
          setResumo(data.resumo);
          setQuizzes(data.quizzes);
          setInitialized(true);
          setLoading(false);
        });

        // Auto-generate quiz if requested and no valid questions exist
        if (autoGenerate && data.quizzes.length < 5 && data.resumo) {
          console.log('🎯 Auto-generating quiz as requested...');
          setTimeout(() => handleGenerateQuiz(), 500);
        }
        
      } catch (error) {
        console.error('❌ Error loading data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar dados do quiz';
        
        startTransition(() => {
          if (errorMessage.includes('não encontrado')) {
            toast.error('Resumo não encontrado');
            navigate('/my-summaries');
          } else {
            setError(errorMessage);
            toast.error(errorMessage);
          }
          setLoading(false);
        });
      }
    };

    loadData();
  }, [id, initialized, loadQuizData, navigate, setResumo, setQuizzes, setLoading, setError, setInitialized]);

  const handleGenerateQuiz = async (forceRegenerate = false) => {
    if (!resumo || !id) return;

    // For force regeneration, always proceed
    if (!forceRegenerate) {
      // Check if we have enough valid quiz questions
      if (quizzes.length >= 5) {
        console.warn('⚠️ Quiz already has enough valid questions');
        toast.warning('Este resumo já possui um quiz completo!');
        return;
      }
    }

    if (generating) return;

    try {
      startTransition(() => {
        setGenerating(true);
      });
      
      const newQuizzes = forceRegenerate 
        ? await forceRegenerateQuiz(resumo, id)
        : await generateQuiz(resumo, id);
      
      startTransition(() => {
        setQuizzes(newQuizzes);
        setGenerating(false);
      });
    } catch (error) {
      console.error('❌ Quiz generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar quiz. Tente novamente.';
      
      startTransition(() => {
        setGenerating(false);
      });
      
      toast.error(errorMessage);
    }
  };

  const handleRegenerateQuiz = () => handleGenerateQuiz(true);

  const handleQuizComplete = (result: any) => {
    console.log('🏆 Quiz completed with result:', result);
    toast.success(`Quiz concluído! Você acertou ${result.correctAnswers} de ${result.totalQuestions} questões.`);
    navigate('/quiz-history');
  };

  const handleBack = () => {
    console.log('⬅️ Navigating back to quiz history');
    navigate('/quiz-history');
  };

  // Show loading while data loads
  if (isLoading) {
    console.log('⏳ Showing loading state');
    return (
      <QuizLoader 
        message="🔍 Carregando dados do quiz..."
        description="Verificando quiz e resumo disponível"
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md mx-4">
            <div className="text-4xl md:text-6xl mb-4">😔</div>
            <h2 className="text-lg md:text-xl font-bold mb-2 text-gray-800">Erro</h2>
            <p className="text-sm md:text-base text-gray-600 mb-4">{error}</p>
            <button 
              onClick={handleBack}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm md:text-base"
            >
              Voltar ao Histórico
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show generating state
  if (generating) {
    console.log('🔄 Showing quiz generation state');
    return (
      <QuizLoader 
        message="🧠 Gerando quiz..."
        description="Criando questões personalizadas (isso pode levar alguns segundos)"
      />
    );
  }

  // Show enhanced dashboard if requested - temporarily disabled to fix suspense issues
  if (showDashboard) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard de Quiz</h1>
            <Button onClick={handleBack} variant="outline">
              Voltar
            </Button>
          </div>
          <div className="text-center p-8">
            <p className="text-gray-600">Dashboard em manutenção. Use o quiz simplificado por enquanto.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show quiz if we have questions
  if (quizzes && quizzes.length > 0) {
    console.log('✅ Showing quiz with', quizzes.length, 'questions');
    const quizData = {
      resumo_id: id!,
      questoes: quizzes,
      titulo: `Quiz - ${quizzes.length} questões`
    };
    
    return (
      <QuizSuspenseWrapper 
        fallbackMessage="Carregando quiz..." 
        fallbackDescription="Preparando questões..."
      >
        <SimplifiedQuizPlay 
          quiz={quizData} 
          onComplete={handleQuizComplete}
          sessionId={sessionId}
          resumeMode={resumeMode}
        />
      </QuizSuspenseWrapper>
    );
  }

  // No quiz found or insufficient questions - show generation option
  const hasInsufficient = quizzes.length > 0 && quizzes.length < 5;
  console.log(hasInsufficient ? '⚠️ Insufficient valid questions, showing generator' : '❌ No quiz found, showing generator');
  
  return (
    <div className="space-y-4">
      <QuizGenerator 
        resumoId={id}
        resumoContent={resumo?.resumo_gerado}
        onGenerateQuiz={() => handleGenerateQuiz()}
        isGenerating={generating}
        onBack={handleBack}
        hasExistingQuiz={false}
      />
      
      {hasInsufficient && (
        <div className="flex justify-center">
          <Button 
            onClick={handleRegenerateQuiz}
            variant="outline"
            disabled={generating}
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            🔄 Regenerar Quiz Completo (ENEM)
          </Button>
        </div>
      )}
    </div>
  );
};

export default Quiz;