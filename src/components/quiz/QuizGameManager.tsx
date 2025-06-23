
import React, { useState } from 'react';
import { useQuiz } from '@/hooks/useQuiz';
import { toast } from 'sonner';

interface QuizGameState {
  currentIndex: number;
  selectedAnswer: number | null;
  showResult: boolean;
  isCorrect: boolean;
  score: number;
  gameFinished: boolean;
}

interface QuizGameManagerProps {
  quiz: {
    resumo_id: string;
    questoes: any[];
  };
  onGameFinish: (finalScore: number) => void;
  children: (gameState: QuizGameState & {
    currentQuestion: any;
    isLastQuestion: boolean;
    handleAnswerSelect: (answerIndex: number) => void;
    handleConfirmAnswer: () => Promise<void>;
    handleNextQuestion: () => Promise<void>;
  }) => React.ReactNode;
  sessionMethods: {
    addResponse: (response: any) => void;
    completeSession: () => Promise<any>;
  };
}

const QuizGameManager = ({ 
  quiz, 
  onGameFinish, 
  children, 
  sessionMethods 
}: QuizGameManagerProps) => {
  const { enviarResposta } = useQuiz(quiz.resumo_id);
  
  const [gameState, setGameState] = useState<QuizGameState>({
    currentIndex: 0,
    selectedAnswer: null,
    showResult: false,
    isCorrect: false,
    score: 0,
    gameFinished: false
  });

  const currentQuestion = quiz.questoes[gameState.currentIndex];
  const isLastQuestion = gameState.currentIndex === quiz.questoes.length - 1;

  console.log('🎯 QuizGameManager - Current state:', {
    index: gameState.currentIndex,
    pergunta: currentQuestion?.pergunta,
    selectedAnswer: gameState.selectedAnswer,
    score: gameState.score,
    gameFinished: gameState.gameFinished
  });

  const handleAnswerSelect = (answerIndex: number) => {
    if (gameState.showResult) return;
    console.log('📝 Answer selected:', answerIndex);
    setGameState(prev => ({ ...prev, selectedAnswer: answerIndex }));
  };

  const handleConfirmAnswer = async () => {
    if (gameState.selectedAnswer === null) return;

    console.log('✅ Confirming answer:', {
      selectedAnswer: gameState.selectedAnswer,
      correctAnswer: currentQuestion.correta,
      isCorrect: gameState.selectedAnswer === currentQuestion.correta
    });

    // Verificar resposta localmente
    const localIsCorrect = gameState.selectedAnswer === currentQuestion.correta;
    console.log('🔍 Local verification:', localIsCorrect);

    // Enviar resposta para o servidor (para manter compatibilidade)
    try {
      const result = await enviarResposta(currentQuestion.id, gameState.selectedAnswer);
      console.log('📊 Server response:', result);
    } catch (error) {
      console.error('⚠️ Server response failed, continuing with local verification:', error);
    }
    
    // Adicionar resposta à sessão
    const responseData = {
      question_id: currentQuestion.id,
      pergunta: currentQuestion.pergunta,
      alternativas: currentQuestion.alternativas,
      resposta_correta: currentQuestion.correta,
      resposta_selecionada: gameState.selectedAnswer,
      acertou: localIsCorrect,
      explicacao: currentQuestion.explicacao
    };
    
    console.log('💾 Adding response to session:', responseData);
    sessionMethods.addResponse(responseData);
    
    // Atualizar estado do jogo
    setGameState(prev => ({
      ...prev,
      isCorrect: localIsCorrect,
      showResult: true,
      score: localIsCorrect ? prev.score + 1 : prev.score
    }));
    
    if (localIsCorrect) {
      console.log('🎉 Correct answer! New score:', gameState.score + 1);
    } else {
      console.log('❌ Incorrect answer. Score remains:', gameState.score);
    }
  };

  const handleNextQuestion = async () => {
    if (isLastQuestion) {
      console.log('🏆 Quiz completed, finalizing session...');
      
      // Completar sessão no banco de dados
      const sessionResult = await sessionMethods.completeSession();
      
      if (sessionResult) {
        console.log('✅ Quiz session saved successfully:', sessionResult);
        setGameState(prev => ({ ...prev, gameFinished: true }));
        onGameFinish(gameState.score);
      } else {
        console.error('❌ Failed to save quiz session');
        toast.error('Erro ao salvar resultado do quiz');
      }
    } else {
      console.log('➡️ Moving to next question');
      setGameState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        selectedAnswer: null,
        showResult: false,
        isCorrect: false
      }));
    }
  };

  return (
    <>
      {children({
        ...gameState,
        currentQuestion,
        isLastQuestion,
        handleAnswerSelect,
        handleConfirmAnswer,
        handleNextQuestion
      })}
    </>
  );
};

export default QuizGameManager;
