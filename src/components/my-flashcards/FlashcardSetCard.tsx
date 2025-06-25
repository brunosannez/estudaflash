
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

interface FlashcardSet {
  resumo_id: string;
  resumo_title: string;
  data_criacao: string;
  flashcards: any[];
}

interface FlashcardSetCardProps {
  flashcardSet: FlashcardSet;
  onStartStudy: (flashcardSet: FlashcardSet, sessionId?: string) => void;
}

const FlashcardSetCard = ({ flashcardSet, onStartStudy }: FlashcardSetCardProps) => {
  return (
    <Card 
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
          onClick={() => onStartStudy(flashcardSet)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium"
        >
          <Brain className="h-4 w-4 mr-2" />
          🚀 Estudar Agora
        </Button>
      </CardContent>
    </Card>
  );
};

export default FlashcardSetCard;
