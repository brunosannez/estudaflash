
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/navigation/PageLayout';
import AdminAnalyticsDashboard from '@/components/admin/AdminAnalyticsDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, Loader2, Shield } from 'lucide-react';

const AdminAnalytics = () => {
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();

  // Mostrar loading enquanto verifica permissões
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

  // Mostrar erro se não for admin
  if (!isAdmin) {
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

  // Renderizar página analytics
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
};

export default AdminAnalytics;
