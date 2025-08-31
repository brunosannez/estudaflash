
import { useState, useCallback, useRef } from 'react';

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

  // Add ref to prevent concurrent updates
  const updateInProgress = useRef(false);

  const setResumo = useCallback((resumo: any) => {
    if (updateInProgress.current) return;
    setState(prev => ({ ...prev, resumo }));
  }, []);

  const setQuizzes = useCallback((quizzes: any[]) => {
    if (updateInProgress.current) return;
    setState(prev => ({ ...prev, quizzes }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    updateInProgress.current = isLoading;
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
