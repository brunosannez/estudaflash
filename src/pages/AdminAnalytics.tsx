
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuth } from '@/hooks/useAuth';
import PageLayout from '@/components/navigation/PageLayout';
import AdminAnalyticsDashboard from '@/components/admin/AdminAnalyticsDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, Loader2, Shield } from 'lucide-react';

const AdminAnalytics = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔍 AdminAnalytics - Estado atual:', { 
      userEmail: user?.email, 
      isAdmin, 
      loading,
      hasUser: !!user 
    });
    
    // Só redirecionar se não estiver carregando e não tiver usuário
    if (!loading && !user) {
      console.log('❌ Usuário não logado, redirecionando para /login');
      navigate('/login');
      return;
    }
    
    // Só redirecionar se não estiver carregando, tiver usuário mas não for admin
    if (!loading && user && !isAdmin) {
      console.log('❌ Usuário não é admin, redirecionando para /');
      navigate('/');
      return;
    }
  }, [user, isAdmin, loading, navigate]);

  // Mostrar loading enquanto verifica
  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-96">
            <CardContent className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p>Verificando permissões de administrador...</p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Mostrar erro se não for admin (mas só depois de terminar o loading)
  if (!isAdmin && !loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-96">
            <CardContent className="py-8 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
              <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
              <Button onClick={() => navigate('/')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Renderizar página analytics apenas se for admin
  if (isAdmin) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Admin
            </Button>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Métricas e estatísticas do sistema</p>
              </div>
            </div>
          </div>

          <AdminAnalyticsDashboard />
        </div>
      </PageLayout>
    );
  }

  // Fallback - não deveria chegar aqui
  return (
    <PageLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-96">
          <CardContent className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p>Carregando...</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AdminAnalytics;
