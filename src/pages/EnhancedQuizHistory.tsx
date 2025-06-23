
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles, Trophy, ArrowLeft } from "lucide-react";
import { useEnhancedQuizHistory } from "@/hooks/useEnhancedQuizHistory";
import { useMindMap } from "@/hooks/useMindMap";
import { supabase } from "@/integrations/supabase/client";
import { designColors } from '@/utils/designSystem';
import PageLayout from '@/components/navigation/PageLayout';
import { Button } from '@/components/ui/button';
import EnhancedQuizHistoryStats from "@/components/quiz-history/EnhancedQuizHistoryStats";
import EnhancedQuizHistoryItem from "@/components/quiz-history/EnhancedQuizHistoryItem";
import { toast } from 'sonner';

const EnhancedQuizHistory = () => {
  const navigate = useNavigate();
  const { history, stats, loading, resumeQuiz, deleteQuizSession } = useEnhancedQuizHistory();
  const { generateMindMap, getMindMapByResumoId } = useMindMap();

  const handleResumeQuiz = async (sessionId: string) => {
    console.log('🔄 Resuming quiz session:', sessionId);
    const resumeData = await resumeQuiz(sessionId);
    
    if (resumeData) {
      // Navigate to quiz with resume context
      navigate(`/quiz/${resumeData.resumoId}?session=${sessionId}&resume=true`);
    }
  };

  const handleViewQuiz = (sessionId: string) => {
    console.log('👁️ Viewing quiz session:', sessionId);
    navigate(`/quiz-history/${sessionId}/view`);
  };

  const handleDeleteQuiz = async (sessionId: string) => {
    if (!confirm('Tem certeza que deseja excluir este quiz do histórico?')) {
      return;
    }
    await deleteQuizSession(sessionId);
  };

  const handleGenerateMindMap = async (resumoId: string, resumoTitulo: string) => {
    try {
      console.log('🧠 Generating mind map for resumo:', resumoId);

      // Check if mind map already exists
      const existingMindMap = await getMindMapByResumoId(resumoId);
      
      if (existingMindMap) {
        console.log('✅ Mind map already exists, navigating to it');
        toast.success('Mapa mental já existe! Redirecionando...');
        navigate(`/mind-map/${existingMindMap.id}`);
        return;
      }

      // Get full summary content for mind map generation
      const { data: resumoData, error } = await supabase
        .from('resumos')
        .select('resumo_gerado')
        .eq('id', resumoId)
        .single();

      if (error || !resumoData?.resumo_gerado) {
        throw new Error('Conteúdo do resumo não encontrado');
      }

      toast.info('Gerando mapa mental... Isso pode levar alguns segundos.');
      const mindMap = await generateMindMap(resumoId, resumoData.resumo_gerado);
      
      if (mindMap) {
        console.log('✅ Mind map generated successfully');
        toast.success('Mapa mental gerado com sucesso!');
        navigate(`/mind-map/${mindMap.id}`);
      } else {
        throw new Error('Falha na geração do mapa mental');
      }
    } catch (error) {
      console.error('❌ Error generating mind map:', error);
      toast.error('Erro ao gerar mapa mental. Tente novamente.');
    }
  };

  const handleGoBack = () => navigate('/');
  
  const handleCreateFirstQuiz = () => {
    console.log('🚀 Navegando para criar novo quiz');
    navigate('/my-summaries');
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
            <p className="text-gray-600">Veja seu progresso, continue estudos e gere mapas mentais!</p>
          </div>
        </div>

        {/* Enhanced Stats */}
        <EnhancedQuizHistoryStats stats={stats} />

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
                  key={quiz.session_id} 
                  className={`${designColors.animations.cardHover}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <EnhancedQuizHistoryItem
                    quiz={quiz}
                    onResumeQuiz={handleResumeQuiz}
                    onViewQuiz={handleViewQuiz}
                    onDelete={handleDeleteQuiz}
                    onGenerateMindMap={handleGenerateMindMap}
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

export default EnhancedQuizHistory;
