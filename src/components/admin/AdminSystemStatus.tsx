
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Server, Database, Bug } from 'lucide-react';

interface AdminSystemStatusProps {
  systemHealth: 'healthy' | 'warning' | 'error';
  lastUpdated: Date;
  onToggleDiagnostics: () => void;
}

const AdminSystemStatus = ({ systemHealth, lastUpdated, onToggleDiagnostics }: AdminSystemStatusProps) => {
  const getHealthBadge = () => {
    switch (systemHealth) {
      case 'healthy':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Sistema Saudável</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Atenção</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Modo Fallback</Badge>;
    }
  };

  return (
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
              onClick={onToggleDiagnostics}
            >
              <Bug className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSystemStatus;
