
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

  console.log('🎯 Enhanced QuizGameManager - Current state:', {
    index: gameState.currentIndex,
    pergunta: currentQuestion?.pergunta?.slice(0, 50),
    selectedAnswer: gameState.selectedAnswer,
    score: gameState.score,
    correctAnswer: currentQuestion?.correta,
    questionStructure: {
      id: currentQuestion?.id,
      correta: currentQuestion?.correta,
      alternativasCount: currentQuestion?.alternativas?.length
    }
  });

  const handleAnswerSelect = (answerIndex: number) => {
    if (gameState.showResult) return;
    console.log('📝 Answer selected:', {
      answerIndex,
      currentQuestion: currentQuestion?.pergunta?.slice(0, 50)
    });
    setGameState(prev => ({ ...prev, selectedAnswer: answerIndex }));
  };

  // BULLETPROOF answer verification
  const handleConfirmAnswer = async () => {
    if (gameState.selectedAnswer === null || !currentQuestion) return;

    console.log('🔍 BULLETPROOF ANSWER VERIFICATION:', {
      selectedAnswer: gameState.selectedAnswer,
      currentQuestion: {
        id: currentQuestion.id,
        pergunta: currentQuestion.pergunta?.slice(0, 50),
        correta: currentQuestion.correta,
        correctAnswerType: typeof currentQuestion.correta,
        selectedAnswerType: typeof gameState.selectedAnswer
      }
    });

    // Get correct answer with multiple fallbacks
    let correctAnswerIndex: number;
    
    if (typeof currentQuestion.correta === 'number') {
      correctAnswerIndex = currentQuestion.correta;
    } else if (typeof currentQuestion.correta === 'string') {
      correctAnswerIndex = parseInt(currentQuestion.correta);
    } else {
      console.error('❌ CRITICAL: Invalid correct answer format:', currentQuestion.correta);
      correctAnswerIndex = 0; // Default fallback
    }

    // Ensure both values are numbers for comparison
    const selectedAnswerNum = Number(gameState.selectedAnswer);
    const correctAnswerNum = Number(correctAnswerIndex);

    const isAnswerCorrect = selectedAnswerNum === correctAnswerNum;
    
    console.log('✅ FINAL ANSWER VERIFICATION:', {
      selectedAnswer: selectedAnswerNum,
      correctAnswer: correctAnswerNum,
      isCorrect: isAnswerCorrect,
      comparison: `${selectedAnswerNum} === ${correctAnswerNum} = ${isAnswerCorrect}`
    });

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
