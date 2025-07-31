import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeaderboardWithProfile } from '@/types/social';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

interface LeaderboardProps {
  leaderboard: LeaderboardWithProfile[];
  onFilterChange: (category: string, period: string) => void;
  loading?: boolean;
}

export const Leaderboard = ({ leaderboard, onFilterChange, loading }: LeaderboardProps) => {
  const [category, setCategory] = useState('xp');
  const [period, setPeriod] = useState('weekly');

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    onFilterChange(newCategory, period);
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    onFilterChange(category, newPeriod);
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getCategoryLabel = (cat: string) => {
    const labels = {
      xp: 'XP',
      flashcards: 'Flashcards',
      quiz: 'Quizzes',
      streak: 'Sequência'
    };
    return labels[cat as keyof typeof labels] || cat;
  };

  const getPeriodLabel = (per: string) => {
    const labels = {
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      all_time: 'Todos os Tempos'
    };
    return labels[per as keyof typeof labels] || per;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Ranking
          </CardTitle>
          <div className="flex gap-2">
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xp">XP</SelectItem>
                <SelectItem value="flashcards">Flashcards</SelectItem>
                <SelectItem value="quiz">Quizzes</SelectItem>
                <SelectItem value="streak">Sequência</SelectItem>
              </SelectContent>
            </Select>
            
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
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-3 bg-muted rounded w-20" />
                </div>
                <div className="h-6 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum dados de ranking disponível ainda.</p>
            <p className="text-sm">Seja o primeiro a aparecer no ranking!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  entry.rank_position <= 3 
                    ? 'bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20' 
                    : 'bg-muted/30'
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(entry.rank_position)}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.profile?.avatar_url} />
                  <AvatarFallback>
                    {entry.profile?.display_name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {entry.profile?.display_name || 'Usuário'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nível {entry.profile?.current_level || 1}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <Badge variant={entry.rank_position <= 3 ? 'default' : 'secondary'}>
                    {entry.value.toLocaleString()} {getCategoryLabel(category)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Period Info */}
        <div className="mt-4 pt-3 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Ranking {getPeriodLabel(period).toLowerCase()} de {getCategoryLabel(category)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};