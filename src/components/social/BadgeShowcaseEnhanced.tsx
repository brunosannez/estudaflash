import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdvancedBadges } from '@/hooks/useAdvancedBadges';
import { Trophy, Star, Users, Calendar, Share2 } from 'lucide-react';
import { SocialLoading } from '@/components/common/LoadingStates';
import { toast } from 'sonner';

interface BadgeShowcaseEnhancedProps {
  className?: string;
}

export function BadgeShowcaseEnhanced({ className }: BadgeShowcaseEnhancedProps) {
  const {
    userBadges,
    loading,
    getRarityColor,
    getCategoryIcon,
    checkAndAwardProgressBadges
  } = useAdvancedBadges();

  const categorizedBadges = {
    achievement: userBadges.filter(b => b.badge_category === 'achievement'),
    social: userBadges.filter(b => b.badge_category === 'social'),
    seasonal: userBadges.filter(b => b.badge_category === 'seasonal'),
    collaborative: userBadges.filter(b => b.badge_category === 'collaborative')
  };

  const rarityStats = {
    common: userBadges.filter(b => b.badge_rarity === 'common').length,
    rare: userBadges.filter(b => b.badge_rarity === 'rare').length,
    epic: userBadges.filter(b => b.badge_rarity === 'epic').length,
    legendary: userBadges.filter(b => b.badge_rarity === 'legendary').length
  };

  const shareBadge = async (badge: any) => {
    const shareText = `🏆 Conquistei a badge "${badge.badge_name}"! ${badge.badge_description}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Minha Nova Conquista!',
          text: shareText
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Texto copiado para a área de transferência!');
    }
  };

  if (loading) {
    return <SocialLoading />;
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          Coleção de Badges
        </h2>
        <Button
          variant="outline"
          onClick={checkAndAwardProgressBadges}
          className="flex items-center gap-2"
        >
          <Star className="h-4 w-4" />
          Verificar Novas Badges
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{userBadges.length}</div>
            <div className="text-sm text-muted-foreground">Total de Badges</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{rarityStats.legendary}</div>
            <div className="text-sm text-muted-foreground">Lendárias</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{rarityStats.epic}</div>
            <div className="text-sm text-muted-foreground">Épicas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{rarityStats.rare}</div>
            <div className="text-sm text-muted-foreground">Raras</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            Todas ({userBadges.length})
          </TabsTrigger>
          <TabsTrigger value="achievement">
            🏆 Conquistas ({categorizedBadges.achievement.length})
          </TabsTrigger>
          <TabsTrigger value="social">
            👥 Sociais ({categorizedBadges.social.length})
          </TabsTrigger>
          <TabsTrigger value="seasonal">
            🎃 Sazonais ({categorizedBadges.seasonal.length})
          </TabsTrigger>
          <TabsTrigger value="collaborative">
            🤝 Colaborativas ({categorizedBadges.collaborative.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <BadgeGrid badges={userBadges} onShare={shareBadge} getRarityColor={getRarityColor} />
        </TabsContent>

        <TabsContent value="achievement" className="space-y-4">
          <BadgeGrid badges={categorizedBadges.achievement} onShare={shareBadge} getRarityColor={getRarityColor} />
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <BadgeGrid badges={categorizedBadges.social} onShare={shareBadge} getRarityColor={getRarityColor} />
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4">
          <BadgeGrid badges={categorizedBadges.seasonal} onShare={shareBadge} getRarityColor={getRarityColor} />
        </TabsContent>

        <TabsContent value="collaborative" className="space-y-4">
          <BadgeGrid badges={categorizedBadges.collaborative} onShare={shareBadge} getRarityColor={getRarityColor} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface BadgeGridProps {
  badges: any[];
  onShare: (badge: any) => void;
  getRarityColor: (rarity: string) => string;
}

function BadgeGrid({ badges, onShare, getRarityColor }: BadgeGridProps) {
  if (badges.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold mb-2">Nenhuma badge encontrada</h3>
          <p className="text-muted-foreground">
            Continue estudando para conquistar suas primeiras badges!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {badges.map(badge => (
        <Card key={badge.id} className={`border-2 ${getRarityColor(badge.badge_rarity)}`}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="text-4xl">{badge.badge_icon}</div>
              <div className="flex gap-1">
                <Badge 
                  variant="outline" 
                  className={getRarityColor(badge.badge_rarity)}
                >
                  {badge.badge_rarity}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onShare(badge)}
                  className="h-6 w-6 p-0"
                >
                  <Share2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg mb-2">{badge.badge_name}</CardTitle>
            <p className="text-sm text-muted-foreground mb-3">
              {badge.badge_description}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(badge.earned_at).toLocaleDateString()}
              </span>
              <Badge variant="secondary" className="text-xs">
                {badge.badge_category}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}