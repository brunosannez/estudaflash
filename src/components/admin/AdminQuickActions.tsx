
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Activity, TrendingUp, Bug, Calendar, Database } from 'lucide-react';

interface AdminQuickActionsProps {
  onRefreshStats: () => void;
  onToggleDiagnostics: () => void;
  showDiagnostics: boolean;
}

const AdminQuickActions = ({ onRefreshStats, onToggleDiagnostics, showDiagnostics }: AdminQuickActionsProps) => {
  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="outline" onClick={onRefreshStats} className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Atualizar Dados
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onToggleDiagnostics}
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
  );
};

export default AdminQuickActions;
