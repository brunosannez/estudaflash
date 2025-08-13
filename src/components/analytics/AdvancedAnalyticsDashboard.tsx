import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Clock, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { useStudyAnalytics } from '@/hooks/useStudyAnalytics';

const AdvancedAnalyticsDashboard = () => {
  const { 
    analytics, 
    recommendations, 
    loading,
    getWeeklyProgress,
    getSubjectPerformance 
  } = useStudyAnalytics();

  const weeklyProgress = getWeeklyProgress();
  const subjectPerformance = getSubjectPerformance();
  
  const totalStudyTime = weeklyProgress.reduce((sum, day) => sum + day.total_study_time_minutes, 0);
  const totalCards = weeklyProgress.reduce((sum, day) => sum + day.flashcards_mastered, 0);
  const avgAccuracy = weeklyProgress.length > 0 
    ? weeklyProgress.reduce((sum, day) => sum + day.quiz_accuracy_percentage, 0) / weeklyProgress.length 
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Tempo de Estudo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(totalStudyTime / 60)}h {totalStudyTime % 60}m
            </div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-green-500" />
              Cards Dominados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalCards}</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-500" />
              Precisão Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {avgAccuracy.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Study Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Recomendações Personalizadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {rec.priority === 1 && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {rec.priority === 2 && <TrendingUp className="h-4 w-4 text-yellow-500" />}
                    {rec.priority === 3 && <CheckCircle className="h-4 w-4 text-green-500" />}
                    <span className="font-medium">{rec.title}</span>
                    <Badge variant={rec.priority === 1 ? "destructive" : rec.priority === 2 ? "default" : "secondary"}>
                      {rec.priority === 1 ? "Alta" : rec.priority === 2 ? "Média" : "Baixa"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      ~{rec.estimated_time_minutes} min
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {rec.target_cards} cards
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Começar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Subject Performance */}
      {subjectPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Performance por Matéria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjectPerformance.map((subject, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{subject.subject}</span>
                  <Badge variant={subject.avg_accuracy >= 80 ? "default" : subject.avg_accuracy >= 60 ? "secondary" : "destructive"}>
                    {subject.avg_accuracy.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={subject.avg_accuracy} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{subject.total_cards} cards dominados</span>
                  <span>{Math.round(subject.total_time / 60)}h {subject.total_time % 60}m estudados</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Learning Velocity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Velocidade de Aprendizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weeklyProgress.slice(0, 7).map((day, index) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
              const velocity = day.learning_velocity || 0;
              
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium">{dayName}</div>
                  <div className="flex-1">
                    <Progress value={Math.min(velocity * 10, 100)} className="h-2" />
                  </div>
                  <div className="w-20 text-sm text-muted-foreground text-right">
                    {velocity.toFixed(1)} c/min
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;