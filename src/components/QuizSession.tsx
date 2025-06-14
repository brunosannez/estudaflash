
import { useState } from 'react';
import QuizPlay from './QuizPlay';

interface QuizSessionProps {
  quizzes: any[];
  onComplete: () => void;
}

const QuizSession = ({ quizzes, onComplete }: QuizSessionProps) => {
  // Convert all individual quizzes to a single quiz with multiple questions
  const combinedQuiz = {
    titulo: `Quiz Completo`,
    resumo_id: quizzes[0]?.resumo_id || '',
    questoes: quizzes.map((quiz, index) => ({
      id: quiz.id,
      pergunta: quiz.pergunta,
      alternativas: quiz.alternativas,
      resposta_correta: quiz.correta,
      explicacao: quiz.explicacao || ''
    }))
  };

  if (quizzes.length === 0) {
    return null;
  }

  return (
    <QuizPlay 
      quiz={combinedQuiz} 
      onComplete={onComplete} 
    />
  );
};

export default QuizSession;
