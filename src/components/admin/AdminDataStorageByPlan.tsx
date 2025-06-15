
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DataManagementStats } from '@/types/dataManagement';

interface AdminDataStorageByPlanProps {
  stats: DataManagementStats;
}

const AdminDataStorageByPlan = ({ stats }: AdminDataStorageByPlanProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Uso por Plano</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(stats.storageByPlan || {}).map(([plan, data]) => (
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
  );
};

export default AdminDataStorageByPlan;
