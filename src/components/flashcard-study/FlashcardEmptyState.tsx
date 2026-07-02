
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, ArrowLeft } from 'lucide-react';

interface FlashcardEmptyStateProps {
  onBack: () => void;
}

const FlashcardEmptyState = ({ onBack }: FlashcardEmptyStateProps) => {
  return (
    <Card className="border-4 border-blue-200 shadow-xl overflow-hidden">
      <CardContent className="text-center py-12">
        <Brain className="h-16 w-16 text-muted-foreground/70 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-foreground/80 mb-2">
          📚 Nenhum flashcard disponível
        </h3>
        <p className="text-muted-foreground mb-6">
          Este resumo ainda não possui flashcards. Gere alguns para começar a estudar!
        </p>
        <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl shadow-lg">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </CardContent>
    </Card>
  );
};

export default FlashcardEmptyState;
