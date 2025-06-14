
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, ArrowRight, Play } from 'lucide-react';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import ResumoSelector from '@/components/ResumoSelector';
import FlashcardStudyMode from '@/components/FlashcardStudyMode';

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
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {!studyMode ? (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-800">Meus Flashcards</h1>
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Estude com flashcards interativos estilo Anki. Selecione um resumo para começar sua sessão de estudos.
                </p>
              </div>

              <ResumoSelector
                onSelectResumo={handleSelectResumo}
                title="Selecione um Resumo para Estudar"
                description="Escolha o resumo que você quer revisar com flashcards interativos"
                actionText="Estudar Flashcards"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Estudando: {selectedResumo?.uploads?.texto_extraido?.slice(0, 50)}...
                </h1>
                <p className="text-gray-600">Modo de estudo com flashcards interativos</p>
              </div>

              <FlashcardStudyMode 
                resumoId={selectedResumo.id} 
                onBack={handleBack}
              />
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
};

export default MyFlashcards;
