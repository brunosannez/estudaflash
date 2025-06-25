
import React from 'react';
import { Loader2 } from 'lucide-react';
import PageLayout from '@/components/navigation/PageLayout';

const MyFlashcardsLoading = () => {
  return (
    <PageLayout>
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">🧠 Carregando seus flashcards...</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default MyFlashcardsLoading;
