import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuizErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface QuizErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRetry?: () => void;
}

class QuizErrorBoundary extends React.Component<QuizErrorBoundaryProps, QuizErrorBoundaryState> {
  constructor(props: QuizErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): QuizErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Quiz Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <QuizErrorFallback 
        error={this.state.error} 
        onRetry={() => {
          this.setState({ hasError: false, error: null });
          this.props.onRetry?.();
        }}
      />;
    }

    return this.props.children;
  }
}

const QuizErrorFallback: React.FC<{ error: Error | null; onRetry: () => void }> = ({ error, onRetry }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="mb-6">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Ops! Algo deu errado</h2>
        <p className="text-muted-foreground mb-4">
          Ocorreu um erro inesperado no quiz. Não se preocupe, seus dados estão seguros.
        </p>
        {error && (
          <details className="text-left bg-muted p-4 rounded-lg mb-4 max-w-md">
            <summary className="cursor-pointer font-medium">Detalhes técnicos</summary>
            <pre className="text-xs mt-2 overflow-auto">{error.message}</pre>
          </details>
        )}
      </div>
      
      <div className="flex gap-3">
        <Button onClick={onRetry} variant="default">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
        <Button onClick={() => navigate('/quiz-history')} variant="outline">
          <Home className="h-4 w-4 mr-2" />
          Voltar ao Histórico
        </Button>
      </div>
    </div>
  );
};

export default QuizErrorBoundary;