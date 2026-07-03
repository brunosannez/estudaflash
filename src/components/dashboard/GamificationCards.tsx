
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Flame, Target, Award, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useRealTimeProgress } from '@/hooks/useRealTimeProgress';
import foliMascote from '@/assets/foli-small.webp';

const GamificationCards = () => {
  const { getStats } = useRealTimeProgress();
  const stats = getStats();

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse rounded-2xl">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded-xl"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getLevelTitle = (level: number) => {
    if (level <= 2) return "🌱 Iniciante";
    if (level <= 5) return "📚 Estudante";
    if (level <= 10) return "💪 Dedicado";
    if (level <= 15) return "🎯 Experiente";
    return "🏆 Mestre";
  };

  // Foli reage ao progresso do dia: comemora se já estudou, incentiva se não
  const foliMessage = stats.todayXp > 0
    ? 'Mandou bem hoje! 🎉'
    : 'Vamos estudar um pouco? 💪';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* XP e Nível */}
      <Card className="bg-primary text-primary-foreground overflow-hidden relative rounded-2xl border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-foreground/70 text-sm font-medium">Nível Atual</p>
              <p className="text-3xl font-extrabold">{stats.currentLevel}</p>
              <p className="text-primary-foreground/70 text-xs">{getLevelTitle(stats.currentLevel)}</p>
            </div>
            <Trophy className="h-12 w-12 text-brand-orange" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP: {stats.currentXp}</span>
              <span>{stats.nextLevelXp}</span>
            </div>
            <Progress value={stats.xpProgress} className="h-2 [&>div]:bg-brand-lime" />
            <p className="text-xs text-primary-foreground/70">
              Faltam {stats.nextLevelXp - stats.currentXp} XP para o próximo nível!
            </p>
          </div>
        </CardContent>
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-brand-orange rounded-full opacity-20"></div>
      </Card>

      {/* Streak */}
      <Card className="bg-brand-orange text-white overflow-hidden relative rounded-2xl border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/75 text-sm font-medium">Sequência</p>
              <p className="text-3xl font-extrabold">{stats.currentStreak}</p>
              <p className="text-white/80 text-xs">dias consecutivos</p>
            </div>
            <Flame className="h-11 w-11 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-white/90" />
            <span className="text-sm">Recorde: {stats.longestStreak} dias</span>
          </div>
        </CardContent>
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white rounded-full opacity-10"></div>
      </Card>

      {/* XP Hoje — com Foli reagindo ao progresso */}
      <Card className="bg-accent text-accent-foreground overflow-hidden relative rounded-2xl border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-accent-foreground/70 text-sm font-medium">XP Hoje</p>
              <p className="text-3xl font-extrabold">{stats.todayXp}</p>
            </div>
            <img
              src={foliMascote}
              alt=""
              aria-hidden="true"
              className="w-14 h-14 object-contain mix-blend-multiply"
            />
          </div>
          <p className="text-xs font-semibold text-accent-foreground/80 mb-3">{foliMessage}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>{stats.todayFlashcards} cards</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              <span>{stats.todayQuizzes} quizzes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationCards;
