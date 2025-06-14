
import React, { useState, useEffect } from 'react';
import { useFlashcards } from '@/hooks/useFlashcards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import AnkiFlashcard from './AnkiFlashcard';
import { useToast } from '@/hooks/use-toast';

interface FlashcardStudyModeProps {
  resumoId: string;
  onBack: () => void;
}

const FlashcardStudyMode = ({ resumoId, onBack }: FlashcardStudyModeProps) => {
  const { cards, fetchFlashcards, reviewFlashcard, loading } = useFlashcards(resumoId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyStarted, setStudyStarted] = useState(false);
  const [completedCards, setCompletedCards] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Finished all cards
      toast({
        title: "🎉 Parabéns!",
        description: `Você revisou todos os ${cards.length} flashcards!`,
      });
      setStudyStarted(false);
      setCurrentIndex(0);
      setCompletedCards([]);
    }
  };

  const handleMarkReviewed = async () => {
    const currentCard = cards[currentIndex];
    if (currentCard) {
      await reviewFlashcard(currentCard.id);
      setCompletedCards(prev => [...prev, currentCard.id]);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCompletedCards([]);
    setStudyStarted(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum flashcard encontrado</h3>
          <p className="text-gray-500 mb-6">Gere flashcards automaticamente para começar a estudar!</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!studyStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Play className="h-6 w-6 text-blue-600" />
            Modo de Estudo - Flashcards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">Total de Cartões</h4>
                <p className="text-2xl font-bold text-blue-600">{cards.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800">Revisados</h4>
                <p className="text-2xl font-bold text-green-600">{completedCards.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800">Restantes</h4>
                <p className="text-2xl font-bold text-purple-600">{cards.length - completedCards.length}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={() => setStudyStarted(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Iniciar Estudo
              </Button>
              
              {completedCards.length > 0 && (
                <Button 
                  onClick={handleRestart}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Recomeçar
                </Button>
              )}
              
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={() => setStudyStarted(false)} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Pausar Estudo
        </Button>
        <div className="text-sm text-gray-600">
          Progresso: {completedCards.length}/{cards.length} revisados
        </div>
      </div>

      <AnkiFlashcard
        pergunta={currentCard.pergunta}
        resposta={currentCard.resposta}
        exemplo={currentCard.exemplo}
        onNext={handleNext}
        onMarkReviewed={handleMarkReviewed}
        currentIndex={currentIndex}
        totalCards={cards.length}
      />
    </div>
  );
};

export default FlashcardStudyMode;
