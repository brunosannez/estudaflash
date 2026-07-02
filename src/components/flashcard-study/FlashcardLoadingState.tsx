
import React from 'react';

const FlashcardLoadingState = () => {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-lg font-medium text-muted-foreground">🧠 Carregando flashcards mágicos...</p>
      </div>
    </div>
  );
};

export default FlashcardLoadingState;
