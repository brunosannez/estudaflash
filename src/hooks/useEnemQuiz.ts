import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { edgeFunctionInvoker } from '@/services/edgeFunctionInvoker';
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

    if (!resumoContent || resumoContent.trim().length < 100) {
      toast.error('Conteúdo do resumo muito pequeno para gerar quiz');
      return null;
    }

    setGenerating(true);
    
    try {
      console.log('🚀 Starting ENEM quiz generation...');
      console.log('📝 ResumoId:', resumoId);
      console.log('📊 Content length:', resumoContent?.length);
      console.log('👤 UserId:', user.id);
      
      // Usar o invoker com Authorization header explícito
      const { data, error } = await edgeFunctionInvoker.invoke('generate-enem-quiz', {
        resumoId,
        resumoContent,
        userId: user.id
      });

      console.log('🔍 Edge function response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        
        // More specific error messages
        if (error.message?.includes('Rate limit')) {
          toast.error('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
        } else if (error.message?.includes('API key')) {
          toast.error('Erro de configuração do sistema. Contate o suporte.');
        } else if (error.message?.includes('400')) {
          toast.error('Erro na requisição. Tente novamente com um resumo diferente.');
        } else if (error.message?.includes('Sessão expirada')) {
          toast.error('Sessão expirada. Faça login novamente.');
        } else {
          toast.error(`Erro na geração: ${error.message}`);
        }
        return null;
      }

      if (!data?.success) {
        console.error('❌ Quiz generation failed:', data);
        const errorMsg = data?.error || 'Falha na geração do quiz';
        
        if (errorMsg.includes('Rate limit')) {
          toast.error('Limite de requisições atingido. Aguarde alguns minutos.');
        } else if (errorMsg.includes('insufficient questions')) {
          toast.error('Resumo muito pequeno. Adicione mais conteúdo.');
        } else {
          toast.error(`Erro: ${errorMsg}`);
        }
        return null;
      }

      console.log('✅ ENEM quiz generated successfully:', data);
      
      toast.success(`Quiz ENEM gerado com sucesso! ${data.totalQuestions} questões criadas.`, {
        duration: 4000
      });
      
      return data.quizMetadataId;

    } catch (error) {
      console.error('❌ Error generating ENEM quiz:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage.includes('Failed to fetch')) {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else if (errorMessage.includes('timeout')) {
        toast.error('Tempo limite excedido. O resumo pode ser muito longo.');
      } else {
        toast.error(`Erro ao gerar quiz ENEM: ${errorMessage}`);
      }
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const getQuizMetadata = async (resumoId: string): Promise<EnemQuizMetadata | null> => {
    if (!user) return null;

    setLoading(true);
    
    try {
      // Get the most recent quiz for this resumo
      const { data, error } = await supabase
        .from('enem_quiz_metadata')
        .select('*')
        .eq('resumo_id', resumoId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching quiz metadata:', error);
        throw new Error(error.message);
      }

      if (!data) {
        return null;
      }

      return parseQuizMetadata(data);

    } catch (error) {
      console.error('❌ Error fetching quiz metadata:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lista todos os quizzes de um resumo (suporte a múltiplos quizzes)
   */
  const listQuizMetadata = async (resumoId: string): Promise<EnemQuizMetadata[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('enem_quiz_metadata')
        .select('*')
        .eq('resumo_id', resumoId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error listing quiz metadata:', error);
        return [];
      }

      return (data || []).map(parseQuizMetadata);

    } catch (error) {
      console.error('❌ Error listing quiz metadata:', error);
      return [];
    }
  };

  /**
   * Verifica se já existe quiz para um resumo
   */
  const checkExistingQuiz = async (resumoId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { count, error } = await supabase
        .from('enem_quiz_metadata')
        .select('id', { count: 'exact', head: true })
        .eq('resumo_id', resumoId);

      if (error) {
        console.error('❌ Error checking existing quiz:', error);
        return false;
      }

      return (count || 0) > 0;

    } catch (error) {
      console.error('❌ Error checking existing quiz:', error);
      return false;
    }
  };

  const parseQuizMetadata = (data: any): EnemQuizMetadata => {
    return {
      ...data,
      macrothemes: Array.isArray(data.macrothemes) ? data.macrothemes as string[] : [],
      targets: data.targets as { objetivas: number; vf_sequenciais: number },
      generated: data.generated as { objetivas: number; vf_sequenciais: number },
      coverage_map: Array.isArray(data.coverage_map) 
        ? (data.coverage_map as any[]).map(item => ({
            macrotema: typeof item === 'object' && item?.macrotema ? item.macrotema : String(item),
            objetivas: typeof item === 'object' && item?.objetivas ? item.objetivas : 0,
            vf_sequenciais: typeof item === 'object' && item?.vf_sequenciais ? item.vf_sequenciais : 0
          }))
        : [],
      quality_checks: data.quality_checks as any
    };
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
    listQuizMetadata,
    checkExistingQuiz,
    getQuizQuestions,
    getUserSessions
  };
};
