
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MyFlashcardsEmpty = () => {
  const navigate = useNavigate();

  return (
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
  );
};

export default MyFlashcardsEmpty;
