import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SocialActivity, UserSocialProfile } from '@/types/social';
import { 
  Activity, 
  Trophy, 
  Target, 
  Zap, 
  Star, 
  TrendingUp,
  Heart,
  MessageSquare,
  Share2,
  Calendar
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SocialFeedProps {
  activities: SocialActivity[];
  userProfile?: UserSocialProfile;
  loading?: boolean;
}

export const SocialFeed = ({ activities, userProfile, loading }: SocialFeedProps) => {
  
  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'level_up':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'badge_earned':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'challenge_completed':
        return <Target className="h-5 w-5 text-green-500" />;
      case 'streak_milestone':
        return <Zap className="h-5 w-5 text-orange-500" />;
      case 'quiz_perfect':
        return <Star className="h-5 w-5 text-primary" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'level_up':
        return 'border-blue-200 bg-primary/5/50';
      case 'badge_earned':
        return 'border-yellow-200 bg-yellow-50/50';
      case 'challenge_completed':
        return 'border-green-200 bg-green-50/50';
      case 'streak_milestone':
        return 'border-orange-200 bg-orange-50/50';
      case 'quiz_perfect':
        return 'border-primary/20 bg-primary/5/50';
      default:
        return 'border-border bg-muted/50/50';
    }
  };

  const formatActivityTime = (createdAt: string) => {
    const now = new Date();
    const activityTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}min atrás`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h atrás`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d atrás`;
    }
  };

  const getActivityEmoji = (activityType: string) => {
    switch (activityType) {
      case 'level_up':
        return '🎓';
      case 'badge_earned':
        return '🏆';
      case 'challenge_completed':
        return '🎯';
      case 'streak_milestone':
        return '🔥';
      case 'quiz_perfect':
        return '⭐';
      default:
        return '📚';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Feed de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const myActivities = activities.filter(activity => 
    userProfile?.user_id === activity.user_id
  );
  
  const friendsActivities = activities.filter(activity => 
    userProfile?.user_id !== activity.user_id
  );

  return (
    <div className="space-y-6">
      {/* Minhas Atividades Recentes */}
      {myActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Minhas Conquistas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myActivities.slice(0, 3).map((activity) => (
                <div
                  key={activity.id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-sm ${
                    getActivityColor(activity.activity_type)
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-card rounded-full border">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {getActivityEmoji(activity.activity_type)}
                        </span>
                        <h4 className="font-medium text-foreground">
                          {activity.title}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          Você
                        </Badge>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {activity.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {formatActivityTime(activity.created_at)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feed de Amigos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Atividades da Comunidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friendsActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                Nenhuma atividade ainda
              </h3>
              <p className="text-muted-foreground mb-4">
                Quando outros usuários conquistarem badges ou completarem desafios, 
                suas atividades aparecerão aqui.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>💡 Complete quizzes e ganhe XP</p>
                <p>🎯 Participe de desafios</p>
                <p>🔥 Mantenha sua sequência de estudos</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {friendsActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-sm ${
                    getActivityColor(activity.activity_type)
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {activity.user_id?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {getActivityEmoji(activity.activity_type)}
                        </span>
                        <h4 className="font-medium text-foreground">
                          {activity.title}
                        </h4>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {activity.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatActivityTime(activity.created_at)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
                            <Heart className="h-3 w-3" />
                            <span className="text-xs">0</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span className="text-xs">0</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas do Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {activities.filter(a => a.activity_type === 'level_up').length}
              </div>
              <div className="text-xs text-muted-foreground">
                Níveis Ganhos
              </div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {activities.filter(a => a.activity_type === 'badge_earned').length}
              </div>
              <div className="text-xs text-muted-foreground">
                Badges Ganhos
              </div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {activities.filter(a => a.activity_type === 'challenge_completed').length}
              </div>
              <div className="text-xs text-muted-foreground">
                Desafios Completos
              </div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {activities.filter(a => a.activity_type === 'quiz_perfect').length}
              </div>
              <div className="text-xs text-muted-foreground">
                Quizzes Perfeitos
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};