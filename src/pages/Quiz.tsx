
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
  const [hasCheckedData, setHasCheckedData] = useState(false);
  
  const { getResumoById } = useSummary();
  const { quizzes, loading: quizLoading, generating, fetchQuizzes, generateQuiz } = useQuiz(id || '');

  console.log('📍 Quiz page rendered - ID:', id);
  console.log('🎯 Current state:', { 
    hasQuizzes: quizzes.length > 0, 
    questionsCount: quizzes.length,
    isLoading, 
    generating,
    quizLoading,
    hasCheckedData,
    resumoLoaded: !!resumo
  });

  // Load summary and quiz data
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        console.error('❌ No summary ID provided');
        toast.error('ID do resumo não fornecido');
        navigate('/my-summaries');
        return;
      }

      if (hasCheckedData) {
        console.log('ℹ️ Data already checked, skipping reload');
        return;
      }

      try {
        setIsLoading(true);
        console.log('🔍 Loading summary and quiz data for ID:', id);
        
        // Load summary first
        const resumoData = await getResumoById(id);
        
        if (!resumoData) {
          console.error('❌ Summary not found');
          toast.error('Resumo não encontrado');
          navigate('/my-summaries');
          return;
        }
        
        console.log('📄 Summary loaded successfully:', {
          id: resumoData.id,
          hasContent: !!resumoData.resumo_gerado,
          contentLength: resumoData.resumo_gerado?.length || 0
        });
        setResumo(resumoData);

        // Load existing quizzes
        console.log('🎯 Loading existing quizzes...');
        const existingQuizzes = await fetchQuizzes();
        console.log('📊 Existing quizzes loaded:', existingQuizzes.length);
        
        setHasCheckedData(true);
        
      } catch (error) {
        console.error('❌ Error loading data:', error);
        toast.error('Erro ao carregar dados do quiz');
        navigate('/my-summaries');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, getResumoById, fetchQuizzes, navigate, hasCheckedData]);

  const handleGenerateQuiz = async () => {
    if (!resumo?.resumo_gerado) {
      console.error('❌ No summary content available for quiz generation');
      toast.error('Conteúdo do resumo não disponível');
      return;
    }

    console.log('🚀 Starting quiz generation...');
    const success = await generateQuiz(resumo.resumo_gerado);
    
    if (success) {
      console.log('✅ Quiz generated successfully, refreshing data...');
      // Force refresh after successful generation
      await fetchQuizzes();
    } else {
      console.log('❌ Quiz generation failed');
    }
  };

  const handleQuizComplete = (result: any) => {
    console.log('🏆 Quiz completed with result:', result);
    toast.success(`Quiz concluído! Você acertou ${result.correctAnswers} de ${result.totalQuestions} questões.`);
  };

  const handleBack = () => {
    if (id) {
      console.log('⬅️ Navigating back to summary:', id);
      navigate(`/resumo/${id}`);
    } else {
      console.log('⬅️ Navigating back to summaries');
      navigate('/my-summaries');
    }
  };

  // Show loading while initial data loads
  if (isLoading || !hasCheckedData) {
    console.log('⏳ Showing initial loading state');
    return (
      <QuizLoader 
        message="🔍 Carregando dados..."
        description="Verificando quiz e resumo disponível"
      />
    );
  }

  // Show generating state
  if (generating) {
    console.log('🔄 Showing quiz generation state');
    return (
      <QuizLoader 
        message="🧠 Gerando quiz..."
        description="Criando questões personalizadas baseadas no seu resumo"
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
      <PageLayout>
        <QuizPlay quiz={quizData} onComplete={handleQuizComplete} />
      </PageLayout>
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
    />
  );
};

export default Quiz;
