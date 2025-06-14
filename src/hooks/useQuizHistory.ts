
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
              upload_id,
              uploads!inner(
                arquivo_original_nome
              )
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
        const resumoTitulo = response.quizzes.resumos.uploads.arquivo_original_nome;
        
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
