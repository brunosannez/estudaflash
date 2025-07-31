import PageLayout from '@/components/navigation/PageLayout';
import { SocialProfile } from '@/components/social/SocialProfile';
import { Leaderboard } from '@/components/social/Leaderboard';
import { ChallengesSection } from '@/components/social/ChallengesSection';
import { useSocialFeatures } from '@/hooks/useSocialFeatures';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Trophy, Activity } from 'lucide-react';

export default function Social() {
  const {
    socialProfile,
    challenges,
    userChallenges,
    leaderboard,
    friendsActivities,
    loading,
    updateSocialProfile,
    joinChallenge,
    shareAchievement,
    loadLeaderboard
  } = useSocialFeatures();

  if (loading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Social</h1>
          <div className="animate-pulse">
            <div className="h-64 bg-muted rounded-lg mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-muted rounded-lg" />
              <div className="h-96 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!socialProfile) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Social</h1>
          <Card>
            <CardContent className="py-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Erro ao carregar perfil social. Tente novamente mais tarde.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Social</h1>
        {/* Profile Section */}
        <SocialProfile
          profile={socialProfile}
          onUpdate={updateSocialProfile}
          onShare={shareAchievement}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Desafios
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Atividades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-4">
            <ChallengesSection
              challenges={challenges}
              userChallenges={userChallenges}
              onJoinChallenge={joinChallenge}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Leaderboard
              leaderboard={leaderboard}
              onFilterChange={loadLeaderboard}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Feed de Atividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {friendsActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma atividade de amigos ainda.</p>
                    <p className="text-sm">
                      Adicione amigos para ver suas conquistas!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {friendsActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-4 border rounded-lg bg-muted/30"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">
                            {activity.activity_type === 'level_up' && '🎓'}
                            {activity.activity_type === 'badge_earned' && '🏆'}
                            {activity.activity_type === 'challenge_completed' && '🎯'}
                            {activity.activity_type === 'streak_milestone' && '🔥'}
                            {activity.activity_type === 'quiz_perfect' && '⭐'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{activity.title}</h4>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {activity.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(activity.created_at).toLocaleDateString('pt-BR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}