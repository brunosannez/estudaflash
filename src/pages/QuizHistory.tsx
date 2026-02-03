import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Trash2, Calendar, Target, Trophy, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuizDeleteHandler } from '@/components/quiz-history/QuizDeleteHandler';
import { toast } from 'sonner';
import PageLayout from '@/components/navigation/PageLayout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface QuizSession {
  id: string;
  quiz_metadata_id: string;
  status: string;
  score: number;
  total_questions: number;
  started_at: string;
  completed_at: string | null;
  enem_quiz_metadata: {
    id: string;
    tema: string;
    resumo_id: string;
  };
}

interface ResumoInfo {
  id: string;
  custom_name: string | null;
  uploads: {
    arquivo_original_nome: string;
  };
}

const QuizHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { deleteQuizSession } = useQuizDeleteHandler();
  
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [resumos, setResumos] = useState<Record<string, ResumoInfo>>({});
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadSessions();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadSessions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Buscar sessões de quiz do usuário
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('enem_quiz_sessions')
        .select(`
          id,
          quiz_metadata_id,
          status,
          score,
          total_questions,
          started_at,
          completed_at,
          enem_quiz_metadata (
            id,
            tema,
            resumo_id
          )
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (sessionsError) {
        console.error('❌ Erro ao carregar sessões:', sessionsError);
        throw sessionsError;
      }

      // Filtrar sessões com metadata válido
      const validSessions = (sessionsData || []).filter(
        (s: any) => s.enem_quiz_metadata
      ) as QuizSession[];

      setSessions(validSessions);

      // Buscar informações dos resumos
      const resumoIds = [...new Set(validSessions.map(s => s.enem_quiz_metadata.resumo_id))];
      
      if (resumoIds.length > 0) {
        const { data: resumosData, error: resumosError } = await supabase
          .from('resumos')
          .select(`
            id,
            custom_name,
            uploads (
              arquivo_original_nome
            )
          `)
          .in('id', resumoIds);

        if (!resumosError && resumosData) {
          const resumosMap: Record<string, ResumoInfo> = {};
          resumosData.forEach((r: any) => {
            resumosMap[r.id] = r;
          });
          setResumos(resumosMap);
        }
      }

    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico de quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    setDeletingId(sessionId);
    const success = await deleteQuizSession(sessionId);
    if (success) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    }
    setDeletingId(null);
  };

  const handleGoToQuiz = (resumoId: string) => {
    navigate(`/quiz-enem/${resumoId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResumoName = (resumoId: string): string => {
    const resumo = resumos[resumoId];
    return resumo?.custom_name || resumo?.uploads?.arquivo_original_nome || 'Resumo';
  };

  const getScoreColor = (score: number, total: number): string => {
    const percentage = (score / total) * 100;
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Calcular estatísticas
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const totalCorrect = completedSessions.reduce((acc, s) => acc + s.score, 0);
  const totalQuestions = completedSessions.reduce((acc, s) => acc + s.total_questions, 0);
  const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando histórico...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-96">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Faça login para ver seu histórico de quizzes</p>
              <Button onClick={() => navigate('/login')}>Fazer Login</Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Histórico de Quizzes</h1>
              <p className="text-muted-foreground">
                Veja seu progresso e refaça seus quizzes
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {completedSessions.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-700">{sessions.length}</div>
                <div className="text-sm text-blue-600">Quizzes Feitos</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-700">{completedSessions.length}</div>
                <div className="text-sm text-green-600">Completos</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-2xl font-bold text-purple-700">{totalCorrect}</div>
                <div className="text-sm text-purple-600">Acertos Totais</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-2xl font-bold text-orange-700">{averageScore}%</div>
                <div className="text-sm text-orange-600">Média Geral</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-xl">📚 Nenhum quiz encontrado</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Você ainda não fez nenhum quiz. Acesse um resumo e gere seu primeiro quiz ENEM!
              </p>
              <Button onClick={() => navigate('/my-summaries')}>
                Ver Meus Resumos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {getResumoName(session.enem_quiz_metadata.resumo_id)}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <Badge variant="secondary">{session.enem_quiz_metadata.tema}</Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(session.started_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {session.status === 'completed' ? (
                        <div className="text-center">
                          <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getScoreColor(session.score, session.total_questions)}`}>
                            {session.score}/{session.total_questions} ({Math.round((session.score / session.total_questions) * 100)}%)
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-400">
                          <Clock className="h-3 w-3 mr-1" />
                          Em andamento
                        </Badge>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleGoToQuiz(session.enem_quiz_metadata.resumo_id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          {session.status === 'completed' ? 'Refazer' : 'Continuar'}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive/10"
                              disabled={deletingId === session.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deletar tentativa?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação é irreversível. Esta tentativa de quiz será permanentemente excluída.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSession(session.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default QuizHistory;
