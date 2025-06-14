
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
      {/* Elementos decorativos flutuantes - Responsivos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-10 left-5 sm:top-20 sm:left-10 ${designColors.responsive.floatingElements} animate-bounce`}>⭐</div>
        <div className={`absolute top-20 right-10 sm:top-40 sm:right-20 ${designColors.responsive.floatingElements} animate-pulse`}>🌟</div>
        <div className={`absolute bottom-10 left-10 sm:bottom-20 sm:left-20 ${designColors.responsive.floatingElements} animate-float`}>✨</div>
        <div className={`absolute bottom-20 right-5 sm:bottom-40 sm:right-10 ${designColors.responsive.floatingElements} animate-bounce`}>🎯</div>
      </div>

      <Header />
      
      <div className={`container mx-auto ${designColors.responsive.containerPadding} py-4 sm:py-8 relative z-10`}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 sm:mb-8 text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <Sparkles className={`${designColors.responsive.pageIcon} text-cyan-500 animate-pulse`} />
              <h1 className={`${designColors.responsive.pageTitle} font-bold bg-gradient-to-r from-gray-700 via-purple-600 to-cyan-600 bg-clip-text text-transparent`}>
                Olá, {user?.email?.split('@')[0]}! 
              </h1>
              <Sparkles className={`${designColors.responsive.pageIcon} text-purple-500 animate-pulse`} />
            </div>
            <div className={`${designColors.cards.accent} p-3 sm:p-4 max-w-4xl mx-auto`}>
              <p className={`${designColors.responsive.heroText} text-gray-700 font-medium`}>
                🎓 Transforme suas imagens de estudo em aventuras de aprendizado incríveis! ✨
              </p>
            </div>
          </div>

          {studyMode === 'flashcards' && selectedResumoId ? (
            <div className={`${designColors.cards.primary} p-3 sm:p-6 ${designColors.animations.slideIn}`}>
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
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 sm:mb-8 bg-white/80 backdrop-blur-sm p-1 sm:p-2 rounded-xl sm:rounded-2xl shadow-lg border border-cyan-200">
                <TabsTrigger 
                  value="upload" 
                  className={`flex items-center space-x-1 sm:space-x-2 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm ${
                    activeTab === 'upload' 
                      ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-lg transform scale-105' 
                      : 'hover:bg-purple-50 hover:scale-102 text-gray-700'
                  }`}
                >
                  <Upload className={designColors.responsive.buttonIcon} />
                  <span className="font-semibold">📤 Upload</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="progress" 
                  className={`flex items-center space-x-1 sm:space-x-2 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm ${
                    activeTab === 'progress' 
                      ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-white shadow-lg transform scale-105' 
                      : 'hover:bg-cyan-50 hover:scale-102 text-gray-700'
                  }`}
                >
                  <TrendingUp className={designColors.responsive.buttonIcon} />
                  <span className="font-semibold hidden sm:inline">📈 Progresso</span>
                  <span className="font-semibold sm:hidden">📈</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="flashcards" 
                  className={`flex items-center space-x-1 sm:space-x-2 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm ${
                    activeTab === 'flashcards' 
                      ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg transform scale-105' 
                      : 'hover:bg-green-50 hover:scale-102 text-gray-700'
                  }`}
                >
                  <Brain className={designColors.responsive.buttonIcon} />
                  <span className="font-semibold hidden sm:inline">🧠 Flashcards</span>
                  <span className="font-semibold sm:hidden">🧠</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="quizzes" 
                  className={`flex items-center space-x-1 sm:space-x-2 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm ${
                    activeTab === 'quizzes' 
                      ? 'bg-gradient-to-r from-purple-400 to-cyan-500 text-white shadow-lg transform scale-105' 
                      : 'hover:bg-purple-50 hover:scale-102 text-gray-700'
                  }`}
                >
                  <Target className={designColors.responsive.buttonIcon} />
                  <span className="font-semibold hidden sm:inline">🎯 Quizzes</span>
                  <span className="font-semibold sm:hidden">🎯</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className={designColors.animations.slideIn}>
                <UploadArea />
              </TabsContent>

              <TabsContent value="progress" className={designColors.animations.slideIn}>
                <div className={designColors.responsive.sectionSpacing}>
                  <div className={`${designColors.cards.accent} p-4 sm:p-6 text-center`}>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white text-lg sm:text-2xl animate-pulse">
                          🏆
                        </div>
                        <h2 className={`${designColors.responsive.sectionTitle} font-bold bg-gradient-to-r from-gray-700 to-purple-600 bg-clip-text text-transparent`}>
                          Seu Progresso Incrível!
                        </h2>
                      </div>
                      <Button 
                        onClick={() => navigate('/progresso')}
                        className={`${designColors.buttons.primary} text-white font-bold ${designColors.responsive.buttonPadding} rounded-xl shadow-lg ${designColors.animations.buttonHover} text-xs sm:text-sm`}
                      >
                        ✨ Ver Detalhes Completos
                      </Button>
                    </div>
                  </div>
                  <div className={`grid ${designColors.responsive.gridCols2} gap-4 sm:gap-6`}>
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
                <div className={`${designColors.cards.secondary} text-center py-8 sm:py-16 px-4 sm:px-8`}>
                  <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <Brain className={`h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-purple-500 ${designColors.animations.iconFloat}`} />
                    <div className="text-3xl sm:text-6xl animate-pulse">🧠</div>
                  </div>
                  <h3 className={`${designColors.responsive.sectionTitle} font-bold bg-gradient-to-r from-gray-700 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-4`}>
                    Estudar com Flashcards Mágicos! ✨
                  </h3>
                  <p className={`${designColors.responsive.heroText} text-gray-600 mb-4 sm:mb-8 max-w-2xl mx-auto`}>
                    🎪 Escolha um resumo existente ou faça upload de uma nova imagem para começar sua aventura de aprendizado!
                  </p>
                  <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-6 justify-center">
                    <Button 
                      onClick={() => setStudyMode('selector')}
                      className={`${designColors.buttons.primary} text-white font-bold ${designColors.responsive.buttonPadding} rounded-xl shadow-lg ${designColors.responsive.heroText} ${designColors.animations.buttonHover}`}
                    >
                      🎯 Usar Resumo Existente
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('upload')}
                      className={`border-2 border-purple-300 text-gray-700 font-bold ${designColors.responsive.buttonPadding} rounded-xl shadow-lg ${designColors.responsive.heroText} hover:bg-purple-50 ${designColors.animations.buttonHover}`}
                    >
                      📤 Fazer Novo Upload
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="quizzes" className={designColors.animations.slideIn}>
                <div className={`${designColors.cards.secondary} text-center py-8 sm:py-16 px-4 sm:px-8`}>
                  <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <Target className={`h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-green-500 ${designColors.animations.iconFloat}`} />
                    <div className="text-3xl sm:text-6xl animate-bounce">🎯</div>
                  </div>
                  <h3 className={`${designColors.responsive.sectionTitle} font-bold bg-gradient-to-r from-gray-700 to-green-600 bg-clip-text text-transparent mb-2 sm:mb-4`}>
                    Testar Conhecimento com Diversão! 🎮
                  </h3>
                  <p className={`${designColors.responsive.heroText} text-gray-600 mb-4 sm:mb-8 max-w-2xl mx-auto`}>
                    🎪 Escolha um resumo existente ou faça upload de uma nova imagem para começar seu desafio!
                  </p>
                  <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-6 justify-center">
                    <Button 
                      onClick={() => setStudyMode('selector')}
                      className={`${designColors.buttons.success} text-white font-bold ${designColors.responsive.buttonPadding} rounded-xl shadow-lg ${designColors.responsive.heroText} ${designColors.animations.buttonHover}`}
                    >
                      🎯 Usar Resumo Existente
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('upload')}
                      className={`border-2 border-green-300 text-gray-700 font-bold ${designColors.responsive.buttonPadding} rounded-xl shadow-lg ${designColors.responsive.heroText} hover:bg-green-50 ${designColors.animations.buttonHover}`}
                    >
                      📤 Fazer Novo Upload
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {studyMode && (
            <div className="fixed top-16 sm:top-20 left-2 sm:left-4 z-50">
              <Button 
                variant="outline" 
                onClick={handleBackToMain}
                className={`bg-white/90 backdrop-blur-sm border-2 border-cyan-300 text-gray-700 font-bold py-1 px-2 sm:py-2 sm:px-4 rounded-lg sm:rounded-xl shadow-lg ${designColors.animations.buttonHover} text-xs sm:text-sm`}
              >
                ← 🏠 <span className="hidden sm:inline">Voltar ao Menu</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
