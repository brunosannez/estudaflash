
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

interface FlashcardContinueDialogProps {
  onContinue: () => void;
  onStartNew: () => void;
}

const FlashcardContinueDialog = ({ onContinue, onStartNew }: FlashcardContinueDialogProps) => {
  return (
    <Card className="max-w-2xl mx-auto border-4 border-blue-200 shadow-xl">
      <CardContent className="text-center py-12">
        <Brain className="h-16 w-16 text-blue-500 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-700 mb-4">
          📚 Sessão em Andamento Encontrada!
        </h3>
        <p className="text-gray-600 mb-8">
          Você tem uma sessão de flashcards em andamento. Deseja continuar de onde parou ou começar uma nova sessão?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onContinue}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
          >
            ✅ Continuar Sessão
          </Button>
          <Button 
            onClick={onStartNew}
            variant="outline"
            className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-xl shadow-lg"
          >
            🆕 Nova Sessão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardContinueDialog;
