
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { summaryDataService } from '@/services/summaryDataService';
import { toast } from 'sonner';

export const useQuizDataLoader = () => {
  const loadQuizData = useCallback(async (id: string) => {
    console.log('🔍 Loading quiz data for ID:', id);
    
    try {
      // Load summary first
      const resumoData = await summaryDataService.getResumoById(id);
      
      if (!resumoData) {
        throw new Error('Resumo não encontrado');
      }

      console.log('📄 Summary loaded successfully');

      // Load existing quizzes with validation
      const { data: existingQuizzes, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('resumo_id', id)
        .not('pergunta', 'is', null)
        .not('alternativas', 'is', null)
        .gte('correta', 0)
        .lte('correta', 4)
        .order('data_criacao', { ascending: true });

      if (quizError) {
        console.error('❌ Error loading quizzes:', quizError);
        throw quizError;
      }

      // Validate quiz structure
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
      console.error('❌ Error loading quiz data:', error);
      throw error;
    }
  }, []);

  const generateQuiz = useCallback(async (resumo: any, resumoId: string) => {
    if (!resumo?.resumo_gerado) {
      throw new Error('Conteúdo do resumo não disponível');
    }

    console.log('🚀 Starting quiz generation...');

    // Double-check for existing quizzes
    const { data: existingCheck } = await supabase
      .from('quizzes')
      .select('id')
      .eq('resumo_id', resumoId)
      .limit(1);

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

  return {
    loadQuizData,
    generateQuiz
  };
};
