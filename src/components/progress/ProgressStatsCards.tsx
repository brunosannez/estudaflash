
import { Card, CardContent } from "@/components/ui/card";
import { Star, Flame, TrendingUp, Award } from "lucide-react";
import { GameStats } from "@/types/gamification";

interface ProgressStatsCardsProps {
  stats: GameStats;
  getStreakEmoji: (streak: number) => string;
}

const ProgressStatsCards = ({ stats, getStreakEmoji }: ProgressStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="overflow-hidden transform hover:scale-105 transition-all duration-300">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">XP Total</p>
                <p className="text-3xl font-bold mt-1 animate-pulse">{stats.currentXp}</p>
              </div>
              <Star className="h-8 w-8 opacity-80 animate-spin-slow" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full"></div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden transform hover:scale-105 transition-all duration-300">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-red-500 to-pink-600 p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Streak Atual</p>
                <p className="text-3xl font-bold mt-1">{stats.currentStreak} {getStreakEmoji(stats.currentStreak)}</p>
              </div>
              <Flame className="h-8 w-8 opacity-80 animate-bounce" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full"></div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden transform hover:scale-105 transition-all duration-300">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-green-500 to-teal-600 p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">XP Hoje</p>
                <p className="text-3xl font-bold mt-1 animate-pulse">{stats.todayXp}</p>
              </div>
              <TrendingUp className="h-8 w-8 opacity-80" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full"></div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden transform hover:scale-105 transition-all duration-300">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Precisão</p>
                <p className="text-3xl font-bold mt-1">
                  {stats.todayQuizzes > 0 ? Math.round((stats.todayCorrectAnswers / stats.todayQuizzes) * 100) : 0}%
                </p>
              </div>
              <Award className="h-8 w-8 opacity-80" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressStatsCards;
