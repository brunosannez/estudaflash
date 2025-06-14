
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles, Trophy } from "lucide-react";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import QuizHistoryHeader from "@/components/quiz-history/QuizHistoryHeader";
import QuizHistoryStats from "@/components/quiz-history/QuizHistoryStats";
import QuizHistoryItem from "@/components/quiz-history/QuizHistoryItem";
import QuizHistoryEmpty from "@/components/quiz-history/QuizHistoryEmpty";
import { useQuizHistory } from "@/hooks/useQuizHistory";
import { designColors } from '@/utils/designSystem';

const QuizHistory = () => {
  const navigate = useNavigate();
  const { history, stats, loading } = useQuizHistory();

  const handleRefazerQuiz = async (resumoId: string) => {
    navigate(`/quiz/${resumoId}`);
  };

  const handleGoBack = () => navigate('/');
  const handleCreateFirstQuiz = () => navigate('/');

  if (loading) {
    return (
      <AuthGuard>
        <div className={`min-h-screen ${designColors.backgrounds.main}`}>
          <Header />
          <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-center py-20">
              <div className={`${designColors.cards.primary} p-8 text-center`}>
                <Loader2 className="h-16 w-16 animate-spin text-purple-600 mx-auto mb-4" />
                <div className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-purple-600 bg-clip-text text-transparent mb-2">
                  🚀 Carregando seu histórico...
                </div>
                <p className="text-gray-600 text-lg">Preparando suas conquistas!</p>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className={`min-h-screen ${designColors.backgrounds.main} relative overflow-hidden`}>
        {/* Elementos decorativos flutuantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-5xl animate-bounce opacity-20">🎯</div>
          <div className="absolute top-40 right-20 text-4xl animate-pulse opacity-30">🏆</div>
          <div className="absolute bottom-20 left-20 text-6xl animate-float opacity-20">📊</div>
          <div className="absolute bottom-40 right-10 text-3xl animate-bounce opacity-25">🎮</div>
          <div className="absolute top-1/2 left-1/3 text-8xl animate-pulse opacity-10">🎪</div>
        </div>

        <Header />
        
        <div className="container mx-auto py-8 px-4 relative z-10">
          <div className={designColors.animations.slideIn}>
            <div className="mb-6">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-cyan-300 text-gray-700 font-semibold hover:bg-cyan-50 shadow-lg ${designColors.animations.buttonHover}`}
                onClick={handleGoBack}
              >
                ← Voltar
              </button>
            </div>

            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Sparkles className="h-12 w-12 text-cyan-500 animate-pulse" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                  <span className="text-5xl">📊</span>
                  Histórico de Quizzes
                  <span className="text-5xl">📈</span>
                </h1>
                <Sparkles className="h-12 w-12 text-purple-500 animate-pulse" />
              </div>
              <div className={`${designColors.cards.accent} p-4 max-w-2xl mx-auto`}>
                <p className="text-xl text-gray-700 font-medium">
                  🎪 Veja seu progresso e refaça seus quizzes favoritos! ✨
                </p>
              </div>
            </div>
          </div>
          
          <div className={designColors.animations.slideIn}>
            <QuizHistoryStats stats={stats} />
          </div>

          {history.length === 0 ? (
            <div className={designColors.animations.slideIn}>
              <div className={`${designColors.cards.primary} max-w-lg mx-auto`}>
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">
                    🎯 Nenhum quiz encontrado
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    Você ainda não fez nenhum quiz. Que tal começar agora?
                  </p>
                  <button 
                    onClick={handleCreateFirstQuiz}
                    className={`${designColors.buttons.primary} text-white font-bold py-3 px-6 rounded-xl shadow-lg ${designColors.animations.buttonHover}`}
                  >
                    ✨ Criar Primeiro Quiz
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`grid gap-6 ${designColors.animations.slideIn}`}>
              {history.map((quiz, index) => (
                <div 
                  key={quiz.id} 
                  className={`${designColors.animations.cardHover}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <QuizHistoryItem
                    quiz={quiz}
                    onRefazerQuiz={handleRefazerQuiz}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default QuizHistory;
