import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, ArrowLeft } from 'lucide-react';
import { useFlashcardStudy } from '@/hooks/useFlashcardStudy';
import FlashcardStats from './flashcard-study/FlashcardStats';
import FlashcardProgress from './flashcard-study/FlashcardProgress';
import FlashcardContainer from './flashcard-study/FlashcardContainer';
import FlashcardControls from './flashcard-study/FlashcardControls';
import FlashcardSessionStatus from './flashcard-study/FlashcardSessionStatus';
import FlashcardKeyboardHints from './flashcard-study/FlashcardKeyboardHints';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useFlashcardKeyboard } from '@/hooks/useFlashcardKeyboard';
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
    handleFlip,
    handleAnswer,
    handleShuffle,
    getCurrentCard,
    saveCurrentProgress,
    completeSession
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
    const result = await saveCurrentProgress();
    if (result) {
      setLastSaved(new Date());
    }
    return result;
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
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">🧠 Carregando flashcards mágicos...</p>
        </div>
      </div>
    );
  }

  if (showContinueDialog) {
    return (
      <Card className="max-w-2xl mx-auto border-4 border-blue-200 shadow-xl">
        <CardContent className="text-center py-12">
          <Brain className="h-16 w-16 text-blue-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-700 mb-4">
            📚 Sessão em Andamento Encontrada!
          </h3>
          <p className="text-gray-600 mb-8">
            Você tem uma sessão de flashcards em andamento. Deseja continuar de onde parou ou começar uma nova sessão?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleContinueSession}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
            >
              ✅ Continuar Sessão
            </Button>
            <Button 
              onClick={handleStartNew}
              variant="outline"
              className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-xl shadow-lg"
            >
              🆕 Nova Sessão
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Card className="border-4 border-blue-200 shadow-xl overflow-hidden">
        <CardContent className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            📚 Nenhum flashcard disponível
          </h3>
          <p className="text-gray-600 mb-6">
            Este resumo ainda não possui flashcards. Gere alguns para começar a estudar!
          </p>
          <Button onClick={onBack} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentCard = getCurrentCard();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <FlashcardStats 
        studyStats={studyStats} 
        score={score} 
        realGamificationData={realGamificationData}
      />
      
      <FlashcardProgress 
        currentIndex={currentIndex}
        totalCards={flashcards.length}
        completedCards={completedCards}
        studyStats={studyStats}
        score={score}
      />

      <FlashcardContainer
        currentCard={currentCard}
        currentIndex={currentIndex}
        showAnswer={showAnswer}
        isFlipped={isFlipped}
        onFlip={handleFlip}
        onAnswer={handleAnswer}
        isAnimating={isAnimating}
      />

      <FlashcardControls
        onBack={onBack}
        onShuffle={handleShuffle}
        onFlip={handleFlip}
        isAnimating={isAnimating}
      />
      
      <FlashcardSessionStatus
        sessionId={activeSessionId}
        lastSaved={lastSaved}
        isOnline={isOnline}
      />
      
      <FlashcardKeyboardHints />
    </div>
  );
};

export default FlashcardStudyModeImproved;
