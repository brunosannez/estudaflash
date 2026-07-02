import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Trophy, RotateCcw, Home, Star, Target } from 'lucide-react';

interface FlashcardCompletionScreenProps {
  studyStats: {
    streak: number;
    totalReviewed: number;
    xpEarned: number;
  };
  score: {
    correct: number;
    incorrect: number;
  };
  studyTime?: number;
  onStudyAgain: () => void;
  onBackToFlashcards: () => void;
}

const FlashcardCompletionScreen = ({
  studyStats,
  score,
  studyTime,
  onStudyAgain,
  onBackToFlashcards
}: FlashcardCompletionScreenProps) => {
  const totalQuestions = score.correct + score.incorrect;
  const accuracy = totalQuestions > 0 ? (score.correct / totalQuestions) * 100 : 0;
  
  const getPerformanceMessage = () => {
    if (accuracy >= 90) return { message: "Excelente! 🌟", color: "text-green-600", icon: Star };
    if (accuracy >= 75) return { message: "Muito bem! 👏", color: "text-primary", icon: Target };
    if (accuracy >= 60) return { message: "Bom trabalho! 💪", color: "text-yellow-600", icon: CheckCircle };
    return { message: "Continue praticando! 📚", color: "text-orange-600", icon: RotateCcw };
  };

  const performance = getPerformanceMessage();
  const PerformanceIcon = performance.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header de Parabéns */}
      <Card className="border-green-200 bg-muted/50 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <Trophy className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-green-800 mb-2">
            🎉 Parabéns! Estudo Concluído!
          </CardTitle>
          <div className="flex items-center justify-center gap-2">
            <PerformanceIcon className={`h-6 w-6 ${performance.color}`} />
            <p className={`text-xl font-semibold ${performance.color}`}>
              {performance.message}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Estatísticas do Estudo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Precisão */}
        <Card className="border-blue-200 bg-primary/5 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-3">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Precisão</h3>
            <div className="text-3xl font-bold text-primary mb-2">
              {accuracy.toFixed(1)}%
            </div>
            <Progress value={accuracy} className="h-2 mb-2" />
            <p className="text-sm text-primary">
              {score.correct} de {totalQuestions} corretas
            </p>
          </CardContent>
        </Card>

        {/* XP Ganho */}
        <Card className="border-primary/20 bg-primary/5 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-3">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-purple-800 mb-2">XP Ganho</h3>
            <div className="text-3xl font-bold text-primary mb-2">
              +{studyStats.xpEarned}
            </div>
            <p className="text-sm text-primary">
              {studyStats.totalReviewed} cards revisados
            </p>
          </CardContent>
        </Card>

        {/* Sequência */}
        <Card className="border-orange-200 bg-orange-50 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-3">
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-orange-800 mb-2">Sequência</h3>
            <div className="text-3xl font-bold text-orange-700 mb-2">
              🔥 {studyStats.streak}
            </div>
            <p className="text-sm text-orange-600">
              {studyTime ? `${Math.round(studyTime / 60)} min` : 'Tempo de estudo'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback e Dicas */}
      <Card className="border-border shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">📈 Dicas para melhorar</h3>
          <div className="space-y-3">
            {accuracy < 70 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  💡 <strong>Revisar conceitos:</strong> Considere estudar o material novamente antes de continuar.
                </p>
              </div>
            )}
            {accuracy >= 70 && accuracy < 90 && (
              <div className="bg-primary/5 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  🎯 <strong>Quase lá:</strong> Pratique mais algumas vezes para dominar completamente o conteúdo.
                </p>
              </div>
            )}
            {accuracy >= 90 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  ⭐ <strong>Excelente:</strong> Você dominou este conteúdo! Considere revisar em alguns dias.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onStudyAgain}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 shadow-lg"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          🔄 Estudar Novamente
        </Button>
        
        <Button
          onClick={onBackToFlashcards}
          variant="outline"
          size="lg"
          className="border-2 border-input hover:border-gray-400 font-semibold px-8 py-3 shadow-lg"
        >
          <Home className="h-5 w-5 mr-2" />
          🏠 Voltar aos Flashcards
        </Button>
      </div>
    </div>
  );
};

export default FlashcardCompletionScreen;