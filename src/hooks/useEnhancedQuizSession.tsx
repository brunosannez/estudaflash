
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

      // Check for existing active session
      const { data: existingSession } = await supabase
        .from('quiz_sessions')
        .select('id, status')
        .eq('resumo_id', resumoId)
        .eq('user_id', user.id)
        .in('status', ['in_progress', 'paused'])
        .maybeSingle();

      if (existingSession) {
        console.log('📋 Found existing session, resuming:', existingSession.id);
        return await resumeSession(existingSession.id);
      }

      const quizTitle = `Quiz - ${questoes.length} questões`;
      
      // Prepare questions with validation
      const questionsData = questoes.map((q, index) => ({
        index,
        id: q.id || `q_${index}`,
        pergunta: q.pergunta,
        alternativas: Array.isArray(q.alternativas) ? q.alternativas : [],
        correta: Number.isInteger(q.correta) ? q.correta : 0,
        explicacao: q.explicacao || 'Explicação não disponível'
      }));

      console.log('🔒 Creating session with validated data:', questionsData.length, 'questions');
      
      // Create session
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

      console.log('✅ Quiz session created successfully:', newSession.id);

      // Set session data immediately
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
      console.log('🔄 Resuming enhanced quiz session:', sessionId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Get session data with enhanced validation
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
        throw new Error('Sessão não encontrada ou expirada');
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

      // Parse questions with enhanced validation
      let questoes = [];
      try {
        if (typeof session.questions_data === 'string') {
          questoes = JSON.parse(session.questions_data);
        } else if (Array.isArray(session.questions_data)) {
          questoes = session.questions_data as any[];
        }
        
        // Validate and repair question structure
        questoes = questoes.map((q, index) => ({
          ...q,
          id: q.id || `q_${index}`,
          correta: Number.isInteger(q.correta) ? q.correta : 0,
          alternativas: Array.isArray(q.alternativas) ? q.alternativas : []
        }));

        // If no valid questions, try to get from quizzes table
        if (questoes.length === 0) {
          console.warn('⚠️ No questions in session data, fetching from quizzes table');
          const { data: quizzesData } = await supabase
            .from('quizzes')
            .select('*')
            .eq('resumo_id', session.resumo_id)
            .order('data_criacao');

          if (quizzesData && quizzesData.length > 0) {
            questoes = quizzesData.map((q, index) => ({
              index,
              id: q.id,
              pergunta: q.pergunta,
              alternativas: q.alternativas,
              correta: q.correta,
              explicacao: q.explicacao
            }));
            console.log('✅ Recovered questions from quizzes table:', questoes.length);
          }
        }
      } catch (parseError) {
        console.error('❌ Error parsing questions_data:', parseError);
        questoes = [];
      }

      if (questoes.length === 0) {
        throw new Error('Não foi possível carregar as questões do quiz');
      }

      const resumoContent = session.resumos?.resumo_gerado || 'Conteúdo não disponível';
      
      // Calculate correct current index based on attempts
      const answeredCount = attempts?.length || 0;
      const currentIndex = Math.min(answeredCount, questoes.length - 1);
      
      // Fix progress calculation
      const progressPercentage = questoes.length > 0 
        ? Math.round((answeredCount / questoes.length) * 100) 
        : 0;

      console.log('📊 Resuming with corrected data:', { 
        sessionId, 
        currentIndex, 
        totalQuestions: questoes.length,
        attemptsCount: answeredCount,
        progressPercentage
      });

      // Update session with corrected data if needed
      if (session.current_question_index !== currentIndex || 
          session.progress_percentage !== progressPercentage) {
        console.log('🔧 Updating session with corrected progress data');
        await supabase
          .from('quiz_sessions')
          .update({
            current_question_index: currentIndex,
            progress_percentage: progressPercentage,
            last_activity_at: new Date().toISOString()
          })
          .eq('id', sessionId);
      }

      // Set session data immediately
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
        description: "Não foi possível retomar o quiz. Tente iniciar um novo.",
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
      console.log('💾 Saving response:', { 
        questionId, 
        selectedAnswer, 
        isCorrect,
        sessionId: sessionData.sessionId
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Save attempt
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

      console.log('✅ Response saved successfully:', attempt);

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

      console.log('✅ Session completed successfully');

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
