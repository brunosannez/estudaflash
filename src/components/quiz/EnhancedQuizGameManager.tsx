
import React, { useState, useCallback } from 'react';
import { useEnhancedQuizSession } from '@/hooks/useEnhancedQuizSession';
import { useGameification } from '@/hooks/useGameification';
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
  const { addXP } = useGameification();
  
  const [gameState, setGameState] = useState<EnhancedQuizGameState>({
    currentIndex: 0,
    selectedAnswer: null,
    showResult: false,
    isCorrect: false,
    score: 0,
    gameFinished: false
  });

  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  // Initialize session with improved logic
  const initializeSession = useCallback(async () => {
    if (isInitializing || sessionData) return;
    
    setIsInitializing(true);
    setInitializationError(null);
    
    try {
      console.log('🔄 Starting session initialization...', { resumeMode, sessionId, questionsCount: quiz.questoes.length });
      
      if (resumeMode && sessionId) {
        console.log('🔄 Attempting to resume session:', sessionId);
        const session = await resumeSession(sessionId);
        
        if (!session) {
          throw new Error('Sessão não encontrada ou expirada');
        }
        
        console.log('✅ Session resumed successfully');
      } else {
        console.log('🚀 Starting new session');
        const newSessionId = await startNewSession(quiz.resumo_id, '', quiz.questoes);
        
        if (!newSessionId) {
          throw new Error('Não foi possível criar nova sessão');
        }
        
        console.log('✅ New session created:', newSessionId);
      }
    } catch (error) {
      console.error('❌ Session initialization failed:', error);
      setInitializationError(error instanceof Error ? error.message : 'Erro ao inicializar quiz');
      toast.error('Erro ao inicializar quiz. Tente novamente.');
    } finally {
      setIsInitializing(false);
    }
  }, [quiz.resumo_id, quiz.questoes, sessionId, resumeMode, startNewSession, resumeSession, sessionData, isInitializing]);

  // Initialize when component mounts
  React.useEffect(() => {
    if (quiz.questoes && quiz.questoes.length > 0 && !sessionData && !isInitializing) {
      initializeSession();
    }
  }, [quiz.questoes, sessionData, isInitializing, initializeSession]);

  // Update game state when session data changes
  React.useEffect(() => {
    if (sessionData && resumeMode) {
      const resumedIndex = sessionData.currentQuestionIndex || 0;
      const resumedScore = sessionData.respostas.filter(r => r.is_correct).length;
      
      console.log('📊 Updating game state from session data:', { resumedIndex, resumedScore });
      
      setGameState(prev => ({
        ...prev,
        currentIndex: Math.max(0, Math.min(resumedIndex, sessionData.questoes.length - 1)),
        score: resumedScore
      }));
    }
  }, [sessionData, resumeMode]);

  // Show error state
  if (initializationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-bold mb-2 text-gray-800">Erro ao Carregar Quiz</h2>
          <p className="text-gray-600 mb-4">{initializationError}</p>
          <button 
            onClick={() => {
              setInitializationError(null);
              initializeSession();
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Show loading while initializing or waiting for session data
  if (isInitializing || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            {isInitializing 
              ? (resumeMode ? 'Retomando quiz...' : 'Inicializando quiz...') 
              : 'Carregando dados do quiz...'
            }
          </p>
        </div>
      </div>
    );
  }

  // Validate session data
  if (!sessionData.questoes || sessionData.questoes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❓</div>
          <h2 className="text-xl font-bold mb-2 text-gray-800">Nenhuma Questão Encontrada</h2>
          <p className="text-gray-600 mb-4">Não foi possível carregar as questões do quiz.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  // Validate current question index
  const safeCurrentIndex = Math.max(0, Math.min(gameState.currentIndex, sessionData.questoes.length - 1));
  if (safeCurrentIndex !== gameState.currentIndex) {
    setGameState(prev => ({ ...prev, currentIndex: safeCurrentIndex }));
    return null;
  }

  const currentQuestion = sessionData.questoes[gameState.currentIndex];
  const isLastQuestion = gameState.currentIndex === sessionData.questoes.length - 1;

  if (!currentQuestion) {
    console.error('❌ Current question not found:', gameState.currentIndex);
    return null;
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (gameState.showResult) return;
    console.log('📝 Answer selected:', answerIndex);
    setGameState(prev => ({ ...prev, selectedAnswer: answerIndex }));
  };

  const handleConfirmAnswer = async () => {
    if (gameState.selectedAnswer === null || !currentQuestion) return;

    console.log('🔍 Processing answer:', {
      selectedAnswer: gameState.selectedAnswer,
      correctAnswer: currentQuestion.correta,
      questionId: currentQuestion.id
    });

    const selectedAnswerNum = Number(gameState.selectedAnswer);
    const correctAnswerNum = Number(currentQuestion.correta);

    if (!Number.isInteger(selectedAnswerNum) || selectedAnswerNum < 0 || selectedAnswerNum > 4) {
      console.error('❌ Invalid selected answer:', gameState.selectedAnswer);
      toast.error('Resposta inválida selecionada');
      return;
    }

    if (!Number.isInteger(correctAnswerNum) || correctAnswerNum < 0 || correctAnswerNum > 4) {
      console.error('❌ Invalid correct answer:', currentQuestion.correta);
      toast.error('Erro na estrutura da questão');
      return;
    }

    const isAnswerCorrect = selectedAnswerNum === correctAnswerNum;
    
    // Save response to database
    try {
      await saveQuestionResponse(
        currentQuestion.id || `q_${gameState.currentIndex}`, 
        selectedAnswerNum, 
        isAnswerCorrect
      );
      console.log('💾 Response saved successfully');
    } catch (error) {
      console.error('⚠️ Error saving response:', error);
      toast.error('Erro ao salvar resposta');
    }
    
    // Add XP
    try {
      if (isAnswerCorrect) {
        await addXP(10, 'quiz_correct');
        toast.success('🎉 Correto! +10 XP', { duration: 2000 });
      } else {
        await addXP(2, 'quiz_incorrect');
        toast('💪 Continue tentando! +2 XP', { duration: 2000 });
      }
    } catch (xpError) {
      console.error('⚠️ Error adding XP:', xpError);
    }
    
    // Update game state
    const newScore = isAnswerCorrect ? gameState.score + 1 : gameState.score;
    setGameState(prev => ({
      ...prev,
      isCorrect: isAnswerCorrect,
      showResult: true,
      score: newScore
    }));
  };

  const handleNextQuestion = async () => {
    if (isLastQuestion) {
      console.log('🏆 Quiz completed, finalizing session...');
      
      const sessionResult = await completeSession();
      
      if (sessionResult) {
        console.log('✅ Quiz session completed successfully');
        setGameState(prev => ({ ...prev, gameFinished: true }));
        onGameFinish(gameState.score);
        
        // Bonus XP
        try {
          const accuracy = (gameState.score / sessionData.questoes.length) * 100;
          
          if (accuracy === 100) {
            await addXP(50, 'quiz_perfect');
            toast.success('🏆 Perfeito! +50 XP de bônus!', { duration: 4000 });
          } else if (accuracy >= 80) {
            await addXP(25, 'quiz_excellent');
            toast.success('🎯 Excelente! +25 XP de bônus!', { duration: 4000 });
          } else if (accuracy >= 60) {
            await addXP(15, 'quiz_good');
            toast.success('👍 Bom trabalho! +15 XP de bônus!', { duration: 4000 });
          }
        } catch (bonusError) {
          console.error('⚠️ Error adding bonus XP:', bonusError);
        }
      } else {
        console.error('❌ Failed to complete quiz session');
        toast.error('Erro ao finalizar quiz');
      }
    } else {
      console.log('➡️ Moving to next question');
      const nextIndex = gameState.currentIndex + 1;
      
      if (nextIndex < sessionData.questoes.length) {
        setGameState(prev => ({
          ...prev,
          currentIndex: nextIndex,
          selectedAnswer: null,
          showResult: false,
          isCorrect: false
        }));
      } else {
        console.error('❌ Attempted to go beyond available questions');
        toast.error('Erro ao avançar para próxima questão');
      }
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
