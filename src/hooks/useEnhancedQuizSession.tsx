
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
      console.log('🚀 Starting bulletproof quiz session:', { resumoId, questionsCount: questoes.length });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const quizTitle = `Quiz - ${questoes.length} questões`;
      
      // Prepare questions with bulletproof structure
      const questionsData = questoes.map((q, index) => ({
        index,
        id: q.id || `q_${index}`,
        pergunta: q.pergunta,
        alternativas: Array.isArray(q.alternativas) ? q.alternativas : [],
        correta: Number.isInteger(q.correta) ? q.correta : 0, // Bulletproof: always integer
        explicacao: q.explicacao || 'Explicação não disponível'
      }));

      console.log('🔒 Bulletproof questions structure:', questionsData.map(q => ({
        id: q.id,
        correta: q.correta,
        type: typeof q.correta,
        alternativasCount: q.alternativas.length
      })));
      
      // Create session with bulletproof data
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
          questions_data: questionsData
        })
        .select()
        .single();

      if (sessionError) {
        console.error('❌ Error creating quiz session:', sessionError);
        throw sessionError;
      }

      console.log('✅ Bulletproof quiz session created:', newSession);

      setSessionData({
        sessionId: newSession.id,
        resumoId,
        resumoContent,
        questoes: questionsData,
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
      console.log('🔄 Resuming bulletproof session:', sessionId);
      
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

      // Parse questions with bulletproof structure
      let questoes = [];
      try {
        if (typeof session.questions_data === 'string') {
          questoes = JSON.parse(session.questions_data);
        } else if (Array.isArray(session.questions_data)) {
          questoes = session.questions_data as any[];
        }
        
        // Bulletproof structure validation
        questoes = questoes.map((q, index) => ({
          ...q,
          id: q.id || `q_${index}`,
          correta: Number.isInteger(q.correta) ? q.correta : 0,
          alternativas: Array.isArray(q.alternativas) ? q.alternativas : []
        }));
      } catch (parseError) {
        console.error('Error parsing questions_data:', parseError);
        questoes = [];
      }

      const resumoContent = session.resumos?.resumo_gerado || 'Conteúdo não disponível';
      const currentIndex = Math.max(0, attempts?.length || 0);

      console.log('📊 Resuming with bulletproof data:', { 
        sessionId, 
        currentIndex, 
        totalQuestions: questoes.length,
        attemptsCount: attempts?.length || 0
      });

      setSessionData({
        sessionId,
        resumoId: session.resumo_id,
        resumoContent,
        questoes,
        currentQuestionIndex: currentIndex,
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
      console.log('💾 Saving bulletproof response:', { 
        questionId, 
        selectedAnswer, 
        isCorrect,
        sessionId: sessionData.sessionId
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Save attempt with bulletproof validation
      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          resumo_id: sessionData.resumoId,
          quiz_question_id: questionId,
          selected_answer: Number(selectedAnswer),
          is_correct: Boolean(isCorrect),
          session_id: sessionData.sessionId
        })
        .select()
        .single();

      if (attemptError) {
        console.error('❌ Error saving attempt:', attemptError);
        throw attemptError;
      }

      console.log('✅ Bulletproof response saved:', attempt);

      // Update local session data
      setSessionData(prev => prev ? {
        ...prev,
        respostas: [...prev.respostas, attempt]
      } : null);

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

      console.log('✅ Bulletproof session completed successfully');

      const correctCount = sessionData.respostas.filter(r => r.is_correct).length;
      
      toast({
        title: "Sucesso!",
        description: `Quiz concluído! Você acertou ${correctCount} de ${sessionData.questoes.length} questões.`,
      });

      // Reset session data
      setSessionData(null);

      return {
        sessionId: sessionData.sessionId,
        correctAnswers: correctCount,
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
    completeSession
  };
};
