import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface EnemQuizMetadata {
  id: string;
  resumo_id: string;
  tema: string;
  idade_usuario: number;
  word_count: number;
  macrothemes: string[];
  targets: {
    objetivas: number;
    vf_sequenciais: number;
  };
  generated: {
    objetivas: number;
    vf_sequenciais: number;
  };
  coverage_map: Array<{
    macrotema: string;
    objetivas: number;
    vf_sequenciais: number;
  }>;
  quality_checks: {
    all_from_summary: boolean;
    age_adapted: boolean;
    balanced_difficulty: boolean;
    balanced_cognitive_levels: boolean;
    coverage_complete: boolean;
    no_duplicates: boolean;
  };
  created_at: string;
}

export const useEnemQuiz = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generateQuiz = async (resumoId: string, resumoContent: string): Promise<string | null> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    setGenerating(true);
    
    try {
      console.log('🚀 Starting ENEM quiz generation...');
      
      const { data, error } = await supabase.functions.invoke('generate-enem-quiz', {
        body: {
          resumoId,
          resumoContent,
          userId: user.id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      console.log('✅ ENEM quiz generated successfully:', data);
      
      toast.success(`Quiz ENEM gerado com sucesso! ${data.totalQuestions} questões criadas.`);
      
      return data.quizMetadataId;

    } catch (error) {
      console.error('❌ Error generating ENEM quiz:', error);
      toast.error('Erro ao gerar quiz ENEM');
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const getQuizMetadata = async (resumoId: string): Promise<EnemQuizMetadata | null> => {
    if (!user) return null;

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('enem_quiz_metadata')
        .select('*')
        .eq('resumo_id', resumoId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      return data;

    } catch (error) {
      console.error('❌ Error fetching quiz metadata:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getQuizQuestions = async (quizMetadataId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('enem_questions')
        .select('*')
        .eq('quiz_metadata_id', quizMetadataId)
        .order('created_at');

      if (error) {
        throw new Error(error.message);
      }

      return data || [];

    } catch (error) {
      console.error('❌ Error fetching quiz questions:', error);
      return [];
    }
  };

  const getUserSessions = async (quizMetadataId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('enem_quiz_sessions')
        .select('*')
        .eq('quiz_metadata_id', quizMetadataId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];

    } catch (error) {
      console.error('❌ Error fetching user sessions:', error);
      return [];
    }
  };

  return {
    loading,
    generating,
    generateQuiz,
    getQuizMetadata,
    getQuizQuestions,
    getUserSessions
  };
};