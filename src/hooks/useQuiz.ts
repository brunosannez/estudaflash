
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

export function useQuiz(resumoId: string) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { checkCanProceed, incrementUsage } = useUsageLimit();

  const fetchQuizzes = async () => {
    if (!resumoId) {
      console.log('⚠️ Nenhum resumoId fornecido');
      return [];
    }
    
    try {
      console.log('🔍 Buscando quizzes para resumo:', resumoId);
      
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("resumo_id", resumoId)
        .order("data_criacao", { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar quizzes:', error);
        return [];
      }

      if (data && data.length > 0) {
        console.log('✅ Quizzes encontrados:', data.length);
        const formattedQuizzes = data.map((q) => ({
          ...q,
          alternativas: Array.isArray(q.alternativas)
            ? q.alternativas.filter((alt) => typeof alt === "string")
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
    }
  };

  const generateQuiz = async (texto_resumo: string) => {
    if (!resumoId) {
      console.error('❌ Nenhum resumoId fornecido');
      return false;
    }

    setLoading(true);
    
    // Verificar limite de uso
    const canProceed = await checkCanProceed('quizzes');
    if (!canProceed) {
      console.log('❌ Limite de uso atingido');
      setLoading(false);
      return false;
    }

    try {
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
        console.error('❌ Erro na função:', error);
        throw error;
      }
      
      if (!data || !data.success) {
        const errorMessage = data?.error || 'Erro desconhecido';
        toast({
          title: "Erro ao gerar quiz",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }
      
      // Incrementar uso apenas após sucesso
      await incrementUsage('quizzes');
      console.log('✅ Quiz gerado com sucesso');
      
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
    if (!quiz) return { acertou: false, explicacao: '' };
    
    const acertou = resposta_selecionada === quiz.correta;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({ 
        title: "Você precisa estar autenticado para responder.", 
        variant: "destructive" 
      });
      return { acertou, explicacao: quiz.explicacao };
    }
    
    try {
      const { error } = await supabase
        .from("quiz_respostas")
        .insert({
          quiz_id: quizId,
          resposta_selecionada,
          acertou,
          user_id: user.id,
        });
      
      if (error) {
        console.error("Erro ao salvar resposta:", error);
      }
      
      return { acertou, explicacao: quiz.explicacao };
    } catch (error) {
      console.error("Erro ao salvar resposta:", error);
      return { acertou, explicacao: quiz.explicacao };
    }
  };

  return {
    quizzes,
    loading,
    fetchQuizzes,
    generateQuiz,
    enviarResposta,
    setQuizzes,
  };
}
