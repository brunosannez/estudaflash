
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Brain, TestTube, Award } from "lucide-react";
import { GameStats } from "@/types/gamification";

interface ProgressActivitiesCardProps {
  stats: GameStats;
}

const ProgressActivitiesCard = ({ stats }: ProgressActivitiesCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2 text-muted-foreground" />
          Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Flashcards feitos</span>
          </div>
          <div className="text-2xl font-semibold">{stats.todayFlashcards}</div>
        </div>
        
        <div className="flex justify-between items-center p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3">
            <TestTube className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Respostas no quiz</span>
          </div>
          <div className="text-2xl font-semibold">{stats.todayQuizzes}</div>
        </div>
        
        <div className="flex justify-between items-center p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3">
            <Award className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Acertos no quiz</span>
          </div>
          <div className="text-2xl font-semibold">{stats.todayCorrectAnswers}</div>
        </div>

        {stats.todayXp > 0 && (
          <div className="mt-4 p-3 rounded-lg border bg-muted/30 text-center">
            <div className="text-base font-semibold">Você ganhou {stats.todayXp} XP hoje</div>
            <div className="text-sm text-muted-foreground">Muito bem. Amanhã dá pra fazer de novo.</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressActivitiesCard;
