
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCw } from 'lucide-react';
import { GameStats } from '@/types/gamification';

interface ProgressLevelDetailsProps {
  stats: GameStats;
  onRefresh: () => void;
  loading: boolean;
}

const ProgressLevelDetails = ({ stats, onRefresh, loading }: ProgressLevelDetailsProps) => {
  return (
    <Card className="transform hover:scale-105 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-brand-orange" />
          Progresso do Nível {stats.currentLevel}
        </CardTitle>
        <Button 
          onClick={onRefresh}
          variant="ghost"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Nível {stats.currentLevel}</span>
          <span className="text-sm text-muted-foreground">
            {stats.currentXp} / {stats.nextLevelXp} XP
          </span>
        </div>
        <Progress value={stats.xpProgress} className="h-3" />
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            <strong>Faltam {stats.nextLevelXp - stats.currentXp} XP para o próximo nível!</strong>
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="bg-primary/10 px-2 py-1 rounded">🧠 +5 XP por flashcard</span>
            <span className="bg-accent/10 px-2 py-1 rounded">✅ +10 XP por quiz correto</span>
            <span className="bg-brand-orange/10 px-2 py-1 rounded">🎯 +2 XP por tentativa</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressLevelDetails;
