
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
      
      if (!user) return;

      // Buscar histórico de sessões de quiz com informações dos resumos
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
            uploads!inner(
              arquivo_original_nome
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar histórico:", error);
        return;
      }

      // Transformar dados para o formato esperado
      const historyArray: QuizHistoryItem[] = sessionsData?.map(session => ({
        id: session.id,
        resumo_titulo: session.resumos.uploads.arquivo_original_nome || session.quiz_title,
        total_perguntas: session.total_questions,
        acertos: session.correct_answers,
        data_criacao: session.created_at,
        resumo_id: session.resumo_id,
        quiz_titulo: session.quiz_title,
        tempo_conclusao: session.completion_time_seconds || 0
      })) || [];

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

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  return {
    history,
    stats,
    loading,
    fetchQuizHistory
  };
};
