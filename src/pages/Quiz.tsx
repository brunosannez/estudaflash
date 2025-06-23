
import React from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/navigation/PageLayout';
import QuizPlay from '@/components/QuizPlay';
import QuizLoader from '@/components/quiz/QuizLoader';
import QuizGenerator from '@/components/quiz/QuizGenerator';
import { useQuizData } from '@/hooks/quiz/useQuizData';

const Quiz = () => {
  const { resumoId } = useParams<{ resumoId: string }>();
  
  console.log('📍 Quiz page loaded with resumoId:', resumoId);
  
  const {
    quizData,
    isLoading,
    isGenerating,
    handleGenerateQuiz,
    handleQuizComplete
  } = useQuizData(resumoId);

  console.log('🎯 Quiz state:', { 
    hasQuizData: !!quizData, 
    questionsCount: quizData?.questoes?.length || 0,
    isLoading, 
    isGenerating 
  });

  // Loading state
  if (isLoading) {
    console.log('⏳ Showing loading state');
    return (
      <QuizLoader 
        message="🔍 Carregando..."
        description="Verificando quiz disponível"
      />
    );
  }

  // Generating state
  if (isGenerating) {
    console.log('🔄 Showing generating state');
    return (
      <QuizLoader 
        message="🧠 Gerando quiz..."
        description="Criando questões personalizadas"
      />
    );
  }

  // Show quiz if available
  if (quizData && quizData.questoes && quizData.questoes.length > 0) {
    console.log('✅ Showing quiz with', quizData.questoes.length, 'questions');
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
      onGenerateQuiz={handleGenerateQuiz}
      isGenerating={isGenerating}
    />
  );
};

export default Quiz;
