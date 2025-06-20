
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Brain, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAllFlashcards, FlashcardWithResumo } from '@/hooks/useAllFlashcards';
import FlashcardStudyMode from '@/components/FlashcardStudyMode';
import PageLayout from '@/components/navigation/PageLayout';

interface FlashcardSet {
  resumo_id: string;
  resumo_title: string;
  data_criacao: string;
  flashcards: FlashcardWithResumo[];
}

const MyFlashcards = () => {
  const navigate = useNavigate();
  const { getAllFlashcards, loading } = useAllFlashcards();
  const [flashcards, setFlashcards] = useState<FlashcardSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [studyMode, setStudyMode] = useState(false);

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

  const handleStartStudy = (flashcardSet: FlashcardSet) => {
    setSelectedSet(flashcardSet);
    setStudyMode(true);
  };

  const handleBackToList = () => {
    setStudyMode(false);
    setSelectedSet(null);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600">🧠 Carregando seus flashcards...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (studyMode && selectedSet) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleBackToList}
              variant="ghost" 
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Estudando: {selectedSet.resumo_title}
              </h1>
              <p className="text-gray-600">
                {selectedSet.flashcards.length} flashcards disponíveis
              </p>
            </div>
          </div>
          
          <FlashcardStudyMode 
            resumoId={selectedSet.resumo_id}
            onBack={handleBackToList}
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showBackground>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Sparkles className="h-12 w-12 text-cyan-500 animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center animate-bounce">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Meus Flashcards Inteligentes
              </h1>
              <div className="text-5xl animate-bounce">🧠</div>
            </div>
            <Sparkles className="h-12 w-12 text-purple-500 animate-pulse" />
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-3xl max-w-4xl mx-auto border-2 border-blue-200">
            <p className="text-xl text-gray-700 font-medium leading-relaxed">
              🎪 Seus flashcards organizados e prontos para estudo! Use a repetição espaçada para memorizar melhor. ✨
            </p>
          </div>
        </div>

        {flashcards.length === 0 ? (
          <Card className="border-4 border-blue-200 shadow-xl overflow-hidden">
            <CardContent className="text-center py-16">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                Nenhum flashcard encontrado
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Você ainda não possui flashcards. Gere flashcards a partir de seus resumos para começar a estudar!
              </p>
              <Button 
                onClick={() => navigate('/my-summaries')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
                size="lg"
              >
                📚 Ver Meus Resumos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcards.map((flashcardSet) => (
              <Card 
                key={flashcardSet.resumo_id} 
                className="border-4 border-blue-200 shadow-xl overflow-hidden hover:shadow-2xl hover:border-purple-300 transition-all duration-300 transform hover:scale-105"
              >
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-3">
                  <CardTitle className="text-lg font-bold text-gray-800 line-clamp-2">
                    {flashcardSet.resumo_title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      {flashcardSet.flashcards.length} cards
                    </span>
                    <span>
                      {new Date(flashcardSet.data_criacao).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 font-medium">
                      💡 {flashcardSet.flashcards.length} conceitos prontos para revisar
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => handleStartStudy(flashcardSet)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    🚀 Estudar Agora
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MyFlashcards;
