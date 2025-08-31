
import ProtectedRoute from '@/components/ProtectedRoute';
import FloatingBackground from '@/components/dashboard/FloatingBackground';
import PageLayout from '@/components/navigation/PageLayout';
import PersonalizedGreeting from '@/components/dashboard/PersonalizedGreeting';
import GamificationCards from '@/components/dashboard/GamificationCards';
import QuickActions from '@/components/dashboard/QuickActions';
import StudyStatsGrid from '@/components/dashboard/StudyStatsGrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardUsageOverview from '@/components/dashboard/DashboardUsageOverview';

const Index = () => {
  console.log('🏠 Dashboard Index page rendering...');

  return (
    <ProtectedRoute>
      <PageLayout>
        <div className="relative min-h-screen">
          <FloatingBackground />
          
          <div className="relative z-10 space-y-8 container mx-auto px-4 py-6">
            {/* Saudação Personalizada */}
            <PersonalizedGreeting />
            
            {/* Cards de Gamificação */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                🎮 Seu Progresso
              </h2>
              <GamificationCards />
            </div>
            
            {/* Ações Rápidas */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                ⚡ Ações Rápidas
              </h2>
              <QuickActions />
            </div>
            
            {/* Estatísticas de Estudo */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                📊 Estatísticas
              </h2>
              <StudyStatsGrid />
            </div>
            
            {/* Grid Principal */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    📈 Visão Geral de Uso
                  </h3>
                  <DashboardUsageOverview />
                </div>
              </div>
              
              <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Suas atividades de estudo mais recentes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Seus estudos recentes aparecerão aqui</p>
            </CardContent>
          </Card>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
};

export default Index;
