
import { supabase } from '@/integrations/supabase/client';

interface ConsistencyReport {
  uploadsConsistent: boolean;
  flashcardsConsistent: boolean;
  quizzesConsistent: boolean;
  realCounts: {
    uploads: number;
    flashcards: number;
    quizzes: number;
  };
  recordedCounts: {
    uploads: number;
    flashcards: number;
    quizzes: number;
  };
  discrepancies: string[];
}

export const useConsistencyChecker = () => {
  const checkDataConsistency = async (userId: string): Promise<ConsistencyReport | null> => {
    try {
      console.log('🔍 Verificando consistência de dados para:', userId);

      // Buscar contagens reais das tabelas
      const [uploadsResult, flashcardsResult, quizzesResult, usageResult] = await Promise.all([
        supabase.from('uploads').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('flashcards').select('id', { count: 'exact' }).eq('resumo_id', 
          supabase.from('resumos').select('id').eq('upload_id', 
            supabase.from('uploads').select('id').eq('user_id', userId)
          )
        ),
        supabase.from('quiz_sessions').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('uso_usuarios').select('uploads_realizados, flashcards_gerados, quizzes_realizados').eq('user_id', userId).single()
      ]);

      if (uploadsResult.error || flashcardsResult.error || quizzesResult.error || usageResult.error) {
        throw new Error('Erro ao buscar dados para verificação de consistência');
      }

      const realCounts = {
        uploads: uploadsResult.count || 0,
        flashcards: flashcardsResult.count || 0,
        quizzes: quizzesResult.count || 0
      };

      const recordedCounts = {
        uploads: usageResult.data?.uploads_realizados || 0,
        flashcards: usageResult.data?.flashcards_gerados || 0,
        quizzes: usageResult.data?.quizzes_realizados || 0
      };

      const discrepancies: string[] = [];
      
      if (realCounts.uploads !== recordedCounts.uploads) {
        discrepancies.push(`Uploads: real ${realCounts.uploads} vs registrado ${recordedCounts.uploads}`);
      }
      
      if (realCounts.flashcards !== recordedCounts.flashcards) {
        discrepancies.push(`Flashcards: real ${realCounts.flashcards} vs registrado ${recordedCounts.flashcards}`);
      }
      
      if (realCounts.quizzes !== recordedCounts.quizzes) {
        discrepancies.push(`Quizzes: real ${realCounts.quizzes} vs registrado ${recordedCounts.quizzes}`);
      }

      const report: ConsistencyReport = {
        uploadsConsistent: realCounts.uploads === recordedCounts.uploads,
        flashcardsConsistent: realCounts.flashcards === recordedCounts.flashcards,
        quizzesConsistent: realCounts.quizzes === recordedCounts.quizzes,
        realCounts,
        recordedCounts,
        discrepancies
      };

      console.log('📊 Relatório de consistência:', report);
      return report;
    } catch (error) {
      console.error('❌ Erro na verificação de consistência:', error);
      return null;
    }
  };

  return {
    checkDataConsistency
  };
};
