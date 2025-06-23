
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UsageIncrementService } from "@/services/usageIncrementService";

interface QuizSessionData {
  resumoId: string;
  resumoContent: string;
  questoes: any[];
  respostas: any[];
  startTime: number;
}

export const useQuizSession = () => {
  const [sessionData, setSessionData] = useState<QuizSessionData | null>(null);
  const { toast } = useToast();

  const startSession = (resumoId: string, resumoContent: string, questoes: any[]) => {
    console.log('🚀 Starting quiz session:', { resumoId, questionsCount: questoes.length });
    setSessionData({
      resumoId,
      resumoContent,
      questoes,
      respostas: [],
      startTime: Date.now()
    });
  };

  const addResponse = (response: any) => {
    if (!sessionData) return;
    
    console.log('📝 Adding response to session:', response);
    setSessionData(prev => prev ? {
      ...prev,
      respostas: [...prev.respostas, response]
    } : null);
  };

  const completeSession = async () => {
    if (!sessionData) {
      console.error('❌ No session data to complete');
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ User not authenticated');
        throw new Error("Usuário não autenticado");
      }

      const completionTime = Math.floor((Date.now() - sessionData.startTime) / 1000);
      const correctAnswers = sessionData.respostas.filter(r => r.acertou).length;
      const quizTitle = `Quiz - ${sessionData.questoes.length} questões`;
      
      // Dados detalhados das questões para salvar
      const questionsData = sessionData.questoes.map((questao, index) => ({
        pergunta: questao.pergunta,
        alternativas: questao.alternativas,
        resposta_correta: questao.correta,
        explicacao: questao.explicacao,
        resposta_usuario: sessionData.respostas[index]?.resposta_selecionada,
        acertou: sessionData.respostas[index]?.acertou || false
      }));

      console.log('💾 Saving quiz session to database:', {
        user_id: user.id,
        resumo_id: sessionData.resumoId,
        quiz_title: quizTitle,
        total_questions: sessionData.questoes.length,
        correct_answers: correctAnswers,
        completion_time_seconds: completionTime
      });

      // Salvar sessão no banco em uma transação
      const { data: sessionRecord, error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          resumo_id: sessionData.resumoId,
          quiz_title: quizTitle,
          total_questions: sessionData.questoes.length,
          correct_answers: correctAnswers,
          completion_time_seconds: completionTime,
          questions_data: questionsData
        })
        .select()
        .single();

      if (sessionError) {
        console.error('❌ Error saving quiz session:', sessionError);
        throw sessionError;
      }

      console.log('✅ Quiz session saved successfully:', sessionRecord);

      // Incrementar contador de uso após salvar com sucesso
      try {
        await UsageIncrementService.incrementUsage(user.id, 'quizzes');
        console.log('✅ Usage counter incremented successfully');
      } catch (usageError) {
        console.error('⚠️ Warning: Failed to increment usage counter:', usageError);
        // Não falhar a operação principal se o incremento falhar
      }

      // Resetar dados da sessão
      setSessionData(null);

      return {
        sessionId: sessionRecord.id,
        quizTitle,
        correctAnswers,
        totalQuestions: sessionData.questoes.length,
        completionTime,
        questionsData
      };

    } catch (error) {
      console.error("❌ Error completing quiz session:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o resultado do quiz.",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    sessionData,
    startSession,
    addResponse,
    completeSession
  };
};
