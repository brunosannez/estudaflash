import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, TrendingUp, Clock, Award } from 'lucide-react';
import { FlashcardSetStats } from '@/hooks/useFlashcardSetStats';

interface FlashcardStatsTooltipProps {
  stats: FlashcardSetStats;
  className?: string;
}

const FlashcardStatsTooltip = ({ stats, className }: FlashcardStatsTooltipProps) => {
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-accent bg-accent/5 border-accent/20';
    if (accuracy >= 75) return 'text-primary bg-primary/5 border-primary/20';
    if (accuracy >= 60) return 'text-brand-orange bg-brand-orange/5 border-brand-orange/20';
    return 'text-destructive bg-destructive/5 border-destructive/20';
  };

  const getRecommendation = (accuracy: number, studyStreak: number) => {
    if (accuracy >= 90 && studyStreak >= 3) {
      return { text: "Domínio excelente! ✨", color: "text-green-600" };
    }
    if (accuracy >= 75) {
      return { text: "Bom progresso! 👍", color: "text-primary" };
    }
    if (accuracy >= 60) {
      return { text: "Precisa praticar mais 📚", color: "text-yellow-600" };
    }
    return { text: "Revisar conceitos 🔄", color: "text-orange-600" };
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca estudado';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.round(seconds / 60)}min`;
  };

  const recommendation = getRecommendation(stats.accuracy_percentage, stats.study_streak);

  return (
    <Card className={`w-80 shadow-xl border-2 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <Target className="h-5 w-5" />
          Estatísticas de Estudo
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Precisão Principal */}
        <div className="text-center">
          <div className={`text-3xl font-bold mb-2 ${getAccuracyColor(stats.accuracy_percentage).split(' ')[0]}`}>
            {stats.accuracy_percentage.toFixed(1)}%
          </div>
          <Progress value={stats.accuracy_percentage} className="h-2 mb-2" />
          <p className="text-sm text-muted-foreground">
            {stats.total_correct} corretas de {stats.total_correct + stats.total_incorrect} tentativas
          </p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary/5 p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-blue-800">Sessões</span>
            </div>
            <div className="text-lg font-bold text-primary">
              {stats.completed_sessions}/{stats.total_sessions}
            </div>
            <div className="text-xs text-primary">completas</div>
          </div>

          <div className="bg-primary/5 p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">Melhor</span>
            </div>
            <div className="text-lg font-bold text-primary">
              {stats.best_accuracy.toFixed(0)}%
            </div>
            <div className="text-xs text-primary">precisão</div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              Tempo médio:
            </span>
            <span className="font-medium">
              {formatTime(stats.average_session_time)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Sequência:
            </span>
            <span className="font-medium">
              🔥 {stats.study_streak} dias
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Último estudo:</span>
            <span className="font-medium">
              {formatDate(stats.last_studied_at)}
            </span>
          </div>
        </div>

        {/* Recomendação */}
        <div className={`p-3 rounded-lg border ${getAccuracyColor(stats.accuracy_percentage)}`}>
          <div className="text-center">
            <div className={`font-semibold ${recommendation.color}`}>
              {recommendation.text}
            </div>
            {stats.total_cards_reviewed > 0 && (
              <div className="text-xs mt-1 opacity-75">
                {stats.total_cards_reviewed} cards revisados no total
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardStatsTooltip;