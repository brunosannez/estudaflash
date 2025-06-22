
import React from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/navigation/PageLayout';
import QuizPlay from '@/components/QuizPlay';
import QuizLoader from '@/components/quiz/QuizLoader';
import QuizGenerator from '@/components/quiz/QuizGenerator';
import { useQuizData } from '@/hooks/quiz/useQuizData';

const Quiz = () => {
  const { resumoId } = useParams<{ resumoId: string }>();
  
  const {
    quizData,
    isLoading,
    isGenerating,
    handleGenerateQuiz,
    handleQuizComplete
  } = useQuizData(resumoId);

  // Loading state
  if (isLoading) {
    return (
      <QuizLoader 
        message="🔍 Carregando..."
        description="Verificando quiz disponível"
      />
    );
  }

  // Generating state
  if (isGenerating) {
    return (
      <QuizLoader 
        message="🧠 Gerando quiz..."
        description="Criando questões personalizadas"
      />
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
    <QuizGenerator 
      onGenerateQuiz={handleGenerateQuiz}
      isGenerating={isGenerating}
    />
  );
};

export default Quiz;
