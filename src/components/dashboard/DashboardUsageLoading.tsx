
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DashboardUsageLoading = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas de Uso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardUsageLoading;
