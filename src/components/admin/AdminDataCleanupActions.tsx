
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Download, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DataManagementService } from '@/services/dataManagementService';
import type { DataManagementStats } from '@/types/dataManagement';
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

interface AdminDataCleanupActionsProps {
  stats: DataManagementStats;
  onRefresh: () => void;
}

const AdminDataCleanupActions = ({ stats, onRefresh }: AdminDataCleanupActionsProps) => {
  const [cleaningOldFiles, setCleaningOldFiles] = useState(false);
  const { toast } = useToast();

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

      onRefresh();
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Ações de Limpeza</h3>
      
      <div className="flex flex-wrap gap-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 text-destructive hover:bg-destructive/10"
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
                Aproximadamente {stats.filesOlderThan30Days} arquivos serão deletados.
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteOldFiles}
                className="bg-destructive hover:bg-destructive/90"
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
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar Estatísticas
        </Button>
      </div>
    </div>
  );
};

export default AdminDataCleanupActions;
