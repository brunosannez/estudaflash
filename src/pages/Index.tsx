
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import FloatingBackground from '@/components/dashboard/FloatingBackground';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DashboardUsageOverview from '@/components/dashboard/DashboardUsageOverview';

const Index = () => {
  console.log('🏠 Index page rendering...');

  return (
    <ProtectedRoute>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <FloatingBackground />
        
        <div className="relative z-10">
          <DashboardHeader />
          
          <main className="container mx-auto px-4 pb-8">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3 space-y-6">
                <DashboardTabs />
              </div>
              
              <div className="xl:col-span-1 space-y-6">
                <DashboardUsageOverview />
                <RecentActivity />
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
