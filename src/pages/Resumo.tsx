import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Calendar, Zap, Target, Brain, Map, Loader2, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEnemQuiz } from '@/hooks/useEnemQuiz';
import { useAutoFlashcards } from '@/hooks/useAutoFlashcards';
import { useMindMap } from '@/hooks/useMindMap';
import { useAuth } from '@/hooks/useAuth';
import { useCreditsSystem } from '@/hooks/useCreditsSystem';
import { CreditsService } from '@/services/creditsService';
import { toast } from 'sonner';
import PageLayout from '@/components/navigation/PageLayout';
import ResumoContent from '@/components/ResumoContent';
import CreditsCostBadge from '@/components/usage/CreditsCostBadge';
import CreditsConfirmDialog from '@/components/usage/CreditsConfirmDialog';
import { printResumo } from '@/utils/printResumo';

interface ResumoData {
  id: string;
  custom_name: string | null;
  resumo_gerado: string;
  data_criacao: string;
  upload_id: string;
}

type PendingAction = 'quiz' | 'flashcards' | 'mind_map' | null;

const Resumo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { generateQuiz, loading: quizLoading, generating } = useEnemQuiz();
  const { generateAutoFlashcards, isGenerating: flashcardsLoading } = useAutoFlashcards();
  const { generateMindMap, loading: mindMapLoading } = useMindMap();
  const { userCredits, getActionCreditsCost } = useCreditsSystem();

  const [resumo, setResumo] = useState<ResumoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Credits confirmation dialog state
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [confirmCost, setConfirmCost] = useState(0);
  const [confirmName, setConfirmName] = useState('');

  useEffect(() => {
    console.log('🔍 Resumo useEffect - ID:', id, 'User:', !!user, 'AuthLoading:', authLoading);
    if (!authLoading) {
      loadResumo();
    }
  }, [id, user, authLoading]);

  const loadResumo = async () => {
    console.log('📄 loadResumo called - ID:', id, 'User:', !!user);
    
    if (!id) {
      setError('ID do resumo não fornecido');
      setLoading(false);
      return;
    }

    if (!user) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('resumos')
        .select(`
          id,
          custom_name,
          resumo_gerado,
          data_criacao,
          upload_id,
          uploads!inner(
            user_id,
            arquivo_original_nome
          )
        `)
        .eq('id', id)
        .eq('uploads.user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao carregar resumo:', error);
        setError('Resumo não encontrado ou acesso negado');
        return;
      }

      setResumo({
        id: data.id,
        custom_name: data.custom_name,
        resumo_gerado: data.resumo_gerado,
        data_criacao: data.data_criacao,
        upload_id: data.upload_id
      });
      
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
      setError('Erro ao carregar resumo');
      toast.error('Erro ao carregar resumo');
    } finally {
      setLoading(false);
    }
  };

  // --- Credit-gated action helpers ---
  const requestAction = async (action: PendingAction, actionType: string, actionLabel: string) => {
    if (!user || !resumo) return;

    const check = await CreditsService.checkCreditsForAction(user.id, actionType);
    if (!check.canProceed) {
      toast.error('Créditos insuficientes', {
        description: `Você precisa de ${check.creditsRequired} crédito(s) mas tem ${check.creditsAvailable}.`,
      });
      return;
    }

    setConfirmCost(check.creditsRequired);
    setConfirmName(actionLabel);
    setPendingAction(action);
  };

  const confirmAction = () => {
    const action = pendingAction;
    setPendingAction(null);

    switch (action) {
      case 'quiz':
        executeGenerateEnemQuiz();
        break;
      case 'flashcards':
        executeGenerateFlashcards();
        break;
      case 'mind_map':
        executeGenerateMindMap();
        break;
    }
  };

  // --- Action executors (called after credit confirmation) ---
  const executeGenerateEnemQuiz = async () => {
    if (!resumo || generating) return;
    
    try {
      const { data: existingQuizzes, error: checkError } = await supabase
        .from('enem_quiz_metadata')
        .select('id')
        .eq('resumo_id', resumo.id)
        .limit(1);

      if (!checkError && existingQuizzes && existingQuizzes.length > 0) {
        toast.info('Quiz existente encontrado! Abrindo...');
        navigate(`/quiz-enem/${resumo.id}`);
        return;
      }

      if (!resumo.resumo_gerado || resumo.resumo_gerado.trim().length < 100) {
        toast.error('Resumo muito pequeno para gerar quiz. Mínimo 100 caracteres.');
        return;
      }
      
      const quizMetadataId = await generateQuiz(resumo.id, resumo.resumo_gerado);
      
      if (quizMetadataId) {
        setTimeout(() => {
          navigate(`/quiz-enem/${resumo.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Error in handleGenerateEnemQuiz:', error);
      toast.error('Erro inesperado ao processar quiz');
    }
  };

  const executeGenerateFlashcards = async () => {
    if (!resumo) return;

    try {
      await generateAutoFlashcards(resumo.id, resumo.resumo_gerado);
      toast.success('Flashcards gerados com sucesso!');
      navigate('/my-flashcards');
    } catch (error) {
      console.error('Erro ao gerar flashcards:', error);
      toast.error('Erro ao gerar flashcards');
    }
  };

  const executeGenerateMindMap = async () => {
    if (!resumo) return;

    try {
      const mindMap = await generateMindMap(resumo.id, resumo.resumo_gerado);
      if (mindMap) {
        toast.success('Mapa mental gerado com sucesso!');
        navigate(`/mind-map/${mindMap.id}`);
      }
    } catch (error) {
      console.error('Erro ao gerar mapa mental:', error);
      toast.error('Erro ao gerar mapa mental');
    }
  };

  // --- Public handlers with credit gate ---
  const handleGenerateEnemQuiz = () => requestAction('quiz', 'quiz', 'Quiz ENEM');
  const handleGenerateFlashcards = () => requestAction('flashcards', 'flashcards', 'Gerar Flashcards');
  const handleGenerateMindMap = () => requestAction('mind_map', 'mind_map', 'Mapa Mental');

  const handlePrint = () => {
    if (!resumo) return;
    printResumo(
      resumo.custom_name || 'Resumo Didático',
      resumo.resumo_gerado,
      resumo.data_criacao
    );
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

  const getResumoTitle = () => {
    if (!resumo) return 'Resumo';
    return resumo.custom_name || 'Resumo Didático';
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando resumo...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !resumo) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-96">
            <CardContent className="py-8 text-center">
              <p className="text-red-600 mb-4">{error || 'Resumo não encontrado'}</p>
              <Button onClick={() => navigate('/my-summaries')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Resumos
              </Button>
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
          <Button variant="outline" onClick={() => navigate('/my-summaries')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Resumos
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">
                {getResumoTitle()}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Criado em {formatDate(resumo.data_criacao)}
                </span>
                <Badge variant="secondary" className="ml-2">
                  Resumo Didático
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              <Button 
                onClick={handleGenerateEnemQuiz}
                disabled={generating || !resumo}
                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando Quiz...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Quiz ENEM
                    <CreditsCostBadge actionType="quiz" className="ml-1" />
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleGenerateFlashcards}
                disabled={flashcardsLoading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                {flashcardsLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Flashcards
                    <CreditsCostBadge actionType="flashcards" className="ml-1" />
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleGenerateMindMap}
                disabled={mindMapLoading}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
              >
                {mindMapLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Map className="h-4 w-4 mr-2" />
                    Mapa Mental
                    <CreditsCostBadge actionType="mind_map" className="ml-1" />
                  </>
                )}
              </Button>

              <Button
                onClick={handlePrint}
                variant="outline"
                className="border-blue-300 hover:bg-blue-50 text-blue-700"
              >
                <Printer className="h-4 w-4 mr-2" />
                Salvar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Content */}
        <Card className="overflow-hidden shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              Conteúdo do Resumo
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <ResumoContent content={resumo.resumo_gerado} />
          </CardContent>
        </Card>

        {/* Navigation Links */}
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/my-flashcards')}
                className="border-green-300 hover:bg-green-50 text-green-700"
              >
                <Brain className="h-4 w-4 mr-2" />
                Ver Meus Flashcards
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/my-progress')}
                className="border-purple-300 hover:bg-purple-50 text-purple-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Ver Meu Progresso
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credits Confirmation Dialog */}
      <CreditsConfirmDialog
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={confirmAction}
        actionName={confirmName}
        creditsCost={confirmCost}
        creditsAvailable={userCredits?.remaining ?? 0}
      />
    </PageLayout>
  );
};

export default Resumo;
