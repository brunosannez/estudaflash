import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useNavigate } from 'react-router-dom';
import UserManagement from '@/components/admin/UserManagement';
import AdminDashboard from '@/components/admin/AdminDashboard';
import PlanManagement from '@/components/admin/PlanManagement';
import DataManagement from '@/components/admin/DataManagement';
import UsageAnalytics from '@/components/admin/UsageAnalytics';
import ApiUsageMonitoring from '@/components/admin/ApiUsageMonitoring';
import { SecurityDashboard } from '@/components/admin/SecurityDashboard';
import PageLayout from '@/components/navigation/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Loader2, BarChart3, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GuardianAccessAudit from '@/components/admin/GuardianAccessAudit';
import AdminSecurity from '@/components/admin/AdminSecurity';
import SubscriptionManagement from '@/components/admin/SubscriptionManagement';

const AdminPanel = () => {
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();

  // Mostrar loading enquanto verifica permissões
  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md mx-auto">
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
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="py-8 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
              <p className="text-gray-600 mb-4">
                Você não tem permissão para acessar esta página.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Entre em contato com um administrador existente para solicitar acesso.
              </p>
              
              <Button 
                onClick={() => navigate('/')} 
                variant="outline"
                className="w-full"
              >
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600 text-sm sm:text-base">Gerencie usuários, planos, APIs e monitore o sistema completo</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => navigate('/admin/analytics')}
              variant="outline"
              className="flex items-center gap-2 text-sm"
              size="sm"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics Avançados</span>
              <span className="sm:hidden">Analytics</span>
            </Button>
            <Button
              onClick={() => window.open('https://supabase.com/dashboard/project/wevafattotpzozkmgpwm', '_blank')}
              variant="outline"
              className="flex items-center gap-2 text-sm"
              size="sm"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Supabase Dashboard</span>
              <span className="sm:hidden">Supabase</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-10 min-w-fit gap-1">
              <TabsTrigger value="dashboard" className="text-xs sm:text-sm">Dashboard</TabsTrigger>
              <TabsTrigger value="users" className="text-xs sm:text-sm">Usuários</TabsTrigger>
              <TabsTrigger value="subscriptions" className="text-xs sm:text-sm">Assinaturas</TabsTrigger>
              <TabsTrigger value="plans" className="text-xs sm:text-sm">Planos</TabsTrigger>
              <TabsTrigger value="apis" className="text-xs sm:text-sm">APIs</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
              <TabsTrigger value="data" className="text-xs sm:text-sm">Dados</TabsTrigger>
              <TabsTrigger value="audit" className="text-xs sm:text-sm">Auditoria</TabsTrigger>
              <TabsTrigger value="security" className="text-xs sm:text-sm">Segurança</TabsTrigger>
              <TabsTrigger value="monitoring" className="text-xs sm:text-sm">Monitoramento</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <AdminDashboard />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6 mt-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6 mt-6">
            <SubscriptionManagement />
          </TabsContent>

          <TabsContent value="plans" className="space-y-6 mt-6">
            <PlanManagement />
          </TabsContent>

          <TabsContent value="apis" className="space-y-6 mt-6">
            <ApiUsageMonitoring />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <UsageAnalytics />
          </TabsContent>

          <TabsContent value="data" className="space-y-6 mt-6">
            <DataManagement />
          </TabsContent>

          <TabsContent value="audit" className="space-y-6 mt-6">
            <GuardianAccessAudit />
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
            <AdminSecurity />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6 mt-6">
            <SecurityDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AdminPanel;
