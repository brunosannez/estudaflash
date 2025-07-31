import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEnhancedQuizSystem } from '@/hooks/useEnhancedQuizSystem';
import { Trophy, Target, Clock, Brain } from 'lucide-react';

const EnhancedQuizDashboard = () => {
  const {
    analytics,
    todayStats,
    badges,
    isLoading,
    refreshAnalytics
  } = useEnhancedQuizSystem();

  if (isLoading) {
    return <div className="p-6">Carregando estatísticas...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard de Quizzes</h1>
        <Button onClick={refreshAnalytics} variant="outline">
          Atualizar Dados
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Quizzes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalQuizzes || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisão Média</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.averageAccuracy ? `${Math.round(analytics.averageAccuracy)}%` : '0%'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.totalTimeSpent ? `${Math.round(analytics.totalTimeSpent / 60)}min` : '0min'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badges?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Progress */}
      {todayStats && (
        <Card>
          <CardHeader>
            <CardTitle>Progresso de Hoje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Quizzes Completados: {todayStats.total_quizzes_completed}</span>
              <span>Precisão: {Math.round(todayStats.average_accuracy)}%</span>
            </div>
            <Progress value={Math.min(100, (todayStats.total_quizzes_completed / 5) * 100)} />
          </CardContent>
        </Card>
      )}

      {/* Recent Badges */}
      {badges && badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conquistas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {badges.slice(0, 6).map((badge) => (
                <Badge key={badge.id} variant="secondary" className="p-2">
                  <span className="mr-2">{badge.badge_icon}</span>
                  {badge.badge_name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedQuizDashboard;