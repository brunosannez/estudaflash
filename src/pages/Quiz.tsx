
import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import PageLayout from '@/components/navigation/PageLayout';
import SimplifiedQuizPlay from '@/components/quiz/SimplifiedQuizPlay';
import QuizLoader from '@/components/quiz/QuizLoader';
import QuizGenerator from '@/components/quiz/QuizGenerator';
import { useQuizPageState } from '@/hooks/quiz/useQuizPageState';
import { useQuizDataLoader } from '@/hooks/quiz/useQuizDataLoader';

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

  const { loadQuizData, generateQuiz } = useQuizDataLoader();

  // Check if this is a resume operation
  const sessionId = searchParams.get('session');
  const resumeMode = searchParams.get('resume') === 'true';

  console.log('📍 Quiz page rendered:', { 
    id, 
    sessionId, 
    resumeMode,
    initialized,
    isLoading
  });

  // Load data once on mount
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
        setLoading(true);
        setError(null);
        
        const data = await loadQuizData(id);
        
        setResumo(data.resumo);
        setQuizzes(data.quizzes);
        setInitialized(true);
        
      } catch (error) {
        console.error('❌ Error loading data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar dados do quiz';
        
        if (errorMessage.includes('não encontrado')) {
          toast.error('Resumo não encontrado');
          navigate('/my-summaries');
        } else {
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, initialized, loadQuizData, navigate, setResumo, setQuizzes, setLoading, setError, setInitialized]);

  const handleGenerateQuiz = async () => {
    if (!resumo || !id) return;

    // Check if quiz already exists
    if (quizzes.length > 0) {
      console.warn('⚠️ Quiz already exists, preventing duplicate generation');
      toast.warning('Este resumo já possui um quiz!');
      return;
    }

    if (generating) return;

    try {
      setGenerating(true);
      const newQuizzes = await generateQuiz(resumo, id);
      setQuizzes(newQuizzes);
    } catch (error) {
      console.error('❌ Quiz generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar quiz. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

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

  // Show quiz if we have questions
  if (quizzes && quizzes.length > 0) {
    console.log('✅ Showing quiz with', quizzes.length, 'questions');
    const quizData = {
      resumo_id: id!,
      questoes: quizzes,
      titulo: `Quiz - ${quizzes.length} questões`
    };
    
    return (
      <SimplifiedQuizPlay 
        quiz={quizData} 
        onComplete={handleQuizComplete}
        sessionId={sessionId}
        resumeMode={resumeMode}
      />
    );
  }

  // No quiz found - show generation option
  console.log('❌ No quiz found, showing generator');
  return (
    <QuizGenerator 
      resumoId={id}
      resumoContent={resumo?.resumo_gerado}
      onGenerateQuiz={handleGenerateQuiz}
      isGenerating={generating}
      onBack={handleBack}
      hasExistingQuiz={false}
    />
  );
};

export default Quiz;
