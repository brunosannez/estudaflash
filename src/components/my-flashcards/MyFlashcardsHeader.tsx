
import React from 'react';
import { Sparkles, Brain } from 'lucide-react';

const MyFlashcardsHeader = () => {
  return (
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
  );
};

export default MyFlashcardsHeader;
