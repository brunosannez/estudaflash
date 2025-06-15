
import React from 'react';
import PageLayout from '@/components/navigation/PageLayout';
import UploadArea from '@/components/UploadArea';

const Upload = () => {
  return (
    <PageLayout showBackground>
      <div className="max-w-6xl mx-auto">
        <UploadArea />
      </div>
    </PageLayout>
  );
};

export default Upload;
