
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import PageLayout from '@/components/navigation/PageLayout';

const ResumoLoadingState = () => {
  return (
    <PageLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-96">
          <CardContent className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Carregando resumo...</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ResumoLoadingState;
