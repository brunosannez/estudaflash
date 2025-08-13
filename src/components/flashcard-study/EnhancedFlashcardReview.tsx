import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  ChevronLeft, 
  ChevronRight, 
  Brain, 
  Clock, 
  Star,
  Target
} from 'lucide-react';
import { useEnhancedSpacedRepetition } from '@/hooks/useEnhancedSpacedRepetition';

interface Flashcard {
  id: string;
  pergunta: string;
  resposta: string;
  exemplo?: string;
  difficulty: number;
  ef_factor: number;
  repetition_count: number;
  next_review_date: string;
}

interface EnhancedFlashcardReviewProps {
  flashcards: Flashcard[];
  onReviewComplete: () => void;
}

const EnhancedFlashcardReview = ({ flashcards, onReviewComplete }: EnhancedFlashcardReviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [confidence, setConfidence] = useState([3]);
  const [quality, setQuality] = useState([3]);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    totalTime: 0
  });

  const { recordEnhancedReview, loading } = useEnhancedSpacedRepetition();

  const currentCard = flashcards[currentIndex];

  useEffect(() => {
    if (currentCard && !showAnswer) {
      setStartTime(new Date());
    }
  }, [currentIndex, showAnswer]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleReview = async (reviewQuality: number) => {
    if (!currentCard || !startTime) return;

    const endTime = new Date();
    const responseTime = endTime.getTime() - startTime.getTime();

    // Record enhanced review
    await recordEnhancedReview({
      flashcard_id: currentCard.id,
      review_quality: reviewQuality,
      response_time_ms: responseTime,
      confidence_level: confidence[0],
      study_context: {
        device: 'web',
        session_length: sessionStats.reviewed + 1,
        time_of_day: endTime.getHours()
      }
    });

    // Update session stats
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: reviewQuality >= 3 ? prev.correct + 1 : prev.correct,
      totalTime: prev.totalTime + responseTime
    }));

    // Move to next card or complete session
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
      setConfidence([3]);
      setQuality([3]);
    } else {
      onReviewComplete();
    }
  };

  const getQualityLabel = (value: number) => {
    switch (value) {
      case 0: return 'Blackout - Não lembrei';
      case 1: return 'Muito Difícil';
      case 2: return 'Difícil';
      case 3: return 'Normal';
      case 4: return 'Fácil';
      case 5: return 'Muito Fácil';
      default: return 'Normal';
    }
  };

  const getConfidenceLabel = (value: number) => {
    switch (value) {
      case 1: return 'Muito Baixa';
      case 2: return 'Baixa';
      case 3: return 'Média';
      case 4: return 'Alta';
      case 5: return 'Muito Alta';
      default: return 'Média';
    }
  };

  if (!currentCard) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Revisão Concluída!</h3>
          <p className="text-muted-foreground mb-4">
            Excelente trabalho! Você revisou {sessionStats.reviewed} cards.
          </p>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Precisão: {sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 0}%
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Tempo médio: {sessionStats.reviewed > 0 ? Math.round(sessionStats.totalTime / sessionStats.reviewed / 1000) : 0}s
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Revisão Espaçada Inteligente</h2>
          <p className="text-sm text-muted-foreground">
            Card {currentIndex + 1} de {flashcards.length}
          </p>
        </div>
        <Badge variant="outline">
          EF: {currentCard.ef_factor.toFixed(1)} | Rep: {currentCard.repetition_count}
        </Badge>
      </div>

      {/* Main Card */}
      <Card className="min-h-[400px]">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Question */}
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-4">
                Pergunta
              </Badge>
              <h3 className="text-xl font-medium leading-relaxed">
                {currentCard.pergunta}
              </h3>
            </div>

            {/* Answer (shown conditionally) */}
            {showAnswer && (
              <div className="space-y-4 border-t pt-6">
                <Badge variant="default" className="mb-2">
                  Resposta
                </Badge>
                <p className="text-lg leading-relaxed">
                  {currentCard.resposta}
                </p>
                {currentCard.exemplo && (
                  <div className="text-sm text-muted-foreground italic">
                    Exemplo: {currentCard.exemplo}
                  </div>
                )}
              </div>
            )}

            {/* Show Answer Button */}
            {!showAnswer && (
              <Button onClick={handleShowAnswer} size="lg" className="mt-8">
                Mostrar Resposta
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Controls (shown when answer is visible) */}
      {showAnswer && (
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Confidence Slider */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <label className="text-sm font-medium">
                  Confiança: {getConfidenceLabel(confidence[0])}
                </label>
              </div>
              <Slider
                value={confidence}
                onValueChange={setConfidence}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>

            {/* Quality Slider */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-500" />
                <label className="text-sm font-medium">
                  Dificuldade: {getQualityLabel(quality[0])}
                </label>
              </div>
              <Slider
                value={quality}
                onValueChange={setQuality}
                min={0}
                max={5}
                step={1}
                className="w-full"
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="destructive"
                onClick={() => handleReview(1)}
                disabled={loading}
                size="sm"
              >
                Não Lembrei
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleReview(3)}
                disabled={loading}
                size="sm"
              >
                Normal
              </Button>
              <Button
                variant="default"
                onClick={() => handleReview(quality[0])}
                disabled={loading}
                size="sm"
              >
                Confirmar ({quality[0]})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>

        <div className="text-sm text-muted-foreground">
          Próxima revisão: {new Date(currentCard.next_review_date).toLocaleDateString('pt-BR')}
        </div>

        <Button
          variant="outline"
          onClick={() => setCurrentIndex(prev => Math.min(flashcards.length - 1, prev + 1))}
          disabled={currentIndex === flashcards.length - 1}
        >
          Próximo
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default EnhancedFlashcardReview;