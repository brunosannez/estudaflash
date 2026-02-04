
import AdminStatsGrid from './AdminStatsGrid';
import { useAdminRealTime } from '@/hooks/admin/useAdminRealTime';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Users, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SubscriptionService } from '@/services/subscriptionService';

const AdminDashboard = () => {
  // Real-time updates
  useAdminRealTime({ enabled: true });

  const { data: subscriptionStats } = useQuery({
    queryKey: ['admin-subscription-stats'],
    queryFn: SubscriptionService.getSubscriptionStats,
    refetchInterval: 60000,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <AdminStatsGrid 
        totalUsers={0} 
        totalStorageMB={0} 
        activeUsers7Days={0} 
      />

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Mensal (MRR)
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(subscriptionStats?.mrr || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscriptionStats?.active_count || 0} assinaturas ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total
            </CardTitle>
            <div className="p-2 rounded-lg bg-accent">
              <Zap className="h-4 w-4 text-accent-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(subscriptionStats?.total_revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Desde o início
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Status do Sistema
            </CardTitle>
            <div className="p-2 rounded-lg bg-secondary">
              <Activity className="h-4 w-4 text-secondary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500 text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Online
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time ativo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo Rápido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{subscriptionStats?.active_count || 0}</p>
              <p className="text-xs text-muted-foreground">Assinantes Ativos</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{subscriptionStats?.pending_count || 0}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Activity className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{subscriptionStats?.canceled_count || 0}</p>
              <p className="text-xs text-muted-foreground">Cancelamentos</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Zap className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">
                {subscriptionStats?.active_count ? 
                  Math.round((subscriptionStats.canceled_count / (subscriptionStats.active_count + subscriptionStats.canceled_count)) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Churn Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
