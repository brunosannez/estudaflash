
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import { GameStats } from "@/types/gamification";

interface ProgressLevelCardProps {
  stats: GameStats;
}

const ProgressLevelCard = ({ stats }: ProgressLevelCardProps) => {
  const remaining = Math.max(0, stats.nextLevelXp - stats.currentXp);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-muted-foreground" />
          Seu nível
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium">Nível {stats.currentLevel}</span>
          <span className="text-sm text-muted-foreground">{stats.currentXp} / {stats.nextLevelXp} XP</span>
        </div>
        <Progress value={stats.xpProgress} className="h-4" />
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            Faltam <span className="font-medium text-foreground">{remaining} XP</span> para subir de nível.
          </p>
          <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
            <div>• Flashcard: +10 (Lembrei) ou +2 (Não lembrei)</div>
            <div>• Quiz: até +15 quando acerta</div>
            <div>• Bônus: você ganha mais XP ao completar uma sessão</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressLevelCard;
