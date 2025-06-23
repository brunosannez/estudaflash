
import React, { useState } from 'react';
import { useEnhancedQuizSession } from '@/hooks/useEnhancedQuizSession';
import { toast } from 'sonner';

interface EnhancedQuizGameState {
  currentIndex: number;
  selectedAnswer: number | null;
  showResult: boolean;
  isCorrect: boolean;
  score: number;
  gameFinished: boolean;
}

interface EnhancedQuizGameManagerProps {
  quiz: {
    resumo_id: string;
    questoes: any[];
  };
  sessionId?: string;
  resumeMode?: boolean;
  onGameFinish: (finalScore: number) => void;
  children: (gameState: EnhancedQuizGameState & {
    currentQuestion: any;
    isLastQuestion: boolean;
    handleAnswerSelect: (answerIndex: number) => void;
    handleConfirmAnswer: () => Promise<void>;
    handleNextQuestion: () => Promise<void>;
  }) => React.ReactNode;
}

const EnhancedQuizGameManager = ({ 
  quiz, 
  sessionId,
  resumeMode = false,
  onGameFinish, 
  children
}: EnhancedQuizGameManagerProps) => {
  const { sessionData, startNewSession, resumeSession, saveQuestionResponse, completeSession } = useEnhancedQuizSession();
  
  const [gameState, setGameState] = useState<EnhancedQuizGameState>({
    currentIndex: 0,
    selectedAnswer: null,
    showResult: false,
    isCorrect: false,
    score: 0,
    gameFinished: false
  });

  const [sessionInitialized, setSessionInitialized] = useState(false);

  // Initialize session
  React.useEffect(() => {
    const initializeSession = async () => {
      if (sessionInitialized) return;

      try {
        if (resumeMode && sessionId) {
          console.log('🔄 Initializing resume session:', sessionId);
          const session = await resumeSession(sessionId);
          if (session && sessionData) {
            setGameState(prev => ({
              ...prev,
              currentIndex: sessionData.currentQuestionIndex,
              score: sessionData.respostas.filter(r => r.is_correct).length
            }));
          }
        } else {
          console.log('🚀 Starting new session');
          await startNewSession(quiz.resumo_id, '', quiz.questoes);
        }
        setSessionInitialized(true);
      } catch (error) {
        console.error('❌ Error initializing session:', error);
        toast.error('Erro ao inicializar quiz');
      }
    };

    initializeSession();
  }, [quiz, sessionId, resumeMode, sessionInitialized]);

  if (!sessionData || !sessionInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Inicializando quiz...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = sessionData.questoes[gameState.currentIndex];
  const isLastQuestion = gameState.currentIndex === sessionData.questoes.length - 1;

  console.log('🎯 Enhanced QuizGameManager - Current state:', {
    index: gameState.currentIndex,
    pergunta: currentQuestion?.pergunta,
    selectedAnswer: gameState.selectedAnswer,
    score: gameState.score,
    gameFinished: gameState.gameFinished,
    sessionId: sessionData.sessionId
  });

  const handleAnswerSelect = (answerIndex: number) => {
    if (gameState.showResult) return;
    console.log('📝 Answer selected:', answerIndex);
    setGameState(prev => ({ ...prev, selectedAnswer: answerIndex }));
  };

  const handleConfirmAnswer = async () => {
    if (gameState.selectedAnswer === null || !currentQuestion) return;

    console.log('✅ Confirming answer:', {
      selectedAnswer: gameState.selectedAnswer,
      correctAnswer: currentQuestion.correta,
      isCorrect: gameState.selectedAnswer === currentQuestion.correta
    });

    const localIsCorrect = gameState.selectedAnswer === currentQuestion.correta;
    console.log('🔍 Local verification:', localIsCorrect);

    // Save response to database
    try {
      await saveQuestionResponse(currentQuestion.id, gameState.selectedAnswer, localIsCorrect);
      console.log('💾 Response saved to database');
    } catch (error) {
      console.error('⚠️ Error saving response to database:', error);
      toast.error('Erro ao salvar resposta');
    }
    
    // Update game state
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
      
      const sessionResult = await completeSession();
      
      if (sessionResult) {
        console.log('✅ Quiz session completed successfully:', sessionResult);
        setGameState(prev => ({ ...prev, gameFinished: true }));
        onGameFinish(gameState.score);
      } else {
        console.error('❌ Failed to complete quiz session');
        toast.error('Erro ao finalizar quiz');
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

export default EnhancedQuizGameManager;
