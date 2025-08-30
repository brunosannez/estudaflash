import React from 'react';
import PageLayout from '@/components/navigation/PageLayout';
import EnhancedUpload from '@/components/upload/EnhancedUpload';

const Upload = () => {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        <div className="container mx-auto px-4 py-8 relative z-10">
          <EnhancedUpload />
        </div>
      </div>
    </PageLayout>
  );
};

export default Upload;
