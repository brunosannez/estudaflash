
import React from "react";
import { useNavigate } from "react-router-dom";
import QuizSessionManager from "@/components/quiz/QuizSessionManager";
import QuizGameManager from "@/components/quiz/QuizGameManager";
import QuizGameplay from "@/components/quiz/QuizGameplay";
import QuizResultScreen from "@/components/quiz/QuizResultScreen";

interface QuizPlayProps {
  quiz: {
    resumo_id: string;
    questoes: any[];
    titulo?: string;
  };
  onComplete: (result: any) => void;
}

const QuizPlay = ({ quiz, onComplete }: QuizPlayProps) => {
  const navigate = useNavigate();
  const [gameFinished, setGameFinished] = React.useState(false);
  const [finalScore, setFinalScore] = React.useState(0);

  const handleGameFinish = (score: number) => {
    setFinalScore(score);
    setGameFinished(true);
  };

  const handleSessionComplete = (sessionResult: any) => {
    console.log('✅ Quiz session saved successfully:', sessionResult);
    
    const finalResult = {
      totalQuestions: quiz.questoes.length,
      correctAnswers: finalScore,
      accuracy: Math.round((finalScore / quiz.questoes.length) * 100),
      sessionId: sessionResult.sessionId
    };
    
    console.log('🏆 Quiz completed with final result:', finalResult);
    onComplete(finalResult);
  };

  const handleRestart = () => {
    window.location.reload();
  };

  const handleBack = () => {
    navigate('/my-summaries');
  };

  if (gameFinished) {
    return (
      <QuizResultScreen 
        score={finalScore}
        totalQuestions={quiz.questoes.length}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <QuizSessionManager
      quiz={quiz}
      onSessionStart={() => {}}
      onSessionComplete={handleSessionComplete}
    >
      {(sessionMethods) => (
        <QuizGameManager
          quiz={quiz}
          onGameFinish={handleGameFinish}
          sessionMethods={sessionMethods}
        >
          {(gameState) => (
            <QuizGameplay
              currentQuestion={gameState.currentQuestion}
              currentIndex={gameState.currentIndex}
              totalQuestions={quiz.questoes.length}
              selectedAnswer={gameState.selectedAnswer}
              showResult={gameState.showResult}
              isCorrect={gameState.isCorrect}
              isLastQuestion={gameState.isLastQuestion}
              onAnswerSelect={gameState.handleAnswerSelect}
              onConfirmAnswer={gameState.handleConfirmAnswer}
              onNextQuestion={gameState.handleNextQuestion}
              onBack={handleBack}
            />
          )}
        </QuizGameManager>
      )}
    </QuizSessionManager>
  );
};

export default QuizPlay;
