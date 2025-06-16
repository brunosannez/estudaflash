
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, RefreshCw, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDataSync } from '@/hooks/useDataSync';
import ProgressOverview from '@/components/ProgressOverview';
import SuccessPopup from '@/components/dashboard/SuccessPopup';

const DashboardTabs = () => {
  const navigate = useNavigate();
  const { forceSyncUserData, checkDataConsistency, syncing } = useDataSync();
  const [dataInconsistent, setDataInconsistent] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    // Verificar consistência dos dados ao carregar
    checkDataConsistency().then(result => {
      if (result?.isInconsistent) {
        setDataInconsistent(true);
      }
    });
  }, []);

  const handleSyncData = async () => {
    const success = await forceSyncUserData();
    if (success) {
      setDataInconsistent(false);
      setShowSuccessPopup(true);
      
      // Recarregar a página após 2 segundos para garantir que os dados sejam atualizados
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <div className="w-full">
      <SuccessPopup 
        show={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
      />
      
      {dataInconsistent && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Dados inconsistentes detectados</p>
                  <p className="text-sm text-orange-600">Seus contadores podem estar desatualizados. Clique em sincronizar para corrigir.</p>
                </div>
              </div>
              <Button 
                onClick={handleSyncData}
                disabled={syncing}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sincronizar Dados
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
          <TabsTrigger value="overview">📊 Visão Geral</TabsTrigger>
          <TabsTrigger value="upload">📤 Upload</TabsTrigger>
          <TabsTrigger value="progress">🏆 Progresso</TabsTrigger>
          <TabsTrigger value="sync" className="hidden lg:flex">🔄 Sincronizar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Bem-vindo ao seu painel de estudos!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => navigate('/upload')}
                  className="h-24 flex flex-col gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Upload className="h-8 w-8" />
                  <span className="font-semibold">Fazer Upload</span>
                  <span className="text-xs opacity-90">Envie suas imagens de estudo</span>
                </Button>
                
                <Button 
                  onClick={() => navigate('/my-summaries')}
                  variant="outline"
                  className="h-24 flex flex-col gap-2 border-2 border-purple-300 hover:bg-purple-50"
                >
                  <span className="text-2xl">📚</span>
                  <span className="font-semibold">Ver Resumos</span>
                  <span className="text-xs text-gray-600">Acesse seus resumos gerados</span>
                </Button>
                
                <Button 
                  onClick={() => navigate('/my-flashcards')}
                  variant="outline"
                  className="h-24 flex flex-col gap-2 border-2 border-green-300 hover:bg-green-50"
                >
                  <span className="text-2xl">🧠</span>
                  <span className="font-semibold">Flashcards</span>
                  <span className="text-xs text-gray-600">Pratique com flashcards</span>
                </Button>
                
                <Button 
                  onClick={() => navigate('/quiz-history')}
                  variant="outline"
                  className="h-24 flex flex-col gap-2 border-2 border-orange-300 hover:bg-orange-50"
                >
                  <span className="text-2xl">🎯</span>
                  <span className="font-semibold">Quizzes</span>
                  <span className="text-xs text-gray-600">Teste seus conhecimentos</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>📤 Fazer Upload de Imagens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Faça upload de suas imagens de estudo para gerar resumos e flashcards automaticamente.
              </p>
              <Button 
                onClick={() => navigate('/upload')}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Upload className="h-5 w-5 mr-2" />
                Ir para Upload
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress">
          <ProgressOverview />
        </TabsContent>
        
        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Sincronização de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Se você notar inconsistências nos seus dados ou contadores, use a sincronização para corrigir baseado no seu histórico real.
              </p>
              <Button 
                onClick={handleSyncData}
                disabled={syncing}
                size="lg"
                className="w-full"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Sincronizando dados históricos...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Sincronizar Dados Históricos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTabs;
