
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Star, Zap } from 'lucide-react';
import { toast } from "@/components/ui/use-toast"
import { useGameification } from '@/hooks/useGameification';
import { useQuiz } from '@/hooks/useQuiz';

interface QuizPlayProps {
  quiz: any;
  onComplete: () => void;
}

const QuizPlay = ({ quiz, onComplete }: QuizPlayProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentXP, setCurrentXP] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const navigate = useNavigate();
  const { addXP, getStats } = useGameification();
  const { enviarResposta } = useQuiz(quiz.resumo_id || '');

  const currentQuestion = quiz.questoes[currentQuestionIndex];
  const stats = getStats();

  useEffect(() => {
    if (quizCompleted) {
      onComplete();
    }
  }, [quizCompleted, onComplete]);

  const triggerCelebration = (isCorrect: boolean) => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  const handleAnswerSelect = async (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
    
    const isCorrect = index === currentQuestion.resposta_correta;
    
    // Sistema de pontuação imediata
    const xpGained = isCorrect ? 10 : 2;
    setCurrentXP(prev => prev + xpGained);
    
    // Atualizar streak
    if (isCorrect) {
      setStreakCount(prev => prev + 1);
      triggerCelebration(true);
    } else {
      setStreakCount(0);
    }

    // Salvar resposta no banco de dados e adicionar XP
    try {
      if (quiz.questoes[0].id) {
        await enviarResposta(quiz.questoes[0].id, index);
      }
      
      await addXP(xpGained, isCorrect ? 'quiz_correct' : 'quiz_incorrect');
      
      // Toast com animação de XP
      toast({
        title: isCorrect ? "🎉 Correto! +" + xpGained + " XP" : "💪 +" + xpGained + " XP pela tentativa",
        description: isCorrect 
          ? streakCount > 0 
            ? `Sequência de ${streakCount + 1} acertos! 🔥` 
            : "Excelente resposta! Continue assim!" 
          : "Não desista! Cada erro é um aprendizado.",
        duration: 3000,
      });
      
    } catch (error) {
      console.error("Erro ao processar resposta:", error);
    }
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === currentQuestion.resposta_correta) {
      setCorrectAnswersCount(correctAnswersCount + 1);
    }

    setSelectedAnswer(null);
    setShowResult(false);

    if (currentQuestionIndex < quiz.questoes.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
      const correctPercentage = ((correctAnswersCount + (selectedAnswer === currentQuestion.resposta_correta ? 1 : 0)) / quiz.questoes.length) * 100;
      let bonusXP = 50;

      if (correctPercentage >= 90) {
        bonusXP = 100;
      } else if (correctPercentage >= 80) {
        bonusXP = 75;
      }

      addXP(bonusXP, 'quiz_complete');

      toast({
        title: "🏆 Quiz Completo!",
        description: `Você ganhou +${bonusXP} XP de bônus! Total: ${currentXP + bonusXP} XP!`,
        duration: 5000,
      });

      navigate('/quiz-history');
    }
  };

  const alternativeEmojis = [
    { emoji: "🔴", letter: "A", bg: "bg-red-100", border: "border-red-300", text: "text-red-700", hover: "hover:bg-red-200" },
    { emoji: "🔵", letter: "B", bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-700", hover: "hover:bg-blue-200" },
    { emoji: "🟢", letter: "C", bg: "bg-green-100", border: "border-green-300", text: "text-green-700", hover: "hover:bg-green-200" },
    { emoji: "🟡", letter: "D", bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-700", hover: "hover:bg-yellow-200" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 relative overflow-hidden">
      {/* Celebração animada */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-8xl animate-bounce">🎉</div>
          <div className="absolute top-1/4 left-1/4 text-6xl animate-pulse">⭐</div>
          <div className="absolute top-3/4 right-1/4 text-6xl animate-bounce delay-300">✨</div>
          <div className="absolute top-1/2 right-1/3 text-5xl animate-spin">🌟</div>
          <div className="absolute bottom-1/4 left-1/3 text-5xl animate-pulse delay-500">🎊</div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header com estatísticas */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800 font-fredoka">
              Quiz: {quiz.titulo}
            </h1>
            <div className="flex items-center gap-4">
              {/* Contador de XP atual */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <Zap className="h-5 w-5" />
                <span className="font-bold font-fredoka">{currentXP} XP</span>
              </div>
              
              {/* Streak counter */}
              {streakCount > 0 && (
                <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
                  <span className="text-lg">🔥</span>
                  <span className="font-bold font-fredoka">{streakCount}</span>
                </div>
              )}
              
              {/* Nível atual */}
              {stats && (
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                  <Star className="h-5 w-5" />
                  <span className="font-bold font-fredoka">Nível {stats.currentLevel}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Barra de progresso do XP */}
          {stats && (
            <div className="mb-4">
              <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                <span>Progresso para Nível {stats.currentLevel + 1}</span>
                <span>{stats.currentXp} / {stats.nextLevelXp} XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out shadow-lg"
                  style={{ width: `${stats.xpProgress}%` }}
                />
              </div>
            </div>
          )}
          
          <p className="text-gray-600 font-nunito">
            Responda as perguntas e ganhe XP! 🎯
          </p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-3 font-fredoka">
                Pergunta {currentQuestionIndex + 1} de {quiz.questoes.length}
              </h2>
              <p className="text-gray-600 font-nunito text-lg">{currentQuestion.pergunta}</p>
            </div>

            <div className="space-y-4">
              {currentQuestion.alternativas.map((alt, index) => {
                const altStyle = alternativeEmojis[index];
                const isSelected = selectedAnswer === index;
                const isCorrect = showResult && index === currentQuestion.resposta_correta;
                const isWrong = showResult && isSelected && index !== currentQuestion.resposta_correta;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={`w-full p-6 rounded-2xl border-3 text-left transition-all duration-300 transform hover:scale-[1.02] font-nunito font-semibold text-lg
                      ${isSelected ? `${altStyle.bg} ${altStyle.border} ${altStyle.text} scale-[1.02] shadow-lg` : 
                        showResult ? 
                          isCorrect ? 'bg-green-100 border-green-400 text-green-800 shadow-lg animate-pulse' :
                          isWrong ? 'bg-red-100 border-red-400 text-red-800 shadow-lg' :
                          'bg-gray-100 border-gray-300 text-gray-600' :
                        `${altStyle.bg} ${altStyle.border} ${altStyle.text} ${altStyle.hover} hover:shadow-lg hover:animate-pulse`
                      }
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-fredoka text-xl font-bold
                        ${isSelected ? 'bg-white shadow-md' : 
                          showResult && isCorrect ? 'bg-green-200 animate-bounce' :
                          showResult && isWrong ? 'bg-red-200' :
                          'bg-white/70'
                        }`}>
                        <span className="text-2xl">{altStyle.emoji}</span>
                        <span className={`ml-1 ${isSelected ? altStyle.text : 'text-gray-700'}`}>
                          {altStyle.letter}
                        </span>
                      </div>
                      <span className="flex-1">{alt}</span>
                      {showResult && isCorrect && (
                        <span className="text-2xl animate-bounce">✅</span>
                      )}
                      {showResult && isWrong && (
                        <span className="text-2xl">❌</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div className="mt-6">
                {selectedAnswer === currentQuestion.resposta_correta ? (
                  <div className="flex items-center text-green-600 font-semibold font-nunito bg-green-50 p-4 rounded-xl border-2 border-green-200">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>🎉 Resposta Correta! +10 XP</span>
                    {streakCount > 0 && (
                      <span className="ml-2 text-orange-600">🔥 Sequência: {streakCount + 1}</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 font-semibold font-nunito bg-red-50 p-4 rounded-xl border-2 border-red-200">
                    <XCircle className="h-5 w-5 mr-2" />
                    <span>💪 Boa tentativa! +2 XP pelo esforço</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <Button 
                onClick={handleNextQuestion} 
                disabled={!showResult}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 font-fredoka"
                size="lg"
              >
                {currentQuestionIndex === quiz.questoes.length - 1 ? '🏆 Concluir Quiz' : '▶️ Próxima Pergunta'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizPlay;
