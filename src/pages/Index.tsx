
import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import UploadArea from '@/components/UploadArea';
import ResumoSelector from '@/components/ResumoSelector';
import FlashcardStudy from '@/components/FlashcardStudy';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import FloatingBackground from '@/components/dashboard/FloatingBackground';
import ProgressTabContent from '@/components/dashboard/ProgressTabContent';
import FlashcardsTabContent from '@/components/dashboard/FlashcardsTabContent';
import QuizzesTabContent from '@/components/dashboard/QuizzesTabContent';
import BackButton from '@/components/dashboard/BackButton';
import { designColors } from '@/utils/designSystem';

const Index = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [studyMode, setStudyMode] = useState<'selector' | 'flashcards' | 'quiz' | null>(null);
  const [selectedResumoId, setSelectedResumoId] = useState<string | null>(null);
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
      <FloatingBackground />
      <Header />
      
      <div className={`container mx-auto ${designColors.responsive.containerPadding} py-4 sm:py-8 relative z-10`}>
        <div className="max-w-6xl mx-auto">
          <DashboardHeader />

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
              <DashboardTabs activeTab={activeTab} />

              <TabsContent value="upload" className={designColors.animations.slideIn}>
                <UploadArea />
              </TabsContent>

              <TabsContent value="progress" className={designColors.animations.slideIn}>
                <ProgressTabContent />
              </TabsContent>

              <TabsContent value="flashcards" className={designColors.animations.slideIn}>
                <FlashcardsTabContent 
                  onSelectExisting={() => setStudyMode('selector')}
                  onUploadNew={() => setActiveTab('upload')}
                />
              </TabsContent>

              <TabsContent value="quizzes" className={designColors.animations.slideIn}>
                <QuizzesTabContent 
                  onSelectExisting={() => setStudyMode('selector')}
                  onUploadNew={() => setActiveTab('upload')}
                />
              </TabsContent>
            </Tabs>
          )}

          {studyMode && (
            <BackButton onClick={handleBackToMain} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
