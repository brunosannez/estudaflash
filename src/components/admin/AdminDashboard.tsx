
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AdminStatsService } from '@/services/adminStatsService';
import AdminDiagnostics from './AdminDiagnostics';
import { 
  Users, 
  Upload, 
  Brain, 
  Target, 
  TrendingUp, 
  Activity,
  Calendar,
  Server,
  Database,
  Loader2,
  AlertCircle,
  HardDrive,
  Bug
} from 'lucide-react';

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

  const getHealthBadge = () => {
    if (!stats) return null;
    
    switch (stats.systemHealth) {
      case 'healthy':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Sistema Saudável</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Atenção</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Modo Fallback</Badge>;
    }
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
      {/* Diagnósticos do Sistema */}
      {showDiagnostics && (
        <AdminDiagnostics />
      )}

      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Database</span>
              </div>
              {getHealthBadge()}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDiagnostics(!showDiagnostics)}
              >
                <Bug className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Armazenamento Total</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStorageMB.toFixed(1)} MB</div>
            <p className="text-xs text-muted-foreground">
              Espaço utilizado
            </p>
            {stats.totalStorageMB === 0 && stats.totalUsers > 0 && (
              <Badge variant="destructive" className="mt-1 text-xs">
                Dados podem estar zerados
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos (7 dias)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers7Days}</div>
            <p className="text-xs text-muted-foreground">
              Usuários com atividade recente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" onClick={loadStats} className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Atualizar Dados
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              {showDiagnostics ? 'Ocultar' : 'Mostrar'} Diagnóstico
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.open('/admin/analytics', '_blank')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Ver Analytics
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                toast({
                  title: "Info",
                  description: "Funcionalidade em desenvolvimento.",
                });
              }}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Limpeza DB
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      {stats.systemHealth === 'error' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Sistema operando em modo fallback. Execute o diagnóstico para mais informações.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
