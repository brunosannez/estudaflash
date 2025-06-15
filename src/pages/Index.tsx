import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import FloatingBackground from '@/components/FloatingBackground';
import RecentActivity from '@/components/dashboard/RecentActivity';
import UsageIndicator from '@/components/usage/UsageIndicator';

const Index = () => {
  const [activeTab, setActiveTab] = useState('progress');
  const [hasUploads, setHasUploads] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/home');
    }
  }, [user, navigate]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <FloatingBackground />
        
        <div className="relative z-10">
          <DashboardHeader />
          
          <main className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3 space-y-6">
                <DashboardTabs 
                  activeTab={activeTab} 
                  onTabChange={setActiveTab}
                  hasUploads={hasUploads}
                />
              </div>
              
              <div className="xl:col-span-1 space-y-6">
                <UsageIndicator />
                
                <div className="space-y-4">
                  <RecentActivity setHasUploads={setHasUploads} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
