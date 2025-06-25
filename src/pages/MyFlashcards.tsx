
import React, { useState, useEffect } from 'react';
import { useAllFlashcards, FlashcardWithResumo } from '@/hooks/useAllFlashcards';
import PageLayout from '@/components/navigation/PageLayout';
import MyFlashcardsHeader from '@/components/my-flashcards/MyFlashcardsHeader';
import MyFlashcardsLoading from '@/components/my-flashcards/MyFlashcardsLoading';
import MyFlashcardsEmpty from '@/components/my-flashcards/MyFlashcardsEmpty';
import MyFlashcardsStudyMode from '@/components/my-flashcards/MyFlashcardsStudyMode';
import FlashcardSetCard from '@/components/my-flashcards/FlashcardSetCard';

interface FlashcardSet {
  resumo_id: string;
  resumo_title: string;
  data_criacao: string;
  flashcards: FlashcardWithResumo[];
}

const MyFlashcards = () => {
  const { getAllFlashcards, loading } = useAllFlashcards();
  const [flashcards, setFlashcards] = useState<FlashcardSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [resumeSessionId, setResumeSessionId] = useState<string | null>(null);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcards.map((flashcardSet) => (
              <FlashcardSetCard
                key={flashcardSet.resumo_id}
                flashcardSet={flashcardSet}
                onStartStudy={handleStartStudy}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MyFlashcards;
