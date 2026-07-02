import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Trash2, PlayCircle, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { deleteService } from '@/services/deleteService';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FlashcardSet {
  resumo_id: string;
  resumo_title: string;
  data_criacao: string;
  flashcards: any[];
}

interface ActiveSession {
  id: string;
  completedCount: number;
  score: { correct: number; incorrect: number };
  xpEarned: number;
}

interface FlashcardSetCardProps {
  flashcardSet: FlashcardSet;
  onStartStudy: (flashcardSet: FlashcardSet, sessionId?: string) => void;
  onDeleted?: () => void;
}

const FlashcardSetCard = ({ flashcardSet, onStartStudy, onDeleted }: FlashcardSetCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);

  useEffect(() => {
    checkActiveSession();
  }, [flashcardSet.resumo_id]);

  const checkActiveSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('flashcard_sessions')
        .select('id, current_card_index, completed_cards, session_stats')
        .eq('user_id', user.id)
        .eq('resumo_id', flashcardSet.resumo_id)
        .eq('status', 'active')
        .order('last_activity_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        const completedCards = Array.isArray(data.completed_cards) ? data.completed_cards as string[] : [];
        const stats = data.session_stats && typeof data.session_stats === 'object'
          ? data.session_stats as any
          : { correct: 0, incorrect: 0, xpEarned: 0 };

        if (completedCards.length > 0 || data.current_card_index > 0) {
          setActiveSession({
            id: data.id,
            completedCount: completedCards.length,
            score: { correct: stats.correct || 0, incorrect: stats.incorrect || 0 },
            xpEarned: stats.xpEarned || 0,
          });
        }
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await deleteService.deleteFlashcardSet(flashcardSet.resumo_id);
    if (success && onDeleted) {
      onDeleted();
    }
    setIsDeleting(false);
  };

  const handleContinue = () => {
    if (activeSession) {
      onStartStudy(flashcardSet, activeSession.id);
    }
  };

  const handleNewStudy = async () => {
    // Mark old session as abandoned before starting new
    if (activeSession) {
      try {
        await supabase
          .from('flashcard_sessions')
          .update({ status: 'abandoned' })
          .eq('id', activeSession.id);
      } catch (e) {
        console.error('Error abandoning old session:', e);
      }
      setActiveSession(null);
    }
    onStartStudy(flashcardSet);
  };

  const totalCards = flashcardSet.flashcards.length;
  const progressPercent = activeSession
    ? Math.round((activeSession.completedCount / totalCards) * 100)
    : 0;

  return (
    <Card 
      className="group border-4 border-blue-200 shadow-xl overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-300 transform hover:scale-105 relative"
    >
      {/* Botão de excluir */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 z-10"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar flashcards?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. Todos os {flashcardSet.flashcards.length} flashcards deste conjunto serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CardHeader className="bg-muted/50 pb-3 pr-12">
        <CardTitle className="text-lg font-bold text-foreground line-clamp-2">
          {flashcardSet.resumo_title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            {totalCards} cards
          </span>
          <span>
            {new Date(flashcardSet.data_criacao).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short'
            })}
          </span>
        </div>

        {activeSession ? (
          <>
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>📊 {activeSession.completedCount} de {totalCards} cards</span>
                <span>{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>✅ {activeSession.score.correct}</span>
                <span>❌ {activeSession.score.incorrect}</span>
                <span>⚡ {activeSession.xpEarned} XP</span>
              </div>
            </div>

            {/* Continue / New buttons */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleContinue}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                ▶️ Continuar de onde parou
              </Button>
              <Button
                onClick={handleNewStudy}
                variant="outline"
                size="sm"
                className="w-full text-xs border-blue-200 text-primary hover:bg-primary/5"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Novo Estudo
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-foreground/80 font-medium">
                💡 {totalCards} conceitos prontos para revisar
              </p>
            </div>

            <Button 
              onClick={() => onStartStudy(flashcardSet)}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
            >
              <Brain className="h-4 w-4 mr-2" />
              🚀 Estudar Agora
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FlashcardSetCard;
