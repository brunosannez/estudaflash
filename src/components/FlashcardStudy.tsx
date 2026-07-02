
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, RotateCcw, CheckCircle, XCircle, ArrowLeft, Trophy } from 'lucide-react';
import { useFlashcards } from '@/hooks/useFlashcards';
import { Progress } from '@/components/ui/progress';

interface FlashcardStudyProps {
  resumoId: string;
  onBack: () => void;
}

const FlashcardStudy = ({ resumoId, onBack }: FlashcardStudyProps) => {
  const { cards, fetchFlashcards, reviewFlashcard, loading } = useFlashcards(resumoId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<string>>(new Set());
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    fetchFlashcards();
  }, [resumoId]);

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  const handleAnswer = async (remembered: boolean) => {
    if (!currentCard) return;

    const newScore = { 
      ...score, 
      total: score.total + 1,
      correct: remembered ? score.correct + 1 : score.correct
    };
    setScore(newScore);
    setStudiedCards(prev => new Set([...prev, currentCard.id]));
    
    // Adicionar XP por revisar flashcard
    await reviewFlashcard(currentCard.id);
    
    // Avançar para próximo card ou finalizar
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      // Finalizar estudo
      setShowAnswer(false);
    }
  };

  const resetStudy = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setStudiedCards(new Set());
    setScore({ correct: 0, total: 0 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Brain className="h-16 w-16 mx-auto text-muted-foreground/70 mb-4" />
          <h3 className="text-xl font-semibold text-foreground/80 mb-2">Nenhum flashcard encontrado</h3>
          <p className="text-muted-foreground mb-6">
            Este resumo ainda não possui flashcards. Crie alguns primeiro!
          </p>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Se terminou o estudo
  if (score.total === cards.length) {
    const accuracy = Math.round((score.correct / score.total) * 100);
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <Trophy className="h-24 w-24 mx-auto text-yellow-500 mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-4">Estudo Concluído! 🎉</h2>
          <div className="text-2xl font-semibold mb-6">
            <span className="text-green-600">{score.correct}</span>
            <span className="text-muted-foreground/70"> / </span>
            <span className="text-primary">{score.total}</span>
          </div>
          <div className="text-lg text-muted-foreground mb-6">
            Precisão: <span className="font-bold text-primary">{accuracy}%</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={resetStudy} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Estudar Novamente
            </Button>
            <Button onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} de {cards.length} flashcards
          </div>
          <div className="text-sm text-muted-foreground">
            Acertos: {score.correct}/{score.total}
          </div>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="bg-muted/50">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="mb-6">
              <Brain className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-4">
                {showAnswer ? 'Resposta' : 'Pergunta'}
              </h3>
            </div>

            <div className="min-h-[200px] flex items-center justify-center">
              <div className="text-lg text-foreground/80 max-w-lg">
                {showAnswer ? (
                  <div className="space-y-4">
                    <div className="font-semibold text-green-700">
                      {currentCard.resposta}
                    </div>
                    {currentCard.exemplo && (
                      <div className="text-sm text-primary bg-primary/5 p-3 rounded-lg">
                        <strong>Exemplo:</strong> {currentCard.exemplo}
                      </div>
                    )}
                  </div>
                ) : (
                  currentCard.pergunta
                )}
              </div>
            </div>

            <div className="mt-8">
              {!showAnswer ? (
                <Button 
                  onClick={() => setShowAnswer(true)}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  Mostrar Resposta
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground mb-4">Você lembrou da resposta?</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => handleAnswer(false)}
                      variant="outline"
                      size="lg"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Não Lembrei
                    </Button>
                    <Button
                      onClick={() => handleAnswer(true)}
                      size="lg"
                      className="bg-emerald-600 hover:opacity-90"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Lembrei!
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlashcardStudy;
