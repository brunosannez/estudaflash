
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
        <div className="relative">
          <FloatingBackground />
          
          <div className="relative z-10">
            <DashboardHeader />
            
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-6">
              <div className="xl:col-span-3 space-y-6">
                <DashboardTabs />
              </div>
              
              <div className="xl:col-span-1 space-y-6">
                <DashboardUsageOverview />
                <RecentActivity />
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
};

export default Index;
