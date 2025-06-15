
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, HardDrive, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import type { DataManagementStats } from '@/types/dataManagement';

interface AdminDataStatsProps {
  stats: DataManagementStats;
}

const AdminDataStats = ({ stats }: AdminDataStatsProps) => {
  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total de Arquivos</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.totalFiles || 0}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.filesOlderThan7Days || 0} com +7 dias
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
              {stats.totalStorageMB.toFixed(1) || 0} MB
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Maior arquivo: {stats.largestFileSizeMB.toFixed(1) || 0} MB
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
              {stats.averageStoragePerUser.toFixed(1) || 0} MB
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.totalUsers || 0} usuários total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Usuários Ativos</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.activeUsers30Days || 0}</div>
            <div className="text-xs text-gray-500 mt-1">
              Últimos 30 dias
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Arquivos para Limpeza */}
      {stats.filesOlderThan30Days > 0 && (
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
    </div>
  );
};

export default AdminDataStats;
