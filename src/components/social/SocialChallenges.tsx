import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Challenge, ChallengeParticipation } from '@/types/social';
import { 
  Target, 
  Calendar, 
  Trophy, 
  Timer, 
  CheckCircle, 
  Clock,
  Star,
  Brain,
  Zap,
  TrendingUp
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SocialChallengesProps {
  challenges: Challenge[];
  userChallenges: ChallengeParticipation[];
  onJoinChallenge: (challengeId: string) => void;
  loading?: boolean;
}

export const SocialChallenges = ({ 
  challenges, 
  userChallenges, 
  onJoinChallenge, 
  loading 
}: SocialChallengesProps) => {
  
  const getUserChallengeProgress = (challengeId: string) => {
    return userChallenges.find(uc => uc.challenge_id === challengeId);
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-primary/10 text-blue-800 border-blue-200';
      case 'weekly':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'monthly':
        return 'bg-primary/10 text-purple-800 border-primary/20';
      case 'special':
        return 'bg-amber-100 dark:bg-amber-950/40 text-orange-800 border-orange-200';
      default:
        return 'bg-muted text-foreground border-border';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'flashcards':
        return <Brain className="h-4 w-4" />;
      case 'quiz':
        return <Target className="h-4 w-4" />;
      case 'streak':
        return <Zap className="h-4 w-4" />;
      case 'xp':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const filterChallengesByType = (type: string) => {
    return challenges.filter(challenge => challenge.type === type);
  };

  const activeChallenges = challenges.filter(c => !isExpired(c.end_date));
  const userActiveChallenges = activeChallenges.filter(c => 
    getUserChallengeProgress(c.id) && !getUserChallengeProgress(c.id)?.completed
  );
  const userCompletedChallenges = userChallenges.filter(uc => uc.completed);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Desafios Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3 p-4 border rounded-lg">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
    const userProgress = getUserChallengeProgress(challenge.id);
    const progress = userProgress 
      ? (userProgress.current_progress / challenge.target_value) * 100 
      : 0;
    const daysRemaining = getDaysRemaining(challenge.end_date);
    const expired = isExpired(challenge.end_date);

    return (
      <Card className={`transition-all hover:shadow-md ${
        userProgress?.completed 
          ? 'border-green-200 bg-green-50/50' 
          : expired 
          ? 'border-border bg-muted/50/50' 
          : 'hover:border-primary/50'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {getCategoryIcon(challenge.category)}
                {challenge.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={getChallengeTypeColor(challenge.type)}
                >
                  {challenge.type === 'daily' && 'Diário'}
                  {challenge.type === 'weekly' && 'Semanal'}
                  {challenge.type === 'monthly' && 'Mensal'}
                  {challenge.type === 'special' && 'Especial'}
                </Badge>
                <Badge variant="secondary">
                  <Trophy className="h-3 w-3 mr-1" />
                  {challenge.xp_reward} XP
                </Badge>
              </div>
            </div>
            
            {userProgress?.completed ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completo
              </Badge>
            ) : expired ? (
              <Badge variant="secondary" className="bg-muted/500">
                <Clock className="h-3 w-3 mr-1" />
                Expirado
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {challenge.description}
          </p>
          
          {userProgress && (
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>
                  {userProgress.current_progress} / {challenge.target_value}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {expired 
                    ? 'Expirado' 
                    : daysRemaining === 0 
                    ? 'Último dia' 
                    : `${daysRemaining} dias`
                  }
                </span>
              </div>
              {challenge.badge_reward && (
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>Badge especial</span>
                </div>
              )}
            </div>
            
            {!userProgress && !expired && (
              <Button 
                onClick={() => onJoinChallenge(challenge.id)}
                size="sm"
                className="ml-4"
              >
                <Target className="h-4 w-4 mr-1" />
                Participar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Resumo dos Desafios */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userActiveChallenges.length}</p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userCompletedChallenges.length}</p>
                <p className="text-sm text-muted-foreground">Completos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {userCompletedChallenges.reduce((sum, uc) => {
                    const challenge = challenges.find(ch => ch.id === uc.challenge_id);
                    return sum + (challenge?.xp_reward || 0);
                  }, 0)}
                </p>
                <p className="text-sm text-muted-foreground">XP Ganho</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Desafios */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="available">Disponíveis</TabsTrigger>
          <TabsTrigger value="active">Meus Ativos</TabsTrigger>
          <TabsTrigger value="completed">Completos</TabsTrigger>
          <TabsTrigger value="daily">Diários</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {activeChallenges
              .filter(c => !getUserChallengeProgress(c.id))
              .map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))
            }
          </div>
          {activeChallenges.filter(c => !getUserChallengeProgress(c.id)).length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Nenhum desafio disponível no momento.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {userActiveChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
          {userActiveChallenges.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Você não tem desafios ativos.
                </p>
                <p className="text-sm text-muted-foreground">
                  Participe de alguns desafios para começar!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {userCompletedChallenges.map(uc => {
              const challenge = challenges.find(c => c.id === uc.challenge_id);
              return challenge ? <ChallengeCard key={uc.id} challenge={challenge} /> : null;
            })}
          </div>
          {userCompletedChallenges.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Nenhum desafio completo ainda.
                </p>
                <p className="text-sm text-muted-foreground">
                  Complete alguns desafios para ver suas conquistas!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filterChallengesByType('daily').map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
          {filterChallengesByType('daily').length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Nenhum desafio diário disponível.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};