import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, TrendingUp, Calendar } from 'lucide-react';
import { FlashcardStudyStats, FlashcardStudyGoal, FlashcardCategory } from '@/types/flashcard';

interface EnhancedFlashcardStatsProps {
  studyStats: FlashcardStudyStats[];
  activeGoals: FlashcardStudyGoal[];
  categories: FlashcardCategory[];
  dueCardsCount: number;
}

const EnhancedFlashcardStats = ({ 
  studyStats, 
  activeGoals, 
  categories, 
  dueCardsCount 
}: EnhancedFlashcardStatsProps) => {
  const totalReviewed = studyStats.reduce((sum, stat) => sum + stat.cards_reviewed, 0);
  const totalRemembered = studyStats.reduce((sum, stat) => sum + stat.cards_remembered, 0);
  const accuracy = totalReviewed > 0 ? Math.round((totalRemembered / totalReviewed) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Due Cards */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-900">Pendentes</h3>
            </div>
            <div className="text-2xl font-bold text-orange-700">{dueCardsCount}</div>
            <p className="text-sm text-orange-600">Cards para revisar hoje</p>
          </CardContent>
        </Card>

        {/* Accuracy */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Precisão</h3>
            </div>
            <div className="text-2xl font-bold text-green-700">{accuracy}%</div>
            <p className="text-sm text-green-600">{totalReviewed} cards revisados</p>
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card className="border-blue-200 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-blue-900">Metas</h3>
            </div>
            <div className="text-2xl font-bold text-primary">{activeGoals.length}</div>
            <p className="text-sm text-primary">Metas ativas</p>
          </CardContent>
        </Card>

        {/* Study Time */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-primary">Tempo Total</h3>
            </div>
            <div className="text-2xl font-bold text-primary">
              {studyStats.reduce((sum, stat) => sum + stat.total_study_time_minutes, 0)}min
            </div>
            <p className="text-sm text-primary">Tempo estudado</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Categorias</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="text-sm"
                style={{ borderColor: category.color, color: category.color }}
              >
                {category.icon} {category.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Active Goals Details */}
      {activeGoals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Metas em Andamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => (
              <Card key={goal.id} className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{goal.goal_type}</h4>
                    <Badge variant="outline">
                      {Math.round((goal.current_progress / goal.target_value) * 100)}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${Math.min((goal.current_progress / goal.target_value) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {goal.current_progress} / {goal.target_value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedFlashcardStats;