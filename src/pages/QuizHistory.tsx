
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import QuizHistoryHeader from "@/components/quiz-history/QuizHistoryHeader";
import QuizHistoryStats from "@/components/quiz-history/QuizHistoryStats";
import QuizHistoryItem from "@/components/quiz-history/QuizHistoryItem";
import QuizHistoryEmpty from "@/components/quiz-history/QuizHistoryEmpty";
import { useQuizHistory } from "@/hooks/useQuizHistory";

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Header />
          <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        
        <div className="container mx-auto py-8 px-4">
          <QuizHistoryHeader onGoBack={handleGoBack} />
          
          <QuizHistoryStats stats={stats} />

          {history.length === 0 ? (
            <QuizHistoryEmpty onCreateFirstQuiz={handleCreateFirstQuiz} />
          ) : (
            <div className="grid gap-6">
              {history.map((quiz) => (
                <QuizHistoryItem
                  key={quiz.id}
                  quiz={quiz}
                  onRefazerQuiz={handleRefazerQuiz}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default QuizHistory;
