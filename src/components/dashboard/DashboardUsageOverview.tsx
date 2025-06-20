
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, BookOpen, RefreshCw, Brain, Target, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUsageData } from '@/hooks/useUsageData';

const DashboardUsageOverview = () => {
  const navigate = useNavigate();
  const { usageData, loading, refreshUsage } = useUsageData();

  const handleRefresh = async () => {
    await refreshUsage();
  };

  if (loading) {
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
            <Upload className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">
              {usageData?.uploads_realizados || 0}
            </div>
            <div className="text-sm text-gray-600">Uploads</div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
          <CardContent className="p-4 text-center">
            <Brain className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">
              {usageData?.flashcards_gerados || 0}
            </div>
            <div className="text-sm text-gray-600">Flashcards</div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">
              {usageData?.quizzes_realizados || 0}
            </div>
            <div className="text-sm text-gray-600">Quizzes</div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-600">
              {usageData?.plano === 'free' ? 'Free' : usageData?.plan_name || 'Free'}
            </div>
            <div className="text-sm text-gray-600">Plano</div>
          </CardContent>
        </Card>
      </div>

      {/* Botão de Atualização */}
      <div className="flex justify-center pt-4">
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={loading}
          className="bg-white/70 backdrop-blur-sm border-purple-200 hover:bg-purple-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Sincronizando...' : 'Atualizar Dados'}
        </Button>
      </div>
    </div>
  );
};

export default DashboardUsageOverview;
