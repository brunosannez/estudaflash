
import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  if (authLoading || adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <span className="text-muted-foreground">Verificando permissões de administrador...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/50">
        <div className="text-center max-w-md p-6 rounded-xl bg-background/80 shadow">
          <Lock className="h-10 w-10 text-red-600 mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-foreground mb-1">Acesso negado</h1>
          <p className="text-sm text-muted-foreground">Você precisa de permissões de administrador para acessar esta página.</p>
          <Link to="/" className="inline-block mt-4 text-primary hover:underline">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
