
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AdminStatsService } from '@/services/adminStatsService';
import AdminDiagnostics from './AdminDiagnostics';
import AdminSystemStatus from './AdminSystemStatus';
import AdminStatsGrid from './AdminStatsGrid';
import AdminQuickActions from './AdminQuickActions';
import AdminSystemAlert from './AdminSystemAlert';
import { Loader2, AlertCircle, Bug } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalStorageMB: number;
  activeUsers7Days: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const { toast } = useToast();

  const loadStats = async () => {
    try {
      setLoading(true);
      console.log('📊 AdminDashboard: Carregando estatísticas...');

      const dashboardStats = await AdminStatsService.getDashboardStats();

      setStats({
        ...dashboardStats,
        systemHealth: 'healthy'
      });

      setLastUpdated(new Date());
      console.log('✅ AdminDashboard: Estatísticas carregadas com sucesso');
    } catch (error) {
      console.error('❌ AdminDashboard: Erro ao carregar estatísticas:', error);
      toast({
        title: "Aviso",
        description: "Algumas estatísticas podem estar indisponíveis temporariamente.",
        variant: "destructive",
      });
      
      // Definir estatísticas padrão em caso de erro
      setStats({
        totalUsers: 0,
        totalStorageMB: 0,
        activeUsers7Days: 0,
        systemHealth: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleToggleDiagnostics = () => {
    setShowDiagnostics(!showDiagnostics);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Card className="w-96">
          <CardContent className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p>Carregando dashboard administrativo...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <p className="text-gray-600 mb-4">Erro ao carregar dashboard.</p>
        <div className="space-x-2">
          <Button onClick={loadStats}>
            Tentar Novamente
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDiagnostics(true)}
          >
            <Bug className="h-4 w-4 mr-2" />
            Executar Diagnóstico
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showDiagnostics && <AdminDiagnostics />}

      <AdminSystemStatus 
        systemHealth={stats.systemHealth}
        lastUpdated={lastUpdated}
        onToggleDiagnostics={handleToggleDiagnostics}
      />

      <AdminStatsGrid 
        totalUsers={stats.totalUsers}
        totalStorageMB={stats.totalStorageMB}
        activeUsers7Days={stats.activeUsers7Days}
      />

      <AdminQuickActions 
        onRefreshStats={loadStats}
        onToggleDiagnostics={handleToggleDiagnostics}
        showDiagnostics={showDiagnostics}
      />

      <AdminSystemAlert systemHealth={stats.systemHealth} />
    </div>
  );
};

export default AdminDashboard;
