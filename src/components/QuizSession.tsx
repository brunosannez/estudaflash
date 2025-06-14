
import { useState } from 'react';
import QuizPlay from './QuizPlay';

interface QuizSessionProps {
  quizzes: any[];
  onComplete: () => void;
}

const QuizSession = ({ quizzes, onComplete }: QuizSessionProps) => {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  const handleQuizComplete = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      onComplete();
    }
  };

  if (quizzes.length === 0) {
    return null;
  }

  // Convert individual quiz format to expected format
  const currentQuiz = {
    titulo: `Quiz ${currentQuizIndex + 1}`,
    resumo_id: quizzes[currentQuizIndex].resumo_id,
    questoes: [{
      id: quizzes[currentQuizIndex].id,
      pergunta: quizzes[currentQuizIndex].pergunta,
      alternativas: quizzes[currentQuizIndex].alternativas,
      resposta_correta: quizzes[currentQuizIndex].correta
    }]
  };

  return (
    <QuizPlay 
      quiz={currentQuiz} 
      onComplete={handleQuizComplete} 
    />
  );
};

export default QuizSession;
