
import { Star, Zap } from 'lucide-react';
import { GameStats } from '@/types/gamification';

interface QuizHeaderProps {
  quizTitle: string;
  currentXP: number;
  streakCount: number;
  stats: GameStats | null;
}

const QuizHeader = ({ quizTitle, currentXP, streakCount, stats }: QuizHeaderProps) => {
  return (
    <div className="mb-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-3">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-800 font-fredoka">
          Quiz: {quizTitle}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {/* Contador de XP atual */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
            <Zap className="h-3 w-3" />
            <span className="font-bold font-fredoka text-xs">{currentXP} XP</span>
          </div>
          
          {/* Streak counter */}
          {streakCount > 0 && (
            <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
              <span className="text-xs">🔥</span>
              <span className="font-bold font-fredoka text-xs">{streakCount}</span>
            </div>
          )}
          
          {/* Nível atual */}
          {stats && (
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
              <Star className="h-3 w-3" />
              <span className="font-bold font-fredoka text-xs">Nível {stats.currentLevel}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Barra de progresso do XP */}
      {stats && (
        <div className="mb-3">
          <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
            <span>Progresso para Nível {stats.currentLevel + 1}</span>
            <span>{stats.currentXp} / {stats.nextLevelXp} XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
            <div 
              className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out shadow-lg"
              style={{ width: `${stats.xpProgress}%` }}
            />
          </div>
        </div>
      )}
      
      <p className="text-gray-600 font-nunito text-xs lg:text-sm">
        Responda as perguntas e ganhe XP! 🎯
      </p>
    </div>
  );
};

export default QuizHeader;
