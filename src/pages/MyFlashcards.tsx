
import React, { useState, useEffect } from 'react';
import { useAllFlashcards, FlashcardWithResumo } from '@/hooks/useAllFlashcards';
import { useEnhancedFlashcards } from '@/hooks/useEnhancedFlashcards';
import PageLayout from '@/components/navigation/PageLayout';
import MyFlashcardsHeader from '@/components/my-flashcards/MyFlashcardsHeader';
import MyFlashcardsLoading from '@/components/my-flashcards/MyFlashcardsLoading';
import MyFlashcardsEmpty from '@/components/my-flashcards/MyFlashcardsEmpty';
import MyFlashcardsStudyMode from '@/components/my-flashcards/MyFlashcardsStudyMode';
import FlashcardSetCard from '@/components/my-flashcards/FlashcardSetCard';
import CategoryManager from '@/components/my-flashcards/CategoryManager';
import CategoryFilter from '@/components/my-flashcards/CategoryFilter';
import StudyModeSelector from '@/components/my-flashcards/StudyModeSelector';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Target, TrendingUp, Settings } from 'lucide-react';
import { StudyModeConfig } from '@/types/flashcard';

interface FlashcardSet {
  resumo_id: string;
  resumo_title: string;
  data_criacao: string;
  flashcards: FlashcardWithResumo[];
}

const MyFlashcards = () => {
  const { getAllFlashcards, loading } = useAllFlashcards();
  const { 
    categories, 
    dueCards, 
    studyStats, 
    activeGoals, 
    loading: enhancedLoading,
    startStudySession,
    loadCategories
  } = useEnhancedFlashcards();
  
  const [flashcards, setFlashcards] = useState<FlashcardSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [resumeSessionId, setResumeSessionId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('flashcards');

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      console.log('🔄 Carregando flashcards...');
      const data = await getAllFlashcards();
      console.log('📚 Flashcards carregados:', data);
      
      if (data && data.length > 0) {
        // Agrupar flashcards por resumo
        const groupedFlashcards = data.reduce((acc: Record<string, FlashcardSet>, flashcard: FlashcardWithResumo) => {
          const resumoId = flashcard.resumo_id;
          if (!acc[resumoId]) {
            acc[resumoId] = {
              resumo_id: resumoId,
              resumo_title: flashcard.resumos?.custom_name || 'Resumo sem título',
              data_criacao: flashcard.resumos?.data_criacao || flashcard.data_criacao,
              flashcards: []
            };
          }
          acc[resumoId].flashcards.push(flashcard);
          return acc;
        }, {});

        setFlashcards(Object.values(groupedFlashcards));
      } else {
        setFlashcards([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar flashcards:', error);
      setFlashcards([]);
    }
  };

  const handleStartStudy = (flashcardSet: FlashcardSet, sessionId?: string) => {
    setSelectedSet(flashcardSet);
    setResumeSessionId(sessionId || null);
    setStudyMode(true);
  };

  const handleBackToList = () => {
    setStudyMode(false);
    setSelectedSet(null);
    setResumeSessionId(null);
  };

  const handleStartCustomStudy = async (config: StudyModeConfig) => {
    const session = await startStudySession(config);
    if (session) {
      // Create a mock flashcard set for the enhanced study mode
      const studySet: FlashcardSet = {
        resumo_id: 'custom-study',
        resumo_title: `Estudo ${config.mode} - ${session.cards.length} cards`,
        data_criacao: new Date().toISOString(),
        flashcards: session.cards.map(card => ({
          ...card,
          resumos: null
        })) as FlashcardWithResumo[]
      };
      
      setSelectedSet(studySet);
      setStudyMode(true);
    }
  };

  const filteredFlashcards = selectedCategory
    ? flashcards.filter(set => {
        const categoryFromCategories = categories.find(cat => cat.id === selectedCategory);
        const categoryName = categoryFromCategories?.name;
        return set.flashcards.some(card => 
          card.category === selectedCategory || card.category === categoryName
        );
      })
    : flashcards;

  if (loading) {
    return <MyFlashcardsLoading />;
  }

  if (studyMode && selectedSet) {
    return (
      <MyFlashcardsStudyMode 
        selectedSet={selectedSet}
        resumeSessionId={resumeSessionId}
        onBackToList={handleBackToList}
      />
    );
  }

  return (
    <PageLayout showBackground>
      <div className="space-y-8">
        <MyFlashcardsHeader />

        {flashcards.length === 0 ? (
          <MyFlashcardsEmpty />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="flashcards">Meus Flashcards</TabsTrigger>
              <TabsTrigger value="categories">
                <Settings className="h-4 w-4 mr-2" />
                Categorias
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flashcards" className="space-y-6">
              {/* Enhanced Stats Section */}
              {!enhancedLoading && (dueCards.length > 0 || studyStats || activeGoals.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Due Cards */}
                  {dueCards.length > 0 && (
                    <Card className="border-orange-200 bg-orange-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-5 w-5 text-orange-600" />
                          <h3 className="font-semibold text-orange-900">Cards Pendentes</h3>
                        </div>
                        <div className="text-2xl font-bold text-orange-700">{dueCards.length}</div>
                        <p className="text-sm text-orange-600">Cards para revisar hoje</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Study Stats */}
                  {studyStats && studyStats.length > 0 && (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <h3 className="font-semibold text-green-900">Precisão</h3>
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                          {(() => {
                            const totalReviewed = studyStats.reduce((sum, stat) => sum + stat.cards_reviewed, 0);
                            const totalRemembered = studyStats.reduce((sum, stat) => sum + stat.cards_remembered, 0);
                            return totalReviewed > 0 ? Math.round((totalRemembered / totalReviewed) * 100) : 0;
                          })()}%
                        </div>
                        <p className="text-sm text-green-600">
                          {studyStats.reduce((sum, stat) => sum + stat.cards_reviewed, 0)} cards revisados
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Active Goals */}
                  {activeGoals.length > 0 && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-blue-900">Metas Ativas</h3>
                        </div>
                        <div className="text-2xl font-bold text-blue-700">{activeGoals.length}</div>
                        <p className="text-sm text-blue-600">Metas em andamento</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Study Mode Selector */}
              {flashcards.length > 0 && (
                <div className="flex justify-center">
                  <StudyModeSelector 
                    categories={categories}
                    onStartStudy={handleStartCustomStudy}
                  />
                </div>
              )}

              {/* Category Filter */}
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />

              {/* Flashcard Sets */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFlashcards.map((flashcardSet) => (
                  <FlashcardSetCard
                    key={flashcardSet.resumo_id}
                    flashcardSet={flashcardSet}
                    onStartStudy={handleStartStudy}
                  />
                ))}
              </div>

              {filteredFlashcards.length === 0 && selectedCategory && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum flashcard encontrado para a categoria selecionada.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCategory(null)}
                    className="mt-4"
                  >
                    Ver todos os flashcards
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="categories">
              <CategoryManager 
                categories={categories}
                onCategoryUpdate={loadCategories}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageLayout>
  );
};

export default MyFlashcards;
