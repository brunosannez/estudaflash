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
  Bug,
  Users,
  Shield
} from 'lucide-react';

const AdminDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-primary" />
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
          <div className="text-center py-8 text-muted-foreground">
            Clique em "Executar Diagnóstico" para verificar o sistema
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status do Admin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium">Status Admin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {diagnostics.isAdmin ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                    <Badge variant={diagnostics.isAdmin ? "default" : "destructive"}>
                      {diagnostics.isAdmin ? 'Admin' : 'Não Admin'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      via {diagnostics.adminCheckMethod}
                    </span>
                  </div>
                  {!diagnostics.isAdmin && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span>
                          Promoção de admin deve ser feita através de processos seguros no servidor.
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium">Informações</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>Usuário ID: {diagnostics.currentUserId?.slice(0, 8)}...</div>
                    <div>Método de verificação: {diagnostics.adminCheckMethod}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Erros */}
            {diagnostics.errors.length > 0 && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="font-medium text-destructive">Problemas Encontrados</span>
                  </div>
                  <ul className="text-sm text-destructive space-y-1">
                    {diagnostics.errors.map((error: string, index: number) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Warnings */}
            {diagnostics.warnings && diagnostics.warnings.length > 0 && (
              <Card className="border-yellow-500/50 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-700">Avisos</span>
                  </div>
                  <ul className="text-sm text-yellow-600 space-y-1">
                    {diagnostics.warnings.map((warning: string, index: number) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Security Notice */}
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium text-primary">Nota de Segurança</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  A promoção de administradores foi restrita a processos seguros no servidor para prevenir 
                  ataques de escalação de privilégios. Para adicionar um novo administrador, utilize o 
                  painel do Supabase ou funções RPC autorizadas.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDiagnostics;
