
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Upload, TrendingUp, Brain, Target } from 'lucide-react';
import Header from '@/components/Header';
import UploadArea from '@/components/UploadArea';
import RecentActivity from '@/components/RecentActivity';
import ProgressOverview from '@/components/ProgressOverview';
import ResumoSelector from '@/components/ResumoSelector';
import FlashcardStudy from '@/components/FlashcardStudy';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [studyMode, setStudyMode] = useState<'selector' | 'flashcards' | 'quiz' | null>(null);
  const [selectedResumoId, setSelectedResumoId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleResumoSelect = (resumo: any) => {
    setSelectedResumoId(resumo.id);
    if (activeTab === 'flashcards') {
      setStudyMode('flashcards');
    } else if (activeTab === 'quizzes') {
      navigate(`/quiz/${resumo.id}`);
    }
  };

  const handleBackToSelector = () => {
    setStudyMode('selector');
    setSelectedResumoId(null);
  };

  const handleBackToMain = () => {
    setStudyMode(null);
    setSelectedResumoId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Bem-vindo, {user?.email?.split('@')[0]}! 
            </h1>
            <p className="text-gray-600">
              Transforme suas imagens de estudo em conteúdo interativo com IA
            </p>
          </div>

          {studyMode === 'flashcards' && selectedResumoId ? (
            <FlashcardStudy 
              resumoId={selectedResumoId} 
              onBack={handleBackToSelector}
            />
          ) : studyMode === 'selector' ? (
            <ResumoSelector
              onSelectResumo={handleResumoSelect}
              title={activeTab === 'flashcards' ? 'Escolha um Resumo para Estudar' : 'Escolha um Resumo para Quiz'}
              description={activeTab === 'flashcards' ? 'Selecione um resumo para criar e estudar flashcards' : 'Selecione um resumo para criar e responder quizzes'}
              actionText={activeTab === 'flashcards' ? 'Estudar Flashcards' : 'Fazer Quiz'}
            />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="upload" className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </TabsTrigger>
                <TabsTrigger value="progress" className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Progresso</span>
                </TabsTrigger>
                <TabsTrigger value="flashcards" className="flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span>Flashcards</span>
                </TabsTrigger>
                <TabsTrigger value="quizzes" className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Quizzes</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <UploadArea />
              </TabsContent>

              <TabsContent value="progress">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Seu Progresso</h2>
                    <Button 
                      onClick={() => navigate('/progresso')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Ver Detalhes Completos
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ProgressOverview />
                    <RecentActivity />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="flashcards">
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Estudar com Flashcards</h3>
                  <p className="text-gray-500 mb-6">
                    Escolha um resumo existente ou faça upload de uma nova imagem
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => setStudyMode('selector')}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Usar Resumo Existente
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('upload')}
                    >
                      Fazer Novo Upload
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="quizzes">
                <div className="text-center py-12">
                  <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Testar Conhecimento</h3>
                  <p className="text-gray-500 mb-6">
                    Escolha um resumo existente ou faça upload de uma nova imagem
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => setStudyMode('selector')}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      Usar Resumo Existente
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('upload')}
                    >
                      Fazer Novo Upload
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {studyMode && (
            <div className="fixed top-4 left-4">
              <Button variant="outline" onClick={handleBackToMain}>
                ← Voltar ao Menu
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
