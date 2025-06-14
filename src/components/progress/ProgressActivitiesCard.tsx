
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
          <Target className="h-5 w-5 mr-2 text-blue-600" />
          Atividades de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Flashcards</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.todayFlashcards}</div>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
          <div className="flex items-center gap-3">
            <TestTube className="h-5 w-5 text-green-600" />
            <span className="font-medium">Quizzes</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.todayQuizzes}</div>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
          <div className="flex items-center gap-3">
            <Award className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Acertos</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.todayCorrectAnswers}</div>
        </div>

        {stats.todayXp > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white text-center">
            <div className="text-lg font-bold">🎉 {stats.todayXp} XP ganhos hoje!</div>
            <div className="text-sm opacity-90">Continue assim!</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressActivitiesCard;
