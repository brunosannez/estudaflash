import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, BarChart3, Trophy, Target } from 'lucide-react';
import { QuizBadge, QuizPerformanceStats } from '@/types/enhancedQuiz';

interface QuizStatsHeaderProps {
  badges: QuizBadge[];
  todayStats?: QuizPerformanceStats;
  onOpenDashboard: () => void;
  onOpenConfig: () => void;
}

const QuizStatsHeader = ({ 
  badges, 
  todayStats, 
  onOpenDashboard, 
  onOpenConfig 
}: QuizStatsHeaderProps) => {
  if (!badges.length && !todayStats) return null;

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Today's Stats */}
            {todayStats && (
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <div className="flex items-center gap-1 mb-1">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Hoje:</span>
                  </div>
                  <div className="text-blue-700">
                    <span className="font-bold">{todayStats.total_quizzes_completed}</span> quizzes
                    {todayStats.average_accuracy > 0 && (
                      <span className="ml-2">
                        • <span className="font-bold">{Math.round(todayStats.average_accuracy)}%</span> precisão
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Badges:</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {badges.length} conquistados
                </Badge>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenDashboard}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Analytics
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenConfig}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              <Settings className="h-4 w-4 mr-1" />
              Configurar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizStatsHeader;