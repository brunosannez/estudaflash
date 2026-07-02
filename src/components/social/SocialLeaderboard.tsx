import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaderboardWithProfile } from '@/types/social';
import { Trophy, Medal, Award, Crown, TrendingUp, Target, Brain, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SocialLeaderboardProps {
  leaderboard: LeaderboardWithProfile[];
  onFilterChange: (category: string, period: string) => void;
  loading?: boolean;
}

export const SocialLeaderboard = ({ 
  leaderboard, 
  onFilterChange, 
  loading 
}: SocialLeaderboardProps) => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('weekly');

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-muted-foreground/70" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
            {position}
          </div>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'xp':
        return <TrendingUp className="h-4 w-4" />;
      case 'flashcards':
        return <Brain className="h-4 w-4" />;
      case 'quiz':
        return <Target className="h-4 w-4" />;
      case 'streak':
        return <Zap className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const handleCategoryChange = (category: string) => {
    onFilterChange(category, period);
  };

  const handlePeriodChange = (newPeriod: string) => {
    const typedPeriod = newPeriod as 'daily' | 'weekly' | 'monthly' | 'all_time';
    setPeriod(typedPeriod);
    onFilterChange('xp', typedPeriod);
  };

  const formatValue = (value: number, category: string) => {
    switch (category) {
      case 'xp':
        return `${value.toLocaleString()} XP`;
      case 'flashcards':
        return `${value} cards`;
      case 'quiz':
        return `${value} quizzes`;
      case 'streak':
        return `${value} dias`;
      default:
        return value.toString();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Ranking
          </CardTitle>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diário</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="all_time">Geral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="xp" onValueChange={handleCategoryChange}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="xp" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              XP
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Quiz
            </TabsTrigger>
            <TabsTrigger value="streak" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Streak
            </TabsTrigger>
          </TabsList>

          <TabsContent value="xp" className="space-y-4">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum dado disponível ainda.</p>
                <p className="text-sm">Seja o primeiro a aparecer no ranking!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                      index < 3 
                        ? 'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20' 
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getRankIcon(entry.rank_position)}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.profile.avatar_url || undefined} />
                        <AvatarFallback>
                          {entry.profile.display_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {entry.profile.display_name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Nível {entry.profile.current_level}
                        </Badge>
                        {entry.profile.badges && entry.profile.badges.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {entry.profile.badges.length} 🏆
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {formatValue(entry.value, entry.category)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{entry.rank_position}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* As outras tabs seguem o mesmo padrão */}
          <TabsContent value="flashcards" className="space-y-4">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum dado de flashcards ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                      index < 3 
                        ? 'bg-muted/50 border border-blue-200' 
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getRankIcon(entry.rank_position)}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.profile.avatar_url || undefined} />
                        <AvatarFallback>
                          {entry.profile.display_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {entry.profile.display_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Nível {entry.profile.current_level}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {formatValue(entry.value, entry.category)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{entry.rank_position}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="quiz" className="space-y-4">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum dado de quiz ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                      index < 3 
                        ? 'bg-muted/50 border border-green-200' 
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getRankIcon(entry.rank_position)}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.profile.avatar_url || undefined} />
                        <AvatarFallback>
                          {entry.profile.display_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {entry.profile.display_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Nível {entry.profile.current_level}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatValue(entry.value, entry.category)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{entry.rank_position}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="streak" className="space-y-4">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum dado de streak ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                      index < 3 
                        ? 'bg-muted/50 border border-orange-200' 
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getRankIcon(entry.rank_position)}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.profile.avatar_url || undefined} />
                        <AvatarFallback>
                          {entry.profile.display_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {entry.profile.display_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Nível {entry.profile.current_level}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-orange-600">
                        {formatValue(entry.value, entry.category)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{entry.rank_position}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};