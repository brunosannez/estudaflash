
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateQuizTitle, calculateCompletionTime, analyzePerformance } from "@/utils/quizUtils";

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
    
    setSessionData(prev => prev ? {
      ...prev,
      respostas: [...prev.respostas, response]
    } : null);
  };

  const completeSession = async () => {
    if (!sessionData) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const completionTime = calculateCompletionTime(sessionData.startTime);
      const correctAnswers = sessionData.respostas.filter(r => r.acertou).length;
      const quizTitle = generateQuizTitle(sessionData.resumoContent);
      
      // Análise de performance
      const performance = analyzePerformance(sessionData.questoes, sessionData.respostas);

      // Dados detalhados das questões para salvar
      const questionsData = sessionData.questoes.map((questao, index) => ({
        pergunta: questao.pergunta,
        alternativas: questao.alternativas,
        resposta_correta: questao.resposta_correta,
        explicacao: questao.explicacao,
        resposta_usuario: sessionData.respostas[index]?.resposta_selecionada,
        acertou: sessionData.respostas[index]?.acertou || false
      }));

      // Salvar sessão no banco
      const { data: sessionRecord, error } = await supabase
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

      if (error) throw error;

      console.log('✅ Sessão de quiz salva:', sessionRecord);

      // Resetar dados da sessão
      setSessionData(null);

      return {
        sessionId: sessionRecord.id,
        quizTitle,
        correctAnswers,
        totalQuestions: sessionData.questoes.length,
        completionTime,
        performance,
        questionsData
      };

    } catch (error) {
      console.error("Erro ao salvar sessão:", error);
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
