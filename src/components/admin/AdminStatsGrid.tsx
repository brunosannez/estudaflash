
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, HardDrive, Activity, Loader2, RefreshCw } from 'lucide-react';
import { AdminStatsService, type AdminDashboardStats } from '@/services/adminStatsService';
import { Button } from '@/components/ui/button';

interface AdminStatsGridProps {
  totalUsers: number;
  totalStorageMB: number;
  activeUsers7Days: number;
}

const AdminStatsGrid = ({ totalUsers: propTotalUsers, totalStorageMB: propTotalStorageMB, activeUsers7Days: propActiveUsers7Days }: AdminStatsGridProps) => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Carregando estatísticas do admin...');
      
      const adminStats = await AdminStatsService.getDashboardStats();
      console.log('✅ Estatísticas carregadas:', adminStats);
      setStats(adminStats);
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      setError('Erro ao carregar estatísticas');
      
      // Use props as fallback
      setStats({
        totalUsers: propTotalUsers,
        totalStorageMB: propTotalStorageMB,
        activeUsers7Days: propActiveUsers7Days,
        totalFiles: 0,
        averageStoragePerUser: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error && !stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statsData = [
    {
      title: 'Total de Usuários',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Armazenamento Total',
      value: `${(stats?.totalStorageMB || 0).toFixed(1)} MB`,
      icon: HardDrive,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Usuários Ativos (7 dias)',
      value: stats?.activeUsers7Days || 0,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Estatísticas Gerais</h3>
        <Button onClick={fetchStats} variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stats?.totalFiles && stat.title === 'Armazenamento Total' && (
                  <p className="text-xs text-muted-foreground">
                    {stats.totalFiles} arquivos • Média: {(stats.averageStoragePerUser || 0).toFixed(1)} MB/usuário
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminStatsGrid;
