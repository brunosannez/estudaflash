// Compatibility hook - provides basic quiz functionality
// This maintains backward compatibility while we migrate to the enhanced system

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
      console.log('❌ No resumoId provided for fetchQuizzes');
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
        throw error;
      }

      if (data && data.length > 0) {
        console.log('✅ Raw quizzes from database:', data);
        
        const formattedQuizzes = data.map((q) => ({
          id: q.id,
          resumo_id: q.resumo_id,
          pergunta: q.pergunta,
          alternativas: Array.isArray(q.alternativas) 
            ? q.alternativas.filter((alt) => typeof alt === "string")
            : [],
          correta: q.correta,
          explicacao: q.explicacao,
          data_criacao: q.data_criacao
        })) as Quiz[];
        
        console.log('📊 Formatted quizzes:', formattedQuizzes);
        setQuizzes(formattedQuizzes);
        return formattedQuizzes;
      } else {
        console.log('ℹ️ No quizzes found for resumo:', resumoId);
        setQuizzes([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching quizzes:', error);
      toast({
        title: "Erro ao carregar quiz",
        description: "Não foi possível carregar as questões do quiz",
        variant: "destructive",
      });
      setQuizzes([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async (texto_resumo: string) => {
    if (!resumoId) {
      console.error('❌ No resumoId provided for generateQuiz');
      toast({
        title: "Erro",
        description: "ID do resumo não encontrado",
        variant: "destructive",
      });
      return false;
    }

    if (!texto_resumo || texto_resumo.trim().length < 50) {
      console.error('❌ Invalid summary text for quiz generation');
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
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🚀 Calling quiz generation function for resumo:', resumoId);
      
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
      
      console.log('✅ Quiz generated successfully:', data);
      
      // Increment usage after success
      await incrementUsage('quizzes');
      
      // Refresh quizzes immediately after generation
      const newQuizzes = await fetchQuizzes();
      console.log('🔄 Refreshed quizzes after generation:', newQuizzes.length);
      
      toast({
        title: "✅ Quiz gerado!",
        description: `Quiz criado com sucesso com ${newQuizzes.length} questões!`,
      });
      
      return true;
    } catch (error: any) {
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
    console.log('📝 Enviando resposta:', { quizId, resposta_selecionada });
    
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) {
      console.error('❌ Quiz not found:', quizId);
      return { acertou: false, explicacao: '' };
    }

    console.log('🎯 Quiz found for answer submission:', {
      id: quiz.id,
      pergunta: quiz.pergunta,
      alternativas: quiz.alternativas,
      correta: quiz.correta,
      resposta_selecionada
    });
    
    const acertou = resposta_selecionada === quiz.correta;
    console.log('✅ Answer verification:', {
      resposta_selecionada,
      correta: quiz.correta,
      acertou
    });

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({ 
        title: "Você precisa estar autenticado para responder.", 
        variant: "destructive" 
      });
      return { acertou, explicacao: quiz.explicacao };
    }
    
    try {
      console.log('💾 Saving answer to database...');
      const { error } = await supabase
        .from("quiz_respostas")
        .insert({
          quiz_id: quizId,
          resposta_selecionada,
          acertou,
          user_id: user.id,
        });
      
      if (error) {
        console.error("❌ Error saving answer:", error);
      } else {
        console.log("✅ Answer saved successfully");
      }
      
      return { acertou, explicacao: quiz.explicacao };
    } catch (error) {
      console.error("❌ Error saving answer:", error);
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