
import React, { useEffect, useState, useRef } from 'react';
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

interface ExistingSessionData {
  id: string;
  completedCount: number;
  totalCards: number;
  score: { correct: number; incorrect: number };
  xpEarned: number;
  lastActivityAt: string;
}

const FlashcardStudyModeImproved = ({ resumoId, onBack, sessionId }: FlashcardStudyModeImprovedProps) => {
  // Phase 1: Determine the session to use BEFORE initializing study hook
  const [resolvedSessionId, setResolvedSessionId] = useState<string | undefined>(sessionId);
  const [initializing, setInitializing] = useState(!sessionId); // skip init if sessionId prop given
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [existingSessionData, setExistingSessionData] = useState<ExistingSessionData | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const checkedRef = useRef(false);
  
  const { toast } = useToast();
  const isOnline = useConnectionStatus();

  // Check for existing session BEFORE mounting study hook
  useEffect(() => {
    if (sessionId || checkedRef.current) return;
    checkedRef.current = true;

    const checkSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setInitializing(false);
          return;
        }

        // Also fetch total flashcards for progress display
        const [sessionResult, flashcardsResult] = await Promise.all([
          supabase
            .from('flashcard_sessions')
            .select('id, current_card_index, completed_cards, session_stats, last_activity_at')
            .eq('user_id', user.id)
            .eq('resumo_id', resumoId)
            .eq('status', 'active')
            .order('last_activity_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('flashcards')
            .select('id', { count: 'exact', head: true })
            .eq('resumo_id', resumoId)
        ]);

        const session = sessionResult.data;
        const totalCards = flashcardsResult.count || 0;

        if (session) {
          const completedCards = Array.isArray(session.completed_cards) ? session.completed_cards as string[] : [];
          const stats = session.session_stats && typeof session.session_stats === 'object'
            ? session.session_stats as any
            : { correct: 0, incorrect: 0, xpEarned: 0 };

          const hasProgress = completedCards.length > 0 || session.current_card_index > 0;

          if (hasProgress) {
            setExistingSessionData({
              id: session.id,
              completedCount: completedCards.length,
              totalCards,
              score: { correct: stats.correct || 0, incorrect: stats.incorrect || 0 },
              xpEarned: stats.xpEarned || 0,
              lastActivityAt: session.last_activity_at,
            });
            setShowContinueDialog(true);
            // DON'T set initializing=false yet — wait for user choice
            return;
          }
        }

        // No active session with progress — proceed normally
        setInitializing(false);
      } catch (error) {
        console.error('❌ Error checking session:', error);
        setInitializing(false);
      }
    };

    checkSession();
  }, [resumoId, sessionId]);

  const handleContinueSession = () => {
    if (existingSessionData) {
      setResolvedSessionId(existingSessionData.id);
    }
    setShowContinueDialog(false);
    setInitializing(false);
    toast({
      title: "📚 Sessão retomada!",
      description: "Continuando de onde você parou.",
    });
  };

  const handleStartNew = async () => {
    if (existingSessionData) {
      try {
        await supabase
          .from('flashcard_sessions')
          .update({ status: 'abandoned' })
          .eq('id', existingSessionData.id);
      } catch (error) {
        console.error('❌ Error abandoning old session:', error);
      }
    }
    setResolvedSessionId(undefined);
    setExistingSessionData(null);
    setShowContinueDialog(false);
    setInitializing(false);
    toast({
      title: "🎯 Nova sessão iniciada!",
      description: "Começando do primeiro card.",
    });
  };

  // Show continue dialog BEFORE initializing study hook
  if (showContinueDialog && existingSessionData) {
    return (
      <FlashcardContinueDialog
        onContinue={handleContinueSession}
        onStartNew={handleStartNew}
        completedCount={existingSessionData.completedCount}
        totalCards={existingSessionData.totalCards}
        score={existingSessionData.score}
        xpEarned={existingSessionData.xpEarned}
        lastActivityAt={existingSessionData.lastActivityAt}
      />
    );
  }

  // Show loading while checking for existing session
  if (initializing) {
    return <FlashcardLoadingState />;
  }

  // Phase 2: Only now mount the study content
  return (
    <FlashcardStudyContent
      resumoId={resumoId}
      sessionId={resolvedSessionId}
      onBack={onBack}
      isOnline={isOnline}
      lastSaved={lastSaved}
      setLastSaved={setLastSaved}
    />
  );
};

// Separated component so useFlashcardStudy only runs AFTER session resolution
interface FlashcardStudyContentProps {
  resumoId: string;
  sessionId?: string;
  onBack: () => void;
  isOnline: boolean;
  lastSaved?: Date;
  setLastSaved: (d: Date) => void;
}

const FlashcardStudyContent = ({ resumoId, sessionId, onBack, isOnline, lastSaved, setLastSaved }: FlashcardStudyContentProps) => {
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
    showFeedback,
    userChoice,
    lastXpEarned,
    handleFlip,
    handleAnswer,
    handleNextCard,
    handleShuffle,
    getCurrentCard,
    saveCurrentProgress,
    completeSession,
    handleStudyAgain
  } = useFlashcardStudy(resumoId, sessionId);

  useFlashcardKeyboard({
    onFlip: handleFlip,
    onCorrect: () => handleAnswer(true),
    onIncorrect: () => handleAnswer(false),
    onShuffle: handleShuffle,
    showAnswer,
    isAnimating
  });

  if (loading) {
    return <FlashcardLoadingState />;
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
