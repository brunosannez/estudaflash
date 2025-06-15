
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Target, Award } from 'lucide-react';
import { GameStats } from '@/types/gamification';

interface ProgressStreakDetailsProps {
  stats: GameStats;
}

const ProgressStreakDetails = ({ stats }: ProgressStreakDetailsProps) => {
  return (
    <Card className="transform hover:scale-105 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Flame className="h-5 w-5 mr-2 text-red-500" />
          Streak & Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{stats.currentStreak}</div>
            <div className="text-xs text-gray-500">Dias Atuais</div>
          </div>
          <div className="text-3xl">
            {stats.currentStreak >= 7 ? '🔥' : stats.currentStreak >= 3 ? '⚡' : stats.currentStreak >= 1 ? '💫' : '😴'}
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-600">{stats.longestStreak}</div>
            <div className="text-xs text-gray-500">Recorde</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Quizzes Hoje</span>
            </div>
            <span className="font-bold text-blue-600">{stats.todayQuizzes}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Precisão</span>
            </div>
            <span className="font-bold text-green-600">
              {stats.todayQuizzes > 0 ? Math.round((stats.todayCorrectAnswers / stats.todayQuizzes) * 100) : 0}%
            </span>
          </div>
        </div>

        {stats.todayXp > 0 ? (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 rounded-lg text-center">
            <div className="font-bold">🎉 {stats.todayXp} XP ganhos hoje!</div>
            <div className="text-sm opacity-90">Continue assim!</div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white p-3 rounded-lg text-center">
            <div className="font-bold">💪 Comece hoje mesmo!</div>
            <div className="text-sm opacity-90">Faça um flashcard ou quiz para ganhar XP</div>
          </div>
        )}

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Dados atualizados em tempo real
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressStreakDetails;
