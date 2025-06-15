
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Loader2, Activity, RefreshCw } from 'lucide-react';
import { useDataManagement } from '@/hooks/useDataManagement';
import AdminDataStats from './AdminDataStats';
import AdminDataStorageByPlan from './AdminDataStorageByPlan';
import AdminDataCleanupActions from './AdminDataCleanupActions';

const DataManagement = () => {
  const { stats, loading, lastUpdated, isRealTimeConnected, forceRefresh } = useDataManagement();

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2">Carregando estatísticas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Erro ao carregar estatísticas.</p>
            <Button onClick={forceRefresh}>Tentar Novamente</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <CardTitle>Gerenciamento de Dados</CardTitle>
            {isRealTimeConnected && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Activity className="h-3 w-3 mr-1" />
                Tempo Real
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}</span>
            <Button 
              onClick={forceRefresh}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Monitore e gerencie o armazenamento e uso de dados em tempo real
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <AdminDataStats stats={stats} />
          <AdminDataStorageByPlan stats={stats} />
          <AdminDataCleanupActions stats={stats} onRefresh={forceRefresh} />
        </div>
      </CardContent>
    </Card>
  );
};

export default DataManagement;
