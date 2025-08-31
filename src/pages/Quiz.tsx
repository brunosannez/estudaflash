import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import PageLayout from '@/components/navigation/PageLayout';
import QuizLoader from '@/components/quiz/QuizLoader';
import QuizGenerator from '@/components/quiz/QuizGenerator';
import QuizGameEngine from '@/components/quiz/QuizGameEngine';
import { useIntelligentQuizGenerator } from '@/hooks/quiz/useIntelligentQuizGenerator';
import { summaryDataService } from '@/services/summaryDataService';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [resumo, setResumo] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const { 
    loading: generatorLoading, 
    analyzing, 
    generating, 
    generateIntelligentQuiz,
    checkExistingQuiz
  } = useIntelligentQuizGenerator();

  // Check if this is auto-generate mode
  const autoGenerate = searchParams.get('autoGenerate') === 'true';
  const sessionId = searchParams.get('session');

  // Load quiz data on mount
  useEffect(() => {
    if (!id) {
      toast.error('ID do resumo não fornecido');
      navigate('/my-summaries');
      return;
    }

    loadQuizData();
  }, [id, navigate]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading quiz data for ID:', id);

      // Load summary
      const resumoData = await summaryDataService.getResumoById(id!);
      if (!resumoData) {
        throw new Error('Resumo não encontrado');
      }

      setResumo(resumoData);
      console.log('📄 Summary loaded successfully');

      // Check for existing quiz questions
      const { exists, questions: existingQuestions } = await checkExistingQuiz(id!);

      if (exists && existingQuestions.length > 0) {
        console.log('✅ Found existing quiz with', existingQuestions.length, 'questions');
        setQuestions(existingQuestions);
        if (autoGenerate) {
          // If auto-generate is requested but quiz exists, start directly
          setGameStarted(true);
        }
      } else if (autoGenerate) {
        console.log('🎯 Auto-generating quiz as requested...');
        await handleGenerateQuiz();
      }

    } catch (error) {
      console.error('❌ Error loading quiz data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar dados do quiz';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!resumo || !id) return;

    try {
      console.log('🚀 Starting intelligent quiz generation...');
      const newQuestions = await generateIntelligentQuiz(
        resumo.resumo_gerado, 
        id, 
        user?.id
      );
      
      setQuestions(newQuestions);
      setGameStarted(true);
      
    } catch (error) {
      console.error('❌ Quiz generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar quiz';
      toast.error(errorMessage);
    }
  };

  const handleQuizComplete = (result: any) => {
    console.log('🏆 Quiz completed with result:', result);
    toast.success(`Quiz concluído! Você acertou ${result.correctAnswers} de ${result.totalQuestions} questões.`);
    navigate('/quiz-history');
  };

  const handleExit = () => {
    console.log('⬅️ Exiting quiz');
    navigate('/quiz-history');
  };

  const handleBackToSummary = () => {
    navigate(`/resumo/${id}`);
  };

  // Show loading state
  if (loading) {
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
            <Button onClick={handleExit} variant="outline">
              Voltar ao Histórico
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show generating state
  if (generatorLoading) {
    const message = analyzing ? '🔍 Analisando conteúdo...' : 
                   generating ? '🧠 Gerando questões inteligentes...' : 
                   '⏳ Preparando quiz...';
    
    const description = analyzing ? 'Detectando tema e complexidade do conteúdo' :
                       generating ? 'Criando questões múltipla escolha e verdadeiro/falso' :
                       'Isso pode levar alguns segundos';

    return (
      <QuizLoader 
        message={message}
        description={description}
      />
    );
  }

  // Show quiz game if questions exist and game started
  if (questions.length > 0 && gameStarted) {
    console.log('🎮 Starting quiz game with', questions.length, 'questions');
    return (
      <QuizGameEngine
        questions={questions}
        onComplete={handleQuizComplete}
        onExit={handleExit}
        resumoId={id!}
        sessionId={sessionId}
      />
    );
  }

  // Show quiz generator if no questions or game not started
  console.log('🎯 Showing quiz generator - Questions:', questions.length);
  
  return (
    <QuizGenerator 
      resumoId={id}
      resumoContent={resumo?.resumo_gerado}
      onGenerateQuiz={handleGenerateQuiz}
      isGenerating={generatorLoading}
      onBack={handleBackToSummary}
      hasExistingQuiz={questions.length > 0}
    />
  );
};

export default Quiz;