
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageLayout from '@/components/navigation/PageLayout';
import QuizPlay from '@/components/QuizPlay';
import QuizLoader from '@/components/quiz/QuizLoader';
import QuizGenerator from '@/components/quiz/QuizGenerator';
import { useQuiz } from '@/hooks/useQuiz';
import { useSummary } from '@/hooks/useSummary';

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [resumo, setResumo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  const { getResumoById } = useSummary();
  const { quizzes, loading: quizLoading, generating, fetchQuizzes, generateQuiz } = useQuiz(id || '');

  console.log('📍 Quiz page - ID:', id);

  // Load summary and check for existing quiz
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        console.error('❌ No summary ID provided');
        toast.error('ID do resumo não fornecido');
        navigate('/my-summaries');
        return;
      }

      try {
        setIsLoading(true);
        console.log('🔍 Loading summary:', id);
        
        // Load summary
        const resumoData = await getResumoById(id);
        
        if (!resumoData) {
          console.error('❌ Summary not found');
          toast.error('Resumo não encontrado');
          navigate('/my-summaries');
          return;
        }
        
        console.log('📄 Summary loaded:', resumoData.id);
        setResumo(resumoData);

        // Check for existing quiz
        console.log('🎯 Checking for existing quiz...');
        await fetchQuizzes();
        
        setInitialized(true);
        
      } catch (error) {
        console.error('❌ Error loading data:', error);
        toast.error('Erro ao carregar dados');
        navigate('/my-summaries');
      } finally {
        setIsLoading(false);
      }
    };

    if (!initialized) {
      loadData();
    }
  }, [id, getResumoById, fetchQuizzes, navigate, initialized]);

  const handleGenerateQuiz = async () => {
    if (!resumo?.resumo_gerado) {
      toast.error('Resumo não carregado');
      return;
    }

    console.log('🚀 Generating quiz...');
    const success = await generateQuiz(resumo.resumo_gerado);
    
    if (success) {
      console.log('✅ Quiz generated successfully');
      toast.success('Quiz gerado com sucesso!');
    }
  };

  const handleQuizComplete = (result: any) => {
    console.log('🏆 Quiz completed:', result);
    toast.success(`Quiz concluído! Você acertou ${result.correctAnswers} de ${result.totalQuestions} questões.`);
  };

  const handleBack = () => {
    if (id) {
      navigate(`/resumo/${id}`);
    } else {
      navigate('/my-summaries');
    }
  };

  console.log('🎯 Quiz state:', { 
    hasQuizzes: quizzes.length > 0, 
    questionsCount: quizzes.length,
    isLoading, 
    generating,
    quizLoading,
    initialized
  });

  // Loading state
  if (isLoading || !initialized) {
    console.log('⏳ Showing loading state');
    return (
      <QuizLoader 
        message="🔍 Carregando..."
        description="Verificando quiz disponível"
      />
    );
  }

  // Generating state
  if (generating) {
    console.log('🔄 Showing generating state');
    return (
      <QuizLoader 
        message="🧠 Gerando quiz..."
        description="Criando questões personalizadas"
      />
    );
  }

  // Show quiz if available
  if (quizzes && quizzes.length > 0) {
    console.log('✅ Showing quiz with', quizzes.length, 'questions');
    const quizData = {
      resumo_id: id!,
      questoes: quizzes,
      titulo: `Quiz - ${quizzes.length} questões`
    };
    
    return (
      <PageLayout>
        <QuizPlay quiz={quizData} onComplete={handleQuizComplete} />
      </PageLayout>
    );
  }

  // No quiz - show generation option
  console.log('❌ No quiz found, showing generator');
  return (
    <QuizGenerator 
      resumoId={id}
      onGenerateQuiz={handleGenerateQuiz}
      isGenerating={generating}
      onBack={handleBack}
    />
  );
};

export default Quiz;
