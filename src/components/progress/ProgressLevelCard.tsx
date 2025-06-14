
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import { GameStats } from "@/types/gamification";

interface ProgressLevelCardProps {
  stats: GameStats;
}

const ProgressLevelCard = ({ stats }: ProgressLevelCardProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
          Progresso do Nível
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium">Nível {stats.currentLevel}</span>
          <span className="text-sm text-gray-500">{stats.currentXp} / {stats.nextLevelXp} XP</span>
        </div>
        <Progress value={stats.xpProgress} className="h-4" />
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Faltam apenas {stats.nextLevelXp - stats.currentXp} XP para o próximo nível!</strong>
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>🎯 +5 XP por flashcard</span>
            <span>🧠 +10 XP por quiz correto</span>
            <span>📚 +2 XP por tentativa</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressLevelCard;
