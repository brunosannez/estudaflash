
import { supabase } from '@/integrations/supabase/client';

interface RealUserCounts {
  uploads: number;
  flashcards: number;
  quizzes: number;
}

export const useRealUserCounts = () => {
  const getRealUserCounts = async (userId: string): Promise<RealUserCounts> => {
    try {
      console.log('📊 Obtendo contagens reais para usuário:', userId);

      // Contar uploads diretos
      const { count: uploadsCount, error: uploadsError } = await supabase
        .from('uploads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (uploadsError) throw uploadsError;

      // Contar quiz sessions (mais preciso que quiz_respostas)
      const { count: quizzesCount, error: quizzesError } = await supabase
        .from('quiz_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (quizzesError) throw quizzesError;

      // Contar flashcards através de resumos dos uploads do usuário
      const { data: userUploads, error: userUploadsError } = await supabase
        .from('uploads')
        .select('id')
        .eq('user_id', userId);

      if (userUploadsError) throw userUploadsError;

      let flashcardsCount = 0;
      if (userUploads && userUploads.length > 0) {
        // Buscar resumos dos uploads
        const uploadIds = userUploads.map(upload => upload.id);
        const { data: resumos, error: resumosError } = await supabase
          .from('resumos')
          .select('id')
          .in('upload_id', uploadIds);

        if (resumosError) throw resumosError;

        if (resumos && resumos.length > 0) {
          // Contar flashcards dos resumos
          const resumoIds = resumos.map(resumo => resumo.id);
          const { count: flashcardsCountResult, error: flashcardsError } = await supabase
            .from('flashcards')
            .select('*', { count: 'exact', head: true })
            .in('resumo_id', resumoIds);

          if (flashcardsError) throw flashcardsError;
          flashcardsCount = flashcardsCountResult || 0;
        }
      }

      const counts: RealUserCounts = {
        uploads: uploadsCount || 0,
        flashcards: flashcardsCount,
        quizzes: quizzesCount || 0
      };

      console.log('✅ Contagens reais obtidas:', counts);
      return counts;
    } catch (error) {
      console.error('❌ Erro ao obter contagens reais:', error);
      return {
        uploads: 0,
        flashcards: 0,
        quizzes: 0
      };
    }
  };

  return {
    getRealUserCounts
  };
};
