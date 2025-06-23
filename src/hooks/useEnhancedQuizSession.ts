
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EnhancedQuizSessionData {
  sessionId: string;
  resumoId: string;
  resumoContent: string;
  questoes: any[];
  currentQuestionIndex: number;
  respostas: any[];
  startTime: number;
  status: 'in_progress' | 'completed' | 'paused';
}

export const useEnhancedQuizSession = () => {
  const [sessionData, setSessionData] = useState<EnhancedQuizSessionData | null>(null);
  const { toast } = useToast();

  const startNewSession = async (resumoId: string, resumoContent: string, questoes: any[]) => {
    try {
      console.log('🚀 Starting new enhanced quiz session:', { resumoId, questionsCount: questoes.length });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const quizTitle = `Quiz - ${questoes.length} questões`;
      
      // Create new session in database
      const { data: newSession, error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          resumo_id: resumoId,
          quiz_title: quizTitle,
          total_questions: questoes.length,
          correct_answers: 0,
          status: 'in_progress',
          current_question_index: 0,
          progress_percentage: 0,
          questions_data: questoes.map((q, index) => ({
            index,
            id: q.id,
            pergunta: q.pergunta,
            alternativas: q.alternativas,
            resposta_correta: q.correta || q.resposta_correta,
            explicacao: q.explicacao
          }))
        })
        .select()
        .single();

      if (sessionError) {
        console.error('❌ Error creating quiz session:', sessionError);
        throw sessionError;
      }

      console.log('✅ New quiz session created:', newSession);

      setSessionData({
        sessionId: newSession.id,
        resumoId,
        resumoContent,
        questoes,
        currentQuestionIndex: 0,
        respostas: [],
        startTime: Date.now(),
        status: 'in_progress'
      });

      return newSession.id;
    } catch (error) {
      console.error("❌ Error starting enhanced quiz session:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o quiz.",
        variant: "destructive",
      });
      return null;
    }
  };

  const resumeSession = async (sessionId: string) => {
    try {
      console.log('🔄 Resuming enhanced quiz session:', sessionId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Get session data
      const { data: session, error: sessionError } = await supabase
        .from('quiz_sessions')
        .select(`
          *,
          resumos!inner(
            resumo_gerado,
            custom_name,
            uploads!inner(arquivo_original_nome)
          )
        `)
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (sessionError || !session) {
        console.error('❌ Error fetching session:', sessionError);
        throw new Error('Sessão não encontrada');
      }

      // Get existing attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('session_id', sessionId)
        .order('answered_at');

      if (attemptsError) {
        console.error('❌ Error fetching attempts:', attemptsError);
        throw attemptsError;
      }

      console.log('📊 Resuming session with data:', { session, attempts });

      // Parse questions data
      let questoes = [];
      try {
        if (typeof session.questions_data === 'string') {
          questoes = JSON.parse(session.questions_data);
        } else if (Array.isArray(session.questions_data)) {
          questoes = session.questions_data as any[];
        }
      } catch (parseError) {
        console.error('Error parsing questions_data:', parseError);
        questoes = [];
      }

      const resumoContent = session.resumos?.resumo_gerado || 'Conteúdo não disponível';

      setSessionData({
        sessionId,
        resumoId: session.resumo_id,
        resumoContent,
        questoes,
        currentQuestionIndex: session.current_question_index || 0,
        respostas: attempts || [],
        startTime: new Date(session.started_at || session.created_at).getTime(),
        status: session.status as 'in_progress' | 'completed' | 'paused'
      });

      return session;
    } catch (error) {
      console.error("❌ Error resuming enhanced quiz session:", error);
      toast({
        title: "Erro",
        description: "Não foi possível retomar o quiz.",
        variant: "destructive",
      });
      return null;
    }
  };

  const saveQuestionResponse = async (questionId: string, selectedAnswer: number, isCorrect: boolean) => {
    if (!sessionData) {
      console.error('❌ No session data available for saving response');
      return;
    }

    try {
      console.log('💾 Saving question response:', { questionId, selectedAnswer, isCorrect });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Save individual attempt
      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          resumo_id: sessionData.resumoId,
          quiz_question_id: questionId,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          session_id: sessionData.sessionId
        })
        .select()
        .single();

      if (attemptError) {
        console.error('❌ Error saving attempt:', attemptError);
        throw attemptError;
      }

      console.log('✅ Question response saved:', attempt);

      // Update local session data
      setSessionData(prev => prev ? {
        ...prev,
        respostas: [...prev.respostas, attempt],
        currentQuestionIndex: prev.currentQuestionIndex + 1
      } : null);

      // Update session progress
      await updateSessionProgress();

      return attempt;
    } catch (error) {
      console.error("❌ Error saving question response:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a resposta.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateSessionProgress = async () => {
    if (!sessionData) return;

    try {
      const { error } = await supabase
        .from('quiz_sessions')
        .update({
          current_question_index: sessionData.currentQuestionIndex,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', sessionData.sessionId);

      if (error) {
        console.error('❌ Error updating session progress:', error);
        throw error;
      }

      console.log('✅ Session progress updated');
    } catch (error) {
      console.error("❌ Error updating session progress:", error);
    }
  };

  const completeSession = async () => {
    if (!sessionData) {
      console.error('❌ No session data to complete');
      return null;
    }

    try {
      const completionTime = Math.floor((Date.now() - sessionData.startTime) / 1000);
      
      // Mark session as completed
      const { error: updateError } = await supabase
        .from('quiz_sessions')
        .update({
          status: 'completed',
          completion_time_seconds: completionTime,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', sessionData.sessionId);

      if (updateError) {
        console.error('❌ Error completing session:', updateError);
        throw updateError;
      }

      console.log('✅ Quiz session completed successfully');

      toast({
        title: "Sucesso!",
        description: `Quiz concluído! Você acertou ${sessionData.respostas.filter(r => r.is_correct).length} de ${sessionData.questoes.length} questões.`,
      });

      // Reset session data
      setSessionData(null);

      return {
        sessionId: sessionData.sessionId,
        correctAnswers: sessionData.respostas.filter(r => r.is_correct).length,
        totalQuestions: sessionData.questoes.length,
        completionTime
      };
    } catch (error) {
      console.error("❌ Error completing enhanced quiz session:", error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar o quiz.",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    sessionData,
    startNewSession,
    resumeSession,
    saveQuestionResponse,
    updateSessionProgress,
    completeSession
  };
};
