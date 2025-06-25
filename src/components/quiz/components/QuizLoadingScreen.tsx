
import React from 'react';

interface QuizLoadingScreenProps {
  message: string;
}

const QuizLoadingScreen = ({ message }: QuizLoadingScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default QuizLoadingScreen;
