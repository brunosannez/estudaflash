import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Lightbulb, Target } from 'lucide-react';
import type { GameStats } from '@/types/gamification';
import type { TopicFocus } from '@/hooks/progress/useProgressData';

interface ProgressCoachCardProps {
  stats: GameStats;
  topicFocus: TopicFocus | null;
}

const ProgressCoachCard = ({ stats, topicFocus }: ProgressCoachCardProps) => {
  const accuracy = stats.todayQuizzes > 0
    ? Math.round((stats.todayCorrectAnswers / stats.todayQuizzes) * 100)
    : 0;

  const tips: string[] = [];

  if (stats.todayXp === 0) tips.push('Hoje: faça 1 flashcard ou 1 quiz.');
  if (stats.todayFlashcards < 5) tips.push('Meta fácil: 5 flashcards.');
  if (stats.todayQuizzes > 0 && accuracy < 60) tips.push('Se o quiz ficou difícil, revise o resumo e tente de novo.');
  if (stats.currentStreak < 3) tips.push('Faça um pouquinho todo dia para criar sequência.');

  const mood = stats.todayXp > 0
    ? { title: 'Você estudou hoje. Boa!', variant: 'secondary' as const }
    : { title: 'Vamos começar? Só 5 min!', variant: 'outline' as const };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-muted-foreground" />
          Dicas do Estuda Flash
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">Como você está hoje</div>
          <Badge variant={mood.variant}>{mood.title}</Badge>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Target className="h-4 w-4 text-muted-foreground" />
            O que treinar mais
          </div>
          {topicFocus ? (
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium">{topicFocus.topic}</div>
                <Badge variant="secondary">{topicFocus.accuracy}% de acerto</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Dica: faça mais 1 quiz desse tema e depois revise os flashcards.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Faça pelo menos 1 quiz para eu te dizer qual tema precisa de mais atenção.
            </p>
          )}
        </div>

        {tips.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Passos simples</div>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              {tips.slice(0, 4).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressCoachCard;
