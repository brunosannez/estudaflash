
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, BookOpen, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useStorageManagement } from '@/hooks/useStorageManagement';
import { useRealTimeProgress } from '@/hooks/useRealTimeProgress';
import { useDataSync } from '@/hooks/useDataSync';

const DashboardUsageOverview = () => {
  const navigate = useNavigate();
  const { usageData, loading: usageLoading } = useUsageLimit();
  const { storageUsage, loading: storageLoading } = useStorageManagement();
  const { progress, loading: progressLoading } = useRealTimeProgress();
  const { forceSyncUserData, syncing } = useDataSync();

  const isLoading = usageLoading || storageLoading || progressLoading;

  const handleRefresh = async () => {
    await forceSyncUserData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Ação Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => navigate('/upload')}>
          <CardContent className="p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Fazer Upload</h3>
            <p className="text-blue-100">Envie suas imagens de estudo</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => navigate('/my-summaries')}>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Ver Resumos</h3>
            <p className="text-green-100">Acesse seus materiais gerados</p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {usageData?.uploads_realizados || 0}
            </div>
            <div className="text-sm text-gray-600">Uploads</div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {usageData?.flashcards_gerados || 0}
            </div>
            <div className="text-sm text-gray-600">Flashcards</div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {usageData?.quizzes_realizados || 0}
            </div>
            <div className="text-sm text-gray-600">Quizzes</div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {progress?.current_level || 1}
            </div>
            <div className="text-sm text-gray-600">Nível</div>
          </CardContent>
        </Card>
      </div>

      {/* Botão de Atualização */}
      <div className="flex justify-center pt-4">
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={syncing}
          className="bg-white/70 backdrop-blur-sm border-purple-200 hover:bg-purple-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Atualizar Dados'}
        </Button>
      </div>
    </div>
  );
};

export default DashboardUsageOverview;
