
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import PageLayout from '@/components/navigation/PageLayout';

interface QuizGeneratorProps {
  resumoId?: string;
  onGenerateQuiz: () => void;
  isGenerating: boolean;
  onBack?: () => void;
}

const QuizGenerator = ({ resumoId, onGenerateQuiz, isGenerating, onBack }: QuizGeneratorProps) => {
  console.log('🎯 QuizGenerator - resumoId:', resumoId, 'isGenerating:', isGenerating);

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleGenerate = () => {
    console.log('🚀 Generate button clicked');
    onGenerateQuiz();
  };

  return (
    <PageLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-xl font-bold mb-2 text-gray-800">Nenhum quiz encontrado</h2>
            <p className="text-gray-600 mb-6">
              Este resumo ainda não possui um quiz. Vamos criar questões de múltipla escolha personalizadas!
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleGenerate}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gerando Quiz...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    ✨ Gerar Quiz
                  </>
                )}
              </Button>
              {onBack && (
                <Button 
                  onClick={handleBack}
                  variant="outline"
                  className="w-full"
                  disabled={isGenerating}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Resumo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default QuizGenerator;
