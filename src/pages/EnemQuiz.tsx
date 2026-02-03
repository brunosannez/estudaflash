import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Play, RotateCcw, Clock, Target, BookOpen, Trash2, ChevronDown, Pencil, Check, X } from 'lucide-react';
import { EnemQuizPlayer } from '@/components/enem/EnemQuizPlayer';
import { useEnemQuiz } from '@/hooks/useEnemQuiz';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { deleteService } from '@/services/deleteService';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const EnemQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { loading, generating, generateQuiz, getQuizMetadata, listQuizMetadata, getUserSessions, renameQuiz, getQuizDisplayName } = useEnemQuiz();
  
  const [resumoData, setResumoData] = useState<any>(null);
  const [quizMetadata, setQuizMetadata] = useState<any>(null);
  const [allQuizzes, setAllQuizzes] = useState<any[]>([]);
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    // Aguardar auth carregar antes de tentar carregar dados
    if (authLoading) {
      console.log('🔄 Aguardando autenticação...');
      return;
    }

    // Se auth carregou mas não há usuário, redirecionar
    if (!user) {
      console.log('❌ Usuário não autenticado após auth loading');
      setLoadingData(false);
      toast.error('Faça login para acessar o quiz');
      navigate('/login');
      return;
    }

    // Se não há ID, redirecionar
    if (!id) {
      console.log('❌ ID não fornecido');
      setLoadingData(false);
      toast.error('ID do resumo não fornecido');
      navigate('/my-summaries');
      return;
    }

    loadData();
  }, [id, user, authLoading, navigate]);

  const loadData = async () => {
    if (!id || !user) return;

    setLoadingData(true);
    try {
      console.log('📄 Carregando dados do resumo:', id);
      
      // Load resumo data
      const { data: resumo, error: resumoError } = await supabase
        .from('resumos')
        .select(`
          id,
          custom_name,
          resumo_gerado,
          data_criacao,
          uploads (
            arquivo_original_nome,
            user_id
          )
        `)
        .eq('id', id)
        .single();

      if (resumoError) {
        console.error('❌ Erro ao carregar resumo:', resumoError);
        throw new Error(resumoError.message);
      }

      if (!resumo || resumo.uploads?.user_id !== user.id) {
        throw new Error('Resumo não encontrado ou acesso negado');
      }

      setResumoData(resumo);
      console.log('✅ Resumo carregado:', resumo.id);

      // Listar todos os quizzes para este resumo
      const quizzes = await listQuizMetadata(id);
      setAllQuizzes(quizzes);
      console.log(`📚 ${quizzes.length} quiz(zes) encontrado(s)`);

      // Usar o mais recente como selecionado
      if (quizzes.length > 0) {
        const latestQuiz = quizzes[0];
        setQuizMetadata(latestQuiz);
        
        // Load user sessions for the selected quiz
        const sessions = await getUserSessions(latestQuiz.id);
        setUserSessions(sessions);
      }

    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast.error('Erro ao carregar dados');
      navigate('/my-summaries');
    } finally {
      setLoadingData(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!resumoData) return;

    const quizMetadataId = await generateQuiz(resumoData.id, resumoData.resumo_gerado);
    if (quizMetadataId) {
      // Recarregar lista de quizzes
      const quizzes = await listQuizMetadata(resumoData.id);
      setAllQuizzes(quizzes);
      
      // Selecionar o novo quiz (mais recente)
      if (quizzes.length > 0) {
        const newQuiz = quizzes[0];
        setQuizMetadata(newQuiz);
        
        // Load sessions
        const sessions = await getUserSessions(newQuiz.id);
        setUserSessions(sessions);
      }
    }
  };

  const handleSelectQuiz = async (quiz: any) => {
    setQuizMetadata(quiz);
    const sessions = await getUserSessions(quiz.id);
    setUserSessions(sessions);
  };

  const handleStartQuiz = () => {
    setIsPlaying(true);
  };

  const handleQuizComplete = (results: any) => {
    console.log('📊 Quiz completed:', results);
    toast.success(`Quiz concluído! Você acertou ${results.correctAnswers} de ${results.totalQuestions} questões.`);
    setIsPlaying(false);
    
    // Reload sessions to show the latest completion
    if (quizMetadata) {
      getUserSessions(quizMetadata.id).then(setUserSessions);
    }
  };

  const handleExit = () => {
    setIsPlaying(false);
  };

  const handleStartEditing = () => {
    setEditName(quizMetadata?.custom_name || getQuizDisplayName(quizMetadata));
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditName('');
  };

  const handleSaveQuizName = async () => {
    if (!quizMetadata || !editName.trim()) return;
    
    const success = await renameQuiz(quizMetadata.id, editName.trim());
    if (success) {
      // Update local state
      const updatedQuiz = { ...quizMetadata, custom_name: editName.trim() };
      setQuizMetadata(updatedQuiz);
      setAllQuizzes(prev => prev.map(q => q.id === quizMetadata.id ? updatedQuiz : q));
    }
    setIsEditing(false);
    setEditName('');
  };

  const handleDeleteQuiz = async () => {
    if (!quizMetadata) return;
    
    setIsDeleting(true);
    const success = await deleteService.deleteQuiz(quizMetadata.id);
    if (success) {
      // Remover da lista e selecionar próximo
      const remainingQuizzes = allQuizzes.filter(q => q.id !== quizMetadata.id);
      setAllQuizzes(remainingQuizzes);
      
      if (remainingQuizzes.length > 0) {
        const nextQuiz = remainingQuizzes[0];
        setQuizMetadata(nextQuiz);
        const sessions = await getUserSessions(nextQuiz.id);
        setUserSessions(sessions);
      } else {
        setQuizMetadata(null);
        setUserSessions([]);
      }
    }
    setIsDeleting(false);
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

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando resumo...</p>
        </div>
      </div>
    );
  }

  if (isPlaying && quizMetadata) {
    return (
      <EnemQuizPlayer
        quizMetadataId={quizMetadata.id}
        onComplete={handleQuizComplete}
        onExit={handleExit}
      />
    );
  }

  const completedSessions = userSessions.filter(s => s.status === 'completed');
  const bestScore = completedSessions.length > 0 
    ? Math.max(...completedSessions.map(s => Math.round((s.score / s.total_questions) * 100)))
    : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/my-summaries')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Resumos
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Quiz ENEM</h1>
            <p className="text-muted-foreground">
              {resumoData?.custom_name || resumoData?.uploads?.arquivo_original_nome}
            </p>
          </div>
        </div>

        {/* Quiz Status */}
        {!quizMetadata ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Gerar Quiz ENEM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Este resumo ainda não possui um quiz ENEM. Clique no botão abaixo para gerar questões 
                no formato do ENEM baseadas no conteúdo do resumo.
              </p>
              
              <Button 
                onClick={handleGenerateQuiz} 
                disabled={generating}
                size="lg"
                className="w-full sm:w-auto"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Gerando Quiz ENEM...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Gerar Quiz ENEM
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Quiz Name and Edit */}
            <Card className="mb-6">
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nome do quiz..."
                          className="max-w-xs"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveQuizName();
                            if (e.key === 'Escape') handleCancelEditing();
                          }}
                        />
                        <Button size="sm" onClick={handleSaveQuizName}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEditing}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold truncate">
                          {quizMetadata.custom_name || getQuizDisplayName(quizMetadata)}
                        </h2>
                        <Button size="sm" variant="ghost" onClick={handleStartEditing}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {allQuizzes.length > 1 && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={quizMetadata?.id}
                        onValueChange={(value) => {
                          const selected = allQuizzes.find(q => q.id === value);
                          if (selected) handleSelectQuiz(selected);
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {allQuizzes.map((quiz) => (
                            <SelectItem key={quiz.id} value={quiz.id}>
                              {quiz.custom_name || getQuizDisplayName(quiz)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Badge variant="outline">{allQuizzes.length} quiz(zes)</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quiz Info */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações do Quiz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tema:</span>
                    <Badge variant="secondary">{quizMetadata.tema}</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total de Questões:</span>
                    <span className="font-semibold">
                      {(quizMetadata.generated?.objetivas || 0) + (quizMetadata.generated?.vf_sequenciais || 0)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Objetivas:</span>
                      <span>{quizMetadata.generated?.objetivas || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">V/F Sequenciais:</span>
                      <span>{quizMetadata.generated?.vf_sequenciais || 0}</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Palavras Analisadas:</span>
                    <span>{quizMetadata.word_count}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Criado em:</span>
                    <span>{formatDate(quizMetadata.created_at)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Seu Desempenho</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tentativas:</span>
                    <span className="font-semibold">{userSessions.length}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completas:</span>
                    <span className="font-semibold">{completedSessions.length}</span>
                  </div>
                  
                  {bestScore > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Melhor Score:</span>
                      <Badge variant={bestScore >= 70 ? "default" : "secondary"}>
                        {bestScore}%
                      </Badge>
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <Button onClick={handleStartQuiz} size="lg" className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      {completedSessions.length > 0 ? 'Fazer Novamente' : 'Iniciar Quiz'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sessions */}
            {userSessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Histórico de Tentativas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userSessions.slice(0, 5).map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            session.status === 'completed' ? 'bg-green-500' : 
                            session.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                          
                          <div>
                            <div className="font-medium">
                              {formatDate(session.started_at)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {session.status === 'completed' 
                                ? `${session.score}/${session.total_questions} acertos` 
                                : session.status === 'in_progress' 
                                ? 'Em andamento'
                                : 'Abandonado'
                              }
                            </div>
                          </div>
                        </div>
                        
                        {session.status === 'completed' && (
                          <Badge variant={session.score / session.total_questions >= 0.7 ? "default" : "secondary"}>
                            {Math.round((session.score / session.total_questions) * 100)}%
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delete and Regenerate Options */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Opções do Quiz
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <p className="text-muted-foreground mb-2 text-sm">
                      Gere um novo quiz com questões diferentes.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleGenerateQuiz} 
                      disabled={generating}
                    >
                      {generating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Gerar Novo Quiz
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-muted-foreground mb-2 text-sm">
                      Exclua este quiz permanentemente.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="border-destructive text-destructive hover:bg-destructive/10"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deletar Quiz
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deletar quiz?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação é irreversível. O quiz e todo o histórico de tentativas serão permanentemente excluídos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteQuiz}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default EnemQuiz;