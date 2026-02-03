
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useFlashcardKeyboard } from '@/hooks/useFlashcardKeyboard';
import { useFlashcardStudy } from '@/hooks/useFlashcardStudy';
import FlashcardLoadingState from './flashcard-study/FlashcardLoadingState';
import FlashcardContinueDialog from './flashcard-study/FlashcardContinueDialog';
import FlashcardEmptyState from './flashcard-study/FlashcardEmptyState';
import FlashcardStudyContainer from './flashcard-study/FlashcardStudyContainer';
import FlashcardCompletionScreen from './flashcard-study/FlashcardCompletionScreen';
import './FlashcardAnimations.css';

interface FlashcardStudyModeImprovedProps {
  resumoId: string;
  onBack: () => void;
  sessionId?: string;
}

const FlashcardStudyModeImproved = ({ resumoId, onBack, sessionId }: FlashcardStudyModeImprovedProps) => {
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [existingSessionId, setExistingSessionId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const { toast } = useToast();
  const isOnline = useConnectionStatus();

  const {
    flashcards,
    currentIndex,
    showAnswer,
    loading,
    score,
    studyStats,
    isFlipped,
    completedCards,
    isAnimating,
    realGamificationData,
    sessionId: activeSessionId,
    isCompleted,
    // New feedback states
    showFeedback,
    userChoice,
    lastXpEarned,
    // Actions
    handleFlip,
    handleAnswer,
    handleNextCard,
    handleShuffle,
    getCurrentCard,
    saveCurrentProgress,
    completeSession,
    handleStudyAgain
  } = useFlashcardStudy(resumoId, sessionId || existingSessionId || undefined);

  // Setup keyboard shortcuts
  useFlashcardKeyboard({
    onFlip: handleFlip,
    onCorrect: () => handleAnswer(true),
    onIncorrect: () => handleAnswer(false),
    onShuffle: handleShuffle,
    showAnswer,
    isAnimating
  });

  // Enhanced save tracking
  const enhancedSaveProgress = async () => {
    try {
      await saveCurrentProgress();
      setLastSaved(new Date());
      return true;
    } catch (error) {
      console.error('❌ Error saving progress:', error);
      return false;
    }
  };

  // Check for existing active session on mount
  useEffect(() => {
    if (!sessionId) {
      checkForExistingSession();
    }
  }, [resumoId, sessionId]);

  const checkForExistingSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingSession, error } = await supabase
        .from('flashcard_sessions')
        .select('id, current_card_index, completed_cards')
        .eq('user_id', user.id)
        .eq('resumo_id', resumoId)
        .eq('status', 'active')
        .order('last_activity_at', { ascending: false })
        .limit(1)
        .single();

      if (existingSession && !error) {
        // Check if there's meaningful progress to continue
        const completedCardsArray = Array.isArray(existingSession.completed_cards) 
          ? existingSession.completed_cards as string[]
          : [];
        
        const hasProgress = existingSession.current_card_index > 0 || completedCardsArray.length > 0;
        
        if (hasProgress) {
          console.log('📍 Found existing flashcard session with progress:', existingSession);
          setExistingSessionId(existingSession.id);
          setShowContinueDialog(true);
        }
      }
    } catch (error) {
      console.error('❌ Error checking for existing session:', error);
    }
  };

  const handleContinueSession = () => {
    console.log('✅ Continuing existing flashcard session');
    setShowContinueDialog(false);
    toast({
      title: "📚 Sessão retomada!",
      description: "Continuando de onde você parou.",
    });
  };

  const handleStartNew = async () => {
    console.log('🆕 Starting new flashcard session');
    if (existingSessionId) {
      // Mark old session as completed
      try {
        await supabase
          .from('flashcard_sessions')
          .update({ status: 'completed' })
          .eq('id', existingSessionId);
      } catch (error) {
        console.error('❌ Error completing old session:', error);
      }
    }
    setExistingSessionId(null);
    setShowContinueDialog(false);
    toast({
      title: "🎯 Nova sessão iniciada!",
      description: "Começando do primeiro card.",
    });
  };

  if (loading) {
    return <FlashcardLoadingState />;
  }

  if (showContinueDialog) {
    return (
      <FlashcardContinueDialog
        onContinue={handleContinueSession}
        onStartNew={handleStartNew}
      />
    );
  }

  if (flashcards.length === 0) {
    return <FlashcardEmptyState onBack={onBack} />;
  }

  if (isCompleted) {
    return (
      <FlashcardCompletionScreen
        studyStats={studyStats}
        score={score}
        onStudyAgain={handleStudyAgain}
        onBackToFlashcards={onBack}
      />
    );
  }

  return (
    <FlashcardStudyContainer
      flashcards={flashcards}
      currentIndex={currentIndex}
      showFeedback={showFeedback}
      userChoice={userChoice}
      score={score}
      studyStats={studyStats}
      completedCards={completedCards}
      isAnimating={isAnimating}
      xpEarned={lastXpEarned}
      realGamificationData={realGamificationData}
      sessionId={activeSessionId}
      lastSaved={lastSaved}
      isOnline={isOnline}
      onBack={onBack}
      onShuffle={handleShuffle}
      onAnswer={handleAnswer}
      onNextCard={handleNextCard}
      getCurrentCard={getCurrentCard}
    />
  );
};

export default FlashcardStudyModeImproved;
