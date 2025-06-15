
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AdminDiagnosticsService } from '@/services/adminDiagnosticsService';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Wrench, 
  Bug,
  Database,
  Users,
  HardDrive,
  Settings
} from 'lucide-react';

const AdminDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    try {
      setLoading(true);
      console.log('🔍 Executando diagnósticos...');
      
      const result = await AdminDiagnosticsService.runDiagnostics();
      setDiagnostics(result);
      
      console.log('📊 Diagnósticos concluídos:', result);
      
      toast({
        title: "Diagnósticos Concluídos",
        description: `${result.errors.length} problemas encontrados.`,
        variant: result.errors.length > 0 ? "destructive" : "default",
      });
    } catch (error) {
      console.error('❌ Erro nos diagnósticos:', error);
      toast({
        title: "Erro",
        description: "Erro ao executar diagnósticos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fixFileSizes = async () => {
    try {
      setFixing(true);
      console.log('🔧 Corrigindo file sizes...');
      
      const result = await AdminDiagnosticsService.fixFileSizes();
      
      toast({
        title: "Correção Concluída",
        description: `${result.fixed} uploads corrigidos.`,
      });

      // Re-executar diagnósticos
      await runDiagnostics();
    } catch (error) {
      console.error('❌ Erro ao corrigir:', error);
      toast({
        title: "Erro",
        description: "Erro ao corrigir file sizes.",
        variant: "destructive",
      });
    } finally {
      setFixing(false);
    }
  };

  const makeAdmin = async () => {
    try {
      if (!diagnostics?.currentUserId) return;
      
      const success = await AdminDiagnosticsService.ensureUserIsAdmin(diagnostics.currentUserId);
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Usuário promovido a administrador.",
        });
        await runDiagnostics();
      } else {
        toast({
          title: "Erro",
          description: "Falha ao promover usuário.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao promover usuário.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-blue-600" />
            <CardTitle>Diagnóstico do Sistema</CardTitle>
          </div>
          <Button
            onClick={runDiagnostics}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Bug className="h-4 w-4" />
            )}
            Executar Diagnóstico
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!diagnostics ? (
          <div className="text-center py-8 text-gray-500">
            Clique em "Executar Diagnóstico" para verificar o sistema
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status do Admin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Status Admin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {diagnostics.isAdmin ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <Badge variant={diagnostics.isAdmin ? "default" : "destructive"}>
                      {diagnostics.isAdmin ? 'Admin' : 'Não Admin'}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      via {diagnostics.adminCheckMethod}
                    </span>
                  </div>
                  {!diagnostics.isAdmin && (
                    <Button
                      onClick={makeAdmin}
                      size="sm"
                      className="mt-2"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Promover a Admin
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Dados do Sistema</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>Uploads: {diagnostics.totalUploads}</div>
                    <div>Usuários: {diagnostics.totalUsers}</div>
                    <div>Usuário ID: {diagnostics.currentUserId?.slice(0, 8)}...</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sample Upload */}
            {diagnostics.sampleUpload && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Upload de Exemplo</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>ID: {diagnostics.sampleUpload.id}</div>
                    <div>Arquivo: {diagnostics.sampleUpload.arquivo_original_nome}</div>
                    <div>Tamanho: {diagnostics.sampleUpload.file_size || 0} bytes</div>
                    <div>Data: {new Date(diagnostics.sampleUpload.data_upload).toLocaleDateString('pt-BR')}</div>
                  </div>
                  {(diagnostics.sampleUpload.file_size === 0 || !diagnostics.sampleUpload.file_size) && (
                    <Button
                      onClick={fixFileSizes}
                      disabled={fixing}
                      size="sm"
                      className="mt-2"
                    >
                      {fixing ? (
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Wrench className="h-3 w-3 mr-1" />
                      )}
                      Corrigir File Sizes
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Erros */}
            {diagnostics.errors.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-700">Problemas Encontrados</span>
                  </div>
                  <ul className="text-sm text-red-600 space-y-1">
                    {diagnostics.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Registro do Usuário */}
            {diagnostics.userRecord && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Registro do Usuário</span>
                  </div>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(diagnostics.userRecord, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDiagnostics;
