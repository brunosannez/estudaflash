import React, { useState } from 'react';
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

  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  // Initialize session with bulletproof logic and error handling
  React.useEffect(() => {
    const initializeSession = async () => {
      if (sessionInitialized) return;

      try {
        console.log('🔄 Initializing quiz session...', { resumeMode, sessionId });
        setInitializationError(null);

        if (resumeMode && sessionId) {
          console.log('🔄 Attempting to resume session:', sessionId);
          const session = await resumeSession(sessionId);
          
          if (session && sessionData) {
            const resumedIndex = sessionData.currentQuestionIndex || 0;
            const resumedScore = sessionData.respostas.filter(r => r.is_correct).length;
            
            console.log('📊 Resume data loaded:', { resumedIndex, resumedScore, totalQuestions: sessionData.questoes.length });
            
            // Ensure we don't go beyond available questions
            const safeIndex = Math.min(resumedIndex, sessionData.questoes.length - 1);
            
            setGameState(prev => ({
              ...prev,
              currentIndex: Math.max(0, safeIndex),
              score: resumedScore
            }));
          } else {
            throw new Error('Não foi possível retomar a sessão do quiz');
          }
        } else {
          console.log('🚀 Starting new bulletproof session');
          await startNewSession(quiz.resumo_id, '', quiz.questoes);
        }
        
        setSessionInitialized(true);
      } catch (error) {
        console.error('❌ Error initializing session:', error);
        setInitializationError(error instanceof Error ? error.message : 'Erro ao inicializar quiz');
        toast.error('Erro ao inicializar quiz. Tente novamente.');
      }
    };

    if (quiz.questoes && quiz.questoes.length > 0) {
      initializeSession();
    }
  }, [quiz, sessionId, resumeMode, sessionInitialized]);

  // Show error state if initialization failed
  if (initializationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-bold mb-2 text-gray-800">Erro ao Carregar Quiz</h2>
          <p className="text-gray-600 mb-4">{initializationError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Show loading while session initializes
  if (!sessionData || !sessionInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            {resumeMode ? 'Retomando quiz...' : 'Inicializando quiz...'}
          </p>
        </div>
      </div>
    );
  }

  // Validate current question index
  if (gameState.currentIndex >= sessionData.questoes.length) {
    console.error('❌ Invalid question index, resetting to last valid question');
    setGameState(prev => ({
      ...prev,
      currentIndex: Math.max(0, sessionData.questoes.length - 1)
    }));
    return null;
  }

  const currentQuestion = sessionData.questoes[gameState.currentIndex];
  const isLastQuestion = gameState.currentIndex === sessionData.questoes.length - 1;

  console.log('🎯 BULLETPROOF Game State:', {
    currentIndex: gameState.currentIndex,
    selectedAnswer: gameState.selectedAnswer,
    totalQuestions: sessionData.questoes.length,
    currentQuestion: currentQuestion ? {
      id: currentQuestion.id,
      pergunta: currentQuestion.pergunta?.slice(0, 50) + '...',
      correta: currentQuestion.correta,
      correctAnswerType: typeof currentQuestion.correta,
      alternativasCount: currentQuestion.alternativas?.length
    } : null
  });

  const handleAnswerSelect = (answerIndex: number) => {
    if (gameState.showResult) return;
    console.log('📝 Answer selected:', answerIndex);
    setGameState(prev => ({ ...prev, selectedAnswer: answerIndex }));
  };

  // BULLETPROOF answer verification with enhanced validation
  const handleConfirmAnswer = async () => {
    if (gameState.selectedAnswer === null || !currentQuestion) return;

    console.log('🔍 BULLETPROOF VERIFICATION:', {
      selectedAnswer: gameState.selectedAnswer,
      selectedAnswerType: typeof gameState.selectedAnswer,
      correctAnswer: currentQuestion.correta,
      correctAnswerType: typeof currentQuestion.correta,
      question: currentQuestion.pergunta?.slice(0, 50) + '...'
    });

    // Bulletproof conversion to numbers with validation
    const selectedAnswerNum = Number(gameState.selectedAnswer);
    const correctAnswerNum = Number(currentQuestion.correta);

    // Critical validation with detailed error logging
    if (!Number.isInteger(selectedAnswerNum) || selectedAnswerNum < 0 || selectedAnswerNum > 4) {
      console.error('❌ Invalid selected answer:', gameState.selectedAnswer);
      toast.error('Resposta inválida selecionada');
      return;
    }

    if (!Number.isInteger(correctAnswerNum) || correctAnswerNum < 0 || correctAnswerNum > 4) {
      console.error('❌ Invalid correct answer in question:', currentQuestion.correta);
      toast.error('Erro na estrutura da questão');
      return;
    }

    // Bulletproof comparison
    const isAnswerCorrect = selectedAnswerNum === correctAnswerNum;
    
    console.log('✅ BULLETPROOF RESULT:', {
      selectedAnswer: selectedAnswerNum,
      correctAnswer: correctAnswerNum,
      isCorrect: isAnswerCorrect,
      comparison: `${selectedAnswerNum} === ${correctAnswerNum} = ${isAnswerCorrect}`
    });

    // Save response to database with error handling
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
    
    // Add XP based on answer with error handling
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
    
    console.log('🎯 Answer processed successfully:', {
      isCorrect: isAnswerCorrect,
      newScore: newScore,
      previousScore: gameState.score
    });
  };

  const handleNextQuestion = async () => {
    if (isLastQuestion) {
      console.log('🏆 Quiz completed, finalizing session...');
      
      const sessionResult = await completeSession();
      
      if (sessionResult) {
        console.log('✅ Quiz session completed successfully:', sessionResult);
        setGameState(prev => ({ ...prev, gameFinished: true }));
        onGameFinish(gameState.score);
        
        // Bonus XP for completing quiz with error handling
        try {
          const accuracy = (gameState.score / sessionData.questoes.length) * 100;
          let bonusXP = 0;
          
          if (accuracy === 100) {
            bonusXP = 50;
            await addXP(bonusXP, 'quiz_perfect');
            toast.success('🏆 Perfeito! +50 XP de bônus!', { duration: 4000 });
          } else if (accuracy >= 80) {
            bonusXP = 25;
            await addXP(bonusXP, 'quiz_excellent');
            toast.success('🎯 Excelente! +25 XP de bônus!', { duration: 4000 });
          } else if (accuracy >= 60) {
            bonusXP = 15;
            await addXP(bonusXP, 'quiz_good');
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
      
      // Validate next index before proceeding
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
