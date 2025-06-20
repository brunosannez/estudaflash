
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import FloatingBackground from '@/components/dashboard/FloatingBackground';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DashboardUsageOverview from '@/components/dashboard/DashboardUsageOverview';
import PageLayout from '@/components/navigation/PageLayout';

const Index = () => {
  console.log('🏠 Index page rendering...');

  return (
    <ProtectedRoute>
      <PageLayout>
        <div className="relative min-h-screen">
          <FloatingBackground />
          
          <div className="relative z-10 space-y-6 container mx-auto px-4">
            <DashboardHeader />
            
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3 min-h-0">
                <DashboardTabs />
              </div>
              
              <div className="xl:col-span-1 space-y-6 min-h-0">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Visão Geral</h3>
                  <DashboardUsageOverview />
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">⚡ Atividade Recente</h3>
                  <RecentActivity />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
};

export default Index;
