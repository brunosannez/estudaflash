
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Trophy, Calendar, Target, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuizHistoryItem {
  id: string;
  resumo_titulo: string;
  total_perguntas: number;
  acertos: number;
  data_criacao: string;
  resumo_id: string;
}

const QuizHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalAcertos: 0,
    totalPerguntas: 0,
    mediaAcertos: 0
  });

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Buscar histórico de quizzes com informações dos resumos
      const { data: quizData, error } = await supabase
        .from("quiz_respostas")
        .select(`
          id,
          quiz_id,
          acertou,
          data_resposta,
          quizzes!inner(
            resumo_id,
            resumos!inner(
              id,
              arquivo_original_nome
            )
          )
        `)
        .eq("user_id", user.id)
        .order("data_resposta", { ascending: false });

      if (error) {
        console.error("Erro ao buscar histórico:", error);
        return;
      }

      // Agrupar por quiz/resumo
      const groupedQuizzes = new Map();
      
      quizData?.forEach((response: any) => {
        const resumoId = response.quizzes.resumo_id;
        const resumoTitulo = response.quizzes.resumos.arquivo_original_nome;
        
        if (!groupedQuizzes.has(resumoId)) {
          groupedQuizzes.set(resumoId, {
            resumo_id: resumoId,
            resumo_titulo: resumoTitulo,
            respostas: [],
            data_criacao: response.data_resposta
          });
        }
        
        groupedQuizzes.get(resumoId).respostas.push(response);
      });

      // Converter para array e calcular estatísticas
      const historyArray: QuizHistoryItem[] = Array.from(groupedQuizzes.values()).map(quiz => {
        const acertos = quiz.respostas.filter((r: any) => r.acertou).length;
        const total = quiz.respostas.length;
        
        return {
          id: quiz.resumo_id,
          resumo_titulo: quiz.resumo_titulo || "Quiz sem título",
          total_perguntas: total,
          acertos: acertos,
          data_criacao: quiz.data_criacao,
          resumo_id: quiz.resumo_id
        };
      });

      setHistory(historyArray);
      
      // Calcular estatísticas gerais
      const totalQuizzes = historyArray.length;
      const totalAcertos = historyArray.reduce((acc, quiz) => acc + quiz.acertos, 0);
      const totalPerguntas = historyArray.reduce((acc, quiz) => acc + quiz.total_perguntas, 0);
      const mediaAcertos = totalPerguntas > 0 ? Math.round((totalAcertos / totalPerguntas) * 100) : 0;

      setStats({
        totalQuizzes,
        totalAcertos,
        totalPerguntas,
        mediaAcertos
      });

    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seu histórico de quizzes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefazerQuiz = async (resumoId: string) => {
    navigate(`/quiz/${resumoId}`);
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return "from-yellow-400 to-orange-500";
    if (percentage >= 80) return "from-blue-400 to-purple-500";
    if (percentage >= 70) return "from-green-400 to-emerald-500";
    if (percentage >= 50) return "from-pink-400 to-rose-500";
    return "from-gray-400 to-gray-500";
  };

  const getPerformanceEmoji = (percentage: number) => {
    if (percentage >= 90) return "🏆";
    if (percentage >= 80) return "🎉";
    if (percentage >= 70) return "👏";
    if (percentage >= 50) return "💪";
    return "📚";
  };

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
          <Button
            variant="outline"
            className="mb-6 flex items-center gap-2 hover:bg-purple-50"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-3">
              <span className="text-5xl">📊</span>
              Histórico de Quizzes
              <span className="text-5xl">📈</span>
            </h1>
            <p className="text-xl text-gray-700">Veja seu progresso e refaça seus quizzes favoritos!</p>
          </div>

          {/* Estatísticas gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-2xl font-bold text-blue-700">{stats.totalQuizzes}</div>
                <div className="text-sm font-semibold text-blue-600">Quizzes Feitos</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-2xl font-bold text-green-700">{stats.totalAcertos}</div>
                <div className="text-sm font-semibold text-green-600">Respostas Certas</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">❓</div>
                <div className="text-2xl font-bold text-purple-700">{stats.totalPerguntas}</div>
                <div className="text-sm font-semibold text-purple-600">Total de Perguntas</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-2xl font-bold text-orange-700">{stats.mediaAcertos}%</div>
                <div className="text-sm font-semibold text-orange-600">Média de Acertos</div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de quizzes */}
          {history.length === 0 ? (
            <Card className="max-w-lg mx-auto">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-gray-600">
                  📚 Nenhum quiz encontrado
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Você ainda não fez nenhum quiz. Que tal começar agora?
                </p>
                <Button 
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  Criar Primeiro Quiz
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {history.map((quiz) => {
                const percentage = Math.round((quiz.acertos / quiz.total_perguntas) * 100);
                return (
                  <Card key={quiz.id} className="shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100 hover:border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">{getPerformanceEmoji(percentage)}</span>
                            <h3 className="text-xl font-bold text-gray-800">
                              {quiz.resumo_titulo}
                            </h3>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(quiz.data_criacao).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              {quiz.acertos}/{quiz.total_perguntas} acertos
                            </div>
                            <div className="flex items-center gap-1">
                              <Trophy className="h-4 w-4" />
                              {percentage}% de aproveitamento
                            </div>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div 
                              className={`h-3 bg-gradient-to-r ${getPerformanceColor(percentage)} rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleRefazerQuiz(quiz.resumo_id)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Refazer Quiz
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default QuizHistory;
