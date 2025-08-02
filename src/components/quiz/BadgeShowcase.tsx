import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEnhancedQuizSystem } from '@/hooks/useEnhancedQuizSystem';
import { Trophy, Star, Target, Zap, Award, Crown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BadgeShowcase = () => {
  const { badges, analytics } = useEnhancedQuizSystem();

  // Badge progress tracking
  const badgeProgress = [
    {
      id: 'first_quiz',
      name: 'Primeira Tentativa',
      description: 'Complete seu primeiro quiz',
      icon: '🎯',
      progress: analytics?.totalQuizzes > 0 ? 100 : 0,
      target: 1,
      current: Math.min(1, analytics?.totalQuizzes || 0),
      earned: badges.some(b => b.badge_type === 'first_quiz')
    },
    {
      id: 'quiz_veteran',
      name: 'Veterano dos Quizzes',
      description: 'Complete 10 quizzes',
      icon: '🏅',
      progress: Math.min(100, ((analytics?.totalQuizzes || 0) / 10) * 100),
      target: 10,
      current: analytics?.totalQuizzes || 0,
      earned: badges.some(b => b.badge_type === 'quiz_veteran')
    },
    {
      id: 'perfectionist',
      name: 'Perfeccionista',
      description: 'Acerte 100% em 3 quizzes',
      icon: '💯',
      progress: 0, // Would need perfect score tracking
      target: 3,
      current: 0,
      earned: badges.some(b => b.badge_type === 'perfectionist')
    },
    {
      id: 'high_accuracy',
      name: 'Mira Certeira',
      description: 'Mantenha 90%+ de precisão',
      icon: '🎯',
      progress: analytics?.averageAccuracy >= 90 ? 100 : ((analytics?.averageAccuracy || 0) / 90) * 100,
      target: 90,
      current: Math.round(analytics?.averageAccuracy || 0),
      earned: badges.some(b => b.badge_type === 'high_accuracy')
    },
    {
      id: 'speed_demon',
      name: 'Velocista',
      description: 'Complete um quiz em menos de 5 minutos',
      icon: '⚡',
      progress: 0, // Would need speed tracking
      target: 1,
      current: 0,
      earned: badges.some(b => b.badge_type === 'speed_demon')
    },
    {
      id: 'consistent_learner',
      name: 'Estudante Consistente',
      description: 'Faça quizzes por 7 dias consecutivos',
      icon: '📚',
      progress: Math.min(100, ((analytics?.streakData?.current || 0) / 7) * 100),
      target: 7,
      current: analytics?.streakData?.current || 0,
      earned: badges.some(b => b.badge_type === 'consistent_learner')
    }
  ];

  const earnedBadges = badges || [];
  const availableBadges = badgeProgress.filter(b => !b.earned);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold">Sistema de Conquistas</h2>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Conquistas Desbloqueadas ({earnedBadges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="relative p-4 rounded-lg border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{badge.badge_icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-yellow-800">{badge.badge_name}</h3>
                      <p className="text-sm text-yellow-700 mb-2">{badge.badge_description}</p>
                      <p className="text-xs text-yellow-600">
                        Conquistado {formatDistanceToNow(new Date(badge.earned_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-yellow-500 text-yellow-900">
                      <Star className="h-3 w-3 mr-1" />
                      Conquistado
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Próximas Conquistas ({availableBadges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableBadges.map((badge) => (
              <div
                key={badge.id}
                className="p-4 rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl opacity-60">{badge.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-700">{badge.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Progresso: {badge.current}/{badge.target}
                    </span>
                    <span className="font-medium text-blue-600">
                      {Math.round(badge.progress)}%
                    </span>
                  </div>
                  <Progress value={badge.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badge Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{earnedBadges.length}</div>
            <div className="text-sm text-gray-600">Conquistas Desbloqueadas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{availableBadges.length}</div>
            <div className="text-sm text-gray-600">Próximas Conquistas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((earnedBadges.length / badgeProgress.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Taxa de Conclusão</div>
          </CardContent>
        </Card>
      </div>

      {earnedBadges.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Suas primeiras conquistas estão esperando!
            </h3>
            <p className="text-gray-500 mb-4">
              Complete quizzes e desbloqueie badges incríveis para mostrar seu progresso.
            </p>
            <Badge variant="outline" className="text-blue-600">
              Comece fazendo seu primeiro quiz! 🚀
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BadgeShowcase;