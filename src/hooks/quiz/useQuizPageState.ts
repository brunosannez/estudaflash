
import { useState, useCallback } from 'react';

interface QuizPageState {
  resumo: any | null;
  quizzes: any[];
  isLoading: boolean;
  generating: boolean;
  error: string | null;
  initialized: boolean;
}

export const useQuizPageState = () => {
  const [state, setState] = useState<QuizPageState>({
    resumo: null,
    quizzes: [],
    isLoading: true,
    generating: false,
    error: null,
    initialized: false
  });

  const setResumo = useCallback((resumo: any) => {
    setState(prev => ({ ...prev, resumo }));
  }, []);

  const setQuizzes = useCallback((quizzes: any[]) => {
    setState(prev => ({ ...prev, quizzes }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setGenerating = useCallback((generating: boolean) => {
    setState(prev => ({ ...prev, generating }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setInitialized = useCallback((initialized: boolean) => {
    setState(prev => ({ ...prev, initialized }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      resumo: null,
      quizzes: [],
      isLoading: true,
      generating: false,
      error: null,
      initialized: false
    });
  }, []);

  return {
    ...state,
    setResumo,
    setQuizzes,
    setLoading,
    setGenerating,
    setError,
    setInitialized,
    resetState
  };
};
