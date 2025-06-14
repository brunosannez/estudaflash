
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Upload, TrendingUp, Brain, Target, LogOut } from 'lucide-react';
import Header from '@/components/Header';
import UploadArea from '@/components/UploadArea';
import RecentActivity from '@/components/RecentActivity';
import ProgressOverview from '@/components/ProgressOverview';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const { user } = useAuth();
  const navigate = useNavigate();

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
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Seus Flashcards</h3>
                <p className="text-gray-500 mb-6">
                  Faça upload de uma imagem e gere um resumo para criar flashcards
                </p>
                <Button onClick={() => setActiveTab('upload')}>
                  Fazer Upload
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="quizzes">
              <div className="text-center py-12">
                <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Seus Quizzes</h3>
                <p className="text-gray-500 mb-6">
                  Faça upload de uma imagem e gere um resumo para criar quizzes
                </p>
                <Button onClick={() => setActiveTab('upload')}>
                  Fazer Upload
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
