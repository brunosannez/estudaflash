import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Challenge, ChallengeParticipation } from '@/types/social';
import { Target, Calendar, Trophy, Timer } from 'lucide-react';

interface ChallengesSectionProps {
  challenges: Challenge[];
  userChallenges: ChallengeParticipation[];
  onJoinChallenge: (challengeId: string) => void;
  loading?: boolean;
}

export const ChallengesSection = ({ 
  challenges, 
  userChallenges, 
  onJoinChallenge, 
  loading 
}: ChallengesSectionProps) => {
  
  const getUserChallengeProgress = (challengeId: string) => {
    return userChallenges.find(uc => uc.challenge_id === challengeId);
  };

  const getChallengeTypeColor = (type: string) => {
    const colors = {
      daily: 'bg-blue-500',
      weekly: 'bg-green-500',
      monthly: 'bg-purple-500',
      special: 'bg-orange-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      flashcards: '🧠',
      quiz: '❓',
      streak: '🔥',
      xp: '⭐'
    };
    return icons[category as keyof typeof icons] || '🎯';
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Desafios Ativos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-6 bg-muted rounded w-full" />
                  <div className="h-8 bg-muted rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum desafio ativo no momento.</p>
            <p className="text-sm">Novos desafios aparecerão em breve!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge) => {
              const userProgress = getUserChallengeProgress(challenge.id);
              const progressPercentage = userProgress 
                ? Math.min((userProgress.current_progress / challenge.target_value) * 100, 100)
                : 0;
              const expired = isExpired(challenge.end_date);
              const completed = userProgress?.completed;

              return (
                <div
                  key={challenge.id}
                  className={`p-4 border rounded-lg transition-all ${
                    completed 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                      : expired
                      ? 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800 opacity-60'
                      : 'bg-card hover:shadow-md'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(challenge.category)}</span>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {challenge.title}
                          {completed && <Trophy className="h-4 w-4 text-yellow-500" />}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {challenge.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        className={`${getChallengeTypeColor(challenge.type)} text-white`}
                      >
                        {challenge.type}
                      </Badge>
                      {challenge.xp_reward > 0 && (
                        <span className="text-xs text-muted-foreground">
                          +{challenge.xp_reward} XP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  {userProgress && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progresso</span>
                        <span>
                          {userProgress.current_progress} / {challenge.target_value}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Até {new Date(challenge.end_date).toLocaleDateString('pt-BR')}
                      </div>
                      {challenge.badge_reward && (
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          {challenge.badge_reward}
                        </div>
                      )}
                    </div>

                    {!userProgress && !expired && (
                      <Button
                        size="sm"
                        onClick={() => onJoinChallenge(challenge.id)}
                        className="h-8"
                      >
                        Participar
                      </Button>
                    )}

                    {completed && (
                      <Badge variant="default" className="bg-green-600">
                        ✓ Completo
                      </Badge>
                    )}

                    {expired && !completed && (
                      <Badge variant="secondary">
                        <Timer className="h-3 w-3 mr-1" />
                        Expirado
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};