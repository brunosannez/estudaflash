
import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainNavigation from '@/components/navigation/MainNavigation';
import FloatingBackground from '@/components/dashboard/FloatingBackground';

interface PageLayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
}

const PageLayout = ({ children, showBackground = false }: PageLayoutProps) => {
  return (
    <ProtectedRoute>
      <MainNavigation>
        <div className="relative min-h-[calc(100vh-12rem)]">
          {showBackground && <FloatingBackground />}
          <div className={showBackground ? "relative z-10" : ""}>
            {children}
          </div>
        </div>
      </MainNavigation>
    </ProtectedRoute>
  );
};

export default PageLayout;
