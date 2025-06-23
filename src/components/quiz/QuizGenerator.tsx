
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import PageLayout from '@/components/navigation/PageLayout';

interface QuizGeneratorProps {
  resumoId?: string;
  resumoContent?: string;
  onGenerateQuiz: () => void;
  isGenerating: boolean;
  onBack?: () => void;
}

const QuizGenerator = ({ 
  resumoId, 
  resumoContent,
  onGenerateQuiz, 
  isGenerating, 
  onBack 
}: QuizGeneratorProps) => {
  console.log('🎯 QuizGenerator rendered:', { 
    resumoId, 
    hasContent: !!resumoContent,
    contentLength: resumoContent?.length || 0,
    isGenerating 
  });

  const handleBack = () => {
    console.log('⬅️ QuizGenerator: Back button clicked');
    if (onBack) {
      onBack();
    }
  };

  const handleGenerate = () => {
    if (!resumoContent || resumoContent.trim().length < 50) {
      console.error('❌ Insufficient content for quiz generation');
      return;
    }
    
    console.log('🚀 QuizGenerator: Generate button clicked');
    onGenerateQuiz();
  };

  const canGenerate = resumoContent && resumoContent.trim().length >= 50;

  return (
    <PageLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-xl font-bold mb-2 text-gray-800">
              Nenhum quiz encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              Este resumo ainda não possui um quiz. Vamos criar questões de múltipla escolha personalizadas baseadas no seu conteúdo!
            </p>
            
            {!canGenerate && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ O resumo precisa ter pelo menos 50 caracteres para gerar um quiz
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                onClick={handleGenerate}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
                disabled={isGenerating || !canGenerate}
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
