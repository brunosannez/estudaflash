import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Quiz {
  id: string;
  resumo_id: string;
  pergunta: string;
  alternativas: string[];
  correta: number;
  explicacao: string;
  data_criacao: string;
}

export interface QuizResposta {
  id?: string;
  user_id?: string;
  quiz_id: string;
  acertou: boolean;
  resposta_selecionada: number;
  data_resposta?: string;
}

export function useQuiz(resumoId: string) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [respostas, setRespostas] = useState<QuizResposta[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchQuizzes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("resumo_id", resumoId)
      .order("data_criacao", { ascending: true });

    if (!error && data) {
      setQuizzes(
        data.map((q) => ({
          ...q,
          alternativas: Array.isArray(q.alternativas)
            ? q.alternativas.filter((alt) => typeof alt === "string")
            : typeof q.alternativas === "string"
            ? [q.alternativas]
            : Array.isArray(q.alternativas)
            ? q.alternativas.filter((alt) => typeof alt === "string")
            : [], // fallback if not array/string
        })) as Quiz[]
      );
    } else setQuizzes([]);
    setLoading(false);
    return data;
  };

  const generateQuiz = async (texto_resumo: string) => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("generate-quiz", {
      body: { resumo_id: resumoId, texto_resumo },
    });
    setLoading(false);
    if (error || !data.success) {
      toast({
        title: "Erro ao gerar quiz",
        description: data?.error || error?.message,
        variant: "destructive",
      });
      return false;
    }
    toast({ title: "Quiz gerado com sucesso!" });
    setQuizzes(data.quizzes);
    return true;
  };

  const enviarResposta = async (quizId: string, resposta_selecionada: number) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) return;
    const acertou = resposta_selecionada === quiz.correta;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Você precisa estar autenticado para responder o quiz.", variant: "destructive" });
      return { acertou: false, explicacao: quiz.explicacao };
    }
    const { data, error } = await supabase
      .from("quiz_respostas")
      .insert({
        quiz_id: quizId,
        resposta_selecionada,
        acertou,
        user_id: user.id,
      })
      .select()
      .single();
    if (!error && data) {
      setRespostas((prev) => [...prev, data]);
      return { acertou, explicacao: quiz.explicacao };
    }
    return { acertou: false, explicacao: quiz.explicacao };
  };

  const resetRespostas = () => setRespostas([]);

  return {
    quizzes,
    respostas,
    loading,
    fetchQuizzes,
    generateQuiz,
    enviarResposta,
    setQuizzes,
    resetRespostas,
  };
}
