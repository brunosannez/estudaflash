
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import FloatingBackground from '@/components/dashboard/FloatingBackground';
import PageLayout from '@/components/navigation/PageLayout';
import PersonalizedGreeting from '@/components/dashboard/PersonalizedGreeting';
import GamificationCards from '@/components/dashboard/GamificationCards';
import QuickActions from '@/components/dashboard/QuickActions';
import StudyStatsGrid from '@/components/dashboard/StudyStatsGrid';
import DailyMission from '@/components/dashboard/DailyMission';
import BadgesPreview from '@/components/dashboard/BadgesPreview';
import DashboardUsageOverview from '@/components/dashboard/DashboardUsageOverview';
import RecentActivity from '@/components/dashboard/RecentActivity';
import BadgeUnlockAnimation from '@/components/badges/BadgeUnlockAnimation';
import UpgradeBanner from '@/components/dashboard/UpgradeBanner';
import CreditsIndicator from '@/components/usage/CreditsIndicator';
import CreditsHistoryModal from '@/components/usage/CreditsHistoryModal';
import { BADGE_UNLOCK_EVENT } from '@/hooks/useAdvancedBadges';
import { BadgeDefinition } from '@/data/badgesCatalog';

// Safe wrapper to prevent CreditsIndicator errors from crashing the dashboard
class CreditsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const CreditsIndicatorSafe = (props: { onViewHistory: () => void; onUpgrade: () => void }) => (
  <CreditsErrorBoundary>
    <CreditsIndicator {...props} />
  </CreditsErrorBoundary>
);

const Index = () => {
  console.log('🏠 Dashboard Index page rendering...');
  const navigate = useNavigate();
  const [unlockedBadge, setUnlockedBadge] = useState<BadgeDefinition | null>(null);
  const [showCreditsHistory, setShowCreditsHistory] = useState(false);

  // Listen for badge unlock events
  useEffect(() => {
    const handleBadgeUnlock = (event: CustomEvent<BadgeDefinition>) => {
      setUnlockedBadge(event.detail);
    };

    window.addEventListener(BADGE_UNLOCK_EVENT, handleBadgeUnlock as EventListener);
    return () => {
      window.removeEventListener(BADGE_UNLOCK_EVENT, handleBadgeUnlock as EventListener);
    };
  }, []);

  return (
    <ProtectedRoute>
      <PageLayout>
        <div className="relative min-h-screen">
          <FloatingBackground />
          
          <div className="relative z-10 space-y-6 container mx-auto px-4 py-6">
            {/* Saudação Personalizada */}
            <PersonalizedGreeting />

            {/* Banner de Upgrade para Free */}
            <UpgradeBanner />

            {/* Indicador de Créditos */}
            <React.Suspense fallback={null}>
              <CreditsIndicatorSafe
                onViewHistory={() => setShowCreditsHistory(true)}
                onUpgrade={() => navigate('/choose-plan')}
              />
            </React.Suspense>
            
            {/* Missão do Dia */}
            <DailyMission />
            
            {/* Cards de Gamificação */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                🎮 Seu Progresso
              </h2>
              <GamificationCards />
            </div>

            {/* Conquistas Preview */}
            <BadgesPreview />
            
            {/* Ações Rápidas */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                ⚡ O Que Fazer Agora?
              </h2>
              <QuickActions />
            </div>
            
            {/* Estatísticas de Estudo */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                📊 Como Você Está Indo
              </h2>
              <StudyStatsGrid />
            </div>
            
            {/* Grid Principal */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-sky-100">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    📈 Uso do App
                  </h3>
                  <DashboardUsageOverview />
                </div>
              </div>
              
              <div className="xl:col-span-1">
                <RecentActivity />
              </div>
            </div>
          </div>
        </div>

        {/* Badge Unlock Animation */}
        <BadgeUnlockAnimation
          badge={unlockedBadge}
          isOpen={!!unlockedBadge}
          onClose={() => setUnlockedBadge(null)}
        />

        {/* Credits History Modal */}
        <CreditsHistoryModal
          isOpen={showCreditsHistory}
          onClose={() => setShowCreditsHistory(false)}
        />
      </PageLayout>
    </ProtectedRoute>
  );
};

export default Index;
