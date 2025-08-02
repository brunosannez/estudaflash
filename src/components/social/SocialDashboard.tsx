import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useSocialFeatures } from '@/hooks/useSocialFeatures';
import { UserSocialProfile } from '@/types/social';
import { 
  Trophy, 
  Users, 
  Target, 
  TrendingUp, 
  Star,
  Calendar,
  Award,
  Share2
} from 'lucide-react';

interface SocialDashboardProps {
  profile: UserSocialProfile;
}

export const SocialDashboard = ({ profile }: SocialDashboardProps) => {
  const { challenges, userChallenges, shareAchievement } = useSocialFeatures();

  // Calcular estatísticas do perfil
  const completedChallenges = userChallenges.filter(uc => uc.completed).length;
  const activeChallenges = userChallenges.filter(uc => !uc.completed).length;
  const badgeCount = Array.isArray(profile.badges) ? profile.badges.length : 0;

  // Calcular progresso para o próximo nível
  const xpForCurrentLevel = (profile.current_level - 1) * 1000;
  const xpForNextLevel = profile.current_level * 1000;
  const xpProgress = ((profile.total_xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  const handleShareLevel = () => {
    shareAchievement('level', {
      level: profile.current_level,
      totalXp: profile.total_xp,
      displayName: profile.display_name
    }, 'whatsapp');
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Nível Atual */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Nível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-3xl font-bold text-primary">
              {profile.current_level}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>XP: {profile.total_xp}</span>
                <span>Próximo: {xpForNextLevel}</span>
              </div>
              <Progress value={xpProgress} className="h-2" />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleShareLevel}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Badges/Conquistas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-3xl font-bold text-primary">
              {badgeCount}
            </div>
            <div className="space-y-2">
              {badgeCount > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {profile.badges.slice(0, 3).map((badge: any, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {badge.icon || '🏆'} {badge.name}
                    </Badge>
                  ))}
                  {badgeCount > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{badgeCount - 3} mais
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma conquista ainda
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desafios */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Desafios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {completedChallenges}
                </div>
                <div className="text-xs text-muted-foreground">
                  Completos
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">
                  {activeChallenges}
                </div>
                <div className="text-xs text-muted-foreground">
                  Ativos
                </div>
              </div>
            </div>
            <div className="space-y-1">
              {userChallenges.slice(0, 2).map((uc) => {
                const challenge = challenges.find(c => c.id === uc.challenge_id);
                if (!challenge) return null;
                
                const progress = (uc.current_progress / challenge.target_value) * 100;
                
                return (
                  <div key={uc.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="truncate">{challenge.title}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1" />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Atividade Recente */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Flashcards</span>
                <Badge variant="secondary">
                  {profile.stats?.flashcards_studied || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Quizzes</span>
                <Badge variant="secondary">
                  {profile.stats?.quizzes_completed || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Precisão</span>
                <Badge variant="secondary">
                  {profile.stats?.average_accuracy || 0}%
                </Badge>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Última atividade: hoje</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};