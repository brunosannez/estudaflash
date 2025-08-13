
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EnhancedQuizGameManager from '@/components/quiz/EnhancedQuizGameManager';
import QuizAlternativesList from '@/components/quiz/components/QuizAlternativesList';
import QuizTypeIndicator from '@/components/quiz/components/QuizTypeIndicator';
import { toast } from 'sonner';

interface QuizPlayProps {
  quiz: {
    resumo_id: string;
    questoes: any[];
    titulo?: string;
  };
  onComplete: (result: any) => void;
  sessionId?: string;
  resumeMode?: boolean;
}

const QuizPlay = ({ quiz, onComplete, sessionId, resumeMode = false }: QuizPlayProps) => {
  const navigate = useNavigate();

  console.log('🎮 QuizPlay initialized:', {
    questionsCount: quiz.questoes.length,
    sessionId,
    resumeMode,
    firstQuestion: quiz.questoes[0] ? {
      id: quiz.questoes[0].id,
      correta: quiz.questoes[0].correta,
      alternativasCount: quiz.questoes[0].alternativas?.length
    } : null
  });

  const handleExit = () => {
    console.log('❌ User exiting quiz');
    
    // Show confirmation
    const confirmExit = window.confirm(
      'Tem certeza que deseja sair do quiz? Seu progresso será salvo automaticamente.'
    );
    
    if (confirmExit) {
      toast.info('Progresso salvo! Você pode continuar o quiz depois.');
      navigate('/quiz-history');
    }
  };

  const handleGameFinish = (finalScore: number) => {
    console.log('🏁 Game finished with score:', finalScore);
    onComplete({
      correctAnswers: finalScore,
      totalQuestions: quiz.questoes.length
    });
  };

  if (!quiz.questoes || quiz.questoes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Nenhuma questão encontrada</p>
          <Button onClick={() => navigate('/quiz-history')}>
            Voltar ao Histórico
          </Button>
        </div>
      </div>
    );
  }

  return (
    <EnhancedQuizGameManager
      quiz={quiz}
      sessionId={sessionId}
      resumeMode={resumeMode}
      onGameFinish={handleGameFinish}
    >
      {({
        currentQuestion,
        currentIndex,
        selectedAnswer,
        showResult,
        isCorrect,
        score,
        gameFinished,
        isLastQuestion,
        handleAnswerSelect,
        handleConfirmAnswer,
        handleNextQuestion
      }) => {
        if (gameFinished) {
          return (
            <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 p-4 flex items-center justify-center">
              <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl mx-auto text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Quiz Concluído!
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  Você acertou <span className="font-bold text-green-600">{score}</span> de{' '}
                  <span className="font-bold">{quiz.questoes.length}</span> questões
                </p>
                <div className="text-lg text-gray-500 mb-8">
                  Precisão: {Math.round((score / quiz.questoes.length) * 100)}%
                </div>
                <Button
                  onClick={() => navigate('/quiz-history')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold"
                >
                  Ver Histórico de Quizzes
                </Button>
              </div>
            </div>
          );
        }

        if (!currentQuestion) {
          return (
            <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Carregando questão...</p>
              </div>
            </div>
          );
        }

        const progressPercentage = ((currentIndex + 1) / quiz.questoes.length) * 100;

        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <Button
                variant="ghost"
                onClick={handleExit}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-5 w-5 mr-2" />
                Sair
              </Button>
              
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">
                  Questão {currentIndex + 1} de {quiz.questoes.length}
                </div>
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-600">Pontuação</div>
                <div className="text-lg font-bold text-purple-600">
                  {score}/{quiz.questoes.length}
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-3xl shadow-2xl p-6 md:p-8 mb-6">
                <QuizTypeIndicator 
                  questionType={currentQuestion.tipo}
                  questionNumber={currentIndex + 1}
                  totalQuestions={quiz.questoes.length}
                />
                
                <h2 className="text-xl md:text-2xl font-bold text-card-foreground mb-6 md:mb-8 leading-relaxed">
                  {currentQuestion.pergunta}
                </h2>

                {/* Alternatives */}
                <QuizAlternativesList
                  alternatives={currentQuestion.alternativas}
                  selectedAnswer={selectedAnswer}
                  showResult={showResult}
                  correctAnswer={currentQuestion.correta}
                  isCorrect={isCorrect}
                  onAnswerSelect={handleAnswerSelect}
                  questionType={currentQuestion.tipo}
                />

                {/* Explanation (shown after answer) */}
                {showResult && currentQuestion.explicacao && (
                  <div className="bg-info/10 border-l-4 border-info p-4 md:p-6 rounded-lg mb-6">
                    <h3 className="font-bold text-info-foreground mb-2">Explicação:</h3>
                    <p className="text-info-foreground/80 leading-relaxed">
                      {currentQuestion.explicacao}
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-center">
                  {!showResult ? (
                    <Button
                      onClick={handleConfirmAnswer}
                      disabled={selectedAnswer === null}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg w-full md:w-auto min-h-[50px] md:min-h-[60px]"
                    >
                      Confirmar Resposta
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      className="bg-gradient-to-r from-success to-primary hover:from-success/90 hover:to-primary/80 text-primary-foreground px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg w-full md:w-auto min-h-[50px] md:min-h-[60px]"
                    >
                      {isLastQuestion ? 'Finalizar Quiz' : 'Próxima Questão'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </EnhancedQuizGameManager>
  );
};

export default QuizPlay;
