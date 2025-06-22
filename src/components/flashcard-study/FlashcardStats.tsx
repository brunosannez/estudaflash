
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Target, TrendingUp, Trophy } from 'lucide-react';

interface FlashcardStatsProps {
  studyStats: {
    xpEarned: number;
    totalReviewed: number;
    streak: number;
  };
  score: {
    correct: number;
    incorrect: number;
  };
}

const FlashcardStats = ({ studyStats, score }: FlashcardStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
        <CardContent className="p-4 text-center">
          <Zap className="h-6 w-6 mx-auto mb-2" />
          <p className="text-purple-100 text-sm font-medium">XP Ganho</p>
          <p className="text-2xl font-bold">{studyStats.xpEarned}</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
        <CardContent className="p-4 text-center">
          <Target className="h-6 w-6 mx-auto mb-2" />
          <p className="text-green-100 text-sm font-medium">Acertos</p>
          <p className="text-2xl font-bold">{score.correct}</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
        <CardContent className="p-4 text-center">
          <TrendingUp className="h-6 w-6 mx-auto mb-2" />
          <p className="text-blue-100 text-sm font-medium">Sequência</p>
          <p className="text-2xl font-bold">{studyStats.streak}</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-lg">
        <CardContent className="p-4 text-center">
          <Trophy className="h-6 w-6 mx-auto mb-2" />
          <p className="text-cyan-100 text-sm font-medium">Revisados</p>
          <p className="text-2xl font-bold">{studyStats.totalReviewed}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlashcardStats;
