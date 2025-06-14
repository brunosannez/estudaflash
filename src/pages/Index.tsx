
import { useState } from 'react';
import { Upload, BarChart3, Brain, Target, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import UploadArea from '@/components/UploadArea';
import ProgressOverview from '@/components/ProgressOverview';
import RecentActivity from '@/components/RecentActivity';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Estude com <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Inteligência Artificial</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transforme suas imagens de estudo em resumos, flashcards e quizzes personalizados com o poder da IA
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="progresso" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progresso
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Flashcards
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <UploadArea />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <ProgressOverview />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentActivity />
              </div>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">🎯 Meta Diária</h3>
                  <p className="text-sm opacity-90 mb-4">Estude pelo menos 30 minutos hoje</p>
                  <div className="bg-white/20 rounded-full h-2 mb-2">
                    <div className="bg-white rounded-full h-2 w-4/5"></div>
                  </div>
                  <p className="text-xs">25/30 minutos</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">🔥 Dica do Dia</h3>
                  <p className="text-sm opacity-90">
                    Use a técnica Pomodoro: estude por 25 minutos e descanse por 5 minutos para melhor retenção!
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progresso" className="space-y-6">
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 mx-auto text-blue-600 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                🎯 Acompanhe Seu Progresso
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Veja suas estatísticas completas, XP ganho, níveis alcançados e muito mais na página dedicada de progresso!
              </p>
              <Button 
                onClick={() => navigate('/progresso')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                Ver Meu Progresso Completo
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="flashcards" className="space-y-6">
            <div className="text-center py-20">
              <Brain className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                Flashcards Inteligentes
              </h3>
              <p className="text-gray-500 mb-6">
                Faça upload de uma imagem para gerar flashcards personalizados com IA
              </p>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Criar Primeiro Flashcard
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-6">
            <div className="text-center py-20">
              <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                Quizzes Personalizados
              </h3>
              <p className="text-gray-500 mb-6">
                Teste seus conhecimentos com quizzes gerados automaticamente pela IA
              </p>
              <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                Fazer Primeiro Quiz
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
