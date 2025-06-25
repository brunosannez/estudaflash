
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import FlashcardStudyModeImproved from '@/components/FlashcardStudyModeImproved';
import PageLayout from '@/components/navigation/PageLayout';

interface FlashcardSet {
  resumo_id: string;
  resumo_title: string;
  data_criacao: string;
  flashcards: any[];
}

interface MyFlashcardsStudyModeProps {
  selectedSet: FlashcardSet;
  resumeSessionId: string | null;
  onBackToList: () => void;
}

const MyFlashcardsStudyMode = ({ selectedSet, resumeSessionId, onBackToList }: MyFlashcardsStudyModeProps) => {
  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            onClick={onBackToList}
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
              {resumeSessionId && (
                <span className="ml-2 text-blue-600 font-medium">
                  • Continuando sessão anterior
                </span>
              )}
            </p>
          </div>
        </div>
        
        <FlashcardStudyModeImproved 
          resumoId={selectedSet.resumo_id}
          onBack={onBackToList}
          sessionId={resumeSessionId || undefined}
        />
      </div>
    </PageLayout>
  );
};

export default MyFlashcardsStudyMode;
