
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuizHistoryItem {
  id: string;
  resumo_titulo: string;
  total_perguntas: number;
  acertos: number;
  data_criacao: string;
  resumo_id: string;
  quiz_titulo: string;
  tempo_conclusao: number;
}

interface QuizStats {
  totalQuizzes: number;
  totalAcertos: number;
  totalPerguntas: number;
  mediaAcertos: number;
}

export const useQuizHistory = () => {
  const { toast } = useToast();
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QuizStats>({
    totalQuizzes: 0,
    totalAcertos: 0,
    totalPerguntas: 0,
    mediaAcertos: 0
  });

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ User not authenticated for quiz history');
        setHistory([]);
        setStats({
          totalQuizzes: 0,
          totalAcertos: 0,
          totalPerguntas: 0,
          mediaAcertos: 0
        });
        return;
      }

      console.log('🔍 Fetching quiz history for user:', user.id);

      // Buscar sessões de quiz com informações dos resumos
      const { data: sessionsData, error } = await supabase
        .from("quiz_sessions")
        .select(`
          id,
          quiz_title,
          total_questions,
          correct_answers,
          completion_time_seconds,
          created_at,
          resumo_id,
          resumos!inner(
            id,
            upload_id,
            custom_name,
            uploads!inner(
              arquivo_original_nome
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching quiz sessions:", error);
        throw error;
      }

      console.log('📊 Raw quiz sessions data from database:', {
        count: sessionsData?.length || 0,
        data: sessionsData
      });

      if (!sessionsData || sessionsData.length === 0) {
        console.log('ℹ️ No quiz sessions found for user');
        setHistory([]);
        setStats({
          totalQuizzes: 0,
          totalAcertos: 0,
          totalPerguntas: 0,
          mediaAcertos: 0
        });
        return;
      }

      // Transformar dados para o formato esperado
      const historyArray: QuizHistoryItem[] = sessionsData.map(session => {
        const resumoTitulo = session.resumos?.custom_name || 
                           session.resumos?.uploads?.arquivo_original_nome || 
                           'Resumo sem título';
        
        console.log('🔄 Processing session:', {
          sessionId: session.id,
          resumoTitulo,
          totalQuestions: session.total_questions,
          correctAnswers: session.correct_answers
        });

        return {
          id: session.id,
          resumo_titulo: resumoTitulo,
          total_perguntas: session.total_questions || 0,
          acertos: session.correct_answers || 0,
          data_criacao: session.created_at,
          resumo_id: session.resumo_id,
          quiz_titulo: session.quiz_title || `Quiz - ${session.total_questions || 0} questões`,
          tempo_conclusao: session.completion_time_seconds || 0
        };
      });

      console.log('✅ Processed quiz history:', {
        totalSessions: historyArray.length,
        sessions: historyArray
      });
      
      setHistory(historyArray);
      
      // Calcular estatísticas gerais
      const totalQuizzes = historyArray.length;
      const totalAcertos = historyArray.reduce((acc, quiz) => acc + (quiz.acertos || 0), 0);
      const totalPerguntas = historyArray.reduce((acc, quiz) => acc + (quiz.total_perguntas || 0), 0);
      const mediaAcertos = totalPerguntas > 0 ? Math.round((totalAcertos / totalPerguntas) * 100) : 0;

      const calculatedStats = {
        totalQuizzes,
        totalAcertos,
        totalPerguntas,
        mediaAcertos
      };

      console.log('📈 Calculated statistics:', calculatedStats);
      setStats(calculatedStats);

    } catch (error) {
      console.error("❌ Error loading quiz history:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seu histórico de quizzes.",
        variant: "destructive",
      });
      setHistory([]);
      setStats({
        totalQuizzes: 0,
        totalAcertos: 0,
        totalPerguntas: 0,
        mediaAcertos: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Configurar real-time updates
  useEffect(() => {
    console.log('🔄 Setting up quiz history with real-time updates');
    fetchQuizHistory();

    // Configurar listener para updates em tempo real
    const channel = supabase
      .channel('quiz-history-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_sessions'
        },
        (payload) => {
          console.log('🔄 Real-time quiz sessions update received:', payload);
          // Recarregar dados quando houver mudanças
          fetchQuizHistory();
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
      });

    return () => {
      console.log('🧹 Cleaning up quiz history real-time subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    history,
    stats,
    loading,
    fetchQuizHistory
  };
};
