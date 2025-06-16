
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useNavigate } from 'react-router-dom';
import UserManagement from '@/components/admin/UserManagement';
import AdminDashboard from '@/components/admin/AdminDashboard';
import PlanManagement from '@/components/admin/PlanManagement';
import DataManagement from '@/components/admin/DataManagement';
import UsageAnalytics from '@/components/admin/UsageAnalytics';
import PageLayout from '@/components/navigation/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Loader2, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminPanel = () => {
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

  // Renderizar página admin
  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600">Gerencie usuários, planos e monitore o sistema completo</p>
            </div>
          </div>
          
          <Button
            onClick={() => navigate('/admin/analytics')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Ver Analytics Avançados
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 min-w-fit">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="plans">Planos</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="data">Dados</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="dashboard" className="space-y-6">
            <AdminDashboard />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <PlanManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <UsageAnalytics />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataManagement />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AdminPanel;
