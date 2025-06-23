
import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { designColors } from '@/utils/designSystem';
import { Sparkles, Trophy, Target, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EnhancedQuizGameManager from '@/components/quiz/EnhancedQuizGameManager';

interface QuizPlayProps {
  quiz: {
    resumo_id: string;
    questoes: any[];
    titulo?: string;
  };
  onComplete?: (result: any) => void;
}

const QuizPlay = ({ quiz, onComplete }: QuizPlayProps) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const resumeMode = searchParams.get('resume') === 'true';
  
  const [gameFinished, setGameFinished] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);

  console.log('🎯 QuizPlay initialized with:', {
    resumoId: quiz.resumo_id,
    questionsCount: quiz.questoes.length,
    sessionId,
    resumeMode
  });

  const handleGameFinish = (finalScore: number) => {
    console.log('🏆 Quiz finished with score:', finalScore);
    
    const result = {
      sessionId: sessionId || 'new-session',
      correctAnswers: finalScore,
      totalQuestions: quiz.questoes.length,
      accuracy: Math.round((finalScore / quiz.questoes.length) * 100)
    };
    
    setFinalResult(result);
    setGameFinished(true);
    
    if (onComplete) {
      onComplete(result);
    }
  };

  if (gameFinished && finalResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
        <div className={`${designColors.cards.primary} max-w-2xl mx-auto text-center p-8`}>
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Quiz Concluído!
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-700">{finalResult.correctAnswers}</div>
              <div className="text-sm text-green-600">Acertos</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-700">{finalResult.accuracy}%</div>
              <div className="text-sm text-blue-600">Precisão</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-purple-700">{finalResult.totalQuestions}</div>
              <div className="text-sm text-purple-600">Questões</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = `/resumo/${quiz.resumo_id}`}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Ver Resumo
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/quiz-history'}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Ver Histórico
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EnhancedQuizGameManager
      quiz={quiz}
      sessionId={sessionId || undefined}
      resumeMode={resumeMode}
      onGameFinish={handleGameFinish}
    >
      {({
        currentIndex,
        selectedAnswer,
        showResult,
        isCorrect,
        score,
        currentQuestion,
        isLastQuestion,
        handleAnswerSelect,
        handleConfirmAnswer,
        handleNextQuestion
      }) => (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Header com progresso */}
            <div className={`${designColors.cards.primary} mb-6 p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">
                  Quiz - {quiz.titulo || `${quiz.questoes.length} questões`}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Questão {currentIndex + 1} de {quiz.questoes.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Score: {score}/{quiz.questoes.length}
                  </div>
                </div>
              </div>
              
              {/* Barra de progresso */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / quiz.questoes.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Questão */}
            <div className={`${designColors.cards.primary} mb-6 p-8`}>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {currentQuestion?.pergunta}
              </h2>

              {/* Alternativas */}
              <div className="space-y-4">
                {currentQuestion?.alternativas?.map((alternativa: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedAnswer === index
                        ? showResult
                          ? isCorrect
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : 'border-red-500 bg-red-50 text-red-800'
                          : 'border-purple-500 bg-purple-50 text-purple-800'
                        : showResult && index === currentQuestion.correta
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="font-semibold mr-3 text-gray-500">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {alternativa}
                    </div>
                  </button>
                ))}
              </div>

              {/* Explicação */}
              {showResult && currentQuestion?.explicacao && (
                <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Explicação:</h3>
                  <p className="text-blue-700">{currentQuestion.explicacao}</p>
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {showResult && (
                  <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                    {isCorrect ? '✅ Correto!' : '❌ Incorreto'}
                  </span>
                )}
              </div>

              <div className="flex gap-4">
                {!showResult ? (
                  <Button
                    onClick={handleConfirmAnswer}
                    disabled={selectedAnswer === null}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50"
                  >
                    Confirmar Resposta
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  >
                    {isLastQuestion ? (
                      <>
                        <Trophy className="h-4 w-4 mr-2" />
                        Finalizar Quiz
                      </>
                    ) : (
                      'Próxima Questão'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </EnhancedQuizGameManager>
  );
};

export default QuizPlay;
