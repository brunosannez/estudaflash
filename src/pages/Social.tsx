import PageLayout from '@/components/navigation/PageLayout';
import { SocialProfile } from '@/components/social/SocialProfile';
import { SocialDashboard } from '@/components/social/SocialDashboard';
import { SocialLeaderboard } from '@/components/social/SocialLeaderboard';
import { SocialChallenges } from '@/components/social/SocialChallenges';
import { SocialFeed } from '@/components/social/SocialFeed';
import { useSocialFeatures } from '@/hooks/useSocialFeatures';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SocialLoading, EmptyState } from '@/components/common/LoadingStates';
import { Users, Target, Trophy, Activity, Home } from 'lucide-react';

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
          <SocialLoading />
        </div>
      </PageLayout>
    );
  }

  if (!socialProfile) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Social</h1>
          <EmptyState
            icon={Users}
            title="Erro ao carregar perfil social"
            description="Tente novamente mais tarde ou entre em contato com o suporte."
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Social</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span className="text-sm">Conecte-se com outros estudantes</span>
          </div>
        </div>

        {/* Profile Section */}
        <SocialProfile
          profile={socialProfile}
          onUpdate={updateSocialProfile}
          onShare={shareAchievement}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
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
              Feed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <SocialDashboard
              profile={socialProfile}
              challenges={challenges}
              userChallenges={userChallenges}
              onShare={shareAchievement}
            />
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            <SocialChallenges
              challenges={challenges}
              userChallenges={userChallenges}
              onJoinChallenge={joinChallenge}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <SocialLeaderboard
              leaderboard={leaderboard}
              onFilterChange={loadLeaderboard}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <SocialFeed
              activities={friendsActivities}
              userProfile={socialProfile}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}