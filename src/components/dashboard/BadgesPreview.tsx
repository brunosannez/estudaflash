
import { Trophy, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdvancedBadges } from '@/hooks/useAdvancedBadges';
import { BADGES_CATALOG, getRarityStyles } from '@/data/badgesCatalog';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const BadgesPreview = () => {
  const { userBadges, loading } = useAdvancedBadges();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 w-12 bg-gray-100 rounded-full"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentBadges = userBadges.slice(0, 4);

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-amber-100 shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Conquistas
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary text-xs h-7"
            onClick={() => navigate('/my-progress')}
          >
            Ver todas <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentBadges.length > 0 ? (
          <div className="flex items-center gap-3">
            {recentBadges.map((earnedBadge, index) => {
              const badgeDef = BADGES_CATALOG.find(b => b.id === earnedBadge.badge_type);
              if (!badgeDef) return null;
              const styles = getRarityStyles(badgeDef.rarity);
              
              return (
                <motion.div
                  key={earnedBadge.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${styles.bg} ${styles.border} border-2 ${styles.glow}`}
                  title={badgeDef.name}
                >
                  <span className="text-xl">{badgeDef.icon}</span>
                </motion.div>
              );
            })}
            {userBadges.length > 4 && (
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 border-2 border-gray-200 text-xs font-medium text-gray-500">
                +{userBadges.length - 4}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200">
              <span className="text-xl">🔒</span>
            </div>
            <p className="text-sm">Continue estudando para ganhar conquistas!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BadgesPreview;
