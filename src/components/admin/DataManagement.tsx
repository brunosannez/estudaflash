
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Database, Trash2, Download, HardDrive, Users, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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

interface SystemStats {
  totalFiles: number;
  totalStorageMB: number;
  averageStoragePerUser: number;
  totalUsers: number;
  filesOlderThan30Days: number;
}

const DataManagement = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaningOldFiles, setCleaningOldFiles] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas do sistema
      const [uploadsResult, usersResult] = await Promise.all([
        supabase.from('uploads').select('file_size, data_upload'),
        supabase.from('uso_usuarios').select('id')
      ]);

      if (uploadsResult.error) throw uploadsResult.error;
      if (usersResult.error) throw usersResult.error;

      const uploads = uploadsResult.data || [];
      const totalUsers = usersResult.data?.length || 0;
      const totalFiles = uploads.length;
      const totalStorageBytes = uploads.reduce((acc, upload) => acc + (upload.file_size || 0), 0);
      const totalStorageMB = totalStorageBytes / (1024 * 1024);

      // Arquivos mais antigos que 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const filesOlderThan30Days = uploads.filter(upload => 
        new Date(upload.data_upload) < thirtyDaysAgo
      ).length;

      setStats({
        totalFiles,
        totalStorageMB,
        averageStoragePerUser: totalUsers > 0 ? totalStorageMB / totalUsers : 0,
        totalUsers,
        filesOlderThan30Days
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar estatísticas do sistema.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOldFiles = async () => {
    try {
      setCleaningOldFiles(true);
      
      // Buscar arquivos mais antigos que 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: oldUploads, error: fetchError } = await supabase
        .from('uploads')
        .select('id')
        .lt('data_upload', thirtyDaysAgo.toISOString());

      if (fetchError) throw fetchError;

      if (oldUploads && oldUploads.length > 0) {
        // Deletar uploads antigos (isso irá deletar em cascata resumos, flashcards, etc.)
        const { error: deleteError } = await supabase
          .from('uploads')
          .delete()
          .lt('data_upload', thirtyDaysAgo.toISOString());

        if (deleteError) throw deleteError;

        toast({
          title: "Sucesso!",
          description: `${oldUploads.length} arquivos antigos foram deletados.`,
        });

        // Recarregar estatísticas
        loadSystemStats();
      } else {
        toast({
          title: "Info",
          description: "Nenhum arquivo antigo encontrado para deletar.",
        });
      }

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
      // Buscar dados de uso detalhados
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

      // Criar CSV
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
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          <CardTitle>Gerenciamento de Dados</CardTitle>
        </div>
        <p className="text-sm text-gray-600">
          Monitore e gerencie o armazenamento e uso de dados
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Estatísticas de Armazenamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total de Arquivos</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats?.totalFiles || 0}</div>
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
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Arquivos > 30 dias</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats?.filesOlderThan30Days || 0}</div>
              </CardContent>
            </Card>
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
                onClick={loadSystemStats}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
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
