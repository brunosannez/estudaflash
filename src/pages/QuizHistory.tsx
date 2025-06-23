
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles, Trophy } from "lucide-react";
import QuizHistoryStats from "@/components/quiz-history/QuizHistoryStats";
import QuizHistoryItem from "@/components/quiz-history/QuizHistoryItem";
import { useQuizHistory } from "@/hooks/useQuizHistory";
import { designColors } from '@/utils/designSystem';
import PageLayout from '@/components/navigation/PageLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const QuizHistory = () => {
  const navigate = useNavigate();
  const { history, stats, loading, fetchQuizHistory } = useQuizHistory();

  const handleRefazerQuiz = async (resumoId: string) => {
    console.log('🔄 Refazendo quiz para resumo:', resumoId);
    navigate(`/quiz/${resumoId}`);
  };

  const handleViewQuiz = (quiz: any) => {
    console.log('👁️ Visualizando quiz:', quiz.id);
    navigate(`/quiz-history/${quiz.id}/view`);
  };

  const handleGoBack = () => navigate('/');
  
  // Corrigir navegação do botão "Criar Quiz"
  const handleCreateFirstQuiz = () => {
    console.log('🚀 Navegando para criar novo quiz');
    navigate('/my-summaries');
  };

  // Função para recarregar dados após exclusão
  const handleQuizDeleted = () => {
    console.log('🔄 Quiz deleted, refreshing history...');
    fetchQuizHistory();
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <div className={`${designColors.cards.primary} p-8 text-center`}>
            <Loader2 className="h-16 w-16 animate-spin text-purple-600 mx-auto mb-4" />
            <div className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-purple-600 bg-clip-text text-transparent mb-2">
              🚀 Carregando seu histórico...
            </div>
            <p className="text-gray-600 text-lg">Preparando suas conquistas!</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showBackground>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleGoBack}
            variant="ghost" 
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-purple-600" />
              Histórico de Quizzes
            </h1>
            <p className="text-gray-600">Veja seu progresso, visualize e refaça seus quizzes!</p>
          </div>
        </div>

        {/* Stats */}
        <QuizHistoryStats stats={stats} />

        {/* Quiz List */}
        {history.length === 0 ? (
          <div className={`${designColors.cards.primary} max-w-lg mx-auto`}>
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                🎯 Nenhum quiz encontrado
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Você ainda não fez nenhum quiz. Que tal começar agora escolhendo um dos seus resumos?
              </p>
              <Button 
                onClick={handleCreateFirstQuiz}
                className={`${designColors.buttons.primary} text-white font-bold py-3 px-6 rounded-xl shadow-lg`}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                ✨ Escolher Resumo para Quiz
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Botão para criar novo quiz quando já existe histórico */}
            <div className="flex justify-end">
              <Button 
                onClick={handleCreateFirstQuiz}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-2 px-4 rounded-xl"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Criar Novo Quiz
              </Button>
            </div>
            
            {/* Lista de quizzes */}
            <div className="grid gap-6">
              {history.map((quiz, index) => (
                <div 
                  key={quiz.id} 
                  className={`${designColors.animations.cardHover}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <QuizHistoryItem
                    quiz={quiz}
                    onRefazerQuiz={handleRefazerQuiz}
                    onViewQuiz={handleViewQuiz}
                    onDelete={handleQuizDeleted}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default QuizHistory;
