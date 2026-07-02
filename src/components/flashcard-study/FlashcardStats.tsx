
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
  realGamificationData?: {
    totalXP: number;
    currentLevel: number;
    currentStreak: number;
    flashcardsReviewedToday: number;
    loading: boolean;
  };
}

const FlashcardStats = ({ studyStats, score, realGamificationData }: FlashcardStatsProps) => {
  // Use dados reais quando disponíveis, senão use dados da sessão atual
  const displayXP = realGamificationData?.loading ? studyStats.xpEarned : realGamificationData?.totalXP || studyStats.xpEarned;
  const displayStreak = realGamificationData?.loading ? studyStats.streak : realGamificationData?.currentStreak || studyStats.streak;
  const displayReviewed = realGamificationData?.loading ? studyStats.totalReviewed : (realGamificationData?.flashcardsReviewedToday || 0) + studyStats.totalReviewed;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-primary text-white border-0 shadow-lg">
        <CardContent className="p-4 text-center">
          <Zap className="h-6 w-6 mx-auto mb-2" />
          <p className="text-purple-100 text-sm font-medium">
            {realGamificationData?.loading ? 'XP Sessão' : 'XP Total'}
          </p>
          <p className="text-2xl font-bold">{displayXP}</p>
          {!realGamificationData?.loading && realGamificationData?.currentLevel && (
            <p className="text-xs text-purple-200">Nível {realGamificationData.currentLevel}</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-emerald-600 text-white border-0 shadow-lg">
        <CardContent className="p-4 text-center">
          <Target className="h-6 w-6 mx-auto mb-2" />
          <p className="text-green-100 text-sm font-medium">Acertos</p>
          <p className="text-2xl font-bold">{score.correct}</p>
        </CardContent>
      </Card>

      <Card className="bg-primary text-white border-0 shadow-lg">
        <CardContent className="p-4 text-center">
          <TrendingUp className="h-6 w-6 mx-auto mb-2" />
          <p className="text-blue-100 text-sm font-medium">
            {realGamificationData?.loading ? 'Sequência' : 'Sequência Atual'}
          </p>
          <p className="text-2xl font-bold">{displayStreak}</p>
        </CardContent>
      </Card>

      <Card className="bg-primary text-white border-0 shadow-lg">
        <CardContent className="p-4 text-center">
          <Trophy className="h-6 w-6 mx-auto mb-2" />
          <p className="text-cyan-100 text-sm font-medium">
            {realGamificationData?.loading ? 'Revisados' : 'Hoje + Sessão'}
          </p>
          <p className="text-2xl font-bold">{displayReviewed}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlashcardStats;
