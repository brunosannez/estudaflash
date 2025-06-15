
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Loader2 } from 'lucide-react';

const QuickStatsLoading = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Estatísticas Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-2">Sincronizando dados...</p>
            <p className="text-xs text-gray-500">Carregando suas estatísticas</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStatsLoading;
