
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Flame, RotateCcw } from 'lucide-react';
import { useFlashcards } from '@/hooks/useFlashcards';
import AnkiFlashcard from './AnkiFlashcard';
import { useGameification } from '@/hooks/useGameification';

interface FlashcardStudyModeProps {
  resumoId: string;
  onBack: () => void;
}

const FlashcardStudyMode = ({ resumoId, onBack }: FlashcardStudyModeProps) => {
  const { cards, fetchFlashcards, loading } = useFlashcards(resumoId);
  const { addXP } = useGameification();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
    xpEarned: 0
  });
  const [sessionCompleted, setSessionCompleted] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, [resumoId]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  const handleCorrectAnswer = async () => {
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + 1,
      total: prev.total + 1,
      xpEarned: prev.xpEarned + 5
    }));
    
    try {
      await addXP(5, 'flashcard');
    } catch (error) {
      console.error('Erro ao adicionar XP:', error);
    }
  };

  const handleIncorrectAnswer = () => {
    setSessionStats(prev => ({
      ...prev,
      incorrect: prev.incorrect + 1,
      total: prev.total + 1
    }));
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setSessionCompleted(false);
    setSessionStats({
      correct: 0,
      incorrect: 0,
      total: 0,
      xpEarned: 0
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando flashcards...</p>
        </CardContent>
      </Card>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600 mb-4">Nenhum flashcard encontrado para este resumo.</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (sessionCompleted) {
    const accuracy = sessionStats.total > 0 ? (sessionStats.correct / sessionStats.total) * 100 : 0;
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Sessão Concluída!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
              <div className="text-sm text-green-700">Acertos</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
              <div className="text-sm text-red-700">Erros</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{accuracy.toFixed(0)}%</div>
              <div className="text-sm text-blue-700">Precisão</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{sessionStats.xpEarned}</div>
              <div className="text-sm text-yellow-700">XP Ganho</div>
            </div>
          </div>

          <div className="space-y-2">
            {accuracy >= 80 && (
              <div className="text-lg text-green-600 font-semibold">
                🎉 Excelente desempenho!
              </div>
            )}
            {accuracy >= 60 && accuracy < 80 && (
              <div className="text-lg text-blue-600 font-semibold">
                👍 Bom trabalho!
              </div>
            )}
            {accuracy < 60 && (
              <div className="text-lg text-orange-600 font-semibold">
                📚 Continue praticando!
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={resetSession} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <RotateCcw className="h-4 w-4 mr-2" />
              Estudar Novamente
            </Button>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats da sessão atual */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-green-600 font-semibold">
                ✅ {sessionStats.correct}
              </span>
              <span className="text-red-600 font-semibold">
                ❌ {sessionStats.incorrect}
              </span>
              <span className="text-yellow-600 font-semibold flex items-center gap-1">
                <Flame className="h-4 w-4" />
                {sessionStats.xpEarned} XP
              </span>
            </div>
            <Button onClick={onBack} variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flashcard atual */}
      <AnkiFlashcard
        pergunta={cards[currentIndex].pergunta}
        resposta={cards[currentIndex].resposta}
        exemplo={cards[currentIndex].exemplo}
        onNext={handleNext}
        onMarkReviewed={() => {}}
        onCorrectAnswer={handleCorrectAnswer}
        onIncorrectAnswer={handleIncorrectAnswer}
        currentIndex={currentIndex}
        totalCards={cards.length}
      />
    </div>
  );
};

export default FlashcardStudyMode;
