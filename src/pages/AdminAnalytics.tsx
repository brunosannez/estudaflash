
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useNavigate } from 'react-router-dom';
import UsageAnalytics from '@/components/admin/UsageAnalytics';
import AdminAnalyticsDashboard from '@/components/admin/AdminAnalyticsDashboard';
import PageLayout from '@/components/navigation/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Loader2, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminAnalytics = () => {
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-96">
            <CardContent className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p>Verificando permissões...</p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

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

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Avançados</h1>
              <p className="text-gray-600">Análise detalhada de uso e performance do sistema</p>
            </div>
          </div>
          
          <Button onClick={() => navigate('/admin')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Admin
          </Button>
        </div>

        <Tabs defaultValue="usage" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 min-w-fit">
              <TabsTrigger value="usage">Analytics de Uso</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard Geral</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="usage" className="space-y-6">
            <UsageAnalytics />
          </TabsContent>
          
          <TabsContent value="dashboard" className="space-y-6">
            <AdminAnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AdminAnalytics;
