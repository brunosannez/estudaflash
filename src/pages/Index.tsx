
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Upload, TrendingUp, Brain, Target, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import UploadArea from '@/components/UploadArea';
import RecentActivity from '@/components/RecentActivity';
import ProgressOverview from '@/components/ProgressOverview';
import ResumoSelector from '@/components/ResumoSelector';
import FlashcardStudy from '@/components/FlashcardStudy';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { designColors } from '@/utils/designSystem';

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
    <div className={`min-h-screen ${designColors.backgrounds.main} relative overflow-hidden`}>
      {/* Elementos decorativos flutuantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl animate-bounce opacity-20">⭐</div>
        <div className="absolute top-40 right-20 text-3xl animate-pulse opacity-30">🌟</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-float opacity-20">✨</div>
        <div className="absolute bottom-40 right-10 text-3xl animate-bounce opacity-25">🎯</div>
      </div>

      <Header />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-8 w-8 text-cyan-500 animate-pulse" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Olá, {user?.email?.split('@')[0]}! 
              </h1>
              <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
            </div>
            <div className={`${designColors.cards.accent} p-4 max-w-4xl mx-auto`}>
              <p className="text-xl text-gray-700 font-medium">
                🎓 Transforme suas imagens de estudo em aventuras de aprendizado incríveis! ✨
              </p>
            </div>
          </div>

          {studyMode === 'flashcards' && selectedResumoId ? (
            <div className={`${designColors.cards.primary} p-6 ${designColors.animations.slideIn}`}>
              <FlashcardStudy 
                resumoId={selectedResumoId} 
                onBack={handleBackToSelector}
              />
            </div>
          ) : studyMode === 'selector' ? (
            <div className={designColors.animations.slideIn}>
              <ResumoSelector
                onSelectResumo={handleResumoSelect}
                title={activeTab === 'flashcards' ? '🧠 Escolha um Resumo para Estudar' : '🎯 Escolha um Resumo para Quiz'}
                description={activeTab === 'flashcards' ? 'Selecione um resumo para criar e estudar flashcards divertidos!' : 'Selecione um resumo para criar e responder quizzes emocionantes!'}
                actionText={activeTab === 'flashcards' ? '🧠 Estudar Flashcards' : '🎮 Fazer Quiz'}
              />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-cyan-200">
                <TabsTrigger 
                  value="upload" 
                  className={`flex items-center space-x-2 rounded-xl transition-all duration-300 ${
                    activeTab === 'upload' 
                      ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-lg transform scale-105' 
                      : 'hover:bg-purple-50 hover:scale-102 text-gray-700'
                  }`}
                >
                  <Upload className="h-5 w-5" />
                  <span className="font-semibold">📤 Upload</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="progress" 
                  className={`flex items-center space-x-2 rounded-xl transition-all duration-300 ${
                    activeTab === 'progress' 
                      ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-white shadow-lg transform scale-105' 
                      : 'hover:bg-cyan-50 hover:scale-102 text-gray-700'
                  }`}
                >
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">📈 Progresso</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="flashcards" 
                  className={`flex items-center space-x-2 rounded-xl transition-all duration-300 ${
                    activeTab === 'flashcards' 
                      ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg transform scale-105' 
                      : 'hover:bg-green-50 hover:scale-102 text-gray-700'
                  }`}
                >
                  <Brain className="h-5 w-5" />
                  <span className="font-semibold">🧠 Flashcards</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="quizzes" 
                  className={`flex items-center space-x-2 rounded-xl transition-all duration-300 ${
                    activeTab === 'quizzes' 
                      ? 'bg-gradient-to-r from-purple-400 to-cyan-500 text-white shadow-lg transform scale-105' 
                      : 'hover:bg-purple-50 hover:scale-102 text-gray-700'
                  }`}
                >
                  <Target className="h-5 w-5" />
                  <span className="font-semibold">🎯 Quizzes</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className={designColors.animations.slideIn}>
                <UploadArea />
              </TabsContent>

              <TabsContent value="progress" className={designColors.animations.slideIn}>
                <div className="space-y-6">
                  <div className={`${designColors.cards.accent} p-6 text-center`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl animate-pulse">
                          🏆
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-purple-600 bg-clip-text text-transparent">
                          Seu Progresso Incrível!
                        </h2>
                      </div>
                      <Button 
                        onClick={() => navigate('/progresso')}
                        className={`${designColors.buttons.primary} text-white font-bold py-3 px-6 rounded-xl shadow-lg ${designColors.animations.buttonHover}`}
                      >
                        ✨ Ver Detalhes Completos
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={`${designColors.cards.primary} ${designColors.animations.cardHover}`}>
                      <ProgressOverview />
                    </div>
                    <div className={`${designColors.cards.primary} ${designColors.animations.cardHover}`}>
                      <RecentActivity />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="flashcards" className={designColors.animations.slideIn}>
                <div className={`${designColors.cards.secondary} text-center py-16 px-8`}>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <Brain className={`h-20 w-20 text-purple-500 ${designColors.animations.iconFloat}`} />
                    <div className="text-6xl animate-pulse">🧠</div>
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-purple-600 bg-clip-text text-transparent mb-4">
                    Estudar com Flashcards Mágicos! ✨
                  </h3>
                  <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    🎪 Escolha um resumo existente ou faça upload de uma nova imagem para começar sua aventura de aprendizado!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Button 
                      onClick={() => setStudyMode('selector')}
                      className={`${designColors.buttons.primary} text-white font-bold py-4 px-8 rounded-xl shadow-lg text-lg ${designColors.animations.buttonHover}`}
                    >
                      🎯 Usar Resumo Existente
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('upload')}
                      className={`border-2 border-purple-300 text-gray-700 font-bold py-4 px-8 rounded-xl shadow-lg text-lg hover:bg-purple-50 ${designColors.animations.buttonHover}`}
                    >
                      📤 Fazer Novo Upload
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="quizzes" className={designColors.animations.slideIn}>
                <div className={`${designColors.cards.secondary} text-center py-16 px-8`}>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <Target className={`h-20 w-20 text-green-500 ${designColors.animations.iconFloat}`} />
                    <div className="text-6xl animate-bounce">🎯</div>
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-green-600 bg-clip-text text-transparent mb-4">
                    Testar Conhecimento com Diversão! 🎮
                  </h3>
                  <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    🎪 Escolha um resumo existente ou faça upload de uma nova imagem para começar seu desafio!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Button 
                      onClick={() => setStudyMode('selector')}
                      className={`${designColors.buttons.success} text-white font-bold py-4 px-8 rounded-xl shadow-lg text-lg ${designColors.animations.buttonHover}`}
                    >
                      🎯 Usar Resumo Existente
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('upload')}
                      className={`border-2 border-green-300 text-gray-700 font-bold py-4 px-8 rounded-xl shadow-lg text-lg hover:bg-green-50 ${designColors.animations.buttonHover}`}
                    >
                      📤 Fazer Novo Upload
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {studyMode && (
            <div className="fixed top-20 left-4 z-50">
              <Button 
                variant="outline" 
                onClick={handleBackToMain}
                className={`bg-white/90 backdrop-blur-sm border-2 border-cyan-300 text-gray-700 font-bold py-2 px-4 rounded-xl shadow-lg ${designColors.animations.buttonHover}`}
              >
                ← 🏠 Voltar ao Menu
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
