
import React from 'react';
import MainNavigation from './MainNavigation';
import UpgradeModal from '@/components/usage/UpgradeModal';
import { useUsageLimit } from '@/hooks/useUsageLimit';

interface PageLayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
}

const PageLayout = ({ children, showBackground = false }: PageLayoutProps) => {
  const { upgradeModalData } = useUsageLimit();

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      
      <main className="lg:ml-64">
        <div className={`${showBackground ? 'min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            {children}
          </div>
        </div>
      </main>

      <UpgradeModal
        isOpen={upgradeModalData.isOpen}
        onClose={upgradeModalData.onClose}
        currentPlan={upgradeModalData.currentPlan}
        actionType={upgradeModalData.actionType}
      />
    </div>
  );
};

export default PageLayout;
