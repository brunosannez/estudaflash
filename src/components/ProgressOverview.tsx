
import { Flame, Trophy, Target, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StatsCard from './StatsCard';

const ProgressOverview = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="XP Total"
          value="1,250"
          icon={Trophy}
          gradient="bg-gradient-to-br from-yellow-500 to-orange-600"
        />
        <StatsCard
          title="Streak"
          value="7 dias"
          icon={Flame}
          gradient="bg-gradient-to-br from-red-500 to-pink-600"
        />
        <StatsCard
          title="Flashcards"
          value="45"
          icon={Target}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <StatsCard
          title="Tempo Hoje"
          value="25min"
          icon={Clock}
          gradient="bg-gradient-to-br from-green-500 to-teal-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
              Progresso do Nível
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Nível 5</span>
              <span className="text-sm text-gray-500">1,250 / 1,500 XP</span>
            </div>
            <Progress value={83} className="h-3" />
            <p className="text-sm text-gray-600">
              Faltam apenas 250 XP para o próximo nível!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flame className="h-5 w-5 mr-2 text-red-500" />
              Histórico de Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold">7 dias</span>
              <span className="text-sm text-gray-500">Recorde: 12 dias</span>
            </div>
            <div className="flex space-x-1">
              {Array.from({length: 7}).map((_, i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                >
                  ✓
                </div>
              ))}
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-xs">
                ?
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressOverview;
