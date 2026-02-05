import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log do erro para análise
    this.logError(error, errorInfo);
  }

  logError = (error: Error, errorInfo: any) => {
    // Sanitize error data - remove potentially sensitive paths
    const sanitizedStack = error.stack?.replace(/\/[^\s:]+:/g, '<path>:') || '';
    const sanitizedUrl = window.location.pathname; // Only pathname, not full URL with query params
    
    const errorData = {
      message: error.message,
      stack: sanitizedStack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      // Don't log full userAgent in production
      userAgent: process.env.NODE_ENV === 'development' ? navigator.userAgent : 'hidden',
      url: sanitizedUrl
    };

    // Use sessionStorage in production (clears on tab close) for better security
    // Use localStorage in development for persistent debugging
    const storage = process.env.NODE_ENV === 'development' ? localStorage : sessionStorage;
    
    try {
      const existingErrors = JSON.parse(storage.getItem('app_errors') || '[]');
      existingErrors.push(errorData);
      
      // Manter apenas os últimos 10 erros
      const recentErrors = existingErrors.slice(-10);
      storage.setItem('app_errors', JSON.stringify(recentErrors));
    } catch (e) {
      // Storage might be full or disabled
      console.warn('Failed to log error to storage:', e);
    }

    // Em produção, aqui seria enviado para um serviço de monitoramento
    console.error('Error logged:', errorData);
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 text-destructive">
                <AlertTriangle className="h-full w-full" />
              </div>
              <CardTitle className="text-xl">Oops! Algo deu errado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-muted-foreground">
                <p>
                  Encontramos um erro inesperado. Nossa equipe foi notificada
                  e está trabalhando para resolver o problema.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <div className="font-medium text-destructive mb-2">
                    Detalhes do erro (desenvolvimento):
                  </div>
                  <div className="text-xs font-mono bg-background p-2 rounded border overflow-auto max-h-32">
                    {this.state.error.message}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Button 
                  onClick={this.handleReload}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Voltar ao início
                </Button>

                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    onClick={() => {
                      const errors = localStorage.getItem('app_errors');
                      console.log('All logged errors:', JSON.parse(errors || '[]'));
                    }}
                    className="w-full"
                    variant="ghost"
                    size="sm"
                  >
                    <Bug className="h-4 w-4 mr-2" />
                    Ver logs de erro
                  </Button>
                )}
              </div>

              <div className="text-xs text-center text-muted-foreground">
                Se o problema persistir, entre em contato com o suporte.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para reportar erros manualmente
export const useErrorReporting = () => {
  const reportError = (error: Error, context?: string) => {
    // Sanitize error data
    const sanitizedStack = error.stack?.replace(/\/[^\s:]+:/g, '<path>:') || '';
    const sanitizedUrl = window.location.pathname;
    
    const errorData = {
      message: error.message,
      stack: sanitizedStack,
      context: context || 'Manual report',
      timestamp: new Date().toISOString(),
      userAgent: process.env.NODE_ENV === 'development' ? navigator.userAgent : 'hidden',
      url: sanitizedUrl
    };

    // Use sessionStorage in production for better security
    const storage = process.env.NODE_ENV === 'development' ? localStorage : sessionStorage;
    
    try {
      const existingErrors = JSON.parse(storage.getItem('app_errors') || '[]');
      existingErrors.push(errorData);
      storage.setItem('app_errors', JSON.stringify(existingErrors.slice(-10)));
    } catch (e) {
      console.warn('Failed to log error to storage:', e);
    }

    console.error('Manual error report:', errorData);
  };

  return { reportError };
};