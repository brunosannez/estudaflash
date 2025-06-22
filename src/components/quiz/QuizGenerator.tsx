
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/navigation/PageLayout';

interface QuizGeneratorProps {
  onGenerateQuiz: () => void;
  isGenerating: boolean;
}

const QuizGenerator = ({ onGenerateQuiz, isGenerating }: QuizGeneratorProps) => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-xl font-bold mb-2 text-gray-800">Nenhum quiz encontrado</h2>
            <p className="text-gray-600 mb-6">
              Este resumo ainda não possui um quiz. Vamos criar questões de múltipla escolha!
            </p>
            <div className="space-y-3">
              <Button 
                onClick={onGenerateQuiz}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
                disabled={isGenerating}
              >
                ✨ Gerar Quiz
              </Button>
              <Button 
                onClick={() => navigate('/my-summaries')} 
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Resumos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default QuizGenerator;
