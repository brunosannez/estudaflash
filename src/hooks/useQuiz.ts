
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
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const { checkCanProceed, incrementUsage } = useUsageLimit();

  const fetchQuizzes = async () => {
    if (!resumoId) {
      console.log('❌ No resumoId provided');
      return [];
    }
    
    try {
      setLoading(true);
      console.log('🔍 Fetching quizzes for resumo:', resumoId);
      
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("resumo_id", resumoId)
        .order("data_criacao", { ascending: true });

      if (error) {
        console.error('❌ Error fetching quizzes:', error);
        return [];
      }

      if (data && data.length > 0) {
        console.log('✅ Quizzes found:', data.length);
        const formattedQuizzes = data.map((q) => ({
          ...q,
          alternativas: Array.isArray(q.alternativas)
            ? q.alternativas.filter((alt) => typeof alt === "string")
            : [],
        })) as Quiz[];
        
        setQuizzes(formattedQuizzes);
        return formattedQuizzes;
      } else {
        console.log('ℹ️ No quizzes found');
        setQuizzes([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching quizzes:', error);
      setQuizzes([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async (texto_resumo: string) => {
    if (!resumoId) {
      console.error('❌ No resumoId provided');
      toast({
        title: "Erro",
        description: "ID do resumo não encontrado",
        variant: "destructive",
      });
      return false;
    }

    if (!texto_resumo || texto_resumo.trim().length < 50) {
      console.error('❌ Invalid summary text');
      toast({
        title: "Erro",
        description: "Texto do resumo muito pequeno para gerar quiz",
        variant: "destructive",
      });
      return false;
    }

    setGenerating(true);
    
    try {
      // Check usage limits
      const canProceed = await checkCanProceed('quizzes');
      if (!canProceed) {
        console.log('❌ Usage limit reached');
        setGenerating(false);
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🚀 Calling quiz generation function...');
      
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { 
          resumo_id: resumoId, 
          texto_resumo: texto_resumo.trim(),
          userId: user.id
        },
      });
      
      if (error) {
        console.error('❌ Function error:', error);
        throw new Error(error.message || 'Failed to generate quiz');
      }
      
      if (!data || !data.success) {
        const errorMessage = data?.error || 'Unknown error occurred';
        console.error('❌ Generation failed:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Increment usage after success
      await incrementUsage('quizzes');
      console.log('✅ Quiz generated successfully');
      
      // Refresh quizzes
      await fetchQuizzes();
      
      toast({
        title: "✅ Quiz gerado!",
        description: "Quiz criado com sucesso. Você pode começar a responder agora!",
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error generating quiz:', error);
      toast({
        title: "Erro ao gerar quiz",
        description: error.message || "Erro inesperado ao gerar quiz",
        variant: "destructive",
      });
      return false;
    } finally {
      setGenerating(false);
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
        console.error("Error saving answer:", error);
      }
      
      return { acertou, explicacao: quiz.explicacao };
    } catch (error) {
      console.error("Error saving answer:", error);
      return { acertou, explicacao: quiz.explicacao };
    }
  };

  return {
    quizzes,
    loading,
    generating,
    fetchQuizzes,
    generateQuiz,
    enviarResposta,
    setQuizzes,
  };
}
