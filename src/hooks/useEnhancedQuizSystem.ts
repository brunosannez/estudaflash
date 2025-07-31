import { useState, useEffect, useCallback } from 'react';
import { enhancedQuizService } from '@/services/enhancedQuizService';
import { useGameification } from '@/hooks/useGameification';
import { useToast } from '@/hooks/use-toast';
import { 
  QuizConfiguration, 
  EnhancedQuizSession, 
  EnhancedQuizAttempt,
  QuizPerformanceStats, 
  QuizBadge, 
  QuizAnalytics,
  QuizSessionConfig,
  QuizPerformanceReport,
  WeakTopic
} from '@/types/enhancedQuiz';

interface QuizSystemState {
  // Configurations
  configurations: QuizConfiguration[];
  activeConfiguration: QuizConfiguration | null;
  
  // Current Session
  currentSession: EnhancedQuizSession | null;
  currentQuestionIndex: number;
  userAnswers: (number | null)[];
  sessionStartTime: number;
  
  // Performance & Analytics
  todayStats: QuizPerformanceStats | null;
  weeklyStats: QuizPerformanceStats[];
  analytics: QuizAnalytics | null;
  badges: QuizBadge[];
  weakTopics: WeakTopic[];
  
  // UI State
  isLoading: boolean;
  isSessionActive: boolean;
  showExplanation: boolean;
  selectedAnswer: number | null;
  timeRemaining: number;
  hintsUsed: number;
  
  // Results
  lastSessionReport: QuizPerformanceReport | null;
}

export const useEnhancedQuizSystem = () => {
  const { addXP } = useGameification();
  const { toast } = useToast();
  
  const [state, setState] = useState<QuizSystemState>({
    configurations: [],
    activeConfiguration: null,
    currentSession: null,
    currentQuestionIndex: 0,
    userAnswers: [],
    sessionStartTime: 0,
    todayStats: null,
    weeklyStats: [],
    analytics: null,
    badges: [],
    weakTopics: [],
    isLoading: false,
    isSessionActive: false,
    showExplanation: false,
    selectedAnswer: null,
    timeRemaining: 0,
    hintsUsed: 0,
    lastSessionReport: null
  });

  // Initialize data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const [configurations, todayStats, analytics, badges] = await Promise.all([
        enhancedQuizService.getQuizConfigurations(),
        enhancedQuizService.getTodayStats(),
        enhancedQuizService.getQuizAnalytics(),
        enhancedQuizService.getUserBadges()
      ]);

      setState(prev => ({
        ...prev,
        configurations,
        todayStats,
        analytics,
        badges,
        weakTopics: analytics?.weakestTopics || [],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error loading quiz data:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados do quiz',
        variant: 'destructive'
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [toast]);

  // Configuration Management
  const createConfiguration = useCallback(async (config: Omit<QuizConfiguration, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newConfig = await enhancedQuizService.createQuizConfiguration(config);
      setState(prev => ({
        ...prev,
        configurations: [newConfig, ...prev.configurations]
      }));
      
      toast({
        title: 'Sucesso',
        description: 'Configuração de quiz criada!'
      });
      
      return newConfig;
    } catch (error) {
      console.error('Error creating configuration:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar configuração',
        variant: 'destructive'
      });
      throw error;
    }
  }, [toast]);

  const updateConfiguration = useCallback(async (id: string, updates: Partial<QuizConfiguration>) => {
    try {
      const updatedConfig = await enhancedQuizService.updateQuizConfiguration(id, updates);
      setState(prev => ({
        ...prev,
        configurations: prev.configurations.map(c => 
          c.id === id ? updatedConfig : c
        )
      }));
      
      toast({
        title: 'Sucesso',
        description: 'Configuração atualizada!'
      });
      
      return updatedConfig;
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar configuração',
        variant: 'destructive'
      });
      throw error;
    }
  }, [toast]);

  const deleteConfiguration = useCallback(async (id: string) => {
    try {
      await enhancedQuizService.deleteQuizConfiguration(id);
      setState(prev => ({
        ...prev,
        configurations: prev.configurations.filter(c => c.id !== id)
      }));
      
      toast({
        title: 'Sucesso',
        description: 'Configuração removida!'
      });
    } catch (error) {
      console.error('Error deleting configuration:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover configuração',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Session Management
  const startQuizSession = useCallback(async (
    resumoId: string,
    quizTitle: string,
    questionsData: any[],
    config: QuizSessionConfig = {}
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const session = await enhancedQuizService.createEnhancedQuizSession(
        resumoId,
        quizTitle,
        questionsData,
        config
      );

      const timeLimit = config.timeLimit ? config.timeLimit * 60 : questionsData.length * 30;

      setState(prev => ({
        ...prev,
        currentSession: session,
        currentQuestionIndex: 0,
        userAnswers: new Array(questionsData.length).fill(null),
        sessionStartTime: Date.now(),
        isSessionActive: true,
        isLoading: false,
        selectedAnswer: null,
        showExplanation: false,
        timeRemaining: timeLimit,
        hintsUsed: 0
      }));

      toast({
        title: 'Quiz Iniciado!',
        description: `${questionsData.length} questões para responder`
      });

      return session;
    } catch (error) {
      console.error('Error starting quiz session:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Erro',
        description: 'Falha ao iniciar quiz',
        variant: 'destructive'
      });
      throw error;
    }
  }, [toast]);

  const selectAnswer = useCallback((answerIndex: number) => {
    if (state.showExplanation || !state.isSessionActive) return;
    
    setState(prev => ({ ...prev, selectedAnswer: answerIndex }));
  }, [state.showExplanation, state.isSessionActive]);

  const submitAnswer = useCallback(async () => {
    if (!state.currentSession || state.selectedAnswer === null || !state.isSessionActive) return;

    const currentQuestion = state.currentSession.questions_data[state.currentQuestionIndex];
    const isCorrect = state.selectedAnswer === currentQuestion.correta;
    
    try {
      // Save attempt
      const attemptData: Omit<EnhancedQuizAttempt, 'id' | 'created_at'> = {
        user_id: state.currentSession.user_id,
        resumo_id: state.currentSession.resumo_id,
        quiz_question_id: currentQuestion.id,
        session_id: state.currentSession.id,
        selected_answer: state.selectedAnswer,
        is_correct: isCorrect,
        confidence_level: 3, // Could be collected from UI
        time_taken_seconds: Math.floor((Date.now() - state.sessionStartTime) / 1000),
        hint_used: false, // Track if user used hint for this question
        difficulty_perceived: 3, // Could be collected from UI
        explanation_viewed: false,
        answered_at: new Date().toISOString()
      };

      await enhancedQuizService.saveQuizAttempt(attemptData);

      // Update local state
      const newUserAnswers = [...state.userAnswers];
      newUserAnswers[state.currentQuestionIndex] = state.selectedAnswer;

      const newCorrectAnswers = state.currentSession.correct_answers + (isCorrect ? 1 : 0);
      const newProgressPercentage = Math.round(((state.currentQuestionIndex + 1) / state.currentSession.total_questions) * 100);

      // Update session in database
      await enhancedQuizService.updateQuizSession(state.currentSession.id, {
        correct_answers: newCorrectAnswers,
        current_question_index: state.currentQuestionIndex + 1,
        progress_percentage: newProgressPercentage
      });

      setState(prev => ({
        ...prev,
        userAnswers: newUserAnswers,
        showExplanation: true,
        currentSession: prev.currentSession ? {
          ...prev.currentSession,
          correct_answers: newCorrectAnswers,
          current_question_index: state.currentQuestionIndex + 1,
          progress_percentage: newProgressPercentage
        } : null
      }));

      // Add XP for attempt
      if (isCorrect) {
        await addXP(10, 'quiz_correct');
        toast({
          title: '🎉 Correto! +10 XP',
          description: 'Excelente resposta!',
          duration: 2000
        });
      } else {
        await addXP(2, 'quiz_incorrect');
        toast({
          title: '😅 Incorreto, mas +2 XP por tentar!',
          description: 'Continue tentando!',
          duration: 2000
        });
      }

    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar resposta',
        variant: 'destructive'
      });
    }
  }, [state, addXP, toast]);

  const nextQuestion = useCallback(() => {
    if (!state.currentSession) return;

    if (state.currentQuestionIndex < state.currentSession.total_questions - 1) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        showExplanation: false
      }));
    } else {
      finishSession();
    }
  }, [state.currentSession, state.currentQuestionIndex]);

  const finishSession = useCallback(async () => {
    if (!state.currentSession) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const report = await enhancedQuizService.completeQuizSession(state.currentSession.id);
      
      // Update analytics and badges
      const [updatedAnalytics, updatedBadges] = await Promise.all([
        enhancedQuizService.getQuizAnalytics(),
        enhancedQuizService.getUserBadges()
      ]);

      setState(prev => ({
        ...prev,
        isSessionActive: false,
        lastSessionReport: report,
        analytics: updatedAnalytics,
        badges: updatedBadges,
        isLoading: false
      }));

      // Show completion notification
      toast({
        title: '🎯 Quiz Concluído!',
        description: `Pontuação: ${Math.round(report.overallScore)} | Precisão: ${Math.round(report.accuracy)}%`,
        duration: 5000
      });

      // Show new badges
      if (report.newBadges.length > 0) {
        report.newBadges.forEach(badge => {
          toast({
            title: `🏆 Nova conquista: ${badge.badge_name}`,
            description: badge.badge_description,
            duration: 4000
          });
        });
      }

    } catch (error) {
      console.error('Error finishing session:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Erro',
        description: 'Falha ao finalizar quiz',
        variant: 'destructive'
      });
    }
  }, [state.currentSession, toast]);

  const useHint = useCallback(() => {
    if (!state.isSessionActive || state.showExplanation) return;

    setState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1
    }));

    toast({
      title: '💡 Dica usada',
      description: 'Lembre-se: usar dicas reduz sua pontuação',
      duration: 3000
    });
  }, [state.isSessionActive, state.showExplanation, toast]);

  const resetSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentSession: null,
      currentQuestionIndex: 0,
      userAnswers: [],
      sessionStartTime: 0,
      isSessionActive: false,
      selectedAnswer: null,
      showExplanation: false,
      timeRemaining: 0,
      hintsUsed: 0,
      lastSessionReport: null
    }));
  }, []);

  // Timer management
  useEffect(() => {
    if (!state.isSessionActive || state.timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          // Auto-finish session when time runs out
          finishSession();
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isSessionActive, state.timeRemaining, finishSession]);

  // Analytics refresh
  const refreshAnalytics = useCallback(async () => {
    try {
      const [analytics, badges, todayStats] = await Promise.all([
        enhancedQuizService.getQuizAnalytics(),
        enhancedQuizService.getUserBadges(),
        enhancedQuizService.getTodayStats()
      ]);

      setState(prev => ({
        ...prev,
        analytics,
        badges,
        todayStats,
        weakTopics: analytics?.weakestTopics || []
      }));
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    }
  }, []);

  return {
    // State
    ...state,
    
    // Configuration Management
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    
    // Session Management
    startQuizSession,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    finishSession,
    useHint,
    resetSession,
    
    // Utilities
    refreshAnalytics,
    loadInitialData,
    
    // Computed values
    currentQuestion: state.currentSession?.questions_data[state.currentQuestionIndex] || null,
    progress: state.currentSession ? (state.currentQuestionIndex / state.currentSession.total_questions) * 100 : 0,
    canSubmit: state.selectedAnswer !== null && !state.showExplanation && state.isSessionActive,
    canProceed: state.showExplanation && state.isSessionActive,
    isLastQuestion: state.currentSession ? state.currentQuestionIndex === state.currentSession.total_questions - 1 : false,
    sessionStats: state.currentSession ? {
      correct: state.currentSession.correct_answers,
      total: state.currentSession.total_questions,
      accuracy: state.currentSession.total_questions > 0 ? 
        (state.currentSession.correct_answers / state.currentSession.total_questions) * 100 : 0,
      timeSpent: Math.floor((Date.now() - state.sessionStartTime) / 1000),
      hintsUsed: state.hintsUsed
    } : null
  };
};