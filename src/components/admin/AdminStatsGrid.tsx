
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, HardDrive, Activity } from 'lucide-react';

interface AdminStatsGridProps {
  totalUsers: number;
  totalStorageMB: number;
  activeUsers7Days: number;
}

const AdminStatsGrid = ({ totalUsers, totalStorageMB, activeUsers7Days }: AdminStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
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
          <div className="text-2xl font-bold">{totalStorageMB.toFixed(1)} MB</div>
          <p className="text-xs text-muted-foreground">
            Espaço utilizado
          </p>
          {totalStorageMB === 0 && totalUsers > 0 && (
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
          <div className="text-2xl font-bold">{activeUsers7Days}</div>
          <p className="text-xs text-muted-foreground">
            Usuários com atividade recente
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatsGrid;
