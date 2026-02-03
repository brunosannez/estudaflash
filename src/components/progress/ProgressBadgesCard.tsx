
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock, ChevronRight } from 'lucide-react';
import { BADGES_CATALOG, BadgeDefinition, getRarityStyles, getRarityLabel } from '@/data/badgesCatalog';
import { useAdvancedBadges } from '@/hooks/useAdvancedBadges';
import { motion } from 'framer-motion';

interface ProgressBadgesCardProps {
  userStats?: {
    flashcards_correct?: number;
    flashcards_reviewed?: number;
    quizzes_completed?: number;
    perfect_quizzes?: number;
    current_streak?: number;
    longest_streak?: number;
    current_level?: number;
    total_xp?: number;
    uploads_count?: number;
    summaries_count?: number;
  };
}

const BadgeItem = ({ 
  badge, 
  isEarned, 
  earnedAt 
}: { 
  badge: BadgeDefinition; 
  isEarned: boolean;
  earnedAt?: string;
}) => {
  const rarityStyles = getRarityStyles(badge.rarity);
  
  return (
    <div 
      className={`relative p-3 rounded-xl border-2 transition-all ${
        isEarned 
          ? `${rarityStyles.bg} ${rarityStyles.border} ${rarityStyles.glow}` 
          : 'bg-gray-50 border-gray-200 opacity-60'
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <span className={`text-3xl ${!isEarned && 'grayscale'}`}>
          {isEarned ? badge.icon : '🔒'}
        </span>
        <span className={`text-xs font-medium mt-1 ${isEarned ? rarityStyles.text : 'text-gray-400'}`}>
          {badge.name}
        </span>
        {isEarned && earnedAt && (
          <span className="text-[10px] text-gray-400 mt-0.5">
            {new Date(earnedAt).toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>
      {!isEarned && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 rounded-xl">
          <Lock className="h-4 w-4 text-gray-400" />
        </div>
      )}
    </div>
  );
};

const ProgressBadgesCard = ({ userStats = {} }: ProgressBadgesCardProps) => {
  const { userBadges, loading } = useAdvancedBadges();
  const [showAllBadges, setShowAllBadges] = useState(false);

  // Get earned badge types
  const earnedBadgeTypes = new Set(userBadges.map(b => b.badge_type));

  // Calculate next badge progress
  const getNextBadge = (): { badge: BadgeDefinition; progress: number; current: number } | null => {
    const priorityBadges = ['elephant_memory', 'first_week', 'studious', 'level_5', 'xp_1000'];
    
    for (const badgeId of priorityBadges) {
      if (!earnedBadgeTypes.has(badgeId)) {
        const badge = BADGES_CATALOG.find(b => b.id === badgeId);
        if (badge) {
          let currentValue = 0;
          switch (badge.requirement.metric) {
            case 'flashcards_correct':
              currentValue = userStats.flashcards_correct || 0;
              break;
            case 'current_streak':
              currentValue = userStats.current_streak || 0;
              break;
            case 'quizzes_completed':
              currentValue = userStats.quizzes_completed || 0;
              break;
            case 'current_level':
              currentValue = userStats.current_level || 1;
              break;
            case 'total_xp':
              currentValue = userStats.total_xp || 0;
              break;
            default:
              currentValue = 0;
          }
          const progress = Math.min(100, (currentValue / badge.requirement.value) * 100);
          return { badge, progress, current: currentValue };
        }
      }
    }
    
    // Find any uneaerned badge
    for (const badge of BADGES_CATALOG) {
      if (!earnedBadgeTypes.has(badge.id)) {
        return { badge, progress: 0, current: 0 };
      }
    }
    
    return null;
  };

  const nextBadge = getNextBadge();
  const recentBadges = userBadges.slice(0, 5);

  // Get all badges organized by category
  const badgesByCategory = {
    'Primeiros Passos': BADGES_CATALOG.filter(b => ['first_upload', 'first_summary', 'first_quiz', 'first_flashcard'].includes(b.id)),
    'Memória de Elefante': BADGES_CATALOG.filter(b => ['elephant_memory', 'perfect_accuracy', 'voracious_reader'].includes(b.id)),
    'Mestre do Quiz': BADGES_CATALOG.filter(b => ['speedster', 'sharpshooter', 'studious', 'quiz_master'].includes(b.id)),
    'Streak e Constância': BADGES_CATALOG.filter(b => ['first_week', 'eternal_fire', 'diamond'].includes(b.id)),
    'XP e Níveis': BADGES_CATALOG.filter(b => ['level_5', 'level_10', 'level_25', 'xp_1000', 'xp_10000'].includes(b.id)),
    'Horários Especiais': BADGES_CATALOG.filter(b => ['early_bird', 'night_owl'].includes(b.id))
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm border-amber-100 shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Minhas Conquistas
            </CardTitle>
            <Dialog open={showAllBadges} onOpenChange={setShowAllBadges}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary text-sm">
                  Ver todas <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Todas as Conquistas ({userBadges.length}/{BADGES_CATALOG.length})
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  {Object.entries(badgesByCategory).map(([category, badges]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-gray-700 mb-3">{category}</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {badges.map((badge) => {
                          const earned = userBadges.find(ub => ub.badge_type === badge.id);
                          return (
                            <BadgeItem 
                              key={badge.id} 
                              badge={badge} 
                              isEarned={!!earned}
                              earnedAt={earned?.earned_at}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recent/Earned Badges Grid */}
          {recentBadges.length > 0 ? (
            <div className="grid grid-cols-5 gap-2">
              {recentBadges.map((earnedBadge, index) => {
                const badgeDef = BADGES_CATALOG.find(b => b.id === earnedBadge.badge_type);
                if (!badgeDef) return null;
                return (
                  <motion.div
                    key={earnedBadge.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <BadgeItem 
                      badge={badgeDef} 
                      isEarned={true}
                      earnedAt={earnedBadge.earned_at}
                    />
                  </motion.div>
                );
              })}
              {/* Fill empty slots with locked placeholders */}
              {[...Array(Math.max(0, 5 - recentBadges.length))].map((_, i) => (
                <div 
                  key={`empty-${i}`}
                  className="p-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50"
                >
                  <div className="flex flex-col items-center text-center">
                    <span className="text-3xl text-gray-300">🔒</span>
                    <span className="text-xs text-gray-400 mt-1">???</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Você ainda não tem conquistas</p>
              <p className="text-xs text-gray-400">Continue estudando para ganhar medalhas!</p>
            </div>
          )}

          {/* Next Badge Progress */}
          {nextBadge && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500">📍 Próxima conquista:</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{nextBadge.badge.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{nextBadge.badge.name}</span>
                    <span className="text-xs text-gray-500">
                      {nextBadge.current}/{nextBadge.badge.requirement.value}
                    </span>
                  </div>
                  <Progress value={nextBadge.progress} className="h-2" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-10">
                {nextBadge.badge.kidFriendlyDescription}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ProgressBadgesCard;
