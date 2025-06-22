
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUsageLimit } from "@/hooks/useUsageLimit";

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
  const { checkCanProceed, incrementUsage } = useUsageLimit();

  const fetchQuizzes = async () => {
    if (!resumoId) return [];
    
    try {
      setLoading(true);
      console.log('🔍 Buscando quizzes para resumo:', resumoId);
      
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("resumo_id", resumoId)
        .order("data_criacao", { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar quizzes:', error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log('✅ Quizzes encontrados:', data.length);
        const formattedQuizzes = data.map((q) => ({
          ...q,
          alternativas: Array.isArray(q.alternativas)
            ? q.alternativas.filter((alt) => typeof alt === "string")
            : typeof q.alternativas === "string"
            ? [q.alternativas]
            : [],
        })) as Quiz[];
        
        setQuizzes(formattedQuizzes);
        return formattedQuizzes;
      } else {
        console.log('ℹ️ Nenhum quiz encontrado');
        setQuizzes([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao buscar quizzes:', error);
      setQuizzes([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async (texto_resumo: string) => {
    setLoading(true);
    
    // Verificar limite de uso ANTES de gerar quiz
    const canProceed = await checkCanProceed('quizzes');
    if (!canProceed) {
      console.log('❌ Geração de quiz bloqueada por limite de uso');
      setLoading(false);
      return false;
    }

    try {
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('🚀 Chamando função de geração de quiz...');
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { 
          resumo_id: resumoId, 
          texto_resumo,
          userId: user.id
        },
      });
      
      if (error) {
        console.error('❌ Erro na função de geração:', error);
        throw error;
      }
      
      if (!data || !data.success) {
        let errorMessage = data?.error || 'Erro desconhecido';
        
        // Se há uma mensagem de fallback, usa ela
        if (data?.fallbackMessage) {
          errorMessage = data.fallbackMessage;
        }
        
        toast({
          title: "Erro ao gerar quiz",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }
      
      // Incrementar contador de uso APENAS após sucesso
      await incrementUsage('quizzes');
      console.log('✅ Usage counter incremented for quizzes');
      
      toast({ title: "Quiz gerado com sucesso!" });
      
      // Atualizar estado local com os novos quizzes
      if (data.quizzes && data.quizzes.length > 0) {
        const formattedQuizzes = data.quizzes.map((q: any) => ({
          ...q,
          alternativas: Array.isArray(q.alternativas)
            ? q.alternativas.filter((alt: any) => typeof alt === "string")
            : [],
        })) as Quiz[];
        
        setQuizzes(formattedQuizzes);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao gerar quiz:', error);
      toast({
        title: "Erro ao gerar quiz",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const enviarResposta = async (quizId: string, resposta_selecionada: number) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) return;
    
    const acertou = resposta_selecionada === quiz.correta;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({ 
        title: "Você precisa estar autenticado para responder o quiz.", 
        variant: "destructive" 
      });
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
      
      // Apenas retornar o resultado, sem adicionar XP aqui
      // O XP será adicionado apenas no final da sessão
      return { acertou, explicacao: quiz.explicacao };
    }
    
    if (error) {
      console.error("Erro ao salvar resposta:", error);
      toast({
        title: "Erro ao salvar resposta",
        description: "Tente novamente.",
        variant: "destructive",
      });
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
