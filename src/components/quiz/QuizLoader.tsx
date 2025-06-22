
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PageLayout from '@/components/navigation/PageLayout';

interface QuizLoaderProps {
  message: string;
  description: string;
}

const QuizLoader = ({ message, description }: QuizLoaderProps) => {
  return (
    <PageLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {message}
            </p>
            <p className="text-sm text-gray-500">
              {description}
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default QuizLoader;
