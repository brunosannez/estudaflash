
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, PlayCircle, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FlashcardContinueDialogProps {
  onContinue: () => void;
  onStartNew: () => void;
  completedCount?: number;
  totalCards?: number;
  score?: { correct: number; incorrect: number };
  xpEarned?: number;
  lastActivityAt?: string;
}

const FlashcardContinueDialog = ({
  onContinue,
  onStartNew,
  completedCount = 0,
  totalCards = 0,
  score = { correct: 0, incorrect: 0 },
  xpEarned = 0,
  lastActivityAt,
}: FlashcardContinueDialogProps) => {
  const remaining = totalCards - completedCount;
  const progressPercent = totalCards > 0 ? Math.round((completedCount / totalCards) * 100) : 0;

  const formatLastActivity = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `há ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `há ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    return `há ${diffD} dia${diffD > 1 ? 's' : ''}`;
  };

  return (
    <Card className="max-w-2xl mx-auto border-4 border-blue-200 shadow-xl">
      <CardContent className="text-center py-12 space-y-6">
        <Brain className="h-16 w-16 text-blue-500 mx-auto" />
        <h3 className="text-2xl font-bold text-foreground/80">
          📚 Sessão em Andamento!
        </h3>

        {totalCards > 0 && (
          <div className="max-w-xs mx-auto space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{completedCount} de {totalCards} cards</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <div className="flex justify-center gap-4 text-sm text-muted-foreground mt-2">
              <span>✅ {score.correct} acertos</span>
              <span>❌ {score.incorrect} erros</span>
              <span>⚡ {xpEarned} XP</span>
            </div>
            {lastActivityAt && (
              <p className="text-xs text-muted-foreground/70">
                Última atividade: {formatLastActivity(lastActivityAt)}
              </p>
            )}
          </div>
        )}

        <p className="text-muted-foreground">
          {remaining > 0
            ? `Faltam ${remaining} cards para concluir. Deseja continuar ou recomeçar?`
            : 'Você tem uma sessão em andamento. Deseja continuar ou recomeçar?'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onContinue}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 px-6 rounded-xl shadow-lg"
          >
            <PlayCircle className="h-5 w-5 mr-2" />
            Continuar Sessão
          </Button>
          <Button 
            onClick={onStartNew}
            variant="outline"
            className="border-2 border-blue-300 text-primary hover:bg-primary/5 font-bold py-3 px-6 rounded-xl shadow-lg"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Nova Sessão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardContinueDialog;
