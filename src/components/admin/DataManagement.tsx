
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Database, Trash2, Download, HardDrive, Users, FileText, Loader2, RefreshCw, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DataManagementService, type DataManagementStats } from '@/services/dataManagementService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const DataManagement = () => {
  const [stats, setStats] = useState<DataManagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaningOldFiles, setCleaningOldFiles] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSystemStats();
    setupRealTimeUpdates();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      loadSystemStats(true); // usar cache
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadSystemStats = async (useCache = false) => {
    try {
      setLoading(!useCache); // Não mostrar loading se estiver usando cache
      console.log('📊 DataManagement: Carregando estatísticas...');

      const statsData = await DataManagementService.getManagementStats(useCache);
      setStats(statsData);
      setLastUpdated(new Date());
      console.log('✅ DataManagement: Estatísticas carregadas com sucesso');
    } catch (error) {
      console.error('❌ DataManagement: Erro ao carregar estatísticas:', error);
      toast({
        title: "Aviso",
        description: "Algumas estatísticas podem estar indisponíveis temporariamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    console.log('🔄 DataManagement: Configurando atualizações em tempo real...');
    
    const channel = supabase
      .channel('data-management-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'uploads',
        },
        (payload) => {
          console.log('🔄 DataManagement: Upload alterado, atualizando estatísticas...', payload);
          DataManagementService.invalidateCache();
          setTimeout(() => loadSystemStats(false), 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'uso_usuarios',
        },
        (payload) => {
          console.log('🔄 DataManagement: Usuário alterado, atualizando estatísticas...', payload);
          DataManagementService.invalidateCache();
          setTimeout(() => loadSystemStats(false), 1000);
        }
      )
      .subscribe((status) => {
        console.log('📡 DataManagement: Status do realtime:', status);
        setIsRealTimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleDeleteOldFiles = async () => {
    try {
      setCleaningOldFiles(true);
      
      const result = await DataManagementService.cleanupOldFiles(30);

      if (result.deletedFiles > 0) {
        toast({
          title: "Limpeza Concluída!",
          description: `${result.deletedFiles} arquivos deletados, ${result.freedStorageMB.toFixed(2)} MB liberados.`,
        });
      } else {
        toast({
          title: "Info",
          description: "Nenhum arquivo antigo encontrado para deletar.",
        });
      }

      // Recarregar estatísticas
      await loadSystemStats(false);
    } catch (error) {
      console.error('Erro ao deletar arquivos antigos:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar arquivos antigos.",
        variant: "destructive",
      });
    } finally {
      setCleaningOldFiles(false);
    }
  };

  const exportUsageData = async () => {
    try {
      const { data: usageData, error } = await supabase
        .from('uso_usuarios')
        .select(`
          user_id,
          plano,
          uploads_realizados,
          flashcards_gerados,
          quizzes_realizados,
          created_at
        `);

      if (error) throw error;

      const csvContent = [
        ['User ID', 'Plano', 'Uploads', 'Flashcards', 'Quizzes', 'Data Cadastro'],
        ...(usageData || []).map(user => [
          user.user_id,
          user.plano,
          user.uploads_realizados,
          user.flashcards_gerados,
          user.quizzes_realizados,
          new Date(user.created_at).toLocaleDateString('pt-BR')
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `uso-dados-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Sucesso!",
        description: "Dados de uso exportados com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar dados de uso.",
        variant: "destructive",
      });
    }
  };

  const forceRefresh = async () => {
    DataManagementService.invalidateCache();
    await loadSystemStats(false);
  };

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
          {/* Estatísticas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total de Arquivos</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats?.totalFiles || 0}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats?.filesOlderThan7Days || 0} com +7 dias
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Armazenamento Total</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {stats?.totalStorageMB.toFixed(1) || 0} MB
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Maior arquivo: {stats?.largestFileSizeMB.toFixed(1) || 0} MB
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Média por Usuário</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {stats?.averageStoragePerUser.toFixed(1) || 0} MB
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats?.totalUsers || 0} usuários total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Usuários Ativos</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats?.activeUsers30Days || 0}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Últimos 30 dias
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Arquivos para Limpeza */}
          {stats && stats.filesOlderThan30Days > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {stats.filesOlderThan30Days} arquivos com mais de 30 dias podem ser removidos
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Storage por Plano */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Uso por Plano</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(stats?.storageByPlan || {}).map(([plan, data]) => (
                <Card key={plan}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={plan === 'edu' ? 'default' : plan === 'pro' ? 'secondary' : 'outline'}>
                        {plan.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600">{data.user_count} usuários</span>
                    </div>
                    <div className="text-lg font-bold">{data.storage_mb.toFixed(1)} MB</div>
                    <div className="text-xs text-gray-500">{data.file_count} arquivos</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Ações de Gerenciamento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ações de Limpeza</h3>
            
            <div className="flex flex-wrap gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 text-red-600 hover:bg-red-50"
                    disabled={cleaningOldFiles}
                  >
                    <Trash2 className="h-4 w-4" />
                    Deletar Arquivos Antigos
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deletar arquivos antigos</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá deletar permanentemente todos os arquivos carregados há mais de 30 dias,
                      incluindo seus resumos, flashcards e quizzes associados. 
                      Aproximadamente {stats?.filesOlderThan30Days} arquivos serão deletados.
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteOldFiles}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {cleaningOldFiles ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deletando...
                        </>
                      ) : (
                        'Deletar'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button 
                variant="outline" 
                onClick={exportUsageData}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar Dados de Uso (CSV)
              </Button>

              <Button 
                variant="outline" 
                onClick={forceRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar Estatísticas
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataManagement;
