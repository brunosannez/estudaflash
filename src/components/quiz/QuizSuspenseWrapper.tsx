import React, { Suspense } from 'react';
import QuizLoader from './QuizLoader';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface QuizSuspenseWrapperProps {
  children: React.ReactNode;
  fallbackMessage?: string;
  fallbackDescription?: string;
  errorFallback?: React.ReactNode;
}

const QuizSuspenseWrapper: React.FC<QuizSuspenseWrapperProps> = ({
  children,
  fallbackMessage = "Carregando...",
  fallbackDescription = "Preparando conteúdo...",
  errorFallback
}) => {
  return (
    <ErrorBoundary fallback={errorFallback || <div className="p-4 text-center">Erro ao carregar componente</div>}>
      <Suspense fallback={
        <QuizLoader 
          message={fallbackMessage}
          description={fallbackDescription}
        />
      }>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default QuizSuspenseWrapper;