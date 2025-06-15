
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, ArrowRight, Play, Sparkles } from 'lucide-react';
import ResumoSelector from '@/components/ResumoSelector';
import FlashcardStudyMode from '@/components/FlashcardStudyMode';
import { designColors } from '@/utils/designSystem';
import PageLayout from '@/components/navigation/PageLayout';

const MyFlashcards = () => {
  const [selectedResumo, setSelectedResumo] = useState<any>(null);
  const [studyMode, setStudyMode] = useState(false);

  const handleSelectResumo = (resumo: any) => {
    setSelectedResumo(resumo);
    setStudyMode(true);
  };

  const handleBack = () => {
    setStudyMode(false);
    setSelectedResumo(null);
  };

  return (
    <PageLayout showBackground>
      <div className="space-y-8 relative overflow-hidden">
        {/* Elementos decorativos flutuantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-5xl animate-bounce opacity-20">🧠</div>
          <div className="absolute top-40 right-20 text-4xl animate-pulse opacity-30">💡</div>
          <div className="absolute bottom-20 left-20 text-6xl animate-float opacity-20">⚡</div>
          <div className="absolute bottom-40 right-10 text-3xl animate-bounce opacity-25">🌟</div>
          <div className="absolute top-1/2 left-1/4 text-7xl animate-pulse opacity-10">🎪</div>
        </div>

        {!studyMode ? (
          <div className={`space-y-8 ${designColors.animations.slideIn} relative z-10`}>
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Sparkles className="h-12 w-12 text-cyan-500 animate-pulse" />
                <div className="flex items-center gap-3">
                  <div className={`w-16 h-16 bg-gradient-to-r from-purple-400 to-cyan-500 rounded-2xl flex items-center justify-center ${designColors.animations.iconFloat}`}>
                    <Brain className="h-10 w-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    Meus Flashcards Mágicos
                  </h1>
                  <div className="text-5xl animate-bounce">🧠</div>
                </div>
                <Sparkles className="h-12 w-12 text-purple-500 animate-pulse" />
              </div>
              
              <div className={`${designColors.cards.accent} p-6 max-w-4xl mx-auto`}>
                <p className="text-xl text-gray-700 font-medium leading-relaxed">
                  🎪 Estude com flashcards mágicos e interativos! Selecione um resumo para começar sua aventura de aprendizado divertida e eficaz. ✨
                </p>
              </div>
            </div>

            <div className={designColors.animations.cardHover}>
              <ResumoSelector
                onSelectResumo={handleSelectResumo}
                title="🎯 Selecione um Resumo para Estudar"
                description="Escolha o resumo que você quer revisar com flashcards interativos e divertidos!"
                actionText="🧠 Estudar Flashcards"
              />
            </div>
          </div>
        ) : (
          <div className={`space-y-6 ${designColors.animations.slideIn} relative z-10`}>
            <div className={`${designColors.cards.accent} p-6 text-center`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Brain className="h-8 w-8 text-purple-600 animate-pulse" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-purple-600 bg-clip-text text-transparent">
                  🎪 Estudando: {selectedResumo?.uploads?.texto_extraido?.slice(0, 50) || selectedResumo?.custom_name}...
                </h1>
                <div className="text-3xl animate-bounce">⚡</div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-500" />
                <p className="text-lg text-gray-600 font-medium">Modo de estudo com flashcards interativos</p>
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
            </div>

            <div className={designColors.animations.cardHover}>
              <FlashcardStudyMode 
                resumoId={selectedResumo.id} 
                onBack={handleBack}
              />
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MyFlashcards;
