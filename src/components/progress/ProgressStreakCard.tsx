
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { GameStats } from "@/types/gamification";

interface ProgressStreakCardProps {
  stats: GameStats;
  getStreakEmoji: (streak: number) => string;
}

const ProgressStreakCard = ({ stats, getStreakEmoji }: ProgressStreakCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Flame className="h-5 w-5 mr-2 text-red-500" />
          Streak de Estudos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500 mb-1">{stats.currentStreak}</div>
            <div className="text-sm text-gray-500">Dias Atuais</div>
          </div>
          <div className="text-4xl">{getStreakEmoji(stats.currentStreak)}</div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600 mb-1">{stats.longestStreak}</div>
            <div className="text-sm text-gray-500">Recorde</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-2">Últimos 7 dias:</div>
          <div className="flex space-x-1 justify-center">
            {Array.from({length: 7}).map((_, i) => {
              const isActive = i < Math.min(stats.currentStreak, 7);
              return (
                <div 
                  key={i} 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse' 
                      : 'bg-gray-200'
                  }`}
                >
                  {isActive ? '✓' : '?'}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressStreakCard;
