import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { summaryDataService } from '@/services/summaryDataService';
import { toast } from 'sonner';

export const useOptimizedQuizDataLoader = () => {
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadQuizData = useCallback(async (id: string) => {
    // Prevent concurrent loading
    if (loadingRef.current) {
      console.warn('⚠️ Quiz data loading already in progress, skipping');
      return { resumo: null, quizzes: [] };
    }

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    console.log('🔍 Loading quiz data for ID:', id);
    loadingRef.current = true;
    abortControllerRef.current = new AbortController();
    
    try {
      // Load summary with timeout
      const resumoData = await Promise.race([
        summaryDataService.getResumoById(id),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout loading summary')), 10000)
        )
      ]);
      
      if (!resumoData) {
        throw new Error('Resumo não encontrado');
      }

      console.log('📄 Summary loaded successfully');

      // Load existing quizzes with validation and timeout
      const quizPromise = supabase
        .from('quizzes')
        .select('*')
        .eq('resumo_id', id)
        .not('pergunta', 'is', null)
        .not('alternativas', 'is', null)
        .gte('correta', 0)
        .lte('correta', 4)
        .order('data_criacao', { ascending: true })
        .abortSignal(abortControllerRef.current.signal);

      const { data: existingQuizzes, error: quizError } = await Promise.race([
        quizPromise,
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout loading quizzes')), 8000)
        )
      ]) as any;

      if (quizError && quizError.name !== 'AbortError') {
        console.error('❌ Error loading quizzes:', quizError);
        throw quizError;
      }

      // Validate quiz structure efficiently
      const validQuizzes = (existingQuizzes || []).filter(quiz => {
        const isValid = quiz.pergunta && 
                       Array.isArray(quiz.alternativas) && 
                       quiz.alternativas.length === 5 &&
                       Number.isInteger(quiz.correta) &&
                       quiz.correta >= 0 && 
                       quiz.correta <= 4;
        
        if (!isValid) {
          console.warn('❌ Invalid quiz found and filtered out:', quiz.id);
        }
        
        return isValid;
      });

      console.log('📊 Quiz validation results:', {
        total: existingQuizzes?.length || 0,
        valid: validQuizzes.length,
        invalid: (existingQuizzes?.length || 0) - validQuizzes.length
      });

      return {
        resumo: resumoData,
        quizzes: validQuizzes
      };

    } catch (error) {
      if (error?.name === 'AbortError') {
        console.log('🔄 Quiz data loading aborted');
        return { resumo: null, quizzes: [] };
      }
      
      console.error('❌ Error loading quiz data:', error);
      throw error;
    } finally {
      loadingRef.current = false;
      abortControllerRef.current = null;
    }
  }, []);

  const generateQuiz = useCallback(async (resumo: any, resumoId: string) => {
    if (!resumo?.resumo_gerado) {
      throw new Error('Conteúdo do resumo não disponível');
    }

    console.log('🚀 Starting quiz generation...');

    // Double-check for existing quizzes with timeout
    const existingCheckResult = await Promise.race([
      supabase
        .from('quizzes')
        .select('id')
        .eq('resumo_id', resumoId)
        .limit(1),
      new Promise<any>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout checking existing quizzes')), 5000)
      )
    ]) as any;

    const { data: existingCheck } = existingCheckResult;

    if (existingCheck && existingCheck.length > 0) {
      throw new Error('Quiz já existe para este resumo!');
    }

    const { data, error } = await supabase.functions.invoke('generate-quiz', {
      body: { 
        resumoContent: resumo.resumo_gerado,
        resumoId: resumoId 
      }
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      throw error;
    }

    if (!data.success) {
      console.error('❌ Quiz generation failed:', data.error);
      throw new Error(data.error);
    }

    console.log('✅ Quiz generated successfully:', data);
    toast.success(`Quiz gerado com ${data.questoes.length} questões!`);
    
    return data.questoes;
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    loadingRef.current = false;
  }, []);

  return {
    loadQuizData,
    generateQuiz,
    cleanup
  };
};