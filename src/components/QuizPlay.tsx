
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "@/hooks/useQuiz";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import QuizHeader from "@/components/quiz/QuizHeader";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizAlternatives from "@/components/quiz/QuizAlternatives";
import QuizFeedback from "@/components/quiz/QuizFeedback";
import QuizResultScreen from "@/components/quiz/QuizResultScreen";

interface QuizPlayProps {
  quiz: {
    resumo_id: string;
    questoes: any[];
    titulo?: string;
  };
  onComplete: (result: any) => void;
}

const QuizPlay = ({ quiz, onComplete }: QuizPlayProps) => {
  const navigate = useNavigate();
  const { enviarResposta } = useQuiz(quiz.resumo_id);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [startTime] = useState(Date.now());
  const [userAnswers, setUserAnswers] = useState<any[]>([]);

  const currentQuestion = quiz.questoes[currentIndex];
  const isLastQuestion = currentIndex === quiz.questoes.length - 1;

  console.log('🎯 Current question:', {
    index: currentIndex,
    pergunta: currentQuestion?.pergunta,
    alternativas: currentQuestion?.alternativas,
    correta: currentQuestion?.correta,
    selectedAnswer
  });

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    console.log('📝 Answer selected:', answerIndex);
    setSelectedAnswer(answerIndex);
  };

  const handleConfirmAnswer = async () => {
    if (selectedAnswer === null) return;

    console.log('✅ Confirming answer:', {
      selectedAnswer,
      correctAnswer: currentQuestion.correta,
      isCorrect: selectedAnswer === currentQuestion.correta
    });

    // Verificar resposta localmente primeiro
    const localIsCorrect = selectedAnswer === currentQuestion.correta;
    console.log('🔍 Local verification:', localIsCorrect);

    const result = await enviarResposta(currentQuestion.id, selectedAnswer);
    console.log('📊 Server response:', result);
    
    // Usar verificação local como fonte da verdade
    setIsCorrect(localIsCorrect);
    setShowResult(true);
    
    // Salvar resposta do usuário para a sessão
    const answerData = {
      question_id: currentQuestion.id,
      pergunta: currentQuestion.pergunta,
      alternativas: currentQuestion.alternativas,
      resposta_correta: currentQuestion.correta,
      resposta_usuario: selectedAnswer,
      acertou: localIsCorrect,
      explicacao: currentQuestion.explicacao
    };
    
    setUserAnswers(prev => [...prev, answerData]);
    
    if (localIsCorrect) {
      setScore(score + 1);
      console.log('🎉 Correct answer! New score:', score + 1);
    } else {
      console.log('❌ Incorrect answer. Score remains:', score);
    }
  };

  const saveQuizSession = async (finalScore: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ User not authenticated for saving session');
        return;
      }

      const completionTime = Math.floor((Date.now() - startTime) / 1000);
      
      console.log('💾 Saving quiz session:', {
        user_id: user.id,
        resumo_id: quiz.resumo_id,
        total_questions: quiz.questoes.length,
        correct_answers: finalScore,
        completion_time: completionTime
      });

      const { data, error } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          resumo_id: quiz.resumo_id,
          quiz_title: quiz.titulo || `Quiz - ${quiz.questoes.length} questões`,
          total_questions: quiz.questoes.length,
          correct_answers: finalScore,
          completion_time_seconds: completionTime,
          questions_data: userAnswers
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving quiz session:', error);
        throw error;
      }

      console.log('✅ Quiz session saved successfully:', data);
      
      // Também incrementar o contador de uso
      const { error: usageError } = await supabase.rpc('log_usage', {
        target_user_id: user.id,
        target_action_type: 'quiz',
        target_credits_used: 1,
        target_metadata: {
          resumo_id: quiz.resumo_id,
          questions_count: quiz.questoes.length,
          score: finalScore,
          completion_time: completionTime
        }
      });

      if (usageError) {
        console.error('⚠️ Error logging usage:', usageError);
      }

      toast.success(`Quiz concluído! Sessão salva com sucesso.`);
      
    } catch (error) {
      console.error('❌ Error saving quiz session:', error);
      toast.error('Erro ao salvar resultado do quiz');
    }
  };

  const handleNextQuestion = async () => {
    if (isLastQuestion) {
      const finalResult = {
        totalQuestions: quiz.questoes.length,
        correctAnswers: score,
        accuracy: Math.round((score / quiz.questoes.length) * 100)
      };
      
      console.log('🏆 Quiz completed:', finalResult);
      
      // Salvar sessão no banco antes de finalizar
      await saveQuizSession(score);
      
      setGameFinished(true);
      onComplete(finalResult);
    } else {
      console.log('➡️ Moving to next question');
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    }
  };

  const handleRestart = () => {
    window.location.reload();
  };

  const handleBack = () => {
    navigate('/my-summaries');
  };

  if (gameFinished) {
    return (
      <QuizResultScreen 
        score={score}
        totalQuestions={quiz.questoes.length}
        onRestart={handleRestart}
      />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <QuizHeader 
          currentIndex={currentIndex}
          totalQuestions={quiz.questoes.length}
          onBack={handleBack}
        />

        <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <QuizQuestion 
              question={currentQuestion.pergunta}
              currentQuestionIndex={currentIndex}
              totalQuestions={quiz.questoes.length}
            />

            <QuizAlternatives 
              alternatives={currentQuestion.alternativas}
              selectedAnswer={selectedAnswer}
              correctAnswer={currentQuestion.correta}
              showResult={showResult}
              onAnswerSelect={handleAnswerSelect}
            />

            {showResult && (
              <QuizFeedback 
                isCorrect={isCorrect}
                explanation={currentQuestion.explicacao}
                correctAnswer={currentQuestion.correta}
                alternatives={currentQuestion.alternativas}
              />
            )}

            <div className="flex justify-end">
              <Button 
                onClick={showResult ? handleNextQuestion : handleConfirmAnswer}
                disabled={!showResult && selectedAnswer === null}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-6 rounded-xl"
              >
                {showResult ? 
                  (isLastQuestion ? '🏆 Finalizar Quiz' : '▶️ Próxima Pergunta') 
                  : '✅ Confirmar Resposta'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizPlay;
