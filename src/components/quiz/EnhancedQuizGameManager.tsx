
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

  // Initialize session
  React.useEffect(() => {
    const initializeSession = async () => {
      if (sessionInitialized) return;

      try {
        if (resumeMode && sessionId) {
          console.log('🔄 Initializing resume session:', sessionId);
          const session = await resumeSession(sessionId);
          if (session && sessionData) {
            console.log('📊 Resuming session with data:', sessionData);
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

  // Detailed logging for debugging answer verification
  console.log('🎯 Enhanced QuizGameManager - Current state:', {
    index: gameState.currentIndex,
    pergunta: currentQuestion?.pergunta,
    selectedAnswer: gameState.selectedAnswer,
    score: gameState.score,
    gameFinished: gameState.gameFinished,
    sessionId: sessionData.sessionId,
    correctAnswer: currentQuestion?.correta,
    questionStructure: currentQuestion
  });

  const handleAnswerSelect = (answerIndex: number) => {
    if (gameState.showResult) return;
    console.log('📝 Answer selected:', {
      answerIndex,
      currentQuestion: currentQuestion?.pergunta,
      currentQuestionStructure: currentQuestion
    });
    setGameState(prev => ({ ...prev, selectedAnswer: answerIndex }));
  };

  const handleConfirmAnswer = async () => {
    if (gameState.selectedAnswer === null || !currentQuestion) return;

    // Enhanced logging for answer verification
    console.log('🔍 DEBUGGING ANSWER VERIFICATION:', {
      selectedAnswer: gameState.selectedAnswer,
      currentQuestion: {
        id: currentQuestion.id,
        pergunta: currentQuestion.pergunta,
        alternativas: currentQuestion.alternativas,
        correta: currentQuestion.correta,
        resposta_correta: currentQuestion.resposta_correta,
        fullStructure: currentQuestion
      }
    });

    // Multiple ways to get correct answer - more robust approach
    let correctAnswerIndex = null;
    
    // Try different possible field names for correct answer
    if (typeof currentQuestion.correta === 'number') {
      correctAnswerIndex = currentQuestion.correta;
      console.log('✅ Using correta field:', correctAnswerIndex);
    } else if (typeof currentQuestion.resposta_correta === 'number') {
      correctAnswerIndex = currentQuestion.resposta_correta;
      console.log('✅ Using resposta_correta field:', correctAnswerIndex);
    } else if (typeof currentQuestion.correct === 'number') {
      correctAnswerIndex = currentQuestion.correct;
      console.log('✅ Using correct field:', correctAnswerIndex);
    } else {
      console.error('❌ Could not find correct answer index in question:', currentQuestion);
      // Try to extract from any available field
      const possibleKeys = ['correta', 'resposta_correta', 'correct', 'answer', 'correctAnswer'];
      for (const key of possibleKeys) {
        if (currentQuestion[key] !== undefined && currentQuestion[key] !== null) {
          correctAnswerIndex = Number(currentQuestion[key]);
          console.log(`✅ Found correct answer using ${key}:`, correctAnswerIndex);
          break;
        }
      }
    }

    if (correctAnswerIndex === null) {
      console.error('❌ CRITICAL: Could not determine correct answer index');
      toast.error('Erro: não foi possível verificar a resposta');
      return;
    }

    const isAnswerCorrect = gameState.selectedAnswer === correctAnswerIndex;
    
    console.log('✅ Final answer verification:', {
      selectedAnswer: gameState.selectedAnswer,
      correctAnswerIndex: correctAnswerIndex,
      isCorrect: isAnswerCorrect,
      comparison: `${gameState.selectedAnswer} === ${correctAnswerIndex} = ${isAnswerCorrect}`
    });

    // Save response to database
    try {
      await saveQuestionResponse(
        currentQuestion.id || `q_${gameState.currentIndex}`, 
        gameState.selectedAnswer, 
        isAnswerCorrect
      );
      console.log('💾 Response saved to database successfully');
    } catch (error) {
      console.error('⚠️ Error saving response to database:', error);
      toast.error('Erro ao salvar resposta');
    }
    
    // Add XP based on answer
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
        
        // Bonus XP for completing quiz
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
