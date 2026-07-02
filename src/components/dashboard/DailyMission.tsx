
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useUnifiedProgress } from '@/hooks/useUnifiedProgress';
import { Target, Zap, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { playfulElements } from '@/utils/designSystem';

interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  icon: string;
  route: string;
  type: 'flashcards' | 'quiz' | 'study_time';
}

const DailyMission = () => {
  const navigate = useNavigate();
  const { todayActivity, loading } = useUnifiedProgress();
  const [missions, setMissions] = useState<Mission[]>([]);

  useEffect(() => {
    if (!loading && todayActivity) {
      // Gerar missões baseadas na atividade do usuário
      const dailyMissions: Mission[] = [
        {
          id: 'flashcards_daily',
          title: 'Revisar Flashcards',
          description: 'Revise 10 cartões de estudo hoje',
          target: 10,
          current: todayActivity.flashcards_reviewed || 0,
          xpReward: 50,
          icon: '🧠',
          route: '/my-flashcards',
          type: 'flashcards'
        },
        {
          id: 'quiz_daily',
          title: 'Completar um Quiz',
          description: 'Complete pelo menos 1 quiz hoje',
          target: 1,
          current: todayActivity.quizzes_completed || 0,
          xpReward: 100,
          icon: '🎯',
          route: '/my-summaries',
          type: 'quiz'
        }
      ];

      setMissions(dailyMissions);
    }
  }, [todayActivity, loading]);

  if (loading) {
    return (
      <Card className="bg-muted/50 border-primary/20/50 animate-pulse">
        <CardContent className="p-6">
          <div className="h-6 bg-primary/20 rounded w-1/3 mb-4"></div>
          <div className="h-16 bg-primary/10 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Verificar se todas as missões foram completadas
  const allCompleted = missions.every(m => m.current >= m.target);
  const totalXpAvailable = missions.reduce((sum, m) => sum + m.xpReward, 0);

  return (
    <Card className="bg-muted/50 border-primary/20/50 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-primary px-5 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Missão do Dia</h3>
                <p className="text-white/80 text-sm">Complete para ganhar XP!</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
              <Zap className="h-4 w-4 text-yellow-300" />
              <span className="font-bold">{totalXpAvailable} XP</span>
            </div>
          </div>
        </div>

        {/* Missions List */}
        <div className="p-5 space-y-4">
          {allCompleted ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">🎉</div>
              <h4 className="text-xl font-bold text-emerald-700 mb-2">
                Parabéns! Missões Completas!
              </h4>
              <p className="text-muted-foreground mb-4">
                Você completou todas as missões de hoje. Volte amanhã para mais!
              </p>
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">+{totalXpAvailable} XP ganhos!</span>
              </div>
            </div>
          ) : (
            missions.map((mission) => {
              const isCompleted = mission.current >= mission.target;
              const progressPercent = Math.min((mission.current / mission.target) * 100, 100);

              return (
                <div
                  key={mission.id}
                  className={`relative rounded-xl p-4 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-card border border-border hover:border-primary/20 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`text-3xl flex-shrink-0 ${isCompleted ? 'grayscale-0' : ''}`}>
                      {isCompleted ? '✅' : mission.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${isCompleted ? 'text-emerald-700' : 'text-foreground'}`}>
                          {mission.title}
                        </h4>
                        {isCompleted && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{mission.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {mission.current} / {mission.target}
                          </span>
                          <span className={`font-medium ${isCompleted ? 'text-emerald-600' : 'text-primary'}`}>
                            +{mission.xpReward} XP
                          </span>
                        </div>
                        <Progress 
                          value={progressPercent} 
                          className={`h-2 ${isCompleted ? 'bg-emerald-100' : 'bg-muted'}`}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    {!isCompleted && (
                      <Button
                        size="sm"
                        onClick={() => navigate(mission.route)}
                        className="flex-shrink-0 bg-primary hover:opacity-90 text-white shadow-md"
                      >
                        Ir
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer motivacional */}
        {!allCompleted && (
          <div className="px-5 pb-4">
            <p className="text-center text-sm text-muted-foreground italic">
              {playfulElements.messages.encouragement[Math.floor(Math.random() * playfulElements.messages.encouragement.length)]}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyMission;
